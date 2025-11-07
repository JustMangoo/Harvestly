import { Link, useLocation } from "react-router-dom";
import "./Nav.css";
import IconElement from "./IconElement.jsx";

export default function Nav() {
  const location = useLocation();

  const NAV_LINKS = [
    { to: "/", icon: "home" },
    { to: "/store", icon: "local_mall" },
    { to: "/calendar", icon: "event" },
    { to: "/forum", icon: "forum" },
    { to: "/profile", icon: "account_circle" },
  ];

  return (
    <nav>
      <ul>
        {NAV_LINKS.map(({ to, icon }) => {
          const active = location.pathname === to;
          return (
            <li key={to}>
              <Link to={to} className={active ? "active" : ""}>
                <IconElement
                  icon={icon}
                  size={44}
                  filled={active}
                  className={active ? "nav-icon active" : "nav-icon"}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
