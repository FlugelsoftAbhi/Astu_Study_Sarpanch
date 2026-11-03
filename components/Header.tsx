"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export type ThemeType = "adrenaline" | "vibey" | "nerd";

interface Track {
  id: string;
  name: string;
  icon: string;
  vibe: string;
}

const TRACKS: Track[] = [
  { id: "lofi", name: "Cozy Lofi Chords", icon: "☕", vibe: "Warm 7th chords & vinyl study warmth" },
  { id: "adrenaline", name: "Beast Phonk Pulse", icon: "⚡", vibe: "128 BPM driving adrenaline rhythm" },
  { id: "rain", name: "Rain & Warm Cafe", icon: "🌧️", vibe: "Gentle rain & warm ambient cafe" },
  { id: "binaural", name: "432Hz Alpha Waves", icon: "🧠", vibe: "Binaural memory retention frequency" },
];

export default function Header() {
  const { user, loading, signIn, logOut } = useAuth();
  const [theme, setTheme] = useState<ThemeType>("adrenaline");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>("lofi");
  const [volume, setVolume] = useState<number>(0.3);
  const [showAudioPanel, setShowAudioPanel] = useState<boolean>(false);

  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize theme from localStorage or system
  useEffect(() => {
    try {
      const saved = localStorage.getItem("study_theme") as ThemeType | null;
      if (saved && (saved === "adrenaline" || saved === "vibey" || saved === "nerd")) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "adrenaline");
      }
    } catch {
      // Ignore
    }

    // Listen for cross-component theme changes
    const onThemeChange = (e: CustomEvent<ThemeType>) => {
      if (e.detail) {
        setTheme(e.detail);
        document.documentElement.setAttribute("data-theme", e.detail);
      }
    };
    window.addEventListener("study_theme_change" as unknown as keyof WindowEventMap, onThemeChange as EventListener);
    return () => {
      window.removeEventListener("study_theme_change" as unknown as keyof WindowEventMap, onThemeChange as EventListener);
    };
  }, []);

  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("study_theme", newTheme);
    } catch {
      // Ignore
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    window.dispatchEvent(new CustomEvent("study_theme_change", { detail: newTheme }));
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const stopAudio = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignore
      }
      audioCtxRef.current = null;
    }
    gainNodeRef.current = null;
    setIsPlaying(false);
  }, []);

  // 1. Cozy Lofi chord generator (Warm 7th chords)
  const playLofiChords = (ctx: AudioContext, destination: GainNode) => {
    const chordProgressions = [
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!audioCtxRef.current) return;
      const chord = chordProgressions[chordIdx];
      chordIdx = (chordIdx + 1) % chordProgressions.length;

      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0.01, ctx.currentTime);
      chordGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.4);
      chordGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
      chordGain.connect(destination);

      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(750, ctx.currentTime);

        osc.connect(filter);
        filter.connect(chordGain);
        osc.start();
        osc.stop(ctx.currentTime + 3.0);
      });
    };

    playChord();
    timerRef.current = window.setInterval(playChord, 3000);
  };

  // 2. Adrenaline Phonk Pulse
  const playAdrenalinePhonk = (ctx: AudioContext, destination: GainNode) => {
    const bassNotes = [55.0, 55.0, 65.41, 73.42];
    let beat = 0;

    const playBeat = () => {
      if (!audioCtxRef.current) return;
      const note = bassNotes[Math.floor(beat / 2) % bassNotes.length];

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(note, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);

      noteGain.gain.setValueAtTime(0.25, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      // Hi-hat noise
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const hatFilter = ctx.createBiquadFilter();
      hatFilter.type = "highpass";
      hatFilter.frequency.setValueAtTime(7000, ctx.currentTime);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.04, ctx.currentTime);
      hatGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      noise.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(destination);
      noise.start();

      beat++;
    };

    playBeat();
    timerRef.current = window.setInterval(playBeat, 468);
  };

  // 3. Rain Ambience
  const playRainAmbience = (ctx: AudioContext, destination: GainNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.12, ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(destination);
    rainSource.start();

    const dropTimer = window.setInterval(() => {
      if (!audioCtxRef.current) return;
      const dropOsc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      const f = freqs[Math.floor(Math.random() * freqs.length)];
      dropOsc.type = "sine";
      dropOsc.frequency.setValueAtTime(f, ctx.currentTime);

      dropGain.gain.setValueAtTime(0.03, ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      dropOsc.connect(dropGain);
      dropGain.connect(destination);
      dropOsc.start();
      dropOsc.stop(ctx.currentTime + 0.9);
    }, 2400);

    timerRef.current = dropTimer;
  };

  // 4. Binaural Alpha Waves
  const playBinauralAlpha = (ctx: AudioContext, destination: GainNode) => {
    const baseFreq = 432.0;
    const beatFreq = 10.0;
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const gainLeft = ctx.createGain();
    const gainRight = ctx.createGain();

    oscLeft.type = "sine";
    oscRight.type = "sine";
    oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscRight.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

    gainLeft.gain.setValueAtTime(0.1, ctx.currentTime);
    gainRight.gain.setValueAtTime(0.1, ctx.currentTime);

    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);
    gainLeft.connect(destination);
    gainRight.connect(destination);

    oscLeft.start();
    oscRight.start();
  };

  const startAudio = (trackId: string) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (trackId === "lofi") playLofiChords(ctx, masterGain);
      else if (trackId === "adrenaline") playAdrenalinePhonk(ctx, masterGain);
      else if (trackId === "rain") playRainAmbience(ctx, masterGain);
      else if (trackId === "binaural") playBinauralAlpha(ctx, masterGain);

      setIsPlaying(true);
    } catch {
      alert("Audio interaction requires user gesture.");
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(selectedTrack);
    }
  };

  const handleTrackChange = (trackId: string) => {
    setSelectedTrack(trackId);
    if (isPlaying) {
      stopAudio();
      setTimeout(() => startAudio(trackId), 50);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const activeTrack = TRACKS.find((t) => t.id === selectedTrack) ?? TRACKS[0];

  return (
    <header className="header glass-nav">
      <div className="header-left">
        <Link href="/" className="brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Study Companion</span>
          <span className="brand-tag">PRO</span>
        </Link>
      </div>

      <div className="header-center">
        {/* Theme Switcher Pill Group */}
        <div className="theme-compact-selector" role="group" aria-label="Select study theme">
          <button
            className={`btn-theme-pill ${theme === "adrenaline" ? "active" : ""}`}
            onClick={() => changeTheme("adrenaline")}
            title="Adrenaline Rush: High octane warrior mode"
          >
            <span>⚡</span>
            <span className="theme-pill-text">Adrenaline</span>
          </button>
          <button
            className={`btn-theme-pill ${theme === "vibey" ? "active" : ""}`}
            onClick={() => changeTheme("vibey")}
            title="Comfy & Vibey: Cozy lo-fi atmosphere"
          >
            <span>🌸</span>
            <span className="theme-pill-text">Comfy Vibe</span>
          </button>
          <button
            className={`btn-theme-pill ${theme === "nerd" ? "active" : ""}`}
            onClick={() => changeTheme("nerd")}
            title="Straight Nerd: Blueprint terminal & solid frames"
          >
            <span>📟</span>
            <span className="theme-pill-text">Straight Nerd</span>
          </button>
        </div>

        {/* Lo-Fi Background Music Control in Header */}
        <div style={{ position: "relative" }}>
          <button
            className={`btn-lofi-pill ${isPlaying ? "pulse-active" : ""}`}
            onClick={() => setShowAudioPanel(!showAudioPanel)}
            title="Toggle Lo-Fi Study Audio"
            aria-label="Toggle Lo-Fi Audio"
          >
            <span className="lofi-icon">{isPlaying ? "🎵" : "🎧"}</span>
            <span className="lofi-label">{isPlaying ? activeTrack.name : "Lo-Fi Audio"}</span>
            {isPlaying && (
              <div className="audio-wave-mini">
                <span className="wave-bar bar-1"></span>
                <span className="wave-bar bar-2"></span>
                <span className="wave-bar bar-3"></span>
              </div>
            )}
          </button>

          {showAudioPanel && (
            <div className="lofi-card header-lofi-popover">
              <div className="lofi-header">
                <div className="lofi-title-box">
                  <span
                    className="lofi-live-dot"
                    style={{ backgroundColor: isPlaying ? "var(--good)" : "var(--muted)" }}
                  />
                  <strong className="lofi-title">Study Atmosphere</strong>
                </div>
                <button
                  className="lofi-close-btn"
                  onClick={() => setShowAudioPanel(false)}
                  aria-label="Close panel"
                >
                  ✕
                </button>
              </div>

              <p className="lofi-vibe-text">{activeTrack.vibe}</p>

              <div className="lofi-track-selector">
                {TRACKS.map((t) => (
                  <button
                    key={t.id}
                    className={`lofi-track-btn ${selectedTrack === t.id ? "active" : ""}`}
                    onClick={() => handleTrackChange(t.id)}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>

              <div className="lofi-controls-row">
                <button
                  className={`btn btn-lofi-toggle ${isPlaying ? "playing" : ""}`}
                  onClick={toggleAudio}
                >
                  {isPlaying ? "⏸ Pause Audio" : "▶ Start Focus Audio"}
                </button>
                <div className="lofi-volume-wrap">
                  <span className="vol-icon">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="lofi-slider"
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="header-right" aria-label="Main navigation">
        {user && (
          <>
            <Link href="/dashboard" className="nav-link">
              My Sets
            </Link>
            <Link href="/progress" className="nav-link">
              Progress
            </Link>
          </>
        )}
        <Link href="/privacy" className="nav-link muted-link">
          Privacy
        </Link>

        {!loading &&
          (user ? (
            <button className="btn ghost btn-nav" onClick={logOut}>
              Sign out
            </button>
          ) : (
            <button
              className="btn btn-primary-glow btn-nav"
              onClick={() => signIn().catch(() => {})}
            >
              Sign in with Google
            </button>
          ))}
      </nav>
    </header>
  );
}
