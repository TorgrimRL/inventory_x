// @ts-expect-error: None
import { TextDecoder, TextEncoder } from "util";
// @ts-expect-error: None
global.TextEncoder = TextEncoder;
// @ts-expect-error: None
global.TextDecoder = TextDecoder;

import { fireEvent, render, screen } from "@testing-library/react";

import { Root } from "../main";

jest.mock("../services/authService", () => ({
  checkSession: jest.fn().mockResolvedValue(false),
}));

jest.mock("../services/inventoryService", () => ({
  getActiveInventory: jest.fn().mockResolvedValue(null),
}));

describe("Theme persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("app starts in light mode by default", async () => {
    render(<Root />);
    await screen.findByRole("checkbox", { name: /toggle theme/i });
    expect(localStorage.getItem("theme")).toBe("light");
  });

  test("loads dark theme from localStorage on startup", async () => {
    localStorage.setItem("theme", "dark");
    render(<Root />);
    await screen.findByRole("checkbox", { name: /toggle theme/i });
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  test("switching theme updates localStorage", async () => {
    render(<Root />);
    const switchInput = await screen.findByRole("checkbox", {
      name: /toggle theme/i,
    });
    fireEvent.click(switchInput);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
