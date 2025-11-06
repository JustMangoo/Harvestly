import "./StorePage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CategoryTabs from "./CategoryTabs";

// Import images (use SVGs)
import headwearImg from "../assets/Hat.svg";
import eyewearImg from "../assets/glasses.svg";
import neckwearImg from "../assets/tie.svg";
import furnitureImg from "../assets/Chair.svg";
import petsImg from "../assets/PetROCK.svg";
import largeDecorImg from "../assets/Tree.svg";

import mysteryPackImg from "../assets/pack.svg";
import goldSeedImg from "../assets/seed.svg";
import backarrow from "../assets/backarrow.svg";

export default function StorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Decor");

  // ✅ Popup state
  const [selectedItem, setSelectedItem] = useState(null);

  const goToHeadwear = () => {
    navigate("/headwear");
  };

  const tabs = ["Decor", "Clothing", "Gold Seeds"];

  const decorItems = [
    { name: "Headwear", img: headwearImg, onClick: goToHeadwear, price: 45 },
    { name: "Eyewear", img: eyewearImg, price: 30 },
    { name: "Neckwear", img: neckwearImg, price: 25 },
    { name: "Furniture", img: furnitureImg, price: 60 },
    { name: "Pets", img: petsImg, price: 80 },
    { name: "Large Decor", img: largeDecorImg, price: 100 },
  ];

  const goldPacks = [
    { qty: 77, price: "15.00 kr." },
    { qty: 169, price: "29.00 kr." },
    { qty: 305, price: "60.00 kr." },
    { qty: 585, price: "99.00 kr." },
  ];

  const handlePurchase = () => {
    alert(`Purchased: ${selectedItem.name} for ${selectedItem.price} kr`);
    setSelectedItem(null);
  };

  return (
    <div className="store-page">

      {/* ✅ NEW TOP BAR – Matches your mock */}
      <div className="store-topbar">
        <button className="back-arrow" onClick={() => navigate(-1)}>
          <img src={backarrow} alt="Back" className="back-arrow-icon" />
        </button>
        <h1 className="store-title">Store</h1>
        <div className="store-currency">
          <img src={goldSeedImg} alt="Seed" className="seed-icon" />
          <span>199</span>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

      {/* Mystery Seeds */}
      {activeTab === "Decor" && (
        <div className="store-section">
          <h2 className="section-title">Mystery Seeds</h2>
          <div className="mystery-card">
            <img src={goldSeedImg} alt="Gold Seed" className="mystery-seed" />
            <p className="price">200</p>
            <img src={mysteryPackImg} alt="Mystery Pack" className="mystery-image" />
          </div>
        </div>
      )}

      {/* Decorations */}
      {activeTab === "Decor" && (
        <div className="store-section">
          <h2 className="section-title">Decorations</h2>
          <div className="decor-grid">
            {decorItems.map((item) => (
              <div
                className="decor-item"
                key={item.name}
                role="button"
                tabIndex={0}
                onClick={() =>
                  item.onClick ? item.onClick() : setSelectedItem(item)
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

      {activeTab === "Clothing" && (
        <div className="store-section">
          <h2 className="section-title">Clothing</h2>
          <p className="placeholder-text">Clothing items coming soon!</p>
        </div>
      )}

      {activeTab === "Gold Seeds" && (
        <div className="store-section">
          <h2 className="section-title">Gold Seeds</h2>
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

      {/* ✅ Purchase Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-placeholder" />

            <h3>{selectedItem.name}</h3>
            <p>Would you like to confirm your purchase for this item?</p>

            <div className="modal-footer">
              <span>{selectedItem.price},00 kr.</span>
              <button className="purchase-btn" onClick={handlePurchase}>
                Purchase
              </button>
            </div>

            <button className="modal-close" onClick={() => setSelectedItem(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
