import React from 'react';
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
  onExpand: () => void;
  chapterTitle: string;
  containerWidth?: number | null;
};

function fmtTime(s: number) {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function MinimizedAudioBar({
  playing,
  time,
  duration,
  speed,
  onToggle,
  onSeekRelative,
  onSeekTo,
  onCycleSpeed,
  onExpand,
  chapterTitle,
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
    <div className="audio-minibar" style={barStyle} onClick={onExpand}>
      <div className="audio-minibar-title">{chapterTitle}</div>
      <div className="audio-minibar-controls" onClick={e => e.stopPropagation()}>
        <button onClick={() => onSeekRelative(-15)} aria-label="Back 15 seconds">-15</button>
        <button onClick={onToggle} aria-label="Play/Pause">{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => onSeekRelative(15)} aria-label="Forward 15 seconds">+15</button>
        <button onClick={onCycleSpeed} aria-label="Change speed">{`${speed}x`}</button>
        <span className="audio-minibar-time">{fmtTime(time)} / {fmtTime(duration)}</span>
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
