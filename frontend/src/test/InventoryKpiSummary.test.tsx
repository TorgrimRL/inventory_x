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

    expect(screen.getByText("Items with low stock")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Item count")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Average price")).toBeInTheDocument();
    expect(screen.getByText(/35\s*kr/i)).toBeInTheDocument();
    expect(screen.getByText("Total units in stock")).toBeInTheDocument();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
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

    expect(
      screen.getByText(/information based on filter/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/340\s*kr/i)).toBeInTheDocument();
    expect(screen.getByText(/90\s*kr/i)).toBeInTheDocument();
    expect(screen.getByText(/35\s*kr/i)).toBeInTheDocument();

    // 40 kr exists both as total value (340 kr) substring and filtered avg (40 kr)
    expect(screen.getAllByText(/40\s*kr/i).length).toBeGreaterThanOrEqual(1);

    // There is a low-stock + item-count value for total and one for filtered card
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("13")).toBeInTheDocument(); // total units
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1); // item count / filtered units
  });

  test("shows zeros for empty inventory", () => {
    render(
      <InventoryKpiSummary
        allItems={[]}
        visibleItems={[]}
        showFilteredMetrics={false}
      />,
    );

    expect(screen.getAllByText(/0\s*kr/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
  });
});
