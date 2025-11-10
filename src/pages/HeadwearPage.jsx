// HeadwearPage.jsx
import "./HeadwearPage.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import hat1 from "../assets/hat.png";
import backarrow from "../assets/backarrow.svg";
import goldSeedImg from "../assets/seed.svg";

export default function HeadwearPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // read state passed from StorePage; fallback defaults:
  const mainTitle = location?.state?.mainTitle || "Clothing";
  const subTitle = location?.state?.subTitle || "Headwear";

  const [selectedItem, setSelectedItem] = useState(null);

  const headwearItems = [
    { name: "Explorer Hat", price: 99, img: hat1 },
    { name: "Summer Cap", price: 120, img: hat1 },
    { name: "Winter Beanie", price: 150, img: hat1 },
    { name: "Wizard Hat", price: 200, img: hat1 },
    { name: "Party Crown", price: 250, img: hat1 },
    { name: "Bucket Hat", price: 180, img: hat1 },
  ];

  return (
    <div className="headwear-page">
      {/* Header (top bar) - shows dynamic mainTitle */}
      <div className="headwear-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <img src={backarrow} alt="Back" style={{ width: 20, height: 20 }} />
        </button>

        <h1
          className="store-title"
          style={{ margin: 0, fontSize: 18, fontWeight: 700 }}
        >
          {mainTitle}
        </h1>

        <div className="seed-count">
          <img src={goldSeedImg} alt="Seed" />
          <span>199</span>
        </div>
      </div>

      {/* Section subtitle shows the actual branch/subcategory */}
      <h2 className="section-title">{subTitle}</h2>

      <div className="items-grid">
        {headwearItems.map((item, i) => (
          <div
            key={i}
            className="item-card"
            onClick={() => setSelectedItem(item)}
          >
            <div className="img-placeholder">
              <img src={item.img} alt={item.name} />
            </div>
            <p className="item-title">{item.name}</p>
            <div className="item-price">
              <img
                src={goldSeedImg}
                alt="Seed"
                className="seed-icon inline-seed"
              />
              <span>{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for selected item */}
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
