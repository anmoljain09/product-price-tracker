import React, { useEffect, useMemo, useState } from "react";
import SearchCard from "../SearchCard/SearchCard";
import "./Search.css";
import api from "../../services/api";

const Search = () => {
  const [search, setSearch] = useState("");
  const [cacheProducts, setCacheProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD EXISTING CACHE
  // ========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await api.get("/products/cache");

        if (response.data.success) {
          setCacheProducts(response.data.products);
        } else {
          setCacheProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setCacheProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ========================================
  // REFRESH PRODUCT CACHE
  // ========================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      // Search clear kar do while refreshing
      setSearch("");

      const response = await api.post(
        "/products/cache/refresh"
      );

      if (response.data.success) {
        setCacheProducts(response.data.products);

        console.log(
          `Cache refreshed: ${response.data.products.length} products`
        );
      }
    } catch (error) {
      console.error(
        "Failed to refresh products:",
        error
      );

      if (error.response) {
        console.error(
          "Server response:",
          error.response.data
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ========================================
  // SEARCH PRODUCTS
  // ========================================

  const filteredProduct = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return [];
    }

    return cacheProducts.filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(searchValue)
    );
  }, [search, cacheProducts]);

  // ========================================
  // UI
  // ========================================

  return (
    <div className="search-container">

      {/* ================================== */}
      {/* SEARCH + REFRESH */}
      {/* ================================== */}

      <div className="search-row">

        {/* SEARCH BOX */}

        <div className="search-wrapper">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={
              loading
                ? "Loading products..."
                : "Search products..."
            }
            className="search-input"
            disabled={loading || refreshing}
          />

          {search && !refreshing && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>

        {/* REFRESH BUTTON */}

        <button
          type="button"
          className="refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span className="refresh-spinner"></span>
              Refreshing...
            </>
          ) : (
            <>
              ↻ Refresh Product Cache
            </>
          )}
        </button>

      </div>

      {/* ================================== */}
      {/* REFRESH MESSAGE */}
      {/* ================================== */}

      {refreshing && (
        <div className="refresh-message">
          <p>
            Updating product list. Please wait...
          </p>
        </div>
      )}

      {/* ================================== */}
      {/* SEARCH RESULTS */}
      {/* ================================== */}

      {!refreshing && search.trim() && (
        <>
          {filteredProduct.length > 0 ? (
            <SearchCard
              filteredProduct={filteredProduct}
            />
          ) : (
            <div className="no-results">
              <p>No products found</p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Search;
