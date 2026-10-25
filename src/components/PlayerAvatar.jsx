import React, { useId } from 'react';

export default function PlayerAvatar({ number = 1 }) {
  const clipId = useId();
  const first = number === 1;
  const edge = first ? '#ffc087' : '#c8b4ff';
  const suit = first ? '#ed7540' : '#9072dc';
  return <svg className="player-avatar" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <defs><clipPath id={clipId}><circle cx="32" cy="32" r="28" /></clipPath></defs>
    <circle cx="32" cy="32" r="30" fill={first ? '#562b31' : '#393052'} stroke={edge} strokeWidth="2" />
    <g clipPath={`url(#${clipId})`}>
      <circle cx="32" cy="32" r="28" fill={first ? '#783d38' : '#514478'} />
      <path d="M8 64V55c0-11 11-17 24-17s24 6 24 17v9" fill={suit} stroke="#342336" strokeWidth="2" />
      <path d="M25 39v7q7 7 14 0v-7" fill={first ? '#eeb28b' : '#b97d63'} stroke="#49303b" strokeWidth="1.5" />
      {!first && <path d="M15 29c-6-3-4-11 1-12-2-6 5-11 10-8 4-6 12-5 15 0 8-2 13 5 10 10 6 4 4 12-1 13" fill="#28202e" />}
      <ellipse cx="32" cy="29" rx="15" ry="17" fill={first ? '#ffcea5' : '#d69a7a'} stroke="#49303b" strokeWidth="1.8" />
      {first ? <path d="M17 28c-4-13 4-22 16-22 10 0 18 7 15 20l-6-7c-6 2-10-1-12-5-1 7-7 9-13 9z" fill="#8b402a" stroke="#49303b" strokeWidth="1.5" /> : <path d="M17 25c-2-5 1-10 5-9 1-7 9-8 12-3 5-4 12 0 12 5l2 8-6-5c-4 3-8 1-10-2-5 6-9 4-11 3z" fill="#312434" />}
      <path d="M24 29v3m16-3v3" stroke="#49303b" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M28 36q4 4 8 0" stroke="#7c4250" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="22" cy="35" rx="3" ry="1.6" fill={first ? '#ed8b79' : '#bb6f64'} opacity=".7" />
      <ellipse cx="42" cy="35" rx="3" ry="1.6" fill={first ? '#ed8b79' : '#bb6f64'} opacity=".7" />
      <path d="M19 47l8 8h10l8-8" stroke={edge} strokeWidth="2" fill="none" />
      <circle cx="32" cy="55" r="4" fill={edge} />
      {first ? <circle cx="32" cy="55" r="2" fill="#a6492d" /> : <path d="M33 52a3 3 0 1 0 1 5 3 3 0 0 1-1-5" fill="#614797" />}
      <path d="M9 16l1.5 3.5L14 21l-3.5 1.5L9 26l-1.5-3.5L4 21l3.5-1.5zM53 35l1 2.5 2.5 1L54 40l-1 2.5-1-2.5-2.5-1.5 2.5-1z" fill={edge} />
    </g>
    <circle cx="32" cy="32" r="27.5" fill="none" stroke={edge} strokeWidth=".7" opacity=".5" />
  </svg>;
}
