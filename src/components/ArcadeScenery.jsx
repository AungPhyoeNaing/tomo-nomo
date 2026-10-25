import React from 'react';

export default function ArcadeScenery({ ice = false }) {
  const ink = ice ? '#176c85' : '#ffcd82';
  const pink = ice ? '#60e7dc' : '#ff812e';
  const orange = ice ? '#c1f56f' : '#ffda70';
  return <svg className="arcade-scenery" viewBox="0 0 820 300" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <circle cx="410" cy="165" r="145" stroke="white" strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 10" />
    <ellipse cx="410" cy="165" rx="226" ry="98" stroke="white" strokeOpacity=".4" strokeWidth="2" transform="rotate(-18 410 165)" />
    <g stroke={ink} strokeWidth="2.5" strokeLinejoin="round">
      <circle cx="145" cy="104" r="33" fill={orange} />
      <ellipse cx="145" cy="104" rx="53" ry="12" transform="rotate(-24 145 104)" strokeWidth="9" stroke={ink} />
      <ellipse cx="145" cy="104" rx="53" ry="12" transform="rotate(-24 145 104)" strokeWidth="5" stroke={pink} />
      <circle cx="134" cy="93" r="6" fill="white" fillOpacity=".5" stroke="none" />
      <path d="M662 47l8 20 21 7-20 8-8 22-8-21-21-8 20-8z" fill="#ffed78" />
      <path d="M193 202l4 11 12 4-11 5-5 12-4-12-12-4 12-5z" fill="#fff9dd" />
      <path d="M733 137l4 10 11 4-11 4-4 11-4-11-10-4 10-4z" fill="#fff9dd" />
      <g transform="translate(610 158) rotate(8)">
        <path d="M0 36l53 48 55-48z" fill={ink} />
        <path d="M14 39l38 33 40-33" stroke="white" strokeOpacity=".4" />
        <ellipse cx="54" cy="33" rx="62" ry="18" fill={pink} />
        <path d="M32 24V-8m0 10C4 1 10-21 32-8m0 0c21-26 39-6 0 10" fill={orange} />
        <path d="M65 24V10m0 0c-18-11-16-23 0-14 17-20 28-3 0 14" fill={ice ? '#a4f4bd' : '#ffd68a'} />
      </g>
      <g transform="translate(68 199) rotate(-8)">
        <path d="M0 25l39 37 40-37z" fill={orange} />
        <ellipse cx="39" cy="24" rx="46" ry="13" fill={ice ? '#c5afff' : '#e4a04a'} />
        <path d="M39 17V-7" />
        <path d="M39-7c-25 8-29-15-9-16-8-22 17-29 21-10 24-4 27 21 7 23-2 17-15 18-19 3z" fill={pink} />
        <circle cx="42" cy="-17" r="7" fill="#ffec79" />
      </g>
      <path d="M-30 299c89-104 184-81 284-39 101 42 201-14 284-17 145-6 227 14 315 67" fill={ice ? pink : '#81300f'} />
      <path d="M-30 310c149-46 210-19 336-11 182 13 275-73 401-59 70 8 101 35 146 70" fill={ice ? orange : '#c95515'} />
      <path d="M494 295c100-24 182-38 277-12" stroke="white" strokeOpacity=".6" strokeWidth="4" strokeDasharray="14 12" />
    </g>
    <g fill="white" opacity=".8"><circle cx="232" cy="66" r="3" /><circle cx="592" cy="101" r="3" /><circle cx="74" cy="56" r="2" /><circle cx="760" cy="51" r="3" /><circle cx="544" cy="35" r="2" /><circle cx="280" cy="198" r="2" /></g>
  </svg>;
}
