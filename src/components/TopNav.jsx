import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconElement from "./IconElement";
import Button from "./Button";
import "./TopNav.css";

export default function TopNav({ showBackButton = true, title = "" }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-background" />
        <div className="top-nav-content">
          {showBackButton && (
            <button className="nav-button back-button" onClick={handleBack}>
              <IconElement icon="arrow_forward_ios" size={24} filled={false} />
            </button>
          )}
          <h2 className="nav-title">{title}</h2>
          <button className="nav-button" onClick={handleToggleSettings}>
            <IconElement icon="more_vert" size={24} filled={false} />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="settings-overlay" onClick={handleCloseSettings}>
          <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <button className="settings-dots-button">
                <IconElement icon="more_vert" size={4} filled={true} />
              </button>
              <h3>Settings</h3>
              <button className="close-button" onClick={handleCloseSettings}>
                <IconElement icon="close" size={24} filled={false} />
              </button>
            </div>
            <div className="settings-content">
              <div className="settings-menu-items">
                <button className="settings-menu-item">
                  <span>Edit profile</span>
                  <IconElement icon="edit" size={18} filled={false} />
                </button>
                <div className="settings-divider" />
                <button className="settings-menu-item">
                  <span>Edit character</span>
                  <IconElement icon="face" size={18} filled={false} />
                </button>
                <div className="settings-divider" />
                <button className="settings-menu-item">
                  <span>Preferences</span>
                  <IconElement icon="settings" size={18} filled={false} />
                </button>
                <div className="settings-divider" />
                <button className="settings-menu-item">
                  <span>Log Out</span>
                  <IconElement icon="logout" size={18} filled={false} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
