"use client";

function playSequence(firstSrc, secondSrc) {
  if (!firstSrc && !secondSrc) return;

  if (!firstSrc && secondSrc) {
    const only = new Audio(secondSrc);
    only.play().catch(() => {});
    return;
  }

  const first = new Audio(firstSrc);
  first.onended = () => {
    if (!secondSrc) return;
    const second = new Audio(secondSrc);
    second.play().catch(() => {});
  };
  first.play().catch(() => {});
}

export default function ConsonantCard({ letter }) {
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
          onClick={() => playSequence(audioSrc, exampleAudioSrc)}
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
