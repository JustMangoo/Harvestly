// StorePage.jsx
import "./StorePage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTabs from "./CategoryTabs";

import headwearImg from "../assets/hat.png";
import eyewearImg from "../assets/glasses.png";
import neckwearImg from "../assets/tie.png";
import furnitureImg from "../assets/Chair.svg";
import petsImg from "../assets/PetROCK.svg";
import largeDecorImg from "../assets/Tree.svg";
import mysteryPackImg from "../assets/pack.svg";
import goldSeedImg from "../assets/seed.svg";
import AppBar from "../components/AppBar";
import infinityIcon from "../assets/infinity.svg";
import calendarIcon from "../assets/calendar.svg";
import seedIcon from "../assets/seed.svg";
import arrowIcon from "../assets/GOOOOArrow.svg";

export default function StorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Clothing");
  const [branch, setBranch] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = ["Clothing", "Decor", "Gold Seeds"];

  const branches = {
    Headwear: [
      { name: "Baseball Cap", img: headwearImg, price: 50 },
      { name: "Wizard Hat", img: headwearImg, price: 65 },
    ],
    Eyewear: [
      { name: "Sunglasses", img: eyewearImg, price: 35 },
      { name: "Monocle", img: eyewearImg, price: 45 },
    ],
    Neckwear: [
      { name: "Red Tie", img: neckwearImg, price: 25 },
      { name: "Bow Tie", img: neckwearImg, price: 30 },
    ],
    Furniture: [
      { name: "Chair", img: furnitureImg, price: 60 },
      { name: "Table", img: furnitureImg, price: 80 },
    ],
    Pets: [
      { name: "Pet Rock", img: petsImg, price: 80 },
      { name: "Mini Dragon", img: petsImg, price: 150 },
    ],
    "Large Decor": [
      { name: "Tree", img: largeDecorImg, price: 100 },
      { name: "Fountain", img: largeDecorImg, price: 200 },
    ],
  };

  const clothingItems = [
    { name: "Headwear", img: headwearImg, branch: "Headwear" },
    { name: "Eyewear", img: eyewearImg, branch: "Eyewear" },
    { name: "Neckwear", img: neckwearImg, branch: "Neckwear" },
  ];

  const decorItems = [
    { name: "Furniture", img: furnitureImg, branch: "Furniture" },
    { name: "Pets", img: petsImg, branch: "Pets" },
    { name: "Large Decor", img: largeDecorImg, branch: "Large Decor" },
  ];

  const goldPacks = [
    { qty: 77, price: "15.00 kr." },
    { qty: 169, price: "29.00 kr." },
    { qty: 305, price: "60.00 kr." },
    { qty: 585, price: "99.00 kr." },
  ];

  const mysteryPack = { name: "Mystery Pack", img: mysteryPackImg, price: 200 };

  const handleBackToMain = () => setBranch(null);
  const handlePurchase = () => {
    if (!selectedItem) return;
    alert(`Purchased: ${selectedItem.name} for ${selectedItem.price} kr`);
    setSelectedItem(null);
  };

  return (
    <div className="store-page">
      <AppBar
        showBack
        title="Store"
        onBack={() => (branch ? handleBackToMain() : navigate(-1))}
        rightContent={
          <div className="store-currency">
            <img src={goldSeedImg} alt="Seed" className="seed-icon" />
            <span>199</span>
          </div>
        }
      />

      {/* Tabs */}
      <CategoryTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={(tab) => {
          setBranch(null);
          setActiveTab(tab);
        }}
      />

      {/* Branch Page (if branch state set) */}
      {branch && (
        <BranchPage
          title={branch}
          items={branches[branch]}
          setSelectedItem={setSelectedItem}
          goldSeedImg={goldSeedImg}
          onBack={() => setBranch(null)}
        />
      )}

      {/* Clothing */}
      {!branch && activeTab === "Clothing" && (
        <>
          <div className="store-section">
            <h2 className="section-title">Mystery Packs</h2>
            <div
              className="mystery-card"
              onClick={() => setSelectedItem(mysteryPack)}
            >
              <div className="mystery-content">
                <div className="mystery-left">
                  <p className="mystery-top-text">
                    Try your luck and get a mystery item
                  </p>
                  <div className="mystery-price-row">
                    <img
                      src={goldSeedImg}
                      alt="Gold Seed"
                      className="mystery-seed"
                    />
                    <p className="mystery-price">{mysteryPack.price}</p>
                  </div>
                </div>
                <img
                  src={mysteryPack.img}
                  alt="Mystery Pack"
                  className="mystery-image"
                />
              </div>
            </div>
          </div>

          <div className="store-section">
            <h2 className="section-title">Clothing</h2>
            <div className="decor-grid">
              {clothingItems.map((item) => (
                <div
                  key={item.name}
                  className="decor-item"
                  onClick={() =>
                    navigate("/headwear", {
                      state: { mainTitle: "Clothing", subTitle: item.branch },
                    })
                  }
                >
                  <div className="decor-icon">
                    <img src={item.img} alt={item.name} />
                  </div>
                  <span className="decor-name">{item.name}</span>
                  <span className="decor-progress">0 / 10</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Decor */}
      {!branch && activeTab === "Decor" && (
        <div className="store-section">
          <h2 className="section-title">Decor</h2>
          <div className="decor-grid">
            {decorItems.map((item) => (
              <div
                key={item.name}
                className="decor-item"
                // navigate to HeadwearPage and pass mainTitle = "Decor"
                onClick={() =>
                  navigate("/headwear", {
                    state: { mainTitle: "Decor", subTitle: item.branch },
                  })
                }
              >
                <div className="decor-icon">
                  <img src={item.img} alt={item.name} />
                </div>
                <span className="decor-name">{item.name}</span>
                <span className="decor-progress">0 / 10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gold Seeds */}
      {!branch && activeTab === "Gold Seeds" && (
        <div className="store-section">
          <h2 className="section-title">Gold Seeds</h2>

          {/* Harvestly Subscription Card (inline) */}
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

            {/* center the button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <button
                className="subscribe-btn"
                onClick={() => navigate("/subscription")}
              >
                Subscribe
                <img src={arrowIcon} alt="Go" className="arrow-icon" />
              </button>
            </div>
          </div>

          {/* Existing Gold Seed Packs */}
          <div className="gold-list">
            {goldPacks.map((pack, i) => (
              <div className="gold-item" key={i}>
                <img src={goldSeedImg} alt="Gold Seed" className="gold-icon" />
                <span>{pack.qty} pieces</span>
                <button>{pack.price}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-placeholder">
              <img src={selectedItem.img} alt={selectedItem.name} />
            </div>
            <h3>{selectedItem.name}</h3>
            <p>Would you like to confirm your purchase for this item?</p>
            <div className="modal-footer">
              <span>
                <img
                  src={goldSeedImg}
                  alt="Seed"
                  className="seed-icon inline-seed"
                />{" "}
                {selectedItem.price}
              </span>
              <button
                className="purchase-btn"
                onClick={() => navigate("/packopen")}
              >
                Purchase
              </button>
            </div>
            <button
              className="modal-close"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helper BranchPage (keeps existing behaviour if branch set via state elsewhere) ---------- */
/* If you have your own BranchPage, remove/replace this helper. */
function BranchPage({ title, items, setSelectedItem, goldSeedImg, onBack }) {
  const navigate = useNavigate();

  return (
    <div className="branch-page">
      <div className="branch-topbar">
        <button className="back-arrow" onClick={onBack || (() => navigate(-1))}>
          ←
        </button>
        <h2>{title}</h2>
      </div>

      <div className="branch-grid">
        {items.map((item) => (
          <div
            key={item.name}
            className="branch-item"
            onClick={() => {
              if (setSelectedItem) setSelectedItem(item);
            }}
          >
            <img src={item.img} alt={item.name} />
            <p>{item.name}</p>
            <span className="branch-price">
              <img
                src={goldSeedImg}
                alt="Seed"
                className="seed-icon inline-seed"
              />{" "}
              {item.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
