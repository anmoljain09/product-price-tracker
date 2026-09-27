import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./ScrapeHistoryTable.css";

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

const ScrapeHistoryTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const { data } = await api.get(
          "/products/detaildata"
        );

        if (data.success) {
          setData(data.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch scrape history:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, []);

  if (loading) {
    return (
      <div className="table-container">
        <p>Loading scrape history...</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Option</th>
            <th>Timestamp</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Outcome</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={item.id || index}>
              <td>
                <strong>
                  {item.productName}
                </strong>
              </td>

              <td>
                {item.option ?? "—"}
              </td>

              <td>
                {item.timestamp
                  ? formatDate(item.timestamp)
                  : "—"}
              </td>

              <td>
                {item.price !== null &&
                item.price !== undefined
                  ? `₹${item.price.toLocaleString(
                      "en-IN"
                    )}`
                  : "—"}
              </td>

              <td>
                {item.stock ?? "—"}
              </td>

              <td>
                <span
                  className={`status ${item.outcome}`}
                >
                  {item.outcome ?? "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScrapeHistoryTable;
