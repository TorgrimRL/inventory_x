import { render, screen } from "@testing-library/react";
import { AddResult } from "./math";

test.each([
  [1, 2, "3"],
  [5, 7, "12"],
])("viser %i + %i = %s", (a, b, result) => {
  render(<AddResult a={a} b={b} />);
  expect(screen.getByText(result)).toBeInTheDocument();
});
