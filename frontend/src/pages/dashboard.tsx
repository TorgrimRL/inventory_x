// const Dashboard = () => {
//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Inventory Dashboard</h1>
//       <p>If you see this, your login redirect worked!</p>
//     </div>
//   );
// };

// export default Dashboard;

import { useState } from "react";

import AdjustStockModal from "../components/inventory/AdjustStockModal";

const Dashboard = () => {
  // Midlertidig demo-data (kun for Adjust Stock UI)
  const demoItem = {
    id: 1,
    name: "Demo item",
  };

  const [stock, setStock] = useState(10);
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Inventory Dashboard</h1>
      <p>If you see this, your login redirect worked!</p>

      {/* ---- TEMPORARY DEMO SECTION (will be replaced by item list) ---- */}
      <hr style={{ margin: "2rem 0" }} />

      <h2>Adjust stock (demo)</h2>
      <p>
        <strong>{demoItem.name}</strong>
      </p>
      <p>Current stock: {stock}</p>

      <button onClick={() => setShowModal(true)}>Adjust stock</button>

      {showModal && (
        <AdjustStockModal
          itemId={demoItem.id}
          itemName={demoItem.name}
          currentStock={stock}
          onClose={() => setShowModal(false)}
          onSuccess={(newStock) => setStock(newStock)}
        />
      )}
      {/* -------------------------------------------------------------- */}
    </div>
  );
};

export default Dashboard;
