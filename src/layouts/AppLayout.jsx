import Nav from "../components/Nav";
import { Outlet } from "react-router-dom";
import { useState, useRef } from "react";

export default function AppLayout() {
  const [isEditMode, setIsEditMode] = useState(false);
  const saveProfileRef = useRef(null);

  return (
    <>
      <main>
        <Outlet context={{ isEditMode, setIsEditMode, saveProfileRef }} />
      </main>
      <Nav />
    </>
  );
}
