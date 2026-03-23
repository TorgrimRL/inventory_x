import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdjustStockModal from "../components/inventory/adjustStockModal";
import { adjustStock } from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  adjustStock: jest.fn(),
}));

const mockedAdjustStock = adjustStock as jest.MockedFunction<
  typeof adjustStock
>;

describe("AdjustStockModal - user story tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderModal(
    overrides?: Partial<React.ComponentProps<typeof AdjustStockModal>>,
  ) {
    const props: React.ComponentProps<typeof AdjustStockModal> = {
      open: true,
      itemId: 1,
      itemName: "Milk",
      currentStock: 2,
      onClose: jest.fn(),
      onStockUpdated: jest.fn(),
      ...overrides,
    };

    render(<AdjustStockModal {...props} />);
    return props;
  }

  test("success: increases stock, calls backend, updates parent and closes", async () => {
    mockedAdjustStock.mockResolvedValueOnce({ stock: 5 } as any);

    const user = userEvent.setup();
    const props = renderModal();

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Milk")).toBeInTheDocument();
    expect(within(dialog).getByText(/current stock:\s*2/i)).toBeInTheDocument();

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "3");

    await user.click(within(dialog).getByRole("button", { name: /increase/i }));
    await user.click(
      within(dialog).getByRole("button", { name: /update stock/i }),
    );

    await waitFor(() => {
      expect(mockedAdjustStock).toHaveBeenCalledWith(1, "increase", 3);
    });

    expect(props.onStockUpdated).toHaveBeenCalledWith(5);
    expect(props.onClose).toHaveBeenCalled();
  });

  test("decrease larger than current stock: shows frontend error and does not call backend", async () => {
    const user = userEvent.setup();
    const props = renderModal({ currentStock: 2 });

    const dialog = await screen.findByRole("dialog");

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "5");

    await user.click(within(dialog).getByRole("button", { name: /decrease/i }));

    expect(
      await within(dialog).findByText(/stock cannot be negative/i),
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /update stock/i }),
    ).toBeDisabled();

    expect(mockedAdjustStock).not.toHaveBeenCalled();
    expect(props.onStockUpdated).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test("amount 0 is allowed by current component state, so no amount validation error is shown", async () => {
    const dialogProps = renderModal();

    const dialog = await screen.findByRole("dialog");

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });

    expect(amountInput).toHaveValue(0);
    expect(
      within(dialog).queryByText(/enter a positive whole number/i),
    ).not.toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /update stock/i }),
    ).toBeDisabled();

    expect(mockedAdjustStock).not.toHaveBeenCalled();
    expect(dialogProps.onStockUpdated).not.toHaveBeenCalled();
  });

  test("handles backend detail string shape: shows detail as error", async () => {
    mockedAdjustStock.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: "Stock cannot be negative" },
      },
    });

    const user = userEvent.setup();
    renderModal();

    const dialog = await screen.findByRole("dialog");

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });

    await user.clear(amountInput);
    await user.type(amountInput, "1");

    await user.click(within(dialog).getByRole("button", { name: /decrease/i }));
    await user.click(
      within(dialog).getByRole("button", { name: /update stock/i }),
    );

    await waitFor(() => {
      expect(mockedAdjustStock).toHaveBeenCalledWith(1, "decrease", 1);
    });

    expect(
      await within(dialog).findByText(/stock cannot be negative/i),
    ).toBeInTheDocument();
  });

  test("cancel closes modal via onClose (when not saving)", async () => {
    const user = userEvent.setup();
    const props = renderModal();

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });

  test("shows warning by default when no direction is selected", async () => {
    renderModal();

    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).getByText(/please select increase or decrease/i),
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /update stock/i }),
    ).toBeDisabled();
  });
});
