import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Login from "../components/auth/loginForm";
import { checkSession } from "../services/authService";

//  MOCK DEPENDENCIES
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../services/authService.ts");

describe("Login Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Reset mocks before every test to ensure a clean slate
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  // TEST : AUTO-REDIRECT IF ALREADY LOGGED IN
  test("redirects to dashboard if session is valid", async () => {
    // Setup: checkSession returns true
    (checkSession as jest.Mock).mockResolvedValue(true);

    render(<Login />);

    // Expect loading text initially
    expect(screen.getByText(/verifying session/i)).toBeInTheDocument();

    // Wait for the redirect to happen
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  // TEST : RENDER FORM IF NOT LOGGED IN
  test("renders login form if session is invalid", async () => {
    // Setup: checkSession returns false
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(<Login />);

    // Wait for the loading state to finish and form to appear
    await waitFor(() => {
      expect(screen.queryByText(/verifying session/i)).not.toBeInTheDocument();
    });

    // Check if inputs exist
    expect(
      screen.getByPlaceholderText(/info@inventoryx.no/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  // TEST : SUCCESSFUL LOGIN FLOW
  test("calls login API and redirects on success", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);
    (axios.post as jest.Mock).mockResolvedValue({
      data: { token: "fake-token-123" },
      headers: { creds: "love is the key" }, //
      status: 200,
    });
    render(<Login />);

    // Wait for form to load
    await waitFor(() => screen.getByPlaceholderText(/info@inventoryx.no/i));

    // Simulate user typing
    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "secret123" },
    });

    // Simulate submit click
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Assert redirect happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  // TEST: NAVIGATION TO REGISTRATION
  test("navigates to registration page on create account click", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(<Login />);
    await waitFor(() =>
      screen.getByRole("button", { name: /Create Account/i }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/registration");
  });
});
