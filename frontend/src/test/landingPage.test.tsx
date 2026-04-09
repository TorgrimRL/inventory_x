import "@testing-library/jest-dom";

import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";
import LandingPage from "../pages/landingPage";
import { LightTheme } from "../theme";

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
    render(
      <ThemeProvider theme={LightTheme}>
        <LandingPage />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /inventory x/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get started/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  test("clicking Get Started navigates to registration page", () => {
    render(
      <ThemeProvider theme={LightTheme}>
        <LandingPage />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.REGISTRATION);
  });

  test("clicking Log in navigates to login page", () => {
    render(
      <ThemeProvider theme={LightTheme}>
        <LandingPage />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.LOGIN);
  });

  test("clicking Create account navigates to registration page", () => {
    render(
      <ThemeProvider theme={LightTheme}>
        <LandingPage />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.REGISTRATION);
  });
});
