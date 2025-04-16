import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BackgroundAudioPlayer } from "./BackgroundAudioPlayer";

const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

global.HTMLAudioElement.prototype.play = mockPlay;
global.HTMLAudioElement.prototype.pause = mockPause;
Object.defineProperty(global.HTMLAudioElement.prototype, "paused", {
  get: vi.fn(() => true),
  configurable: true,
});

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

import { useSelector } from "react-redux";

describe("BackgroundAudioPlayer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global.HTMLAudioElement.prototype, "paused", {
      get: vi.fn(() => true),
      configurable: true,
    });

    vi.mocked(useSelector).mockReturnValue({
      isPlaying: false,
      volume: 0.5,
    });
  });

  it("should render the audio element with correct src", () => {
    const { container } = render(<BackgroundAudioPlayer />);
    const audioElement = container.querySelector("audio");

    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute("src", "/assets/AoE2Theme.mp3");
    expect(audioElement).toHaveAttribute("loop");
  });

  it("should attempt to play audio when isPlaying is true and user has interacted", async () => {
    vi.mocked(useSelector).mockReturnValue({
      isPlaying: false,
      volume: 0.5,
    });

    const { rerender } = render(<BackgroundAudioPlayer />);

    await act(async () => {
      document.dispatchEvent(new MouseEvent("click"));
    });

    vi.mocked(useSelector).mockReturnValue({
      isPlaying: true,
      volume: 0.5,
    });

    await act(async () => {
      rerender(<BackgroundAudioPlayer />);
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it("should set the audio volume based on Redux state", () => {
    vi.mocked(useSelector).mockReturnValue({
      isPlaying: false,
      volume: 0.7,
    });

    const { container } = render(<BackgroundAudioPlayer />);
    const audioElement = container.querySelector("audio") as HTMLAudioElement;

    expect(audioElement.volume).toBe(0.7);
  });
});
