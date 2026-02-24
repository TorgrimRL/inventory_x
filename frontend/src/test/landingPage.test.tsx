import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";
import LandingPage from "../pages/landingPage";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("LandingPage - user story tests", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test("visitor sees heading and primary actions", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 2, name: /inventory x/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  test("clicking Log in navigates to login page", () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.LOGIN);
  });

  test("clicking Create account navigates to registration page", () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.REGISTRATION);
  });
});
