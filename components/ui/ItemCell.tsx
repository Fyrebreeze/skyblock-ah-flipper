
import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Rarity } from '../../types';
import { LoreParser } from './LoreParser';

interface ItemCellProps {
  itemName: string;
  rarity: Rarity;
  lore?: string;
}

const getRarityColor = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.COMMON: return 'text-white';
    case Rarity.UNCOMMON: return 'text-green-400';
    case Rarity.RARE: return 'text-blue-400';
    case Rarity.EPIC: return 'text-purple-500';
    case Rarity.LEGENDARY: return 'text-amber-400';
    case Rarity.MYTHIC: return 'text-pink-400';
    case Rarity.SPECIAL: return 'text-red-500';
    case Rarity.VERY_SPECIAL: return 'text-red-500';
    default: return 'text-white';
  }
};

export const ItemCell: React.FC<ItemCellProps> = ({ itemName, rarity, lore }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const itemRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (!itemRef.current || !lore) return;
    const rect = itemRef.current.getBoundingClientRect();
    
    setTooltipStyle({
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      transform: 'translateY(-100%) translateY(-0.5rem)', // Position above the item with a margin
      willChange: 'transform',
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const renderTooltipContent = () => {
    return (
      <div>
        <h3 className={`font-bold text-lg mb-2 ${getRarityColor(rarity)}`}>{itemName}</h3>
        {lore && (
          <div className="border-t border-gray-700 pt-2 font-mono">
            <LoreParser lore={lore} />
          </div>
        )}
      </div>
    );
  };

  const hasTooltip = !!lore;

  const Tooltip = () => {
    if (!isHovered || !hasTooltip) return null;
    // Use a portal to render the tooltip at the end of the body
    // bypass any parent containers' stacking context or overflow clipping lmao
    return ReactDOM.createPortal(
      <div
        style={tooltipStyle}
        className="w-max max-w-sm bg-gray-900 border border-gray-600 rounded-lg shadow-2xl p-3 z-[9999] pointer-events-none"
        role="tooltip"
      >
        {renderTooltipContent()}
      </div>,
      document.body
    );
  };

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          ref={itemRef}
          className={`font-semibold ${getRarityColor(rarity)} ${hasTooltip ? 'cursor-help' : ''}`}
        >
          {itemName}
        </span>
        <Tooltip />
      </div>
    </td>
  );
};
