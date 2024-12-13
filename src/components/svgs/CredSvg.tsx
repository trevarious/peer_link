

const CredSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#4A90E2", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#9013FE", stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <circle cx="200" cy="200" r="200" fill="url(#bgGradient)" />

    <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0.7">
      <animate attributeName="cy" from="50" to="350" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="350" cy="350" r="5" fill="#ffffff" opacity="0.7">
      <animate attributeName="cy" from="350" to="50" dur="3s" repeatCount="indefinite" />
    </circle>

    <g transform="translate(200 200)">
      <polygon points="0,-80 69.28,-40 69.28,40 0,80 -69.28,40 -69.28,-40" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
      </polygon>

      <text x="0" y="20" fontFamily="Arial, sans-serif" fontSize="80" fontWeight="bold" fill="#ffffff" textAnchor="middle" filter="url(#glow)">CRED</text>
    </g>


    <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
  </svg>
);

export default CredSvg;