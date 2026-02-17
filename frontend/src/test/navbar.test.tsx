// @ts-expect-error: None
import { TextDecoder, TextEncoder } from "util";
// @ts-expect-error: None
global.TextEncoder = TextEncoder;
// @ts-expect-error: None
global.TextDecoder = TextDecoder;

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App";
import { checkSession } from "../services/authService";

jest.mock("../services/authService");

describe("Navbar Component", () => {
  test("Ensure the existence of navbar", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => expect(checkSession).toHaveBeenCalled());
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
