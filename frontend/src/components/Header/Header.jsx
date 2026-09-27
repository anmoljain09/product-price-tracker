import "./Header.css";
import flag from "../../assets/Flag.JPG";

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">

        <a href="/" className="brand">
          <img
            src={flag}
            alt="Product Price Tracker"
            className="brand-flag"
          />

          <span className="brand-name">
            Product Price Tracker
          </span>
        </a>

      </div>
    </header>
  );
}

export default Header;