import "./App.css"; // Assuming you want to keep styles in your CSS file

import { useEffect, useState } from "react";

import XLogo from "/logo1.png";



function App() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    fetch("/api/inventory/")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.data || data); // Update items state
        setLoading(false); // Set loading to false
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load items.");
        setLoading(false); // Set loading to false even in case of error
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://inventoryx.td.-uit.no" target="_blank">
          <img src={XLogo} className="logo" alt="Inventory X logo" />
        </a>
      </div>

      <h1>Inventory X</h1>

      <div className="card">
        <h2>Items from Database:</h2>
        {loading && <p>Loading items...</p>} {/* Show loading state */}
        {error && <p className="error">{error}</p>} {/* Show error message */}
        {!loading && !error && items.length === 0 && (
          <p>No items found.</p>
        )}{" "}
        {/* Empty state */}
        {items.map((item) => (
          <div className="item-card" key={item.id}>
            <h3>{item.name}</h3>
            <p>Price: ${item.price}</p>
            <p>Stock: {item.stock}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
