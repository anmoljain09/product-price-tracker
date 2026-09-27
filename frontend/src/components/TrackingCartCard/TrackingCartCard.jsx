import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./TrackingCartCard.css";

const TrackingCartCard = () => {
  const [products, setProducts] = useState([]);
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get(
          "/products/tracklistcart"
        );

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error(
          "Failed to fetch tracking cart:",
          error
        );
      }
    };

    fetchProducts();
  }, []);

  const handleTrack = async (product) => {
    try {
      setTrackingId(product._id);

      const { data } = await api.post(
        "/products/trackableurl",
        {
          url: product.url,
        }
      );

      console.log(data);

      if (data.success) {
        alert("Product scraped successfully");
      }
    } catch (error) {
      console.error(
        "Failed to track product:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to track product"
      );
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="tracking-cart-container">
      <div className="tracking-cart-grid">
        {products.map((product) => (
          <div
            className="tracking-cart-card"
            key={product._id}
          >
            <h3>{product.name}</h3>

            <p>Product ID: {product.id}</p>

            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check Product
            </a>

            <button
              type="button"
              className="track-product-btn"
              onClick={() => handleTrack(product)}
              disabled={trackingId === product._id}
            >
              {trackingId === product._id
                ? "Scraping..."
                : "Track Current Detail"}
            </button>

            <div className="tracking-status">
              <span></span>
              press button to start tracking
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingCartCard;
