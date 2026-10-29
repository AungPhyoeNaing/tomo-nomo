import React, { useEffect, useRef, useState } from 'react';
import TomoPortrait from './TomoPortrait';
import './ReadingLoading.css';

export default function ReadingLoading({ onCancel, returnFocusRef }) {
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const [longWait, setLongWait] = useState(false);

  useEffect(() => {
    const previousFocus = returnFocusRef?.current || document.activeElement;
    panelRef.current?.focus();
    const timer = setTimeout(() => setLongWait(true), 25000);
    return () => {
      clearTimeout(timer);
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    } else if (event.key === 'Tab') {
      // The cancel button is the dialog's only interactive control.
      event.preventDefault();
      cancelRef.current?.focus();
    }
  };

  return (
    <div className="tomo-loading" role="dialog" aria-modal="true" aria-labelledby="loading-title" aria-describedby="loading-description" onKeyDown={handleKeyDown}>
      <div ref={panelRef} tabIndex={-1} className="tomo-loading-panel tomo-letter-loading">
        <div className="tomo-letter-scene" aria-hidden="true">
          <svg className="tomo-loading-letter" viewBox="0 0 150 190" fill="none">
            <path d="M12 3H116L144 31V177Q144 186 135 186H12Q4 186 4 178V12Q4 3 12 3Z" fill="#fff0d2" stroke="#d99c62" strokeWidth="2" />
            <path d="M116 4V25Q116 31 122 31H143" fill="#f1cf9f" stroke="#d99c62" strokeWidth="2" strokeLinejoin="round" />
            <path d="M25 31H68" stroke="#bd734a" strokeWidth="3" strokeLinecap="round" />
            <g className="tomo-letter-ink" stroke="#a96542" strokeWidth="3" strokeLinecap="round">
              <path className="tomo-letter-line" pathLength="1" d="M25 57Q45 54 65 57T120 57" />
              <path className="tomo-letter-line" pathLength="1" d="M25 74Q49 71 72 74T113 74" />
              <path className="tomo-letter-line" pathLength="1" d="M25 91Q47 88 68 91T120 91" />
              <path className="tomo-letter-line" pathLength="1" d="M25 108Q45 105 66 108T96 108" />
            </g>
            <path d="M102 158C99 155 87 147 87 140C87 133 97 131 102 138C107 131 117 133 117 140C117 147 105 155 102 158Z" fill="#c46b40" />
            <path d="M24 160H64" stroke="#d7af7d" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="tomo-loading-mascot"><TomoPortrait pose="note" /></span>
        </div>
        <h2 id="loading-title">Tomo is writing<br />your duo’s story…</h2>
        <p id="loading-description" lang="my">တိုမိုက နှစ်ယောက်လုံးအတွက် ဖတ်ရှုချက်လေး ပြင်ဆင်နေပြီနော်။</p>
        <p className="tomo-loading-reassurance" role="status" aria-live="polite" aria-atomic="true">
          {longWait ? 'Still writing. You can keep waiting or cancel.' : 'This may take a minute.'}
        </p>
        <button ref={cancelRef} type="button" className="tomo-outline-button tomo-cancel-reading" onClick={onCancel}>Cancel reading</button>
      </div>
    </div>
  );
}
