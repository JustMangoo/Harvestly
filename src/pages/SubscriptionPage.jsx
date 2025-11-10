import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import IconElement from "../components/IconElement.jsx";
import infinityIcon from "../assets/infinity.svg";
import seedIcon from "../assets/seed.svg";
import calendarIcon from "../assets/calendar.svg";
import "./SubscriptionPage.css";

export default function SubscriptionPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Hide nav bar when component mounts
    const navBar = document.querySelector('.nav-bar');
    if (navBar) {
      navBar.style.display = 'none';
    }

    // Show nav bar when component unmounts
    return () => {
      const navBar = document.querySelector('.nav-bar');
      if (navBar) {
        navBar.style.display = '';
      }
    };
  }, []);

  return (
    <div className="subscription-page">
      <div className="subscription-content">
        <h1 className="subscription-title">Harvestly Subscription</h1>

        <div className="subscription-card">
          <div className="card-badge">1</div>
          <h2>You can have unlimited Plants!</h2>
          <div className="feature-pill">
            <img src={infinityIcon} alt="" />
            <span>Unlimited</span>
          </div>
          <p>Take gardening to the next level! Keep track of all your plants.</p>
        </div>

        <div className="subscription-card">
          <div className="card-badge">2</div>
          <h2>You can redeem daily seeds!</h2>
          <div className="feature-pill">
            <img src={seedIcon} alt="" />
            <span>Daily Seeds</span>
          </div>
          <p>Receive in game currency for logging in daily!</p>
        </div>

        <div className="subscription-card">
          <div className="card-badge">3</div>
          <h2>You can share your schedule with everyone!</h2>
          <div className="feature-pill">
            <img src={calendarIcon} alt="" />
            <span>Share More</span>
          </div>
          <p>Share your schedule with more people!</p>
        </div>
      </div>

      <div className="subscription-footer">
        <button
          className="subscribe-button"
          onClick={() => {
            // Handle subscription logic here
            alert("Subscription feature coming soon!");
          }}
        >
          Subscribe
        </button>
        <button onClick={() => navigate(-1)} className="close-button">
          <IconElement icon="close" size={24} />
        </button>
      </div>
    </div>
  );
}
