import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";
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
      expect(mockNavigate).toHaveBeenCalledWith(PATHS.INVENTORIES);
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
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
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
    await screen.findByLabelText(/email/i);

    // Simulate user typing
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });

    // Simulate submit click
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Assert redirect happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(PATHS.INVENTORIES);
    });
  });

  // TEST: NAVIGATION TO REGISTRATION
  test("navigates to registration page on create account click", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(<Login />);
    await screen.findByRole("button", { name: /create account/i });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.REGISTRATION);
  });

  // TEST: Invalid Email.
  test("Server nested email error is rendered as string", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          detail: {
            email: ["Enter a valid email address."],
          },
        },
      },
    });

    render(<Login />);
    await screen.findByLabelText(/email/i);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.c" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();

    expect(axios.post).toHaveBeenCalled();
  });

  // TEST: Empty password.
  test("Empty password shows frontend validation error", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);
    render(<Login />);

    await screen.findByLabelText(/email/i);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/please enter password/i),
    ).toBeInTheDocument();
  });
});
