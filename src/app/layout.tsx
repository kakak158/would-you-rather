"use client";

import React, { useEffect, useState } from "react";
import "./globals.css"; // Your global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Try to autoplay when app first loads
  useEffect(() => {
    const audio = document.getElementById("bg-music") as HTMLAudioElement;
    if (audio) {
      audio.play().catch(() => {
        console.log("Autoplay blocked - user interaction needed");
      });
    }
  }, []);

  const toggleMusic = () => {
    const audio = document.getElementById("bg-music") as HTMLAudioElement;
    if (audio) {
      if (audio.paused) {
        audio.play();
        setIsMusicPlaying(true);
      } else {
        audio.pause();
        setIsMusicPlaying(false);
      }
    }
  };

  return (
    <html lang="en">
      <body>
        {/* Background Music - plays throughout entire app */}
        <audio
          id="bg-music"
          loop
          onPlay={() => setIsMusicPlaying(true)}
          onPause={() => setIsMusicPlaying(false)}
        >
          <source src="/music/background.mp3" type="audio/mpeg" />
        </audio>

        {/* Music toggle button - visible on all pages */}
        <button
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
          aria-label="Toggle music"
        >
          {isMusicPlaying ? "🔊 Music On" : "🔇 Music Off"}
        </button>

        {/* All page content */}
        {children}
      </body>
    </html>
  );
}
