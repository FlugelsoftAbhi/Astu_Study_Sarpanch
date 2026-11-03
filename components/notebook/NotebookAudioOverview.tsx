"use client";

import { useEffect, useRef, useState } from "react";

export default function NotebookAudioOverview({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [audioMode, setAudioMode] = useState<"speech" | "focus">("speech");

  // Web Audio Context for deep focus background frequency
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startFocusAudio = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // 432Hz deep study harmonic
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();

      setIsPlaying(true);
    } catch {
      // Ignore
    }
  };

  const stopFocusAudio = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignore
      }
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const startSpeechOverview = () => {
    if (!("speechSynthesis" in window)) {
      startFocusAudio();
      return;
    }

    window.speechSynthesis.cancel();
    const intro = `Welcome to your NotebookLM Audio Overview for ${title}. Here is the executive briefing: ${summary}`;
    const utterance = new SpeechSynthesisUtterance(intro);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeechActive(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setSpeechActive(false);
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setSpeechActive(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeechOverview = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechActive(false);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      if (audioMode === "speech") stopSpeechOverview();
      else stopFocusAudio();
    } else {
      if (audioMode === "speech") startSpeechOverview();
      else startFocusAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopSpeechOverview();
      stopFocusAudio();
    };
  }, []);

  return (
    <div className="nb-audio-overview-card">
      <div style={{ fontSize: "2rem" }}>🎙️</div>
      <h4 className="nb-audio-title">Audio Deep Dive</h4>
      <p className="nb-audio-desc">
        Experience a Google NotebookLM style Audio Overview synthesizing your uploaded source notes.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        <button
          className={`nb-btn ${audioMode === "speech" ? "nb-btn-primary" : "nb-btn-ghost"}`}
          style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
          onClick={() => {
            if (isPlaying) {
              stopSpeechOverview();
              stopFocusAudio();
            }
            setAudioMode("speech");
          }}
        >
          🗣️ AI Host Overview
        </button>
        <button
          className={`nb-btn ${audioMode === "focus" ? "nb-btn-primary" : "nb-btn-ghost"}`}
          style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
          onClick={() => {
            if (isPlaying) {
              stopSpeechOverview();
              stopFocusAudio();
            }
            setAudioMode("focus");
          }}
        >
          🧠 432Hz Focus Wave
        </button>
      </div>

      <button className="nb-btn nb-btn-primary" onClick={togglePlayback} style={{ width: "100%" }}>
        {isPlaying ? (speechActive ? "⏸ Pause Host Voice" : "⏸ Pause 432Hz Wave") : "▶ Play Audio Overview"}
      </button>
    </div>
  );
}
