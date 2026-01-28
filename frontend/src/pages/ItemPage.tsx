import "./App.css"; // Assuming you want to keep styles in your CSS file

import axios from "axios";
import { useEffect, useState } from "react";

// Import the updated logo
import XLogo from "/logo1.png";

function App() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post("/api/inventory/", { name, price, stock });
      setShowModal(false); // Close modal on successful submit
      setItems((prevItems) => [
        ...prevItems,
        {
          name,
          price,
          stock,
          order_id: Math.random().toString(),
          id: Date.now(),
        },
      ]); // Add new item to the list
      setName(""); // Reset fields
      setPrice(0);
      setStock(0);
    } catch (err) {
      console.error(err);
      setError("Failed to add item.");
    }
  };

  return (
    <>
      <div>
        {/* Logo and link */}
        <a
          href="https://inventoryx.td.-uit.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={XLogo} className="logo" alt="Inventory X logo" />
        </a>
      </div>

      <h1>Inventory X</h1>

      <button onClick={() => setShowModal(true)} className="add-item-button">
        Add Item
      </button>

      <div className="card">
        <h2>Items in Stock:</h2>
        {loading && <p>Loading items...</p>} {/* Show loading state */}
        {error && <p className="error">{error}</p>} {/* Show error message */}
        {!loading && !error && items.length === 0 && (
          <p>No items found.</p>
        )}{" "}
        {/* Empty state */}
        {/* Table to display inventory items */}
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product name</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.stock}</td>
                <td>${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding item */}
      {showModal && (
        <div className="overlay">
          <div className="modal">
            <h2>Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  required
                />
              </div>

              <button type="submit">Add Item</button>
              <button type="button" onClick={() => setShowModal(false)}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </>

  );
}

export default App;