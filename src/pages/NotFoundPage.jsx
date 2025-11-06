import WiltedFlower from "../assets/WiltedPlant.svg";
import IconElement from "../components/IconElement.jsx";
import "./NotFoundPage.css";
import Button from "../components/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>Page not found :&#40;</h2>
      <img src={WiltedFlower} alt="Wilted plant" />
      <IconElement icon="home" size={24} filled={false} />
      <Button variant="secondary" size="lg" icon="eco" text="Plant" />
      <Button
        variant="outline"
        size="sm"
        icon="favorite"
        iconFilled={false}
        text="0"
      />
      <Button size="md" icon="share" hideText aria-label="Share" />
    </div>
  );
}
