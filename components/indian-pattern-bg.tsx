export default function IndianPatternBg() {
  return (
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="indianPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            {/* Paisley-inspired pattern */}
            <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.3"/>
            <circle cx="45" cy="45" r="3" fill="currentColor" opacity="0.3"/>
            <path d="M30 5 Q40 15 30 25 Q20 15 30 5" fill="currentColor" opacity="0.2"/>
            <path d="M5 30 Q15 40 25 30 Q15 20 5 30" fill="currentColor" opacity="0.2"/>
            <path d="M35 55 Q45 45 55 55 Q45 65 35 55" fill="currentColor" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#indianPattern)" className="text-heritage-green"/>
      </svg>
    </div>
  );
}