import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";

function getFriendlyName(session) {
  const metadataName = session?.user?.user_metadata?.name;
  if (metadataName) return metadataName;
  const email = session?.user?.email;
  if (email) return email.split("@")[0];
  return "grower";
}

export default function HomePage() {
  const { session } = useAuthSession();
  const friendlyName = getFriendlyName(session);

  return (
    <div className="home-page">
      <h2>Welcome back, {friendlyName}!</h2>
      <p>
        Track your plants, stay ahead of care tasks, and keep your harvest on
        schedule.
      </p>

      <div className="home-actions">
        <Link to="/plants">
          <Button
            icon="local_florist"
            text="View your plants"
            variant="solid"
          />
        </Link>
        <Link to="/calendar">
          <Button variant="secondary" icon="event" text="Open calendar" />
        </Link>
      </div>
    </div>
  );
}
