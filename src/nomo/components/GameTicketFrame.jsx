import React from 'react';

export default function GameTicketFrame() {
  return <svg className="nomo-ticket-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path className="nomo-ticket-shadow" d="M7 4H93V9H98V37Q91 42 98 47V93H93V98H7V93H2V47Q9 42 2 37V9H7Z" vectorEffect="non-scaling-stroke" />
    <path className="nomo-ticket-paper" d="M7 1H93V6H98V34Q91 39 98 44V90H93V95H7V90H2V44Q9 39 2 34V6H7Z" vectorEffect="non-scaling-stroke" />
    <path className="nomo-ticket-inlay" d="M9 5H91V10H94V28M6 28V10H9V5M6 51V86H10V91H90V86H94V51" vectorEffect="non-scaling-stroke" />
  </svg>;
}
