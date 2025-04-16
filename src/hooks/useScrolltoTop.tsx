import { renderHook } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollToTop } from "./useScrollToTop";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useLocation: vi.fn().mockReturnValue({
      pathname: "/initial",
      search: "",
      hash: "",
      state: null,
      key: "default",
    }),
  };
});

const createMockLocation = (pathname: string) => ({
  pathname,
  search: "",
  hash: "",
  state: null,
  key: "default",
});

describe("useScrollToTop hook tests", () => {
  const originalScrollTo = window.scrollTo;

  const mockedUseLocation = vi.mocked(useLocation);

  beforeEach(() => {
    window.scrollTo = vi.fn();

    mockedUseLocation.mockReset();
    mockedUseLocation.mockReturnValue(createMockLocation("/initial"));
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    vi.restoreAllMocks();
  });

  it("should call window.scrollTo when mounting", () => {
    mockedUseLocation.mockReturnValue(createMockLocation("/home"));

    renderHook(() => useScrollToTop(), {
      wrapper: MemoryRouter,
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("should call window.scrollTo when pathname changes", () => {
    mockedUseLocation.mockReturnValue(createMockLocation("/home"));

    const { rerender } = renderHook(() => useScrollToTop(), {
      wrapper: MemoryRouter,
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    vi.mocked(window.scrollTo).mockClear();

    mockedUseLocation.mockReturnValue(createMockLocation("/about"));
    rerender();

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("should not call window.scrollTo when pathname remains the same", () => {
    mockedUseLocation.mockReturnValue(createMockLocation("/home"));

    const { rerender } = renderHook(() => useScrollToTop(), {
      wrapper: MemoryRouter,
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    vi.mocked(window.scrollTo).mockClear();

    mockedUseLocation.mockReturnValue(createMockLocation("/home"));
    rerender();

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
