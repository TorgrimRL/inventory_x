import "./adjustStockModal.css";

import { useState } from "react";

import { adjustStock } from "../../services/inventoryService";

type AdjustStockModalProps = {
  itemId: number;
  itemName: string;
  currentStock: number;
  onClose: () => void;
  onSuccess: (newStock: number) => void;
};

export default function AdjustStockModal({
  itemId,
  itemName,
  currentStock,
  onClose,
  onSuccess,
}: AdjustStockModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdjust(direction: "increase" | "decrease") {
    const parsedAmount = Number(amount);

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await adjustStock(itemId, direction, parsedAmount);
      onSuccess(result.stock);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Adjust stock</h2>

        <p>
          <strong>Item:</strong> {itemName}
        </p>
        <p>
          <strong>Current stock:</strong> {currentStock}
        </p>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button onClick={() => handleAdjust("increase")} disabled={loading}>
            Increase
          </button>
          <button onClick={() => handleAdjust("decrease")} disabled={loading}>
            Decrease
          </button>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
