import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconElement from "../components/IconElement.jsx";
import { FRIENDS } from "../data/friendsData.js";
import "./ShareGardenPage.css";

export default function ShareGardenPage() {
  const navigate = useNavigate();
  const [shareCode] = useState("12345-67");
  const [copiedCode, setCopiedCode] = useState(false);
  const [sentFriends, setSentFriends] = useState(new Set());

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopiedCode(true);
    // Don't reset - keep as "Copied!"
  };

  const handleSendToFriend = (friendId) => {
    setSentFriends((prev) => new Set(prev).add(friendId));
    console.log("Send to friend:", friendId);
    // TODO: Implement send functionality
  };

  return (
    <div className="share-garden-page">
      <nav className="share-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IconElement icon="arrow_back" size={24} />
        </button>
        <h1 className="page-title">Share garden</h1>
        <div className="nav-spacer" />
      </nav>

      <section className="share-content">
        <div className="share-code-section">
          <div className="share-code-container">
            <input
              type="text"
              className="share-code-input"
              value={shareCode}
              readOnly
            />
            <button
              className={`copy-code-button ${copiedCode ? "copied" : ""}`}
              onClick={handleCopyCode}
              disabled={copiedCode}
            >
              {copiedCode ? "Copied!" : "Copy Code"}
            </button>
          </div>
        </div>

        <div className="share-divider">
          <span>Or share with friends</span>
        </div>

        <div className="friends-list">
          {FRIENDS.map((friend) => {
            const isSent = sentFriends.has(friend.id);
            return (
              <div key={friend.id} className="friend-item">
                <div className="friend-info">
                  <div className="friend-avatar">
                    <img src={friend.avatar} alt={friend.name} />
                  </div>
                  <div className="friend-details">
                    <p className="friend-name">{friend.name}</p>
                    <p className="friend-subtitle">{friend.subtitle}</p>
                  </div>
                </div>
                <button
                  className={`send-button ${isSent ? "sent" : ""}`}
                  onClick={() => !isSent && handleSendToFriend(friend.id)}
                  disabled={isSent}
                >
                  {isSent ? "Sent" : "Send"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}