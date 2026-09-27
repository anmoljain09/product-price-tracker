import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="main-navbar">
      <div className="navbar-inner">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/add-product"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Add New Product
        </NavLink>

        <NavLink
          to="/tracking-cart"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Tracking Cart
        </NavLink>

      </div>
    </nav>
  );
}

export default Navbar;