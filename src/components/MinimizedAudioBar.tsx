import React from 'react';
import { MdExpandLess, MdForward10, MdPause, MdPlayArrow, MdReplay10, MdSkipNext, MdSkipPrevious, MdSpeed } from 'react-icons/md';
import './AudioPlayer.css';

type Props = {
  playing: boolean;
  time: number;
  duration: number;
  speed: number;
  onToggle: () => void;
  onSeekRelative: (deltaSeconds: number) => void;
  onSeekTo: (timeSeconds: number) => void;
  onCycleSpeed: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  canPrevChapter?: boolean;
  canNextChapter?: boolean;
  onExpand: () => void;
  containerWidth?: number | null;
};

export default function MinimizedAudioBar({
  playing,
  time,
  duration,
  speed,
  onToggle,
  onSeekRelative,
  onSeekTo,
  onCycleSpeed,
  onPrevChapter,
  onNextChapter,
  canPrevChapter,
  canNextChapter,
  onExpand,
  containerWidth,
}: Props) {
  const barStyle: React.CSSProperties | undefined = containerWidth
    ? {
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        width: `min(${containerWidth}px, calc(100vw - 24px))`,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
      }
    : undefined;

  return (
    <div className="audio-minibar" style={barStyle}>
      <div className="audio-minibar-controls" onClick={e => e.stopPropagation()}>
        <button className="audio-minibar-btn" onClick={() => onPrevChapter?.()} aria-label="Previous chapter" title="Previous chapter" disabled={!canPrevChapter}>
          <MdSkipPrevious size={18} />
        </button>
        <button className="audio-minibar-btn" onClick={() => onSeekRelative(-15)} aria-label="Back 15 seconds" title="Back 15 seconds">
          <span className="audio-minibar-icon-wrap"><MdReplay10 size={18} /><span className="audio-minibar-icon-badge">5</span></span>
        </button>
        <button className="audio-minibar-btn" onClick={onToggle} aria-label="Play/Pause" title={playing ? 'Pause' : 'Play'}>
          {playing ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
        </button>
        <button className="audio-minibar-btn" onClick={() => onSeekRelative(15)} aria-label="Forward 15 seconds" title="Forward 15 seconds">
          <span className="audio-minibar-icon-wrap"><MdForward10 size={18} /><span className="audio-minibar-icon-badge">5</span></span>
        </button>
        <button className="audio-minibar-btn" onClick={() => onNextChapter?.()} aria-label="Next chapter" title="Next chapter" disabled={!canNextChapter}>
          <MdSkipNext size={18} />
        </button>
        <button className="audio-minibar-btn audio-minibar-btn-speed" onClick={onCycleSpeed} aria-label="Change speed" title="Change speed">
          <MdSpeed size={18} />
          <span className="audio-minibar-speed-chip" aria-hidden="true">{`${speed}x`}</span>
        </button>
        <button className="audio-minibar-btn audio-minibar-btn-open" onClick={onExpand} aria-label="Open player" title="Open player">
          <MdExpandLess size={20} />
        </button>
      </div>
      <div
        className="audio-minibar-progress"
        onClick={(e) => {
          e.stopPropagation();
          if (!duration) return;
          const el = e.currentTarget as HTMLElement;
          const rect = el.getBoundingClientRect();
          const x = (e as React.MouseEvent).clientX - rect.left;
          const pct = Math.max(0, Math.min(1, x / rect.width));
          onSeekTo(duration * pct);
        }}
        role="progressbar"
        aria-label="Audio progress"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, Math.floor(duration))}
        aria-valuenow={Math.max(0, Math.floor(time))}
      >
        <div className="audio-minibar-progress-fill" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
