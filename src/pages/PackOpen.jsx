import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PackOpen.css";

import OpeningGif from "../assets/PackOpen.gif";
import PullsGif from "../assets/Pulls.gif";

export default function PackOpen() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0 = opening, 1 = reveal, 2 = frozen
  const [chosenGif, setChosenGif] = useState(null);
  const revealRef = useRef(null);

  // Randomized GIF selection (replace with other gif imports if you add more)
  const revealGifs = [PullsGif, PullsGif, PullsGif, PullsGif, PullsGif];

  useEffect(() => {
    const randomGif = revealGifs[Math.floor(Math.random() * revealGifs.length)];
    setChosenGif(randomGif);

    // --- Timing control ---
    const openTime = 650;  // ms (0:00:00:48)
    const revealTime = 1100; // ms (0:00:01:10)

    const timers = [
      setTimeout(() => setStage(1), openTime),              // show reveal gif
      setTimeout(() => setStage(2), openTime + revealTime), // freeze on end
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // When freezing, clone the reveal frame into a <canvas> snapshot
    if (stage === 2 && revealRef.current) {
      const video = revealRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = video.src;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        video.src = canvas.toDataURL("image/png");
      };
    }
  }, [stage]);

  return (
    <div className="packopen-page">
      {/* Opening animation */}
      {stage === 0 && (
        <img src={OpeningGif} alt="Opening Pack" className="packopen-gif" />
      )}

      {/* Reveal animation */}
      {stage === 1 && chosenGif && (
        <img
          ref={revealRef}
          src={chosenGif}
          alt="Revealing Pack"
          className="packopen-gif fullscreen"
        />
      )}

      {/* Frozen end frame with continue button */}
      {stage === 2 && (
        <div className="packopen-result">
          <img
            src={chosenGif}
            alt="Reward Frozen"
            className="packopen-gif"
            ref={revealRef}
          />
          <button className="continue-btn" onClick={() => navigate("/store")}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
