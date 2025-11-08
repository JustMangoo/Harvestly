import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import ToggleGroup from "../components/ToggleGroup.jsx";

export default function HomePage() {
  const { session } = useAuthSession();

  return (
    <div className="home-page">
      <h2>Welcome back!</h2>
      <p>
        Track your plants, stay ahead of care tasks, and keep your harvest on
        schedule.
      </p>
      <Link to="/calendar">
        <Button variant="secondary" icon="event" text="Open calendar" />
      </Link>
      <div className="home-actions">
        <Link to="/plants">
          <Button icon="Psychiatry" text="My plants" variant="outline" />
        </Link>
        <Link to="/plants">
          <Button icon="Psychiatry" text="My plants" variant="secondary" />
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
