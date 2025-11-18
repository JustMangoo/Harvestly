import React from "react";
import { useNavigate } from "react-router-dom";
import IconElement from "./IconElement";
import "./AppBar.css";
import Button from "./Button";

/**
 * Reusable application bar.
 * Props:
 *  - showBack (boolean): show back button (default true)
 *  - title (string): optional page title; if omitted no title rendered
 *  - actionIcon (string): material icon name for right action (default 'more_vert')
 *  - onBack (function): custom back handler; defaults to navigate(-1)
 *  - onAction (function): handler for action button; if absent action button still shown for consistency
 */
export default function AppBar({
  showBack = true,
  title,
  actionIcon = "more_vert",
  onBack,
  onAction,
  rightContent, // optional custom right side; overrides default action button
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleAction = () => {
    if (onAction) onAction();
  };

  return (
    <header className="app-bar">
      <div className="app-bar-section left">
        {showBack && (
          <Button
            variant="secondary"
            icon="arrow_back_ios_new"
            onClick={handleBack}
            aria-label="Go Back"
          ></Button>
        )}
      </div>
      <div className="app-bar-section center">
        {title && <h1 className="app-bar-title">{title}</h1>}
      </div>
      <div className="app-bar-section right">
        {rightContent ? (
          rightContent
        ) : (
          <Button
            variant="secondary"
            icon={actionIcon}
            onClick={handleAction}
            aria-label="Action"
          ></Button>
        )}
      </div>
    </header>
  );
}
