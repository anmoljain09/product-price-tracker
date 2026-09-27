import "./INEStorePreview.css";
import ineStore from "../../assets/INEStore.png";

function INEStorePreview() {
  return (
    <section className="ine-preview">

      <div className="ine-preview-heading">
        <div>
          <span className="ine-preview-label">FEATURED Store</span>

          <h2>Explore products and check their latest prices</h2>

          <p>
            Browse the store, decide on a product, then come back
            here and search its name above
            and add it to your tracklist.
          </p>
        </div>

        <a
          href="https://demo.inelabteamdev.com/"
          target="_blank"
          rel="noreferrer"
          className="ine-store-button"
        >
          Visit INE Store
          <span>↗</span>
        </a>
      </div>

      <div className="ine-preview-card">

        <div className="ine-preview-image">
          <img
            src={ineStore}
            alt="INE Store preview"
          />
        </div>

        <div className="ine-preview-info">

          <div className="ine-store-title">
            <span className="ine-store-dot"></span>
            <span>INE Store</span>
          </div>

          <h3>
            Find something you want to track?
          </h3>

          <p>
            Browse the store, decide on a product, then come back
            here and search its name.
          </p>

          <div className="ine-instruction">
            <div className="ine-instruction-number">1</div>
            <div>
              <strong>Choose a product</strong>
              <span>Browse products on INE Store.</span>
            </div>
          </div>

          <div className="ine-instruction">
            <div className="ine-instruction-number">2</div>
            <div>
              <strong>Search the product</strong>
              <span>Enter its name in the search bar above. If not found, try Refreshing Product Cache</span>
            </div>
          </div>

          <div className="ine-instruction">
            <div className="ine-instruction-number">3</div>
            <div>
              <strong>Add to Tracklist</strong>
              <span>Start tracking its price.</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}

export default INEStorePreview;