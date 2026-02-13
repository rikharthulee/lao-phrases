"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PHRASE_GROUPS } from "./data/phrases";

function matchesQuery(item, query) {
  if (!query) return true;

  const normalized = query.toLowerCase();
  return (
    item.en.toLowerCase().includes(normalized) ||
    item.lo.toLowerCase().includes(normalized) ||
    item.say.toLowerCase().includes(normalized)
  );
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

function playAudio(src) {
  if (!src) return;
  const a = new Audio(src);
  a.play().catch(() => {});
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);
  const [playingGroup, setPlayingGroup] = useState("");
  const playlistRef = useRef({
    audio: null,
    sources: [],
    index: 0,
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          return Promise.all(registrations.map((registration) => registration.unregister()));
        })
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const filteredGroups = useMemo(() => {
    return PHRASE_GROUPS.map((group) => {
      const items = group.items.filter((item) => matchesQuery(item, query));
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [query]);

  function stopPlaylist() {
    const current = playlistRef.current.audio;
    if (current) {
      current.pause();
      current.onended = null;
      current.onerror = null;
    }
    playlistRef.current = { audio: null, sources: [], index: 0 };
    setPlayingGroup("");
  }

  function playNextInPlaylist() {
    const state = playlistRef.current;
    const nextIndex = state.index + 1;
    if (nextIndex >= state.sources.length) {
      stopPlaylist();
      return;
    }

    state.index = nextIndex;
    state.audio.src = state.sources[nextIndex];
    state.audio.play().catch(() => {
      playNextInPlaylist();
    });
  }

  function playGroup(groupTitle, sources) {
    if (!sources.length) return;

    stopPlaylist();

    const audio = new Audio(sources[0]);
    playlistRef.current = { audio, sources, index: 0 };
    setPlayingGroup(groupTitle);

    audio.onended = playNextInPlaylist;
    audio.onerror = playNextInPlaylist;
    audio.play().catch(() => {
      stopPlaylist();
    });
  }

  function showCopyToast() {
    setToast(true);
    window.setTimeout(() => {
      setToast(false);
    }, 900);
  }

  async function onCopy(text) {
    try {
      await copyText(text);
      showCopyToast();
    } catch {
      setToast(false);
    }
  }

  useEffect(() => {
    return () => {
      stopPlaylist();
    };
  }, []);

  return (
    <main className="container">
      <header className="topBar">
        <h1>Lao Phrases</h1>
        <p>Tap to copy and speak common phrases.</p>
      </header>

      <section className="controls" aria-label="Controls">
        <label className="searchLabel" htmlFor="phrase-search">
          Search
        </label>
        <input
          id="phrase-search"
          type="search"
          placeholder="Search English, Lao, or pronunciation"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

      </section>

      <section className="groups" aria-label="Phrase groups">
        {filteredGroups.length === 0 && (
          <p className="empty">No phrases matched your search.</p>
        )}

        {filteredGroups.map((group) => (
          <details key={group.title} open={query ? true : undefined}>
            <summary>
              {group.title}
              <span>{group.items.length}</span>
            </summary>

            <div className="groupBody">
              <div className="sectionActions">
                <button
                  type="button"
                  className="playGroup"
                  onClick={() =>
                    playGroup(
                      group.title,
                      group.items.map((item) => item.audio).filter(Boolean)
                    )
                  }
                  disabled={!group.items.some((item) => item.audio)}
                >
                  ▶ Play Section
                </button>
                {playingGroup === group.title && (
                  <button type="button" className="stopGroup" onClick={stopPlaylist}>
                    Stop
                  </button>
                )}
              </div>

              {group.items.map((p) => {
                const selectedAudio = p.audio;

                return (
                  <article key={p.id} className="card">
                    <h2>{p.en}</h2>
                    <p className="lao">{p.lo}</p>
                    <p className="say">{p.say}</p>

                    <div className="actions">
                      <button type="button" onClick={() => onCopy(p.lo)}>
                        Copy Lao
                      </button>
                      <button type="button" onClick={() => onCopy(p.say)}>
                        Copy Pronunciation
                      </button>
                      <button
                        type="button"
                        onClick={() => onCopy(`${p.en} | ${p.lo} | ${p.say}`)}
                      >
                        Copy All
                      </button>
                      {selectedAudio && (
                        <button
                          type="button"
                          className="play"
                          onClick={() => playAudio(selectedAudio)}
                        >
                          ▶ Play
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </details>
        ))}
      </section>

      {toast && <div className="toast">Copied ✅</div>}
    </main>
  );
}
