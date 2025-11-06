import "./HeadwearPage.css";
import { useNavigate } from "react-router-dom";

export default function HeadwearPage() {
  const navigate = useNavigate();

  return (
    <div className="headwear-page">
      <div className="headwear-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="seed-count">
          <span>🌱</span> 199
        </div>
      </div>

      <h2 className="section-title">Headwear</h2>

      <div className="items-grid">
        {/* Temporary demo */}
        {[...Array(9)].map((_, i) => (
          <div key={i} className="item-card">
            <div className="img-placeholder"></div>
            <p className="item-title">Text Here</p>
            <p className="item-price">
              🌱 <span>99</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
