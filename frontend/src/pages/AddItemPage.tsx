import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddItemPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate(); // useNavigate for programmatic navigation

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Reset messages
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post("/api/inventory/", { name, price, stock });

      // On success, show success message and redirect to inventory list
      setSuccessMessage("Item added successfully!");
      setTimeout(() => {
        navigate("/"); // Redirect to the inventory page after 2 seconds
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Log the error message if it's an instance of Error
      } else {
        setError("An error occurred while adding the item.");
      }
    }
  };

  return (
    <div>
      <h1>Add Item</h1>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
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
      </form>
    </div>
  );
};

export default AddItemPage;
