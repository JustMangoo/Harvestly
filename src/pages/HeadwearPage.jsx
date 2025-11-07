import "./HeadwearPage.css";
import hat1 from "../assets/Hat.svg";

export default function HeadwearPage({ setSelectedItem, goldSeedImg }) {
  const headwearItems = [
    { name: "Explorer Hat", price: 99, img: hat1 },
    { name: "Summer Cap", price: 120, img: hat1 },
    { name: "Winter Beanie", price: 150, img: hat1 },
    { name: "Wizard Hat", price: 200, img: hat1 },
    { name: "Party Crown", price: 250, img: hat1 },
    { name: "Bucket Hat", price: 180, img: hat1 },
  ];

  return (
    <div className="headwear-branch">
      <h2 className="section-title">Headwear</h2>
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
              <img src={goldSeedImg} alt="Seed" className="seed-icon inline-seed" />
              <span>{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
