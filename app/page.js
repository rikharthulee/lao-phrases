"use client";

import Link from "next/link";
import { useRef } from "react";
import { PHRASE_GROUPS } from "../data/phrases";

export default function HomePage() {
  const audioRef = useRef(null);

  function playAudio(src) {
    if (!src || !audioRef.current) return;

    audioRef.current.src = src;
    audioRef.current.play().catch(() => {});
  }

  return (
    <main className="container">
      <header className="topBar">
        <h1>Phrasebook</h1>
        <p>Everyday Lao phrases with pronunciation and audio.</p>
      </header>

      <nav className="sectionNav" aria-label="Sections">
        <Link href="/">Phrasebook</Link>
        <Link href="/learn">Learn Alphabet</Link>
      </nav>

      <section className="groups" aria-label="Phrase groups">
        {PHRASE_GROUPS.map((group) => (
          <details key={group.title}>
            <summary>{group.title}</summary>

            <div className="groupBody">
              {group.items.map((phrase) => (
                <article key={phrase.id} className="card phraseCard">
                  <p className="lao">{phrase.lo}</p>
                  <p className="english">{phrase.en}</p>
                  <p className="say">{phrase.say}</p>

                  {phrase.audio ? (
                    <button
                      type="button"
                      className="play"
                      onClick={() => playAudio(phrase.audio)}
                    >
                      Play
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </details>
        ))}
      </section>

      <audio ref={audioRef} hidden preload="none" />
    </main>
  );
}
