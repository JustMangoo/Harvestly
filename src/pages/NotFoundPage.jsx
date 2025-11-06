import WiltedFlower from "../assets/WiltedPlant.svg";

export default function NotFoundPage() {
  return (
    <>
      <h1>404 </h1>
      <h2>Page not found :&#40;</h2>
      <img src={WiltedFlower} alt="Wilted plant" />
    </>
  );
}
