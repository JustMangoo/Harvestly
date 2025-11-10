import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PackOpen.css";

// Import all gif + still pairs
import Pack1Gif from "../assets/PackOpen1.gif";
import Pack2Gif from "../assets/PackOpen2.gif";
import Pack3Gif from "../assets/PackOpen3.gif";
import Pack4Gif from "../assets/PackOpen4.gif";
import Pack5Gif from "../assets/PackOpen5.gif";

import Pack1Still from "../assets/Pack1Still.png";
import Pack2Still from "../assets/Pack2Still.png";
import Pack3Still from "../assets/Pack3Still.png";
import Pack4Still from "../assets/Pack4Still.png";
import Pack5Still from "../assets/Pack5Still.png";

export default function PackOpen() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0 = gif playing, 1 = still image
  const [chosenPack, setChosenPack] = useState(null);

  const packOptions = [
    { gif: Pack1Gif, still: Pack1Still },
    { gif: Pack2Gif, still: Pack2Still },
    { gif: Pack3Gif, still: Pack3Still },
    { gif: Pack4Gif, still: Pack4Still },
    { gif: Pack5Gif, still: Pack5Still },
  ];

  useEffect(() => {
    const randomPack = packOptions[Math.floor(Math.random() * packOptions.length)];
    setChosenPack(randomPack);

    // Gif lasts 2.1s, switch to still immediately after
    const timer = setTimeout(() => setStage(1), 2100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="packopen-page">
      {/* Play random gif */}
      {stage === 0 && chosenPack && (
        <img
          src={chosenPack.gif}
          alt="Pack Opening"
          className="packopen-gif fullscreen"
        />
      )}

      {/* Show matching still */}
      {stage === 1 && chosenPack && (
        <div className="packopen-result">
          <div className="reward-container">
            <img
              src={chosenPack.still}
              alt="Reward"
              className="reward-img fullscreen"
            />
          </div>
          <button
            className="continue-btn"
            onClick={() => navigate("/store")}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
