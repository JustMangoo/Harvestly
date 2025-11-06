import React from "react";
import "./CategoryTabs.css";

export default function CategoryTabs({ tabs, activeTab, onTabClick }) {
  return (
    <div className="store-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? "active" : ""}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
