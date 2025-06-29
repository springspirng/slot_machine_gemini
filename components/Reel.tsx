
import React from 'react';
import { SymbolDefinition } from '../types';

interface ReelProps {
  symbol: SymbolDefinition;
  spinning: boolean;
}

const Reel: React.FC<ReelProps> = ({ symbol, spinning }) => {
  const reelClasses = `
    flex items-center justify-center w-24 h-32 sm:w-32 sm:h-40 md:w-40 md:h-48 
    bg-gray-800/50 border-4 border-gray-900/50 rounded-lg shadow-inner
    transition-all duration-300
    ${spinning ? 'filter blur-sm' : ''}
  `;

  return (
    <div className={reelClasses}>
      <span className="text-5xl sm:text-6xl md:text-7xl transition-transform duration-100 ease-in-out transform scale-100">
        {symbol.emoji}
      </span>
    </div>
  );
};

export default Reel;
