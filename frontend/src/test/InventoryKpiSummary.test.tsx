import { render, screen } from "@testing-library/react";

import InventoryKpiSummary from "../components/inventory/InventoryKpiSummary";

describe("InventoryKpiSummary", () => {
  test("shows total metrics for full list", () => {
    const items = [
      { price: 25, stock: 10 },
      { price: 30, stock: 3 },
      { price: 50, stock: 0 },
    ];

    render(
      <InventoryKpiSummary
        allItems={items}
        visibleItems={items}
        showFilteredMetrics={false}
        lowStockThreshold={5}
      />,
    );

    expect(screen.getByText("Total inventory value")).toBeInTheDocument();
    expect(screen.getByText("340")).toBeInTheDocument();

    expect(screen.getByText("Low-stock count")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Item count")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("shows filtered metrics in addition to totals when filter is active", () => {
    const allItems = [
      { price: 25, stock: 10 },
      { price: 30, stock: 3 },
      { price: 50, stock: 0 },
    ];

    const filteredItems = [
      { price: 30, stock: 3 },
      { price: 50, stock: 0 },
    ];

    render(
      <InventoryKpiSummary
        allItems={allItems}
        visibleItems={filteredItems}
        showFilteredMetrics
        lowStockThreshold={5}
      />,
    );

    expect(screen.getByText("340")).toBeInTheDocument();
    expect(screen.getByText("Filtered value: 90")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  test("shows zeros for empty inventory", () => {
    render(
      <InventoryKpiSummary
        allItems={[]}
        visibleItems={[]}
        showFilteredMetrics={false}
      />,
    );

    expect(screen.getAllByText("0")).toHaveLength(3);
  });
});
