import React from 'react';

export default function ArcadeCharacter({ character = 'tomo' }) {
  const name = character === 'nomo' ? 'Nomo' : 'Tomo';
  return <div className={`arcade-character arcade-character-${character}`}>
    <video key={character} src={`/${character}-main.mp4`} autoPlay loop muted playsInline aria-label={`${name}, the original character`} />
  </div>;
}
