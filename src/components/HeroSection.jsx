import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ArcadeCharacter from './ArcadeCharacter';
import ArcadeScenery from './ArcadeScenery';

function HeroSection({ jumpToPage }) {
  const [mode, setMode] = useState('tomo');
  const [boops, setBoops] = useState(0);
  const isTomo = mode === 'tomo';
  return (
    <section id="page-hero" className="page-section arcade-hero" aria-labelledby="tomo-heading">
      <div className="arcade-welcome"><span className="arcade-online" /> Two players. Endless plot twists.</div>
      <h1 id="tomo-heading">Good chemistry.<br />Great little adventures.</h1>
      <p className="arcade-intro">Your favourite human. A little curiosity. Let’s see what happens.</p>
      <div className="arcade-machine">
        <div className="arcade-machine-top"><span><i /> The connection arcade</span><span>✦ &nbsp; Made for two</span></div>
        <div className={`arcade-stage ${isTomo ? '' : 'stage-ice'}`}>
          <ArcadeScenery ice={!isTomo} />
          <div className="stage-ticket"><span>{isTomo ? '♡' : '⚡'}</span>{isTomo ? 'A little cosmic chemistry' : 'Bestie knowledge: put to the test'}</div>
          <button type="button" className="duo-boop" onClick={() => setBoops(count => count + 1)} aria-label={`Say hello to ${isTomo ? 'Tomo' : 'Nomo'}`}><ArcadeCharacter character={mode} /></button>
          <div className="stage-speech" key={`${mode}-${boops}`} role="status">{boops ? ['Hey, that tickles!', 'Bestie energy detected.', 'Okay, we like you!', 'One more adventure?'][(boops - 1) % 4] : isTomo ? 'You + me = ?' : 'Think you know me?'}</div>
          <span className="stage-name character-name">{isTomo ? 'Tomo · Your connection guide' : 'Nomo · Your challenge host'}</span>
          <span className="stage-caption">{isTomo ? 'New connection unlocked?' : 'Challenge your favourite human.'}</span>
        </div>
        <div className="arcade-control-deck">
          <div className="arcade-mode-picker" role="group" aria-label="Choose your adventure">
            <button type="button" aria-pressed={isTomo} onClick={() => { setMode('tomo'); setBoops(0); }} className={`arcade-mode ${isTomo ? 'mode-active' : ''}`}><span className="mode-icon">♡</span><span><strong>Tomo</strong><small>Discover your chemistry</small></span><span className="mode-light" /></button>
            <button type="button" aria-pressed={!isTomo} onClick={() => { setMode('nomo'); setBoops(0); }} className={`arcade-mode nomo-mode ${!isTomo ? 'mode-active' : ''}`}><span className="mode-icon">⚡</span><span><strong>Nomo</strong><small>The bestie challenge</small></span><span className="mode-light" /></button>
          </div>
          <div className="arcade-start-row"><p><strong>{isTomo ? 'Meet your connection’s main characters.' : 'How well do you really know each other?'}</strong><span>{isTomo ? '2 names + 2 birthdays → your duo’s story' : '2 players + real answers → the ultimate reveal'}</span></p>{isTomo ? <button type="button" onClick={() => jumpToPage('page-inputs')} className="tomo-primary arcade-play"><span aria-hidden="true">▶</span> Let’s play</button> : <Link to="/nomo" className="tomo-primary arcade-play"><span aria-hidden="true">▶</span> Let’s play</Link>}</div>
        </div>
      </div>
      <div className="arcade-bottom-note"><span>✿ No right answers. Just your kind of weird.</span><span>Friends, crushes & favourite humans welcome.</span></div>
      <div className="arcade-next"><span /> Your next adventure starts below <span /></div>
    </section>
  );
}

export default HeroSection;
