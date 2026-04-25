import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ItemDetailsModal from "../components/inventory/itemDetailsModal";

describe("ItemDetailsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderModal(
    overrides?: Partial<React.ComponentProps<typeof ItemDetailsModal>>,
  ) {
    const props: React.ComponentProps<typeof ItemDetailsModal> = {
      open: true,
      item: {
        name: "Milk",
        description: "Fresh milk from Norway",
      },
      onClose: jest.fn(),
      ...overrides,
    };

    render(<ItemDetailsModal {...props} />);
    return props;
  }

  test("success: opens modal and shows item details", async () => {
    renderModal();

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/^milk$/i)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/fresh milk from norway/i),
    ).toBeInTheDocument();
  });

  test("shows description when provided", async () => {
    renderModal({
      item: {
        name: "Bread",
        description: "Baked this morning",
      },
    });

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/baked this morning/i)).toBeInTheDocument();
  });

  test("shows item name so user can identify item", async () => {
    renderModal({
      item: {
        name: "Cheese",
        description: "Yellow cheese",
      },
    });

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/^cheese$/i)).toBeInTheDocument();
  });

  test("handles missing description without crashing", async () => {
    renderModal({
      item: {
        name: "Water",
      },
    });

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/water/i)).toBeInTheDocument();
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
