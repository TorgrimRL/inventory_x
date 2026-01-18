import "./App.css";

import { useEffect, useState } from "react";

import viteLogo from "/vite.svg";

import reactLogo from "./assets/react.svg";

function App() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/inventory/")
      .then((res) => res.json())
      .then((data) => setItems(data.data || data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Inventory App</h1>

      <div className="card">
        <h2>Items from Database:</h2>

        {items.length === 0 && <p>Loading items or no data found...</p>}

        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #444",
              margin: "10px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
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
