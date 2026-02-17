import { render, screen, waitFor } from "@testing-library/react";

import { PATHS } from "../App";
import axios from "../services/apiClient";
import AuthGuardLayout from "../services/authguard";

jest.mock("../services/apiClient");
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="protected">Protected Content</div>,
}));

describe("Auth Guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to login if session is invalid", async () => {
    // Setup: API Failure
    (axios.get as jest.Mock).mockRejectedValue(new Error("No session"));

    render(<AuthGuardLayout />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(PATHS.LOGIN);
    });
  });

  test("renders protected content if session is valid", async () => {
    // Setup: API Success
    (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

    render(<AuthGuardLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("protected")).toBeInTheDocument();
    });
  });
});
