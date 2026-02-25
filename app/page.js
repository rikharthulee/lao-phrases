"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PHRASE_GROUPS } from "../data/phrases";

function getPhraseAudioPaths(groupTitle, id) {
  const group = groupTitle.toLowerCase();
  return {
    lo: `/audio/${group}/${id}_lo.mp3`,
    en: `/audio/${group}/${id}_en.mp3`,
  };
}

export default function HomePage() {
  const audioRef = useRef(null);
  const tokenRef = useRef(0);
  const delayRef = useRef(null);
  const [playingGroup, setPlayingGroup] = useState("");
  const [playEnglish, setPlayEnglish] = useState(false);
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHRASE_GROUPS;

    return PHRASE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        return (
          item.en.toLowerCase().includes(q) ||
          item.lo.toLowerCase().includes(q) ||
          item.say.toLowerCase().includes(q) ||
          item.tone?.toLowerCase().includes(q)
        );
      }),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  function clearActivePlayback() {
    if (delayRef.current) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }

    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.onended = null;
    audioRef.current.onerror = null;
  }

  function stopAllPlayback() {
    tokenRef.current += 1;
    clearActivePlayback();
    setPlayingGroup("");
  }

  function playPhraseSequence(paths, token, includeEnglish, onDone) {
    if (!audioRef.current || token !== tokenRef.current) return;

    audioRef.current.onended = () => {
      if (token !== tokenRef.current) return;

      if (!includeEnglish) {
        onDone?.();
        return;
      }

      delayRef.current = window.setTimeout(() => {
        if (!audioRef.current || token !== tokenRef.current) return;

        audioRef.current.onended = () => {
          if (token !== tokenRef.current) return;
          onDone?.();
        };
        audioRef.current.onerror = () => {
          if (token !== tokenRef.current) return;
          onDone?.();
        };
        audioRef.current.src = paths.en;
        audioRef.current.play().catch(() => {
          onDone?.();
        });
      }, 800);
    };

    audioRef.current.onerror = () => {
      if (token !== tokenRef.current) return;
      onDone?.();
    };

    audioRef.current.src = paths.lo;
    audioRef.current.play().catch(() => {
      onDone?.();
    });
  }

  function playPhrase(groupTitle, id) {
    stopAllPlayback();
    const token = tokenRef.current;
    const paths = getPhraseAudioPaths(groupTitle, id);
    playPhraseSequence(paths, token, playEnglish);
  }

  function playGroup(group) {
    stopAllPlayback();
    const token = tokenRef.current;
    const includeEnglish = playEnglish;
    const phraseList = group.items;
    let index = 0;

    setPlayingGroup(group.title);

    const playNext = () => {
      if (token !== tokenRef.current) return;

      if (index >= phraseList.length) {
        setPlayingGroup("");
        return;
      }

      const item = phraseList[index];
      index += 1;
      const paths = getPhraseAudioPaths(group.title, item.id);
      playPhraseSequence(paths, token, includeEnglish, playNext);
    };

    playNext();
  }

  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, []);

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
        <label className="searchLabel" htmlFor="phrase-search">
          Search
        </label>
        <input
          id="phrase-search"
          type="search"
          placeholder="Search English, Lao, or pronunciation"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: "10px" }}
        />

        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <input
            type="checkbox"
            checked={playEnglish}
            onChange={(e) => setPlayEnglish(e.target.checked)}
          />
          Play English after Lao
        </label>

        {filteredGroups.map((group) => (
          <details key={group.title}>
            <summary>{group.title}</summary>

            <div className="groupBody">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" className="play" onClick={() => playGroup(group)}>
                  Play Section
                </button>
                {playingGroup === group.title ? (
                  <button type="button" onClick={stopAllPlayback}>
                    Stop
                  </button>
                ) : null}
              </div>

              {group.items.map((phrase) => (
                <article key={phrase.id} className="card phraseCard">
                  <p className="lao">{phrase.lo}</p>
                  <p className="english">{phrase.en}</p>
                  <p className="say">{phrase.say}</p>
                  {phrase.tone ? (
                    <p className="toneLabel">Tone: {phrase.tone}</p>
                  ) : null}

                  <button
                    type="button"
                    className="play"
                    onClick={() => playPhrase(group.title, phrase.id)}
                  >
                    {playEnglish ? "🔊🇬🇧 Play" : "🔊 Play"}
                  </button>
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
