import { useNavigate } from "react-router-dom";
import IconElement from "../components/IconElement.jsx";
import "./BadgesPage.css";

// Badge data with locked/unlocked states
const BADGES = [
  { id: 1, name: "is it dead?", locked: false, icon: "💀" },
  { id: 2, name: "The propeller", locked: true },
  { id: 3, name: "Is this the end?", locked: true },
  { id: 4, name: "My first plant!", locked: true },
  { id: 5, name: "Coin master", locked: true },
  { id: 6, name: "Interior desig...", locked: true },
  { id: 7, name: "Green thumb", locked: true },
  { id: 8, name: '"What?"', locked: true },
  { id: 9, name: "Plant expert", locked: true },
  { id: 10, name: "Shared garden", locked: true },
  { id: 11, name: "Gold seeds", locked: true },
  { id: 12, name: "A house", locked: true },
  { id: 13, name: "is it dead?", locked: true },
  { id: 14, name: "is it dead?", locked: true },
  { id: 15, name: "is it dead?", locked: true },
];

export default function BadgesPage() {
  const navigate = useNavigate();

  return (
    <div className="badges-page">
      <nav className="badges-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IconElement icon="arrow_back" size={24} />
        </button>
        <h1 className="page-title">Badges</h1>
        <div className="nav-spacer" />
      </nav>

      <section className="badges-content">
        <div className="badges-grid">
          {BADGES.map((badge) => (
            <div key={badge.id} className="badge-item">
              <div className={`badge-icon ${badge.locked ? "locked" : "unlocked"}`}>
                {badge.locked ? (
                  <IconElement icon="lock" size={40} filled={true} />
                ) : (
                  <span className="badge-emoji">{badge.icon}</span>
                )}
              </div>
              <p className="badge-name">{badge.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}