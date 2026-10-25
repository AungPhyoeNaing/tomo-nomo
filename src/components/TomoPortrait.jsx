import React from 'react';

export default function TomoPortrait({ pose = 'wave' }) {
  const imagePose = pose === 'note' ? 'note' : 'wave';
  return <img className="tomo-portrait" data-pose={imagePose} src={`/mascots/tomo-${imagePose}.webp`} width="256" height="256" alt="" draggable={false} decoding="async" />;
}
