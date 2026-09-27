import React from "react";
import "./SearchCard.css";
import api from "../../services/api";

const SearchCard = ({ filteredProduct = [] }) => {
  const handleAddToTasklist = async (product) => {
    try {
      const { data } = await api.post("/products/add", product);

      console.log(data);
    } catch (error) {
      console.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="search-card-grid">
      {filteredProduct.map((product) => (
        <div className="search-card" key={product.id}>
          <div className="search-card-content">
            <h3 className="search-card-title">
              {product.name}
            </h3>

            <div className="search-card-actions">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="check-product-btn"
              >
                Check this product
              </a>

              <button
                type="button"
                className="tasklist-btn"
                onClick={() => handleAddToTasklist(product)}
              >
                Add to Tasklist
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchCard;