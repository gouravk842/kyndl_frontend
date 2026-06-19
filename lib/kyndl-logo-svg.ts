// Auto-synced from assets/logo.svg — run: npm run sync:logo
export const kyndlLogoSvg = `<svg width="210" height="180" viewBox="0 0 210 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>

  /* Left person walks in from left */
  .person-left {
    animation: walkInLeft 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  }
  @keyframes walkInLeft {
    from { transform: translateX(-80px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }

  /* Right person walks in from right */
  .person-right {
    animation: walkInRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  }
  @keyframes walkInRight {
    from { transform: translateX(80px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  /* Heart appears with a pop after people arrive */
  .heart {
    transform-origin: 105px 55px;
    animation: heartPop 0.5s cubic-bezier(0.34, 1.8, 0.64, 1) 0.75s both;
  }
  @keyframes heartPop {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* Heart pulses continuously after appearing */
  .heart-pulse {
    transform-origin: 105px 55px;
    animation:
      heartPop 0.5s cubic-bezier(0.34, 1.8, 0.64, 1) 0.75s both,
      pulse 1.4s ease-in-out 1.3s infinite;
  }
  @keyframes pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  /* Dashed connector lines draw in */
  .dash-left {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    animation: drawDash 0.4s ease-out 0.85s forwards;
  }
  .dash-right {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    animation: drawDash 0.4s ease-out 0.9s forwards;
  }
  @keyframes drawDash {
    to { stroke-dashoffset: 0; }
  }

  /* Wordmark fades up */
  .wordmark {
    animation: fadeUp 0.5s ease-out 1.1s both;
  }
  @keyframes fadeUp {
    from { transform: translateY(10px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* Sparkles pop out from heart */
  .spark1 {
    transform-origin: 105px 40px;
    animation: sparkOut1 0.4s ease-out 1.1s both;
  }
  .spark2 {
    transform-origin: 122px 48px;
    animation: sparkOut2 0.4s ease-out 1.2s both;
  }
  .spark3 {
    transform-origin: 88px 48px;
    animation: sparkOut3 0.4s ease-out 1.15s both;
  }
  @keyframes sparkOut1 {
    0%   { transform: scale(0) translateY(0); opacity: 0; }
    60%  { transform: scale(1) translateY(-8px); opacity: 1; }
    100% { transform: scale(0.6) translateY(-14px); opacity: 0; }
  }
  @keyframes sparkOut2 {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1) translate(8px, -6px); opacity: 1; }
    100% { transform: scale(0.5) translate(14px, -10px); opacity: 0; }
  }
  @keyframes sparkOut3 {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1) translate(-8px, -6px); opacity: 1; }
    100% { transform: scale(0.5) translate(-14px, -10px); opacity: 0; }
  }

  /* Static lockup — no motion (header, footer) */
  .kyndl-logo--static .person-left,
  .kyndl-logo--static .person-right {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .kyndl-logo--static .dash-left,
  .kyndl-logo--static .dash-right {
    animation: none;
    stroke-dashoffset: 0;
  }
  .kyndl-logo--static .heart-pulse {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
  .kyndl-logo--static .spark1,
  .kyndl-logo--static .spark2,
  .kyndl-logo--static .spark3 {
    animation: none;
    opacity: 0;
  }
  .kyndl-logo--static .wordmark {
    animation: none;
    opacity: 1;
    transform: none;
  }

</style>

  <!-- Left person -->
  <g class="person-left">
    <circle cx="52" cy="32" r="16" fill="#D85A30"/>
    <path d="M30 82 C30 60 74 60 74 82 L74 106 L30 106 Z" fill="#D85A30"/>
    <line x1="52" y1="106" x2="52" y2="130" stroke="#D85A30" stroke-width="5" stroke-linecap="round"/>
    <line x1="52" y1="130" x2="38" y2="142" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
    <line x1="52" y1="130" x2="66" y2="142" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
    <line x1="30" y1="88" x2="12" y2="80" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
    <line x1="12" y1="80" x2="6" y2="90" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Right person -->
  <g class="person-right">
    <circle cx="158" cy="32" r="16" fill="#D85A30"/>
    <path d="M136 82 C136 60 180 60 180 82 L180 106 L136 106 Z" fill="#D85A30"/>
    <line x1="158" y1="106" x2="158" y2="130" stroke="#D85A30" stroke-width="5" stroke-linecap="round"/>
    <line x1="158" y1="130" x2="144" y2="142" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
    <line x1="158" y1="130" x2="172" y2="142" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
    <line x1="180" y1="88" x2="198" y2="80" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
    <line x1="198" y1="80" x2="204" y2="90" stroke="#D85A30" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Connector dashes from arms to heart -->
  <line class="dash-left"  x1="74"  y1="88" x2="88"  y2="76" stroke="#D85A30" stroke-width="2" stroke-linecap="round"/>
  <line class="dash-right" x1="136" y1="88" x2="122" y2="76" stroke="#D85A30" stroke-width="2" stroke-linecap="round"/>

  <!-- Shared heart -->
  <g class="heart-pulse">
    <path d="M105 70 Q105 50 116 46 Q127 42 127 56 Q127 64 105 78 Q83 64 83 56 Q83 42 94 46 Q105 50 105 70Z" fill="#D85A30"/>
  </g>

  <!-- Sparkles -->
  <circle class="spark1" cx="105" cy="40" r="3" fill="#EF9F27"/>
  <circle class="spark2" cx="124" cy="50" r="2.5" fill="#EF9F27"/>
  <circle class="spark3" cx="86"  cy="50" r="2.5" fill="#EF9F27"/>

  <!-- Wordmark -->
  <g class="wordmark">
    <text x="58" y="168" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="#F5E9E2" letter-spacing="-0.5">Kyndl</text>
  </g>

</svg>
`;
