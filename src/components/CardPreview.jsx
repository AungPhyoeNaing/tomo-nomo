import React, { useEffect, useRef, useState } from 'react';

export default function CardPreview({ card, onClose }) {
  const dialog = useRef(null);
  const [shareError, setShareError] = useState('');
  const [sharing, setSharing] = useState(false);
  const file = new File([card.blob], card.filename, { type: 'image/png' });
  const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => { if (element.open) element.close(); };
  }, []);
  const download = () => {
    const link = document.createElement('a');
    link.href = card.url; link.download = card.filename;
    document.body.appendChild(link); link.click(); link.remove();
  };
  return <dialog ref={dialog} className="tomo-card-dialog" aria-labelledby="card-preview-title" onClose={event => { if (!event.currentTarget.open) onClose(); }} onClick={event => {
    if (event.target === dialog.current) {
      const box = dialog.current.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.current.close();
    }
  }}>
    <header><div><h2 id="card-preview-title">Your duo, to keep.</h2><p>Preview your card, then save or share it.</p></div><button type="button" onClick={() => dialog.current.close()} aria-label="Close card preview" autoFocus>×</button></header>
    <div className="tomo-card-image"><img src={card.url} width={card.width} height={card.height} alt="Your Tomo card with both names, game score, story influences and Tomo’s closing note" /></div>
    <footer><button type="button" onClick={download} className="card-download">Download PNG <span aria-hidden="true">↧</span></button>{canShare && <button type="button" disabled={sharing} onClick={async () => {
      setShareError(''); setSharing(true);
      try { await navigator.share({ files: [file], title: 'Our Tomo card' }); }
      catch (error) { if (error.name !== 'AbortError') setShareError('Sharing is unavailable here. Download the image instead.'); }
      finally { setSharing(false); }
    }}>{sharing ? 'Sharing…' : 'Share card'}</button>}<a href={card.url} target="_blank" rel="noopener noreferrer">Open image</a><p>On a phone, you can also touch and hold the image to save it.</p>{shareError && <p role="status">{shareError}</p>}</footer>
  </dialog>;
}
