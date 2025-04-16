import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "./useDebounce";

describe("useDebounce hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial value", 500));
    expect(result.current).toBe("initial value");
  });

  it("should not update the value before the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial value", delay: 500 },
      },
    );

    rerender({ value: "new value", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("initial value");
  });

  it("should update the value after the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial value", delay: 500 },
      },
    );

    rerender({ value: "new value", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current).toBe("new value");
  });

  it("should reset the timer when value changes before delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial value", delay: 500 },
      },
    );

    rerender({ value: "intermediate value", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "final value", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("initial value");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("final value");
  });

  it("should use the default delay if a delay is not provided", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial value" },
    });

    rerender({ value: "new value" });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBe("new value");
  });
});
