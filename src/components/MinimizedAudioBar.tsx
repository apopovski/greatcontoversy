import React from 'react';
import { MdExpandMore, MdForward10, MdPause, MdPlayArrow, MdReplay10, MdRepeat, MdSkipNext, MdSkipPrevious, MdSpeed } from 'react-icons/md';
import './AudioPlayer.css';

type PlayerLabels = {
  untitledChapter: string;
  previousChapter: string;
  back15Seconds: string;
  playPause: string;
  play: string;
  pause: string;
  forward15Seconds: string;
  nextChapter: string;
  changeSpeed: string;
  openPlayer: string;
  audioProgress: string;
  left: string;
  hidePlayer: string;
  continuePlay: string;
};

type Props = {
  labels: PlayerLabels;
  chapterTitle?: string;
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
  onHide?: () => void;
  continuePlay: boolean;
  onToggleContinuePlay?: () => void;
  containerWidth?: number | null;
};

export default function MinimizedAudioBar({
  labels,
  chapterTitle,
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
  onHide,
  continuePlay,
  onToggleContinuePlay,
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

  const fmtTime = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(0, duration - time);

  return (
    <div
      className="audio-minibar"
      style={barStyle}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={labels.openPlayer}
    >
      <div className="audio-minibar-title" title={chapterTitle || labels.untitledChapter}>
        {chapterTitle || labels.untitledChapter}
      </div>
      <div className="audio-minibar-controls" onClick={e => e.stopPropagation()}>
        <button className="audio-minibar-btn" onClick={() => onPrevChapter?.()} aria-label={labels.previousChapter} title={labels.previousChapter} disabled={!canPrevChapter}>
          <MdSkipPrevious size={18} />
        </button>
        <button className="audio-minibar-btn" onClick={() => onSeekRelative(-15)} aria-label={labels.back15Seconds} title={labels.back15Seconds}>
          <span className="audio-minibar-icon-wrap"><MdReplay10 size={18} /><span className="audio-minibar-icon-badge">5</span></span>
        </button>
        <button className="audio-minibar-btn" onClick={onToggle} aria-label={labels.playPause} title={playing ? labels.pause : labels.play}>
          {playing ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
        </button>
        <button className="audio-minibar-btn" onClick={() => onSeekRelative(15)} aria-label={labels.forward15Seconds} title={labels.forward15Seconds}>
          <span className="audio-minibar-icon-wrap"><MdForward10 size={18} /><span className="audio-minibar-icon-badge">5</span></span>
        </button>
        <button className="audio-minibar-btn" onClick={() => onNextChapter?.()} aria-label={labels.nextChapter} title={labels.nextChapter} disabled={!canNextChapter}>
          <MdSkipNext size={18} />
        </button>
        <button className="audio-minibar-btn audio-minibar-btn-speed" onClick={onCycleSpeed} aria-label={labels.changeSpeed} title={labels.changeSpeed}>
          <MdSpeed size={18} />
          <span className="audio-minibar-speed-chip" aria-hidden="true">{`${speed}x`}</span>
        </button>
        {onToggleContinuePlay ? (
          <button
            className={`audio-minibar-btn audio-minibar-btn-toggle${continuePlay ? ' is-active' : ''}`}
            onClick={onToggleContinuePlay}
            aria-label={labels.continuePlay}
            title={labels.continuePlay}
          >
            <MdRepeat size={18} />
          </button>
        ) : null}
        {onHide ? (
          <button className="audio-minibar-btn audio-minibar-btn-hide" onClick={onHide} aria-label={labels.hidePlayer} title={labels.hidePlayer}>
            <MdExpandMore size={20} />
          </button>
        ) : null}
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
        aria-label={labels.audioProgress}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, Math.floor(duration))}
        aria-valuenow={Math.max(0, Math.floor(time))}
      >
        <div className="audio-minibar-progress-fill" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
      </div>
      <div className="audio-minibar-time-row" onClick={e => e.stopPropagation()}>
        <span className="audio-minibar-time">{fmtTime(time)}</span>
        <span className="audio-minibar-time">-{fmtTime(remaining)} {labels.left}</span>
      </div>
    </div>
  );
}
