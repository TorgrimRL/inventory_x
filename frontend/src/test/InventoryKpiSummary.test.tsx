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
    expect(screen.getByText(/340\s*kr/i)).toBeInTheDocument();

    expect(screen.getByText("Low-stock count")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Item count")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("shows a duplicated KPI card with filtered metrics when filter is active", () => {
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

    expect(screen.getByText(/information based on filter/i)).toBeInTheDocument();
    expect(screen.getByText(/340\s*kr/i)).toBeInTheDocument();
    expect(screen.getByText(/90\s*kr/i)).toBeInTheDocument();

    // There is a low-stock + item-count value for total and one for filtered card
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("shows zeros for empty inventory", () => {
    render(
      <InventoryKpiSummary
        allItems={[]}
        visibleItems={[]}
        showFilteredMetrics={false}
      />,
    );

    expect(screen.getByText(/0\s*kr/i)).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
  });
});
