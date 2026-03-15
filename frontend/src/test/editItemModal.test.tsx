import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditItemModal from "../components/inventory/editItemModal";
import {
  adjustStock,
  deleteItem,
  updateItem,
} from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  adjustStock: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
}));

const mockedAdjustStock = adjustStock as jest.MockedFunction<
  typeof adjustStock
>;
const mockedUpdateItem = updateItem as jest.MockedFunction<typeof updateItem>;
const mockedDeleteItem = deleteItem as jest.MockedFunction<typeof deleteItem>;

describe("EditItemModal - user story tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderModal(
    overrides?: Partial<React.ComponentProps<typeof EditItemModal>>,
  ) {
    const props: React.ComponentProps<typeof EditItemModal> = {
      open: true,
      itemId: 1,
      initialName: "Milk",
      initialPrice: 25,
      currentStock: 2,
      canEditDetails: true,
      onClose: jest.fn(),
      onItemUpdated: jest.fn(),
      onStockUpdated: jest.fn(),
      onItemDeleted: jest.fn(),
      ...overrides,
    };

    render(<EditItemModal {...props} />);
    return props;
  }

  test("success (owner): updates name/price and adjusts stock, updates parent and closes", async () => {
    mockedUpdateItem.mockResolvedValueOnce({} as any);
    mockedAdjustStock.mockResolvedValueOnce({ stock: 5 } as any);

    const user = userEvent.setup();
    const props = renderModal({ canEditDetails: true });

    const dialog = await screen.findByRole("dialog");

    // Prefill
    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    expect(nameInput).toHaveValue("Milk");

    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /price/i,
    });
    expect(priceInput).toHaveValue(25);

    // Change details
    await user.clear(nameInput);
    await user.type(nameInput, "Skim Milk");

    await user.clear(priceInput);
    await user.type(priceInput, "30");

    // Stock: amount=3, increase
    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "3");

    await user.click(within(dialog).getByRole("button", { name: /increase/i }));

    // Save
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockedUpdateItem).toHaveBeenCalledWith(1, {
        name: "Skim Milk",
        price: 30,
      });
    });

    await waitFor(() => {
      expect(mockedAdjustStock).toHaveBeenCalledWith(1, "increase", 3);
    });

    // Parent callbacks
    expect(props.onItemUpdated).toHaveBeenCalledWith({
      id: 1,
      name: "Skim Milk",
      price: 30,
    });
    expect(props.onStockUpdated).toHaveBeenCalledWith(5);
    expect(props.onClose).toHaveBeenCalled();
  });

  test("employee: name/price fields are disabled, but stock adjust still works", async () => {
    mockedAdjustStock.mockResolvedValueOnce({ stock: 10 } as any);

    const user = userEvent.setup();
    const props = renderModal({ canEditDetails: false, currentStock: 2 });

    const dialog = await screen.findByRole("dialog");

    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /price/i,
    });

    expect(nameInput).toBeDisabled();
    expect(priceInput).toBeDisabled();

    // Stock: amount=2 increase
    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "2");

    await user.click(within(dialog).getByRole("button", { name: /increase/i }));
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    // Should NOT try to update item details
    expect(mockedUpdateItem).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mockedAdjustStock).toHaveBeenCalledWith(1, "increase", 2);
    });

    expect(props.onStockUpdated).toHaveBeenCalledWith(10);
    expect(props.onClose).toHaveBeenCalled();
  });

  test("owner: invalid price blocks save and does not call backend", async () => {
    const user = userEvent.setup();
    renderModal({ canEditDetails: true });

    const dialog = await screen.findByRole("dialog");

    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /price/i,
    });
    await user.clear(priceInput);
    await user.type(priceInput, "-1");

    // Save should be disabled (because price invalid for owners)
    expect(
      within(dialog).getByRole("button", { name: /^save$/i }),
    ).toBeDisabled();

    expect(mockedUpdateItem).not.toHaveBeenCalled();
    expect(mockedAdjustStock).not.toHaveBeenCalled();
  });

  test("owner: backend 403/validation error shows error message in modal", async () => {
    mockedUpdateItem.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { detail: "Only the owner can edit name and price." },
      },
    });

    const user = userEvent.setup();
    renderModal({ canEditDetails: true });

    const dialog = await screen.findByRole("dialog");

    // change something to trigger updateItem
    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    // amount can stay 0 (no stock change)
    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "0");

    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    expect(
      await within(dialog).findByText(
        /only the owner can edit name and price/i,
      ),
    ).toBeInTheDocument();

    // updateItem called, adjustStock should not be called because amount=0
    expect(mockedUpdateItem).toHaveBeenCalled();
    expect(mockedAdjustStock).not.toHaveBeenCalled();
  });

  test("cancel closes modal via onClose (when not saving)", async () => {
    const user = userEvent.setup();
    const props = renderModal();

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });

  test("employee: delete button is not visible", async () => {
    renderModal({ canEditDetails: false });
    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).queryByRole("button", { name: /delete item/i }),
    ).not.toBeInTheDocument();
  });

  test("owner: can successfully delete an item via confirmation dialog", async () => {
    mockedDeleteItem.mockResolvedValueOnce({} as any);

    const user = userEvent.setup();
    const props = renderModal({ canEditDetails: true, itemId: 99 });

    const dialog = await screen.findByRole("dialog");
    const initialDeleteBtn = within(dialog).getByRole("button", {
      name: /delete item/i,
    });

    await user.click(initialDeleteBtn);

    const confirmDeleteBtn = await screen.findByRole("button", {
      name: /^delete$/i,
    });
    expect(
      screen.getByText(/Are you sure you want to delete this item/i),
    ).toBeInTheDocument();

    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockedDeleteItem).toHaveBeenCalledWith(99);
    });

    expect(props.onItemDeleted).toHaveBeenCalledWith(99);
    expect(props.onClose).toHaveBeenCalled();
  });

  test("owner: cancelling delete confirmation aborts deletion", async () => {
    const user = userEvent.setup();
    const props = renderModal({ canEditDetails: true, itemId: 99 });

    const dialog = await screen.findByRole("dialog");
    const initialDeleteBtn = within(dialog).getByRole("button", {
      name: /delete item/i,
    });

    await user.click(initialDeleteBtn);

    const cancelBtn = await screen.findByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    expect(mockedDeleteItem).not.toHaveBeenCalled();
    expect(props.onItemDeleted).not.toHaveBeenCalled();

    // Check that the confirmation dialog text is gone
    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to delete this item/i),
      ).not.toBeInTheDocument();
    });
  });
});
