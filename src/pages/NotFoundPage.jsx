import WiltedFlower from "../assets/WiltedPlant.svg";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";
import Button from "../components/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>Page not found :&#40;</h2>
      <img src={WiltedFlower} alt="Wilted plant" />
      <Link to="/">
        <Button size="lg" text="Return to Main Page" aria-label="Share" />
      </Link>
    </div>
  );
}
