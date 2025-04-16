import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TableSearchControl } from "./TableSearchControl";

describe("TableSearchControl Component", () => {
  let onChangeMock: ReturnType<typeof vi.fn>;
  let onClearMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChangeMock = vi.fn();
    onClearMock = vi.fn();
  });

  it("should render the search input correctly with placeholder and initial value", () => {
    render(
      <TableSearchControl
        value="initial search"
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );

    const input = screen.getByPlaceholderText(/search units by name.../i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("initial search");
  });

  it("should render without an initial value", () => {
    render(
      <TableSearchControl
        value=""
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );
    const input = screen.getByPlaceholderText(/search units by name.../i);
    expect(input).toHaveValue("");
  });

  it("should call onChange handler when user types", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TableSearchControl
        value=""
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );
    const input = screen.getByPlaceholderText(/search units by name.../i);

    await user.type(input, "test search");

    expect(onChangeMock).toHaveBeenCalled();

    rerender(
      <TableSearchControl
        value="test search"
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );
    expect(input).toHaveValue("test search");

    expect(onClearMock).not.toHaveBeenCalled();
  });

  it("should show the clear button only when input has value", () => {
    const { rerender } = render(
      <TableSearchControl
        value="some text"
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );
    expect(
      screen.getByRole("button", { name: /clear search/i }),
    ).toBeInTheDocument();

    rerender(
      <TableSearchControl
        value=""
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });

  it("should call onClear when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TableSearchControl
        value="some text"
        onChange={onChangeMock}
        onClear={onClearMock}
        placeholder="Search units by name..."
      />,
    );

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearButton);

    expect(onClearMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).not.toHaveBeenCalled();
  });
});
