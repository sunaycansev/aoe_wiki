import { describe, expect, it } from "vitest";

import audioReducer, {
  setPlaying,
  setVolume,
  togglePlaying,
} from "./audioSlice";

interface TestAudioState {
  isPlaying: boolean;
  volume: number;
}

describe("audioSlice reducer", () => {
  const initialState: TestAudioState = {
    isPlaying: false,
    volume: 0.5,
  };

  it("should return the initial state", () => {
    expect(audioReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setPlaying to true", () => {
    const nextState = audioReducer(initialState, setPlaying(true));
    expect(nextState.isPlaying).toBe(true);
    expect(nextState.volume).toBe(initialState.volume);
  });

  it("should handle setPlaying to false", () => {
    const previousState: TestAudioState = { ...initialState, isPlaying: true };
    const nextState = audioReducer(previousState, setPlaying(false));
    expect(nextState.isPlaying).toBe(false);
  });

  it("should handle togglePlaying from false to true", () => {
    const nextState = audioReducer(initialState, togglePlaying());
    expect(nextState.isPlaying).toBe(true);
  });

  it("should handle togglePlaying from true to false", () => {
    const previousState: TestAudioState = { ...initialState, isPlaying: true };
    const nextState = audioReducer(previousState, togglePlaying());
    expect(nextState.isPlaying).toBe(false);
  });

  it("should handle setVolume within range (0.8)", () => {
    const nextState = audioReducer(initialState, setVolume(0.8));
    expect(nextState.volume).toBe(0.8);
    expect(nextState.isPlaying).toBe(initialState.isPlaying);
  });

  it("should handle setVolume clamping below 0", () => {
    const nextState = audioReducer(initialState, setVolume(-0.5));
    expect(nextState.volume).toBe(0);
  });

  it("should handle setVolume clamping above 1", () => {
    const nextState = audioReducer(initialState, setVolume(1.5));
    expect(nextState.volume).toBe(1);
  });

  it("should handle setVolume to exact boundaries (0 and 1)", () => {
    let nextState = audioReducer(initialState, setVolume(0));
    expect(nextState.volume).toBe(0);
    nextState = audioReducer(initialState, setVolume(1));
    expect(nextState.volume).toBe(1);
  });
});
