import React from 'react';

export const LogoLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="animate-pulse-neon"
        >
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent2)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path
            d="M20 90 L20 30 L50 30 L90 70 L90 30 L100 30 L100 90 L70 90 L70 50 L30 90 L20 90"
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            style={{
              strokeDasharray: '300',
              strokeDashoffset: '300',
              animation: 'drawLogo 2s ease-out forwards'
            }}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-32 h-32 rounded-full border-2 border-transparent"
            style={{
              background: `radial-gradient(circle, transparent 40%, rgba(139, 60, 255, 0.1) 70%, transparent 100%)`,
              animation: 'logoGlow 2s ease-out 1s forwards'
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes drawLogo {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes logoGlow {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};