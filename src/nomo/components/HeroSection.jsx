import React from 'react';
import ArcadeCharacter from '../../components/ArcadeCharacter';
import ArcadeScenery from '../../components/ArcadeScenery';

function NomoHeroSection({ onScrollToForm }) {
  return <section className="nomo-arcade-hero">
    <p className="arcade-welcome"><span className="arcade-online" /> Nomo · The two-player challenge</p>
    <h1>Best friends?<br />Prove it.</h1>
    <p>Pick your questions. Guess their answers.<br />Find out who really knows who.</p>
    <div className="nomo-duo-scene"><ArcadeScenery ice /><ArcadeCharacter character="nomo" /><span className="nomo-scene-bubble">Challenge accepted!</span></div>
    <div className="nomo-game-rules"><span><b>1</b> Invite your person</span><span><b>2</b> Make your guesses</span><span><b>3</b> Reveal your score</span></div>
    <button type="button" onClick={onScrollToForm} className="nomo-button-3d-primary nomo-enter">▶ &nbsp; Enter the lobby</button>
    <p lang="my" className="nomo-burmese-intro">သူငယ်ချင်းအကြောင်း ဘယ်လောက်သိလဲ စမ်းကြည့်ရအောင်။</p>
  </section>;
}
export default NomoHeroSection;
