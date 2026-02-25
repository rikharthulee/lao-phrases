"use client";

function playAudio(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();

    audio.play().catch(() => resolve());
  });
}

async function playSequence(firstSrc, secondSrc, includeExample) {
  await playAudio(firstSrc);

  if (includeExample) {
    await playAudio(secondSrc);
  }
}

export default function ConsonantCard({ letter, includeExamples = false }) {
  const audioSrc = letter.audio || `/audio/consonants/${encodeURIComponent(letter.char)}.mp3`;
  const exampleAudioSrc = letter.exampleAudio || "";

  return (
    <div
      style={{
        border: "1px solid #d8dde5",
        borderRadius: "10px",
        padding: "14px",
        textAlign: "center",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: "42px", lineHeight: 1.1 }}>{letter.char}</div>
      <div style={{ marginTop: "6px", fontWeight: 700 }}>{letter.name}</div>
      <div style={{ color: "#60656f", marginTop: "2px" }}>Sound: {letter.sound}</div>
      <div style={{ color: "#60656f", marginTop: "2px" }}>IPA: /{letter.ipa}/</div>
      <div style={{ color: "#60656f", marginTop: "2px" }}>Class: {letter.toneClass}</div>

      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        <div>Example: {letter.example}</div>
        <div>Pronunciation: {letter.exampleSay}</div>
      </div>

      {audioSrc ? (
        <button
          type="button"
          onClick={() => {
            void playSequence(audioSrc, exampleAudioSrc, includeExamples);
          }}
          style={{
            marginTop: "10px",
            border: "1px solid #d8dde5",
            borderRadius: "8px",
            padding: "8px 12px",
            background: "#eaf2ff",
            cursor: "pointer",
          }}
        >
          Play
        </button>
      ) : null}
    </div>
  );
}
