import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AudioState {
  isPlaying: boolean;
  volume: number;
}

const initialState: AudioState = {
  isPlaying: false,
  volume: 0.5,
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    togglePlaying(state) {
      state.isPlaying = !state.isPlaying;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
  },
});

export const { setPlaying, togglePlaying, setVolume } = audioSlice.actions;
export default audioSlice.reducer;
