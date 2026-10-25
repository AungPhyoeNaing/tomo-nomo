import React from 'react';

export default function SpellCardFrame() {
  return <svg className="spell-card-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path className="spell-card-shadow" d="M8 3H92L98 9V38Q90 42 98 46V92L92 98H8L2 92V46Q10 42 2 38V9Z" vectorEffect="non-scaling-stroke" />
    <path className="spell-card-paper" d="M8 1H92L98 7V36Q90 40 98 44V90L92 96H8L2 90V44Q10 40 2 36V7Z" vectorEffect="non-scaling-stroke" />
    <path className="spell-card-inlay" d="M10 5H90L94 9V31M6 31V9L10 5M6 49V87L10 92H90L94 87V49" vectorEffect="non-scaling-stroke" />
  </svg>;
}
