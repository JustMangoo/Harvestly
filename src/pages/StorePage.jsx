import "./StorePage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTabs from "./CategoryTabs";

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
  const [activeTab, setActiveTab] = useState("Clothing");
  const [branch, setBranch] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = ["Clothing", "Decor", "Gold Seeds"];

  // Define branch items
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

  // Items displayed on the main store page
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
    alert(`Purchased: ${selectedItem.name} for ${selectedItem.price} kr`);
    setSelectedItem(null);
  };

  return (
    <div className="store-page">
      {/* Top Bar */}
      <div className="store-topbar">
        <button
          className="back-arrow"
          onClick={() => (branch ? handleBackToMain() : navigate(-1))}
        >
          <img src={backarrow} alt="Back" className="back-arrow-icon" />
        </button>
        <h1 className="store-title">Store</h1>
        <div className="store-currency">
          <img src={goldSeedImg} alt="Seed" className="seed-icon" />
          <span>199</span>
        </div>
      </div>

      {/* Tabs */}
      <CategoryTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={(tab) => {
          setBranch(null);
          setActiveTab(tab);
        }}
      />

      {/* Branch Page */}
      {branch && (
        <BranchPage
          title={branch}
          items={branches[branch]}
          setSelectedItem={setSelectedItem}
          goldSeedImg={goldSeedImg}
        />
      )}

      {/* Main Store */}
      {!branch && activeTab === "Clothing" && (
        <>
          <div className="store-section">
            <h2 className="section-title">Mystery Packs</h2>
            <div className="mystery-card" onClick={() => setSelectedItem(mysteryPack)}>
              <img src={goldSeedImg} alt="Gold Seed" className="mystery-seed" />
              <p className="price">{mysteryPack.price}</p>
              <img src={mysteryPack.img} alt="Mystery Pack" className="mystery-image" />
            </div>
          </div>

          <div className="store-section">
            <h2 className="section-title">Clothing</h2>
            <div className="decor-grid">
              {clothingItems.map((item) => (
                <div
                  key={item.name}
                  className="decor-item"
                  onClick={() => setBranch(item.branch)}
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

      {!branch && activeTab === "Decor" && (
        <div className="store-section">
          <h2 className="section-title">Decor</h2>
          <div className="decor-grid">
            {decorItems.map((item) => (
              <div
                key={item.name}
                className="decor-item"
                onClick={() => setBranch(item.branch)}
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

      {!branch && activeTab === "Gold Seeds" && (
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
              <button className="purchase-btn" onClick={() => navigate("/packopen")}>Purchase</button>
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
