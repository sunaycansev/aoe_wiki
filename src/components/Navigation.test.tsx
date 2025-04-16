import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { setVolume, togglePlaying } from "../store/slices/audioSlice";
import { Navigation } from "./Navigation";

const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: () => mockDispatch,
}));

vi.mock("@radix-ui/react-slider", () => ({
  Root: vi.fn(({ children, onValueChange, value, "aria-label": ariaLabel }) => (
    <div role="slider" aria-label={ariaLabel} aria-valuenow={value[0] * 100}>
      <input
        type="range"
        value={value[0] * 100}
        onChange={(e) => onValueChange([Number(e.target.value) / 100])}
        data-testid="volume-slider-input"
      />
      {children}
    </div>
  )),
  Track: vi.fn(({ children }) => (
    <div data-testid="slider-track">{children}</div>
  )),
  Range: vi.fn(() => <div data-testid="slider-range" />),
  Thumb: vi.fn(({ "aria-label": ariaLabel }) => (
    <div data-testid="slider-thumb" aria-label={ariaLabel} />
  )),
}));

vi.mock("../store/slices/audioSlice", () => ({
  togglePlaying: vi.fn(() => ({ type: "audio/togglePlaying" })),
  setVolume: vi.fn((volume) => ({ type: "audio/setVolume", payload: volume })),
}));

describe("Navigation Component", () => {
  const renderNavigation = (isPlaying = false, volume = 0.5) => {
    // Set up mock return values
    vi.mocked(useSelector).mockReturnValue({ isPlaying, volume });

    return render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>,
    );
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation links", () => {
    renderNavigation();

    const homeLink = screen.getByRole("link", { name: /home/i });
    const unitsLink = screen.getByRole("link", { name: /units/i });

    expect(homeLink).toBeInTheDocument();
    expect(unitsLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
    expect(unitsLink).toHaveAttribute("href", "/units");
  });

  it("should display play button when audio is not playing", () => {
    renderNavigation(false);

    const playButton = screen.getByRole("button", {
      name: /play background music/i,
    });
    expect(playButton).toBeInTheDocument();
  });

  it("should display pause button when audio is playing", () => {
    renderNavigation(true);

    const pauseButton = screen.getByRole("button", {
      name: /pause background music/i,
    });
    expect(pauseButton).toBeInTheDocument();
  });

  it("should dispatch togglePlaying action when play/pause button is clicked", async () => {
    const user = userEvent.setup();
    renderNavigation(false);

    const playButton = screen.getByRole("button", {
      name: /play background music/i,
    });
    await user.click(playButton);

    expect(togglePlaying).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "audio/togglePlaying" });
  });

  it("should display volume high icon when volume is not muted", () => {
    renderNavigation(false, 0.5);

    const volumeButton = screen.getByRole("button", { name: /mute music/i });
    expect(volumeButton).toBeInTheDocument();
  });

  it("should display mute icon when volume is muted", () => {
    renderNavigation(false, 0);

    const muteButton = screen.getByRole("button", { name: /unmute music/i });
    expect(muteButton).toBeInTheDocument();
  });

  it("should dispatch setVolume action with 0 when mute button is clicked with non-zero volume", async () => {
    const user = userEvent.setup();
    renderNavigation(false, 0.5);

    const volumeButton = screen.getByRole("button", { name: /mute music/i });
    await user.click(volumeButton);

    expect(setVolume).toHaveBeenCalledWith(0);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "audio/setVolume",
      payload: 0,
    });
  });

  it("should dispatch setVolume action with 0.5 when unmute button is clicked", async () => {
    const user = userEvent.setup();
    renderNavigation(false, 0);

    const muteButton = screen.getByRole("button", { name: /unmute music/i });
    await user.click(muteButton);

    expect(setVolume).toHaveBeenCalledWith(0.5);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "audio/setVolume",
      payload: 0.5,
    });
  });

  it("should render volume slider with correct value", () => {
    renderNavigation(false, 0.7);

    const slider = screen.getByRole("slider", { name: /volume control/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "70"); // 0.7 * 100
  });

  it("should dispatch setVolume action when slider value changes", () => {
    renderNavigation(false, 0.5);

    const sliderInput = screen.getByTestId("volume-slider-input");
    fireEvent.change(sliderInput, { target: { value: "80" } });

    expect(setVolume).toHaveBeenCalledWith(0.8);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "audio/setVolume",
      payload: 0.8,
    });
  });
});
