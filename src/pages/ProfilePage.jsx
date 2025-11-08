import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import "./ProfilePage.css";
import { supabase } from "../lib/supabaseClient.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isEditMode, setIsEditMode } = useOutletContext();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState(null);
  const [userData, setUserData] = useState(supabase.auth.getUser());
  const [username, setUsername] = useState("User039928");
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const handleLogout = async () => {
    setSignOutLoading(true);
    setSignOutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      setSignOutError(error.message);
    } finally {
      setSignOutLoading(false);
    }
  };

  const isAuthenticated = !!userData;

  const handleCreateAccount = () => {
    navigate("/auth");
  };

  const handleAvatarEdit = () => {
    // Handle avatar edit
    console.log("Edit avatar clicked");
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleUsernameBlur = () => {
    setIsEditingUsername(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-background" />
      <div className="profile-container">
        <div className="profile-info">
          <button
            className={`profile-avatar ${isEditMode ? "edit-mode" : ""}`}
            onClick={isEditMode ? handleAvatarEdit : undefined}
            disabled={!isEditMode}
          >
            {isEditMode && <div className="avatar-overlay" />}
            <IconElement icon="image" size={44} filled={false} />
            {isEditMode && (
              <div className="avatar-edit-button">
                <IconElement icon="edit" size={18} filled={true} />
              </div>
            )}
          </button>

          <div className="profile-user-stats">
            <div className="profile-user-details">
              <div className="profile-header">
                {isEditingUsername ? (
                  <input
                    type="text"
                    className="profile-username-input"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    autoFocus
                  />
                ) : isEditMode ? (
                  <button
                    className="profile-username-edit-area"
                    onClick={handleUsernameEdit}
                  >
                    <h2 className="profile-username">{username}</h2>
                    <div className="profile-edit-button">
                      <IconElement icon="edit" size={18} filled={true} />
                    </div>
                  </button>
                ) : (
                  <h2 className="profile-username">{username}</h2>
                )}
              </div>
              <p className="profile-location">Aarhus, Denmark</p>
            </div>
            <div className="profile-stats-container">
              <div className="profile-stat">
                <span className="profile-stat-number">1</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">15</span>
                <span className="profile-stat-label">Followers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button">
            <div className="action-button-icon">
              <IconElement icon="Psychiatry" size={24} />
            </div>
            <span className="action-button-text">My plants</span>
          </button>
          <div className="action-divider" />
          <button className="action-button">
            <div className="action-button-icon">
              <IconElement icon="award_star" size={24} />
            </div>
            <span className="action-button-text">Badges</span>
          </button>
          <div className="action-divider" />
          <button className="action-button">
            <div className="action-button-icon">
              <IconElement icon="group" size={24} />
            </div>
            <span className="action-button-text">Share</span>
          </button>
        </div>

        <div className="posts-section">
          <h3 className="posts-header">Posts</h3>
          {isAuthenticated ? (
            <div className="post-item">
              <h4 className="post-title">
                Need help with my chili plant, its leaves are turning yellow and
                looking sad 😢🌶️
              </h4>
              <p className="post-content">
                Hey everyone, I'm hoping someone can help me figure out what's
                going on with my chili plant. It's been super healthy until
                recently, but now the leaves are starting to yellow and droop a
                bit.
              </p>
              <div className="post-actions">
                <button className="post-action-button">
                  <IconElement icon="like" size={14} />
                  <span>0</span>
                </button>
                <button className="post-action-button">
                  <IconElement icon="comment" size={14} />
                  <span>0</span>
                </button>
                <button className="post-action-button">
                  <IconElement icon="share" size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="posts-guest-message">
              <p className="posts-guest-text">
                You cannot access the Forums without an account
              </p>
              <Button
                variant="solid"
                size="md"
                onClick={handleCreateAccount}
                text="Create account"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
