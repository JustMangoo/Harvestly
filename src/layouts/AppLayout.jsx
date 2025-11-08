import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import { Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const location = useLocation();
  const showTopNav = location.pathname === "/profile";

  return (
    <>
      {showTopNav && <TopNav />}
      <main>
        <Outlet />
      </main>
      <Nav />
    </>
  );
}
