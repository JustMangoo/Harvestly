import React from "react";
import "./SubscriptionCard.css";

import seedIcon from "../assets/seed.svg";
import calendarIcon from "../assets/calendar.svg";
import infinityIcon from "../assets/infinity.svg";
import arrowIcon from "../assets/arrow-right.svg";

export default function SubscriptionCard({ onSubscribe }) {
  return (
    <div className="subscription-card">
      <h2 className="subscription-title">Harvestly Subscription</h2>

      <div className="subscription-features">
        <div className="feature">
          <img src={infinityIcon} alt="Unlimited Feature" />
          <span>Unlimited</span>
        </div>
        <div className="feature">
          <img src={calendarIcon} alt="Unlimited Calendar" />
          <span>Unlimited</span>
        </div>
        <div className="feature">
          <img src={seedIcon} alt="Daily Seeds" />
          <span>Daily Seeds</span>
        </div>
      </div>

      <div className="subscription-button-container">
        <button
          className="subscribe-btn"
          onClick={onSubscribe}
        >
          Subscribe
          <img src={arrowIcon} alt="Go" className="arrow-icon" />
        </button>
      </div>
    </div>
  );
}
