import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey, keyOptions = [], activeKeyId, onSelectKey, modelOptions = [], readingModel, onSelectModel }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector('input')?.focus();
    return () => previousFocus?.focus();
  }, [isOpen]);

  useEffect(() => {
    setTempKey(apiKey || '');
  }, [apiKey, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'Tab' && isOpen) {
        const controls = Array.from(dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]') || []);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setTempKey(text.trim());
    } catch (err) {
      console.error("Clipboard paste error:", err);
    }
  };

  const handleSave = () => {
    onSaveKey(tempKey.trim());
    onClose();
  };

  const handleClear = () => {
    setTempKey('');
    onSaveKey('');
  };

  return <AnimatePresence>{isOpen && <div className="arcade-modal-shell">
    <motion.div className="arcade-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
    <motion.div className="arcade-settings" role="dialog" ref={dialogRef} aria-modal="true" aria-labelledby="api-settings-title" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: .18 }}>
      <header className="arcade-settings-header"><span aria-hidden="true">✦</span><div><h3 id="api-settings-title">Power up your reading</h3><p>Optional Gemini AI settings</p></div><button type="button" className="arcade-close" onClick={onClose} aria-label="Close AI settings">×</button></header>
      <div className="arcade-settings-body">
        <div className="arcade-settings-note"><span aria-hidden="true">⚡</span><p>The built-in adventure is ready to play.<small>Add your own Gemini key for an AI reading.</small></p></div>
        <label className="arcade-field-label" htmlFor="arcade-reading-model">AI model</label>
        <select id="arcade-reading-model" value={readingModel} onChange={onSelectModel}>{modelOptions.map(model => <option key={model.id} value={model.id}>{model.label}</option>)}</select>
        <p className="arcade-model-help">Model choice affects speed and cost. Compare Burmese writing with the same inputs. A failed language check may trigger one repair request.</p>
        <label className="arcade-field-label" htmlFor="arcade-key-slot">Saved key slot</label>
        <select id="arcade-key-slot" value={activeKeyId} onChange={onSelectKey}>{keyOptions.map(option => <option key={option.id} value={option.id}>{option.label || option.name || option.id}</option>)}</select>
        <div className="arcade-key-label"><label className="arcade-field-label" htmlFor="modalApiKeyInput">Your Gemini key</label><div><button type="button" className="arcade-small-button" onClick={handlePaste}>Paste</button>{tempKey && <button type="button" className="arcade-small-button" onClick={handleClear}>Clear</button>}</div></div>
        <div className="arcade-key-input"><input id="modalApiKeyInput" type={showKey ? 'text' : 'password'} value={tempKey} onChange={event => setTempKey(event.target.value)} placeholder="AIzaSy…" autoComplete="off" spellCheck={false} /><button type="button" className="arcade-small-button" onClick={() => setShowKey(!showKey)} aria-label={showKey ? 'Hide API key' : 'Show API key'}>{showKey ? 'Hide' : 'Show'}</button></div>
        <p className="arcade-key-status"><span aria-hidden="true">{tempKey ? '●' : '◇'}</span>{tempKey ? 'Key entered · saved when you apply' : 'Built-in mode · no key needed'}</p>
        <p className="arcade-key-privacy">Saved in this browser. AI readings send your names, derived chart details, and key directly to Google Gemini. Readings are cached in memory for 10 minutes; they are not saved to browser storage.</p>
        <a className="arcade-key-help" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Get a key from Google AI Studio ↗</a>
      </div>
      <footer className="arcade-settings-footer"><button type="button" onClick={onClose} className="tomo-outline-button">Cancel</button><button type="button" onClick={handleSave} className="tomo-primary">Save settings <span aria-hidden="true">✦</span></button></footer>
    </motion.div>
  </div>}</AnimatePresence>;
}
export default ApiKeyModal;
