import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppInitializer } from "./AppInitializer";

const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

const mockFetchUnitsStart = vi.fn(() => ({ type: "units/fetchUnitsStart" }));
vi.mock("../store/slices/unitsSlice", () => ({
  fetchUnitsStart: () => mockFetchUnitsStart(),
}));

describe("AppInitializer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should dispatch fetchUnitsStart action on mount", () => {
    render(<AppInitializer />);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "units/fetchUnitsStart",
    });
  });

  it("should render nothing (return null)", () => {
    const { container } = render(<AppInitializer />);
    expect(container).toBeEmptyDOMElement();
  });
});
