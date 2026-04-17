import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditItemModal from "../components/inventory/editItemModal";
import {
  adjustStock,
  createActiveCategory,
  deleteItem,
  listActiveCategories,
  updateItem,
} from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  adjustStock: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  listActiveCategories: jest.fn(),
  createActiveCategory: jest.fn(),
}));

const mockedAdjustStock = adjustStock as jest.MockedFunction<
  typeof adjustStock
>;
const mockedUpdateItem = updateItem as jest.MockedFunction<typeof updateItem>;
const mockedDeleteItem = deleteItem as jest.MockedFunction<typeof deleteItem>;
const mockedListActiveCategories = listActiveCategories as jest.MockedFunction<
  typeof listActiveCategories
>;
const mockedCreateActiveCategory = createActiveCategory as jest.MockedFunction<
  typeof createActiveCategory
>;

describe("EditItemModal - user story tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn(
      () => "blob:preview",
    ) as typeof URL.createObjectURL;
    mockedListActiveCategories.mockResolvedValue([
      { id: "c1", name: "Cookies" },
      { id: "c2", name: "Cakes" },
      { id: "c3", name: "Dairy" },
    ] as any);
    mockedCreateActiveCategory.mockResolvedValue({
      id: "c4",
      name: "New",
    } as any);
  });
  jest.setTimeout(15000);

  function renderModal(
    overrides?: Partial<React.ComponentProps<typeof EditItemModal>>,
  ) {
    const props: React.ComponentProps<typeof EditItemModal> = {
      open: true,
      itemId: 1,
      initialName: "Milk",
      initialPrice: 25,
      currentStock: 2,
      initialLowStockThreshold: null,
      low_stock_notification: false,
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

  test("success (owner): updates name/price/threshold and adjusts stock, updates parent and closes", async () => {
    mockedUpdateItem.mockResolvedValueOnce({} as any);
    mockedAdjustStock.mockResolvedValueOnce({ stock: 5 } as any);

    const user = userEvent.setup();
    const props = renderModal({
      canEditDetails: true,
      initialLowStockThreshold: 2,
    });

    const dialog = await screen.findByRole("dialog");

    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /price/i,
    });
    const thresholdInput = within(dialog).getByRole("spinbutton", {
      name: /low stock threshold/i,
    });

    await user.clear(nameInput);
    await user.type(nameInput, "Skim Milk");

    await user.clear(priceInput);
    await user.type(priceInput, "30");

    await user.clear(thresholdInput);
    await user.type(thresholdInput, "4");

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "3");
    await user.click(within(dialog).getByRole("button", { name: /increase/i }));
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockedUpdateItem).toHaveBeenCalledWith(1, {
        name: "Skim Milk",
        price: 30,
        low_stock_threshold: 4,
        low_stock_notification: false,
        category_ids: [],
        image: null,
        remove_image: false,
      });
    });

    await waitFor(() => {
      expect(mockedAdjustStock).toHaveBeenCalledWith(1, "increase", 3);
    });

    expect(props.onItemUpdated).toHaveBeenCalledWith({
      id: 1,
      name: "Skim Milk",
      price: 30,
      lowStockThreshold: 4,
      low_stock_notification: false,
      category_ids: [],
      image_url: undefined,
    });

    expect(props.onStockUpdated).toHaveBeenCalledWith(5);
    expect(props.onClose).toHaveBeenCalled();
  });

  test("employee: name/price/threshold fields are disabled, but stock adjust still works", async () => {
    mockedAdjustStock.mockResolvedValueOnce({ stock: 10 } as any);

    const user = userEvent.setup();
    const props = renderModal({
      canEditDetails: false,
      currentStock: 2,
      initialLowStockThreshold: 5,
    });

    const dialog = await screen.findByRole("dialog");

    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /price/i,
    });
    const thresholdInput = within(dialog).getByRole("spinbutton", {
      name: /low stock threshold/i,
    });

    expect(nameInput).toBeDisabled();
    expect(priceInput).toBeDisabled();
    expect(thresholdInput).toBeDisabled();

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "2");
    await user.click(within(dialog).getByRole("button", { name: /increase/i }));
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

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
    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

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

    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to delete this item/i),
      ).not.toBeInTheDocument();
    });
  });

  test("owner: invalid low stock threshold blocks save and does not call backend", async () => {
    const user = userEvent.setup();
    renderModal({ canEditDetails: true, initialLowStockThreshold: 2 });

    const dialog = await screen.findByRole("dialog");

    const thresholdInput = within(dialog).getByRole("spinbutton", {
      name: /low stock threshold/i,
    });

    await user.clear(thresholdInput);
    await user.type(thresholdInput, "-1");

    expect(
      within(dialog).getByRole("button", { name: /^save$/i }),
    ).toBeDisabled();

    expect(mockedUpdateItem).not.toHaveBeenCalled();
    expect(mockedAdjustStock).not.toHaveBeenCalled();
  });

  test("owner: can clear low stock threshold back to null", async () => {
    mockedUpdateItem.mockResolvedValueOnce({} as any);

    const user = userEvent.setup();
    const props = renderModal({
      canEditDetails: true,
      initialLowStockThreshold: 5,
    });

    const dialog = await screen.findByRole("dialog");

    const thresholdInput = within(dialog).getByRole("spinbutton", {
      name: /low stock threshold/i,
    });

    await user.clear(thresholdInput);
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockedUpdateItem).toHaveBeenCalledWith(1, {
        name: "Milk",
        price: 25,
        low_stock_threshold: null,
        low_stock_notification: false,
        category_ids: [],
        image: null,
        remove_image: false,
      });
    });

    expect(props.onItemUpdated).toHaveBeenCalledWith({
      id: 1,
      name: "Milk",
      price: 25,
      lowStockThreshold: null,
      low_stock_notification: false,
      category_ids: [],
      image_url: undefined,
    });

    expect(props.onClose).toHaveBeenCalled();
  });

  test("owner can upload an image and save item changes", async () => {
    mockedUpdateItem.mockResolvedValueOnce({
      image_url: "/media/items/milk.png",
    } as any);

    const user = userEvent.setup();
    const props = renderModal({ canEditDetails: true });

    const dialog = await screen.findByRole("dialog");
    const saveButton = within(dialog).getByRole("button", { name: /^save$/i });
    const uploadButton = within(dialog).getByRole("button", {
      name: /upload image/i,
    });

    expect(uploadButton).toBeEnabled();
    expect(saveButton).toBeDisabled();

    const fileInput = uploadButton.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["image-data"], "milk.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockedUpdateItem).toHaveBeenCalledWith(1, {
        name: "Milk",
        price: 25,
        low_stock_threshold: null,
        low_stock_notification: false,
        category_ids: [],
        image: file,
        remove_image: false,
      });
    });

    expect(props.onItemUpdated).toHaveBeenCalledWith({
      id: 1,
      name: "Milk",
      price: 25,
      lowStockThreshold: null,
      low_stock_notification: false,
      category_ids: [],
      image_url: "/media/items/milk.png",
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  test("owner sees change image and remove image actions when item already has an image", async () => {
    renderModal({
      canEditDetails: true,
      initialImageUrl: "/media/items/existing.png",
    });

    const dialog = await screen.findByRole("dialog");
    const changeButton = within(dialog).getByRole("button", {
      name: /change image/i,
    });
    const removeButton = within(dialog).getByRole("button", {
      name: /remove image/i,
    });

    expect(within(dialog).getByRole("img", { name: /milk/i })).toBeInTheDocument();
    expect(changeButton).toBeEnabled();
    expect(removeButton).toBeEnabled();
  });

  test("employee can see existing image but image actions are disabled", async () => {
    renderModal({
      canEditDetails: false,
      initialImageUrl: "/media/items/existing.png",
    });

    const dialog = await screen.findByRole("dialog");
    const changeButton = within(dialog).getByRole("button", {
      name: /change image/i,
    });
    const removeButton = within(dialog).getByRole("button", {
      name: /remove image/i,
    });

    expect(within(dialog).getByRole("img", { name: /milk/i })).toBeInTheDocument();
    expect(changeButton).toHaveAttribute("aria-disabled", "true");
    expect(removeButton).toBeDisabled();
  });

  test("blocks save and shows warning when amount is set but direction is not selected", async () => {
    const user = userEvent.setup();
    renderModal({ canEditDetails: true });

    const dialog = await screen.findByRole("dialog");

    const amountInput = within(dialog).getByRole("spinbutton", {
      name: /amount/i,
    });
    await user.clear(amountInput);
    await user.type(amountInput, "5");

    expect(
      await within(dialog).findByText(
        /Please select increase or decrease to update stock/i,
      ),
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("button", { name: /^save$/i }),
    ).toBeDisabled();

    expect(mockedUpdateItem).not.toHaveBeenCalled();
    expect(mockedAdjustStock).not.toHaveBeenCalled();
  });
});
