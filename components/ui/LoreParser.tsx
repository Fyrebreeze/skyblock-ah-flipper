import React, { useMemo } from 'react';

type MinecraftColorCode =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'
  | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

const colorMap: Record<MinecraftColorCode, string> = {
  '0': 'text-black',        // §0 Black
  '1': 'text-blue-800',     // §1 Dark Blue
  '2': 'text-green-800',    // §2 Dark Green
  '3': 'text-cyan-800',     // §3 Dark Aqua
  '4': 'text-red-800',      // §4 Dark Red
  '5': 'text-purple-800',   // §5 Dark Purple
  '6': 'text-yellow-600',   // §6 Gold (closest match)
  '7': 'text-gray-300',     // §7 Gray (lighter)
  '8': 'text-gray-600',     // §8 Dark Gray
  '9': 'text-blue-400',     // §9 Blue
  'a': 'text-green-400',    // §a Green
  'b': 'text-cyan-400',     // §b Aqua
  'c': 'text-red-400',      // §c Red
  'd': 'text-pink-400',     // §d Light Purple
  'e': 'text-yellow-300',   // §e Yellow
  'f': 'text-white',        // §f White
};
const styleMap: { [key: string]: boolean } = {
  'l': true, // bold
  'm': true, // strikethrough
  'n': true, // underline
  'o': true, // italic
};

export const LoreParser: React.FC<{ lore: string }> = ({ lore }) => {
  const parsedLore = useMemo(() => {
    if (!lore) return null;

    return lore.split('\n').map((line, lineIndex) => {
      if (line.trim() === '') {
        return <div key={lineIndex} className="h-3" />;
      }
      
      const segments: { text: string; classes: string[] }[] = [];
      
      let currentStyles = {
        color: 'text-gray-400',
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
      };

      const parts = line.split('§');
      const firstPartText = parts.shift();

      if (firstPartText) {
        const classes = [currentStyles.color];
        segments.push({ text: firstPartText, classes });
      }

      parts.forEach(part => {
        const code = part[0];
        const text = part.substring(1);

        if (colorMap[code]) {
          // Reset all styles on color change, as Minecraft does
          currentStyles = {
            color: colorMap[code],
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
          };
        } else if (styleMap[code]) {
            if (code === 'l') currentStyles.bold = true;
            if (code === 'o') currentStyles.italic = true;
            if (code === 'n') currentStyles.underline = true;
            if (code === 'm') currentStyles.strikethrough = true;
        } else if (code === 'r') { // Reset
          currentStyles = {
            color: 'text-gray-400',
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
          };
        }
        
        if (text) {
          const classes = [currentStyles.color];
          if (currentStyles.bold) classes.push('font-bold');
          if (currentStyles.italic) classes.push('italic');
          if (currentStyles.underline) classes.push('underline');
          if (currentStyles.strikethrough) classes.push('line-through');
          segments.push({ text, classes });
        }
      });

      return (
        <p key={lineIndex} className="text-sm">
          {segments.map((segment, segIndex) => (
            <span key={segIndex} className={segment.classes.join(' ')}>
              {segment.text}
            </span>
          ))}
        </p>
      );
    });
  }, [lore]);

  return <>{parsedLore}</>;
};