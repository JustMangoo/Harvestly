import "./BranchPage.css";

export default function BranchPage({ title, items, setSelectedItem, goldSeedImg }) {
  return (
    <div className="branch-page">
      <h2 className="section-title">{title}</h2>
      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.name}
            className="item-card"
            onClick={() => setSelectedItem(item)}
          >
            <div className="img-placeholder">
              <img src={item.img} alt={item.name} />
            </div>
            <p className="item-title">{item.name}</p>
            <p className="item-price">
              <img src={goldSeedImg} alt="Seed" className="inline-seed" />{" "}
              {item.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
