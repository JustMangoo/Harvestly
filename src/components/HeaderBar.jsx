import React from "react";
import { useNavigate } from "react-router-dom";
import backarrow from "../assets/backarrow.svg";
import goldSeedImg from "../assets/seed.svg";
import threedots from "../assets/kebab.svg"; // replace with your actual file
import "./HeaderBar.css";

export default function HeaderBar({
  title = "Title",
  showSeeds = false,
  showMenu = false,
  seedCount = 199,
}) {
  const navigate = useNavigate();

  return (
    <header className="header-bar">
      {/* Left back arrow */}
      <button className="header-back" onClick={() => navigate(-1)}>
        <img src={backarrow} alt="Back" className="header-back-icon" />
      </button>

      {/* Center title */}
      <h1 className="header-title">{title}</h1>

      {/* Right side */}
      <div className="header-right">
        {showSeeds && (
          <div className="header-seeds">
            <img src={goldSeedImg} alt="Seed" className="seed-icon" />
            <span>{seedCount}</span>
          </div>
        )}

        {showMenu && (
          <button className="header-menu">
            <img src={threedots} alt="Menu" className="menu-icon" />
          </button>
        )}
      </div>
    </header>
  );
}
