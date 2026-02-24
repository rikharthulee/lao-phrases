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

/* ---------------- PHRASES ---------------- */

async function generatePhrases() {
  console.log("Generating phrases...");

  for (const group of PHRASE_GROUPS) {
    const outputDir = `public/audio/${group.title.toLowerCase()}`;
    ensureDir(outputDir);

    for (const item of group.items) {
      const outputPath = `${outputDir}/${item.id}.mp3`;
      if (fs.existsSync(outputPath)) continue;

      await synthesizeSsml(buildSsml(item.lo), outputPath);
    }
  }
}

/* ---------------- VOWELS ---------------- */

async function generateVowels() {
  console.log("Generating vowels...");

  const outputDir = `public/audio/alphabet/vowels`;
  ensureDir(outputDir);

  for (const vowel of VOWELS) {
    const safePattern = vowel.pattern.replace(/[^a-zA-Z0-9]/g, "_");

    const patternPath = `${outputDir}/${safePattern}_pattern.mp3`;
    const examplePath = `${outputDir}/${safePattern}_example.mp3`;

    // Replace placeholder dash with ກ
    const spokenPattern = vowel.pattern.replace("-", "ກ");

    if (!fs.existsSync(patternPath)) {
      await synthesizeSsml(buildSsml(spokenPattern), patternPath);
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
