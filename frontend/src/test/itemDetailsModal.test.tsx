import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ItemDetailsModal from "../components/inventory/itemDetailsModal";

describe("ItemDetailsModal - user story tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderModal(
    overrides?: Partial<React.ComponentProps<typeof ItemDetailsModal>>,
  ) {
    const props: React.ComponentProps<typeof ItemDetailsModal> = {
      open: true,
      item: {
        id: 1,
        name: "Milk",
        stock: 10,
        price: 25,
        low_stock_threshold: 5,
        description: "Fresh milk from Norway",
        category_ids: [],
      },
      onClose: jest.fn(),
      renderCategoryNames: () => "No category",
      isLowStock: () => false,
      ...overrides,
    };

    render(<ItemDetailsModal {...props} />);
    return props;
  }

  test("success: opens modal and shows item details", async () => {
    renderModal();

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("Milk")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/fresh milk from norway/i),
    ).toBeInTheDocument();
  });

  test("shows description", async () => {
    renderModal({
      item: {
        id: 1,
        name: "Bread",
        description: "Baked this morning",
      } as any,
    });

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/baked this morning/i)).toBeInTheDocument();
  });

  test("shows item name so user can identify item", async () => {
    renderModal({
      item: {
        id: 1,
        name: "Cheese",
        description: "Yellow cheese",
      } as any,
    });

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("Cheese")).toBeInTheDocument();
  });

  test("handles missing description without crashing", async () => {
    renderModal({
      item: {
        id: 1,
        name: "Water",
      } as any,
    });

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("Water")).toBeInTheDocument();
  });

  test("close button closes modal via onClose", async () => {
    const user = userEvent.setup();
    const props = renderModal();

    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: /close/i }));

    expect(props.onClose).toHaveBeenCalled();
  });

  test("does not render when closed", () => {
    renderModal({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
