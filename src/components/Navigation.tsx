import * as Slider from "@radix-ui/react-slider";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
} from "@/components/Icons";
import { setVolume, togglePlaying } from "@/store/slices/audioSlice";
import { AppDispatch, RootState } from "@/store/store";

import styles from "./Navigation.module.scss";

export const Navigation = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isPlaying, volume } = useSelector((state: RootState) => state.audio);

  const handleToggleMute = () => {
    dispatch(setVolume(volume === 0 ? 0.5 : 0));
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContent}>
        <div className={styles.audioControls}>
          <button
            onClick={() => dispatch(togglePlaying())}
            className={styles.playPauseButton}
            aria-label={
              isPlaying ? "Pause background music" : "Play background music"
            }
          >
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <button
            onClick={handleToggleMute}
            className={styles.muteButton}
            aria-label={volume === 0 ? "Unmute music" : "Mute music"}
          >
            {volume === 0 ? (
              <VolumeMuteIcon size={20} />
            ) : (
              <VolumeHighIcon size={20} />
            )}
          </button>
          <Slider.Root
            className={styles.volumeSliderRoot}
            value={[volume]}
            onValueChange={(value) => dispatch(setVolume(value[0]))}
            max={1}
            step={0.02}
            aria-label="Volume control"
          >
            <Slider.Track className={styles.volumeSliderTrack}>
              <Slider.Range className={styles.volumeSliderRange} />
            </Slider.Track>
            <Slider.Thumb
              className={styles.volumeSliderThumb}
              aria-label="Volume"
            />
          </Slider.Root>
        </div>

        <div className={styles.navLinksGroup}>
          {" "}
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
          <Link to="/units" className={styles.navLink}>
            Units
          </Link>
        </div>
      </div>
    </nav>
  );
};
