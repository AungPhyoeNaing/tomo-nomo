import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { calculateDetailedMetricsBreakdown, getScoreResonanceTier } from '../utils/astrology';
import confetti from 'canvas-confetti';
import PlayerAvatar from './PlayerAvatar';
import TomoPortrait from './TomoPortrait';
import { wrapCanvasText } from '../utils/canvasText';

function ReadingText({ text }) {
  return <div className="tomo-reading-text" lang="my">{String(text || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
    const headed = paragraph.match(/^\s*\[([^\]]+)\]\s*\n([\s\S]+)$/);
    return headed ? <section key={index}><h3>{headed[1]}</h3><p>{headed[2]}</p></section> : <p key={index}>{paragraph}</p>;
  })}</div>;
}

function MatchResult({ result, p1Name, p2Name, relType, mood, jumpToPage }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedCard, setExportedCard] = useState(null);
  const [exportError, setExportError] = useState('');
  const navigate = useNavigate();
  const [profileIndex, setProfileIndex] = useState(0);
  const profileTabs = useRef([]);

  useEffect(() => {
    setExportedCard(null);
    setExportError('');
    const numericScore = Number(result.chemistry_score);
    const targetScore = Math.min(100, Math.max(0, Number.isFinite(numericScore) ? Math.round(numericScore) : 85));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimatedScore(targetScore);
      return;
    }
    const startTime = performance.now();
    const duration = 900;
    let animId = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeProgress * targetScore));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    const celebration = setTimeout(() => confetti({ particleCount: 65, spread: 65, origin: { y: 0.6 }, colors: ['#be98ed', '#f4adc4', '#ffe69a', '#9dceb5'], disableForReducedMotion: true }), 450);
    return () => { cancelAnimationFrame(animId); clearTimeout(celebration); };
  }, [result]);

  const circumference = 283;
  const offset = circumference - (animatedScore / 100) * circumference;

  const breakdown = result.p1Secret && result.p2Secret ? calculateDetailedMetricsBreakdown(result.p1Secret, result.p2Secret, relType) : [];
  const p1 = result.p1Secret || {};
  const p2 = result.p2Secret || {};
  const resonanceTier = getScoreResonanceTier(Number(result.chemistry_score) || 85);

  const handleDownloadCard = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError('');
    try {
      if (document.fonts) await Promise.all([document.fonts.load('20px "Padauk"').catch(() => []), document.fonts.load('40px "Fredoka"').catch(() => [])]);
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is unavailable.');

      // Background Deep Radial & Linear Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1600);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.35, '#311042');
      bgGrad.addColorStop(0.7, '#4c0519');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Gold Decorative Border
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, 1128, 1528);

      // Header Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Fredoka", "Quicksand", "Padauk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🌸 Tomo's Destiny Matcher 💖", 600, 105);

      // Mode & Mood Banner
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 24px "Quicksand", "Padauk", sans-serif';
      const modeText = `${relType === 'Couple' ? '💖 Romantic Couple Destiny' : '🌟 Best Friends Destiny'} • ${mood} Mood Tone`;
      ctx.fillText(modeText, 600, 155);

      // Names Badge Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(100, 185, 1000, 100, 24);
      } else {
        ctx.rect(100, 185, 1000, 100);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 40px "Fredoka", "Padauk", sans-serif';
      wrapCanvasText(ctx, `${p1Name}   ✨   ${p2Name}`, 920, 2).lines.forEach((line, index) => ctx.fillText(line, 600, 228 + index * 42));

      // Score Circular Gauge
      const centerX = 600;
      const centerY = 450;
      const radius = 115;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 18;
      ctx.stroke();

      const scoreVal = Number(result.chemistry_score) || 85;
      const endAngle = -Math.PI / 2 + (scoreVal / 100) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      const arcGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      arcGrad.addColorStop(0, '#f59e0b');
      arcGrad.addColorStop(0.5, '#ec4899');
      arcGrad.addColorStop(1, '#ef4444');
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 74px "Fredoka", sans-serif';
      ctx.fillText(`${scoreVal}%`, centerX, centerY + 24);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 18px "Quicksand", sans-serif';
      ctx.fillText('SYMBOLIC GAME SCORE', centerX, centerY + 62);

      // Relationship Title
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px "Padauk", "Quicksand", sans-serif';
      const relTitle = result.relationship_title || "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု";
      wrapCanvasText(ctx, relTitle, 1000, 2).lines.forEach((line, index) => ctx.fillText(line, 600, 609 + index * 34));

      // 5-Metric Breakdown Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(100, 670, 1000, 360, 24);
      } else {
        ctx.rect(100, 670, 1000, 360);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Fredoka", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('5-PILLAR ASTROLOGICAL SYNERGY BREAKDOWN', 140, 715);

      const metricsList = breakdown.length ? breakdown : [
        { label: '✨ Western Zodiac Synergy', score: 92 },
        { label: '☀️ Mahabote Planetary Synergy', score: 88 },
        { label: '🐉 Chinese Zodiac Trine', score: 95 },
        { label: '🪵 5 Elements Cycle Balance', score: 90 },
        { label: '🔢 Numerology Destiny Resonance', score: 86 }
      ];

      metricsList.forEach((m, idx) => {
        const barY = 760 + idx * 52;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px "Padauk", "Quicksand", sans-serif';
        ctx.fillText(m.label, 140, barY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(`${m.score}%`, 1060, barY);
        ctx.textAlign = 'left';

        // Bar background
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        if (ctx.roundRect) {
          ctx.roundRect(140, barY + 8, 920, 12, 6);
        } else {
          ctx.fillRect(140, barY + 8, 920, 12);
        }
        ctx.fill();

        // Bar fill
        ctx.beginPath();
        ctx.fillStyle = '#f43f5e';
        const fillWidth = (m.score / 100) * 920;
        if (ctx.roundRect) {
          ctx.roundRect(140, barY + 8, fillWidth, 12, 6);
        } else {
          ctx.fillRect(140, barY + 8, fillWidth, 12);
        }
        ctx.fill();
      });

      // Tomo Guidance Box
      ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(100, 1065, 1000, 395, 24);
      } else {
        ctx.rect(100, 1065, 1000, 395);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px "Fredoka", "Padauk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("👑 Tomo's Secret Guidance (တိုမို ၏ အထူးလမ်းညွှန်ချက်)", 140, 1115);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'normal 20px "Padauk", "Quicksand", sans-serif';
      const adviceText = (result.tomo_secret_advice || '').replace(/[\r\n]+/g, ' ');
      wrapCanvasText(ctx, adviceText, 920, 7).lines.forEach((line, index) => ctx.fillText(line, 140, 1165 + index * 36));

      // Footer stamp
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px "Quicksand", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Astrology-inspired game · Not a personality assessment", 600, 1520);

      // Download
      const link = document.createElement('a');
      link.download = `Tomo_Destiny_Reading_${p1Name}_${p2Name}.png`;
      link.href = canvas.toDataURL('image/png');
      setExportedCard({ url: link.href, filename: link.download });
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.error('Failed to export destiny card:', e);
      setExportError('Your card could not be created. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const profile = profileIndex === 0 ? p1 : p2;
  const names = [p1Name, p2Name];
  const metricNames = ['Western astrology', 'Myanmar Mahabote', 'Chinese zodiac', 'Five elements', 'Numerology'];

  return (
    <>
      <section id="page-gauge" className="page-section tomo-result" aria-labelledby="match-heading">
        <div className="tomo-section-heading"><div><p className="tomo-section-kicker">✦ Duo story unlocked!</p><h2 id="match-heading">{p1Name} <span className="tomo-name-amp">&</span> {p2Name}</h2></div><div className="tomo-reading-tags"><span>{relType === 'Couple' ? '♡ Couple' : '✳ Friends'}</span><span>{mood} voice</span></div></div>
        <div className="tomo-reading-origin"><span>{result.readingInfo?.source === 'gemini' ? `Gemini AI · ${result.readingInfo.model}${result.readingInfo.cached ? ' · cached' : ''}` : result.readingInfo?.fallback ? 'Built-in fallback · AI did not complete' : 'Built-in story · no AI used'}</span><p>Astrology-inspired entertainment, not a measured personality or relationship probability. Birth time is not supplied; chart details are approximate.</p></div>
        <div className="tomo-match-summary">
          <div className="tomo-score-ring" role="img" aria-label={String(result.chemistry_score) + ' out of 100 symbolic game score'}>
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--tomo-line)" strokeWidth="5" /><circle cx="50" cy="50" r="45" fill="none" stroke="var(--tomo-accent)" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" /></svg>
            <div><strong>{animatedScore}<small>%</small></strong><span>Symbolic game score</span></div>
          </div>
          <div className="tomo-match-story"><p className="tomo-section-kicker" lang="my">{resonanceTier.levelMm}</p><h3 lang="my">{result.relationship_title}</h3><p>A little insight into your shared rhythm, your differences, and the ways you can grow together.</p><button type="button" onClick={() => jumpToPage('page-readings')} className="tomo-text-button">Read your profiles <span aria-hidden="true">↓</span></button></div>
        </div>
        <details className="tomo-metrics"><summary>What shapes your reading?<span>Explore the five influences</span></summary><div className="tomo-metric-grid">{breakdown.map((metric, index) => <div key={metricNames[index]}><p><span>{metricNames[index]}</span><strong>{metric.score}%</strong></p><div className="tomo-metric-track"><div style={{width: metric.score + '%'}} /></div></div>)}</div></details>
        <div className="tomo-result-actions"><button type="button" disabled={isExporting} onClick={handleDownloadCard} className="tomo-outline-button">{isExporting ? 'Preparing your card…' : 'Save your destiny card'} <span aria-hidden="true">↧</span></button><button type="button" onClick={() => jumpToPage('page-inputs')} className="tomo-text-button">Edit your details</button></div>
        {exportedCard && <p className="tomo-export-status" role="status">Your card is ready. <a href={exportedCard.url} download={exportedCard.filename}>Download PNG</a></p>}
        {exportError && <p className="tomo-form-error" role="alert">{exportError}</p>}
      </section>
      <section id="page-readings" className="page-section" aria-labelledby="profiles-heading">
        <div className="tomo-section-heading"><div><p className="tomo-section-kicker">Behind the connection</p><h2 id="profiles-heading">A little more about you.</h2></div><p lang="my">နှစ်ယောက်လုံးရဲ့ စိတ်နေစိတ်ထားကို တစ်ယောက်ချင်း ဖတ်ကြည့်ရအောင်။</p></div>
        <div className="tomo-profiles">
          <div className="tomo-profile-tabs" role="tablist" aria-label="Choose a person's profile">{names.map((name, index) => <button type="button" key={index} ref={element => { profileTabs.current[index] = element; }} id={'profile-tab-' + index} role="tab" aria-selected={profileIndex === index} aria-controls="profile-panel" tabIndex={profileIndex === index ? 0 : -1} onClick={() => setProfileIndex(index)} onKeyDown={event => {
            let next;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = 1;
            else return;
            event.preventDefault(); setProfileIndex(next); profileTabs.current[next]?.focus();
          }}><PlayerAvatar number={index + 1} /><span>{name}<small>{index === 0 ? 'First person' : 'Second person'}</small></span><span className="tomo-profile-tab-mark" aria-hidden="true">{profileIndex === index ? '✦' : '↗'}</span></button>)}</div>
          <article id="profile-panel" role="tabpanel" aria-labelledby={'profile-tab-' + profileIndex} tabIndex={0} className="tomo-profile-panel">
            <ReadingText text={profileIndex === 0 ? result.tomo_deep_reading_p1 : result.tomo_deep_reading_p2} />
            <details className="tomo-chart-notes"><summary>Birth chart notes</summary><div>{[['Sun', profile.western], ['Moon', profile.moonSign], ['Venus', profile.venusSign], ['Life path', profile.lifePathNumber]].filter(([, value]) => value).map(([label, value]) => <span key={label}>{label}<strong>{value}</strong></span>)}</div></details>
          </article>
        </div>
      </section>
      <section id="page-synergy" className="page-section" aria-labelledby="together-heading">
        <div className="tomo-section-heading"><div><p className="tomo-section-kicker">The space between you</p><h2 id="together-heading">Better, together.</h2></div><p>What feels easy. What takes a little care.</p></div>
        <article className="tomo-dynamic"><ReadingText text={result.tomo_dynamic_insight} /></article>
        <div className="tomo-growth-grid"><section><h3><span aria-hidden="true">✳</span> Where you shine</h3><ul lang="my">{result.tomo_strengths.map((text, index) => <li key={index}>{text}</li>)}</ul></section><section><h3><span aria-hidden="true">✧</span> Room to grow</h3><ul lang="my">{result.tomo_challenges.map((text, index) => <li key={index}>{text}</li>)}</ul></section></div>
        <article className="tomo-letter"><div className="tomo-letter-heading"><TomoPortrait pose="note" /><div><p>A note from Tomo</p><small>A little something to take with you.</small></div><span aria-hidden="true">♡</span></div><ReadingText text={result.tomo_secret_advice} /><p className="tomo-letter-signature">with love, Tomo ✳</p></article>
        <div className="tomo-ending"><div><h3>Keep a little piece of this.</h3><p>Save your card, share it, and start a conversation.</p></div><button type="button" disabled={isExporting} onClick={handleDownloadCard} className="tomo-primary">{isExporting ? 'Preparing…' : 'Save our card'} <span aria-hidden="true">↧</span></button></div>
        <footer className="tomo-footer"><button type="button" className="tomo-text-button" onClick={() => navigate('/nomo')}>How well do you know each other? Play Nomo ↗</button><button type="button" className="tomo-text-button" onClick={() => jumpToPage('page-inputs')}>Start another reading</button></footer>
      </section>
    </>
  );
}

export default MatchResult;
