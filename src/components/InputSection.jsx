import React from 'react';
import { localTodayISO, isValidBirthDate } from '../utils/reading';
import SpellCardFrame from './SpellCardFrame';
import PlayerAvatar from './PlayerAvatar';

function PersonFields({ number, name, setName, dob, setDob, loading }) {
  return (
    <fieldset className="tomo-person" disabled={loading}>
      <legend><PlayerAvatar number={number} /><span>{number === 1 ? 'Player one' : 'Player two'}<small>{number === 1 ? 'The main character. That’s you.' : 'Every adventure needs a plus one.'}</small></span></legend>
      <SpellCardFrame />
      <label htmlFor={`person-${number}-name`}>Name <span lang="my">အမည်</span></label>
      <input id={`person-${number}-name`} name={`person${number}Name`} autoComplete="off" maxLength={80} required value={name} onChange={event => setName(event.target.value)} placeholder={number === 1 ? 'Your name' : 'Their name'} />
      <label htmlFor={`person-${number}-dob`}>Birthday <span lang="my">မွေးနေ့</span></label>
      <input id={`person-${number}-dob`} name={`person${number}Birthday`} type="date" min="0100-01-01" max={localTodayISO()} required value={dob} onChange={event => setDob(event.target.value)} />
    </fieldset>
  );
}

function InputSection({ p1Name, setP1Name, p1Dob, setP1Dob, p2Name, setP2Name, p2Dob, setP2Dob, relType, setRelType, mood, setMood, loading, aiRetrySeconds = 0, inputError, onCalculate, onDemo }) {
  const readyFields = [Boolean(p1Name.trim()), isValidBirthDate(p1Dob), Boolean(p2Name.trim()), isValidBirthDate(p2Dob)];
  return (
    <section id="page-inputs" className="page-section tomo-details" aria-labelledby="details-heading">
      <div className="tomo-section-heading"><div><p className="tomo-section-kicker">Tomo · Connection quest</p><h2 id="details-heading">Assemble your duo.</h2></div><p lang="my">နာမည်နဲ့ မွေးနေ့လေးတွေပဲ လိုပါတယ်နော်။</p></div>
      <form className="tomo-reading-form" onSubmit={event => { event.preventDefault(); onCalculate(); }}>
        <div className="arcade-form-bar"><span><b aria-hidden="true">☺</b> Duo setup</span><div role="status" aria-label={`${readyFields.filter(Boolean).length} of 4 player details ready`}><span>{readyFields.filter(Boolean).length === 4 ? 'Ready to play' : 'Add your player details'}</span><span className="arcade-ready-meter" aria-hidden="true">{readyFields.map((ready, index) => <i key={index} className={ready ? 'is-ready' : ''} />)}</span></div></div>
        <div className="tomo-people">
          <PersonFields number={1} name={p1Name} setName={setP1Name} dob={p1Dob} setDob={setP1Dob} loading={loading} />
          <span className="tomo-people-link" aria-hidden="true">&</span>
          <PersonFields number={2} name={p2Name} setName={setP2Name} dob={p2Dob} setDob={setP2Dob} loading={loading} />
        </div>
        <div className="tomo-personalise">
          <fieldset disabled={loading}><legend>Choose your duo type</legend><div className="tomo-choice-group">
            {[['Friends', '✳', 'Friends', 'Your favourite teammate.'], ['Couple', '♡', 'Couple', 'A little love, a little magic.']].map(([value, icon, label, detail]) => (
              <button type="button" key={value} data-connection={value.toLowerCase()} aria-pressed={relType === value} onClick={() => setRelType(value)} className={`tomo-choice ${relType === value ? 'is-selected' : ''}`}><span className="tomo-choice-icon" aria-hidden="true">{icon}</span><span>{label}<small>{detail}</small></span><span className="tomo-choice-check" aria-hidden="true">{relType === value ? '✓' : ''}</span></button>
            ))}
          </div></fieldset>
          <fieldset disabled={loading}><legend>Choose your story’s vibe</legend><div className="tomo-tone-group">
            {[['Sweet', '✿', 'Warm & caring'], ['Playful', '☺', 'A little teasing'], ['Mystic', '☾', 'Thoughtful & poetic']].map(([value, icon, detail]) => (
              <button type="button" key={value} data-vibe={value.toLowerCase()} aria-pressed={mood === value} onClick={() => setMood(value)} className={`tomo-tone ${mood === value ? 'is-selected' : ''}`}><span aria-hidden="true">{icon}</span>{value}<small>{detail}</small></button>
            ))}
          </div></fieldset>
        </div>
        {aiRetrySeconds > 0 && <p role="status" className="tomo-model-help">AI requests can resume in {aiRetrySeconds} seconds. You can read the built-in story while you wait.</p>}
        {inputError && <p role="alert" className="tomo-form-error">{inputError}</p>}
        <div className="tomo-form-footer"><div><p>Your duo is ready. Are you?</p><small>Unlock your chemistry score, character profiles & duo card.</small></div><div className="tomo-form-actions"><button type="submit" disabled={loading || aiRetrySeconds > 0} className="tomo-primary">{loading ? 'Unlocking your story…' : aiRetrySeconds > 0 ? `AI ready in ${aiRetrySeconds}s` : 'Reveal our AI reading'} <span aria-hidden="true">✦</span></button><button type="button" disabled={loading} onClick={onDemo} className="tomo-text-button">Read the built-in story</button></div></div>
        <div className="tomo-form-tools"><span>Play instantly with the built-in reading. AI uses your names and chart details with Google. Birthdates are processed by our server.</span><button type="button" disabled={loading} onClick={() => { setP1Name(''); setP1Dob(''); setP2Name(''); setP2Dob(''); }} className="tomo-text-button">Clear details</button></div>
      </form>
    </section>
  );
}

export default InputSection;
