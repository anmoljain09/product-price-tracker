import "./Footer.css";
import flag from "../../assets/Flag.JPG";

function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-main">

        {/* Left */}
        <div className="footer-left">

          <img
            src={flag}
            alt="Product Price Tracker"
            className="footer-flag"
          />

          <p className="footer-note">
            If it seems too simple, that's because I designed it
            with your busy schedule in mind.
          </p>

        </div>

        {/* Right */}
        <div className="footer-right">

          <h4>Anmol Jain</h4>

          <div className="footer-contact">

            <a>8882323263</a>

            <a href="mailto:iamanmoljaainofficial@gmail.com">
              iamanmoljaainofficial@gmail.com
            </a>

            <a
              href="https://github.com/anmoljain09"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/anmol-jain-988555325/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>

          </div>

        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">

        <span>© 2026 Building towards Full Stack Contractor</span>
      
      </div>

    </footer>
  );
}

export default Footer;
