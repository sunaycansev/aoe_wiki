import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "../store/store";

export const BackgroundAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying, volume } = useSelector((state: RootState) => state.audio);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && audio.paused && hasInteracted) {
      audio.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, hasInteracted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        const audio = audioRef.current;
        if (audio && isPlaying && audio.paused) {
          audio
            .play()
            .catch((error) =>
              console.error("Audio play on interaction failed:", error),
            );
        }
      }

      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    if (!hasInteracted) {
      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("keydown", handleFirstInteraction);
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [hasInteracted, isPlaying]);

  return <audio ref={audioRef} src="/assets/AoE2Theme.mp3" loop />;
};
