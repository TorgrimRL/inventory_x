import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import InviteEmployee from "../pages/InviteEmployee";
import { inviteUser } from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  inviteUser: jest.fn(),
}));

describe("InviteEmployee Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the invite form correctly", () => {
    render(<InviteEmployee />);

    expect(screen.getByText("Invite Employee")).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee Email/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /Invite \/ Add employee/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test("handles successful user invitation", async () => {
    (inviteUser as jest.Mock).mockResolvedValueOnce(undefined);

    render(<InviteEmployee />);

    const emailInput = screen.getByLabelText(/Employee Email/i);
    const submitButton = screen.getByRole("button", {
      name: /Invite \/ Add employee/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(inviteUser).toHaveBeenCalledWith("test@example.com");
      expect(inviteUser).toHaveBeenCalledTimes(1);

      expect(
        screen.getByText(
          "Successfully invited test@example.com to the inventory.",
        ),
      ).toBeInTheDocument();
    });

    expect(emailInput).toHaveValue("");
  });

  test("displays an error message when the backend returns a detail string", async () => {
    const errorMessage = "Only the owner can edit name and price.";
    (inviteUser as jest.Mock).mockRejectedValueOnce({
      response: {
        data: { detail: errorMessage },
      },
    });

    render(<InviteEmployee />);

    const emailInput = screen.getByLabelText(/Employee Email/i);
    const submitButton = screen.getByRole("button", {
      name: /Invite \/ Add employee/i,
    });

    fireEvent.change(emailInput, { target: { value: "error@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(inviteUser).toHaveBeenCalledWith("error@example.com");
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(emailInput).toHaveValue("error@example.com");
  });

  test("displays a generic error message when the backend is unreachable or returns unknown errors", async () => {
    (inviteUser as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    render(<InviteEmployee />);

    const emailInput = screen.getByLabelText(/Employee Email/i);
    const submitButton = screen.getByRole("button", {
      name: /Invite \/ Add employee/i,
    });

    fireEvent.change(emailInput, { target: { value: "generic@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred while inviting the user."),
      ).toBeInTheDocument();
    });
  });
});
