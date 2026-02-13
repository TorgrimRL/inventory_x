import "@testing-library/jest-dom";

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";
import Registration from "../components/auth/registrationForm";

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("Registration Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders registration form with all inputs", () => {
    render(<Registration />);

    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/info@inventoryx.no/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  test("shows error for invalid email", async () => {
    render(<Registration />);

    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "invalid-email" }, // missing @ and .
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText("Invalid email address."),
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("shows error when password is empty", async () => {
    render(<Registration />);

    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "test@example.com" },
    });

    // Leave password empty and submit
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText("Password: Cannot be empty"),
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("shows error when passwords do not match", async () => {
    render(<Registration />);

    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "different123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText("Password: Passwords do not match."),
    ).toBeInTheDocument();
  });

  test("submits successfully and redirects after delay", async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 201 });

    render(<Registration />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/user/signup/", {
        email: "test@example.com",
        password: "secret123",
        display_name: "Test User",
      });
    });

    expect(
      await screen.findByText("Account created successfully."),
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.LOGIN);
  });

  test("displays backend email error with prefix", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: {
          detail: {
            email: ["User with this email already exists."],
          },
        },
      },
    });

    render(<Registration />);

    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText("Email: User with this email already exists."),
    ).toBeInTheDocument();
  });

  test("displays backend name error with prefix", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: {
          detail: {
            display_name: ["Name is too long."],
          },
        },
      },
    });

    render(<Registration />);

    fireEvent.change(screen.getByPlaceholderText(/info@inventoryx.no/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText("Name: Name is too long."),
    ).toBeInTheDocument();
  });

  test("navigates to login page when link is clicked", () => {
    render(<Registration />);

    fireEvent.click(screen.getByText("Login here"));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.LOGIN);
  });
});
