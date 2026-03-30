import { useState, useEffect, useRef } from "react";

// Soft luxury ambient piano — light, airy, premium feel (Kevin MacLeod - Meditation Impromptu)
const MUSIC_URL = "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Meditation%20Impromptu%2003.mp3";
const TARGET_VOLUME = 0.10;
const FADE_STEPS = 40;
const FADE_INTERVAL = 60; // ms per step

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    // Auto-start on first user interaction (browsers require this)
    const startOnInteraction = () => {
      audio.play()
        .then(() => {
          fadeIn(audio);
          setPlaying(true);
          document.removeEventListener("click", startOnInteraction);
          document.removeEventListener("scroll", startOnInteraction);
          document.removeEventListener("keydown", startOnInteraction);
          document.removeEventListener("touchstart", startOnInteraction);
        })
        .catch(() => {});
    };

    document.addEventListener("click", startOnInteraction, { once: false });
    document.addEventListener("scroll", startOnInteraction, { once: false });
    document.addEventListener("keydown", startOnInteraction, { once: false });
    document.addEventListener("touchstart", startOnInteraction, { once: false });

    const timer = setTimeout(() => setVisible(true), 1000);

    return () => {
      clearTimeout(timer);
      if (fadeRef.current) clearInterval(fadeRef.current);
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("scroll", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const fadeIn = (audio: HTMLAudioElement) => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    audio.volume = 0;
    const step = TARGET_VOLUME / FADE_STEPS;
    fadeRef.current = setInterval(() => {
      if (audio.volume + step >= TARGET_VOLUME) {
        audio.volume = TARGET_VOLUME;
        if (fadeRef.current) clearInterval(fadeRef.current);
      } else {
        audio.volume += step;
      }
    }, FADE_INTERVAL);
  };

  const fadeOut = (audio: HTMLAudioElement, onDone: () => void) => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    const step = audio.volume / FADE_STEPS;
    fadeRef.current = setInterval(() => {
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        audio.pause();
        if (fadeRef.current) clearInterval(fadeRef.current);
        onDone();
      } else {
        audio.volume -= step;
      }
    }, FADE_INTERVAL);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      fadeOut(audio, () => setPlaying(false));
    } else {
      audio.play()
        .then(() => {
          fadeIn(audio);
          setPlaying(true);
        })
        .catch(() => {});
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={toggle}
      title={playing ? "Pause music" : "Play ambient music"}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group ${
        playing
          ? "bg-primary shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          : "bg-secondary/80 backdrop-blur-sm border border-primary/20 shadow-lg"
      }`}
    >
      {/* Sound wave bars */}
      <div className="flex items-end gap-[3px] h-5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-all duration-300 ${
              playing ? "bg-secondary" : "bg-primary/60"
            }`}
            style={{
              height: playing ? `${[60, 100, 75, 45][i - 1]}%` : "30%",
              animation: playing
                ? `soundBar${i} ${0.6 + i * 0.15}s ease-in-out infinite alternate`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Ripple when playing */}
      {playing && (
        <>
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 pointer-events-none" />
          <span className="absolute -inset-2 rounded-full border border-primary/20 animate-ping pointer-events-none" style={{ animationDelay: "0.3s" }} />
        </>
      )}

      <style>{`
        @keyframes soundBar1 { from { height: 20% } to { height: 80% } }
        @keyframes soundBar2 { from { height: 50% } to { height: 100% } }
        @keyframes soundBar3 { from { height: 30% } to { height: 70% } }
        @keyframes soundBar4 { from { height: 60% } to { height: 40% } }
      `}</style>
    </button>
  );
}
