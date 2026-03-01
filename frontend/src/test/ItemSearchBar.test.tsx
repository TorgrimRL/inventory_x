import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import ItemSearchBar from "../components/inventory/ItemSearchBar";

function Wrapper({
  onChangeSpy,
  disabled = false,
  initialValue = "",
}: {
  onChangeSpy: jest.Mock;
  disabled?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <ItemSearchBar
      value={value}
      disabled={disabled}
      onChange={(v) => {
        onChangeSpy(v);
        setValue(v);
      }}
      onSearch={jest.fn()}
      onClear={() => {
        setValue("");
      }}
    />
  );
}

describe("ItemSearchBar", () => {
  test("calls onChange with the full value while typing", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Wrapper onChangeSpy={onChange} />);

    const input = screen.getByLabelText(/search by name/i);
    await user.type(input, "milk");

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith("milk");
  });

  test("Search button calls onSearch", async () => {
    const user = userEvent.setup();

    const onChange = jest.fn();
    const onSearch = jest.fn();
    const onClear = jest.fn();

    render(
      <ItemSearchBar
        value="milk"
        onChange={onChange}
        onSearch={onSearch}
        onClear={onClear}
      />,
    );

    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  test("pressing Enter in the input calls onSearch", async () => {
    const user = userEvent.setup();

    const onChange = jest.fn();
    const onSearch = jest.fn();
    const onClear = jest.fn();

    render(
      <ItemSearchBar
        value="milk"
        onChange={onChange}
        onSearch={onSearch}
        onClear={onClear}
      />,
    );

    const input = screen.getByLabelText(/search by name/i);
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  test("Clear button calls onClear", async () => {
    const user = userEvent.setup();

    const onChange = jest.fn();
    const onSearch = jest.fn();
    const onClear = jest.fn();

    render(
      <ItemSearchBar
        value="milk"
        onChange={onChange}
        onSearch={onSearch}
        onClear={onClear}
      />,
    );

    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test("Clear button is disabled when input is empty (trimmed)", () => {
    const onChange = jest.fn();
    const onSearch = jest.fn();
    const onClear = jest.fn();

    render(
      <ItemSearchBar
        value="   "
        onChange={onChange}
        onSearch={onSearch}
        onClear={onClear}
      />,
    );

    expect(screen.getByRole("button", { name: /clear/i })).toBeDisabled();
  });

  test("Search and input are disabled when disabled=true", () => {
    const onChange = jest.fn();
    const onSearch = jest.fn();
    const onClear = jest.fn();

    render(
      <ItemSearchBar
        value="milk"
        disabled
        onChange={onChange}
        onSearch={onSearch}
        onClear={onClear}
      />,
    );

    expect(screen.getByLabelText(/search by name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
  });
});
