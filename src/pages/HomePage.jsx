import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import ToggleGroup from "../components/ToggleGroup.jsx";
import MainGarden from "../assets/Main-garden.png";
import "./HomePage.css";

export default function HomePage() {
  const { session } = useAuthSession();

  return (
    <div className="home-page">
      <Link to="/calendar">
        <Button variant="secondary" icon="event" text="Open calendar" />
      </Link>

      <img
        className="main-garden"
        src={MainGarden}
        alt="the main digital garden"
      />

      <div className="home-actions">
        <Link to="/plants">
          <Button icon="Psychiatry" text="My plants" variant="secondary" />
        </Link>
        <Link to="/plants">
          <Button icon="format_paint" variant="secondary" />
        </Link>
      </div>
      <ToggleGroup
        options={[
          { label: "Fences", value: "fences" },
          { label: "Small items", value: "small" },
          { label: "Big items", value: "big" },
        ]}
      />
    </div>
  );
}
