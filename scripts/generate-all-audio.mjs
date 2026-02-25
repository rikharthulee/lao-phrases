import dotenv from "dotenv";
import fs from "fs";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

import { PHRASE_GROUPS } from "../data/phrases.js";
import { VOWELS } from "../data/alphabet/vowels.js";
import { CONSONANTS } from "../data/alphabet/consonants.js";

dotenv.config({ path: ".env.local" });

const speechKey = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
const voice = process.env.AZURE_TTS_VOICE || "lo-LA-KeomanyNeural";

if (!speechKey || !region) {
  throw new Error("Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function synthesizeSsml(ssml, outputPath) {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, region);
    speechConfig.speechSynthesisVoiceName = voice;
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();

        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          fs.writeFileSync(outputPath, Buffer.from(result.audioData));
          console.log("✔", outputPath);
          resolve();
        } else {
          reject(new Error(result.errorDetails));
        }
      },
      (err) => {
        synthesizer.close();
        reject(err);
      },
    );
  });
}

function buildSsml(text) {
  return `
    <speak version="1.0" xml:lang="lo-LA">
      <voice name="${voice}">
        <prosody rate="-25%">
          ${text}
        </prosody>
      </voice>
    </speak>
  `;
}

function buildEnglish(text) {
  return `
    <speak version="1.0" xml:lang="en-GB">
      <voice name="en-GB-SoniaNeural">
        ${text}
      </voice>
    </speak>
  `;
}

function synthesizeEnglish(text, outputPath) {
  return synthesizeSsml(buildEnglish(text), outputPath);
}

/* ---------------- PHRASES ---------------- */

async function generatePhrases() {
  console.log("Generating phrases...");

  for (const group of PHRASE_GROUPS) {
    for (const item of group.items) {
      const baseAudioPath = item.audio.startsWith("/")
        ? item.audio.slice(1)
        : item.audio;
      const basePath = `public/${baseAudioPath.replace(/\.mp3$/, "")}`;
      const outputDir = basePath.substring(0, basePath.lastIndexOf("/"));
      const laoPath = `${basePath}_lo.mp3`;
      const engPath = `${basePath}_en.mp3`;

      ensureDir(outputDir);

      if (!fs.existsSync(laoPath)) {
        await synthesizeSsml(buildSsml(item.lo), laoPath);
      }

      if (!fs.existsSync(engPath)) {
        await synthesizeEnglish(item.en, engPath);
      }
    }
  }
}

/* ---------------- VOWELS ---------------- */

async function generateVowels() {
  console.log("Generating vowels...");

  const outputDir = `public/audio/alphabet/vowels`;
  ensureDir(outputDir);

  for (const vowel of VOWELS) {
    const safeName = `${vowel.sound}_${vowel.vowelLength}`;

    const patternPath = `${outputDir}/${safeName}_pattern.mp3`;
    const examplePath = `${outputDir}/${safeName}_example.mp3`;

    if (!fs.existsSync(patternPath)) {
      await synthesizeSsml(buildSsml(vowel.standalone), patternPath);
    }

    if (!fs.existsSync(examplePath)) {
      await synthesizeSsml(buildSsml(vowel.example), examplePath);
    }
  }
}

/* ---------------- CONSONANTS ---------------- */

async function generateConsonants() {
  console.log("Generating consonants...");

  const outputDir = `public/audio/alphabet/consonants`;
  ensureDir(outputDir);

  for (const consonant of CONSONANTS) {
    const letterPath = `${outputDir}/${consonant.char}_letter.mp3`;
    const examplePath = `${outputDir}/${consonant.char}_example.mp3`;

    // Letter with padding
    if (!fs.existsSync(letterPath)) {
      const paddedSsml = `
        <speak version="1.0" xml:lang="lo-LA">
          <voice name="${voice}">
            <prosody rate="-25%">
              <break time="200ms"/>
              ${consonant.char}
              <break time="300ms"/>
            </prosody>
          </voice>
        </speak>
      `;
      await synthesizeSsml(paddedSsml, letterPath);
    }

    if (!fs.existsSync(examplePath)) {
      await synthesizeSsml(buildSsml(consonant.example), examplePath);
    }
  }
}

/* ---------------- RUN ---------------- */

async function run() {
  try {
    await generatePhrases();
    await generateVowels();
    await generateConsonants();

    console.log("All slowed audio generated successfully.");
  } catch (err) {
    console.error("Error generating audio:", err);
  }
}

run();
