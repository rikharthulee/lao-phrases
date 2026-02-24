import dotenv from "dotenv";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

dotenv.config({ path: ".env.local" });

const speechKey = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;

const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, region);

speechConfig.speechSynthesisVoiceName = "lo-LA-KeomanyNeural";

const audioConfig = sdk.AudioConfig.fromAudioFileOutput(
  "public/audio/test.mp3",
);

const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

synthesizer.speakTextAsync(
  "ສະບາຍດີ",
  (result) => {
    console.log("Result:", result.reason);
    synthesizer.close();
  },
  (error) => {
    console.error("Error:", error);
    synthesizer.close();
  },
);
