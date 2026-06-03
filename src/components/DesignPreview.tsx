import { Design } from '../lib/db';

type Props = {
  design: Design;
  className?: string;
};

export function DesignPreview({ design, className = '' }: Props) {
  if (design.layoutType === 'hexagonal') {
    return (
      <div className={`flex flex-wrap justify-center gap-px bg-neutral-100 p-1 rounded aspect-square overflow-hidden items-center ${className}`}>
        {design.colors.map((color, idx) => (
           <div key={idx} className="w-1/3 h-1/3" style={{
             clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
             backgroundColor: color,
             margin: '-2px'
           }} />
        ))}
      </div>
    );
  }

  if (design.layoutType === 'circular') {
    return (
       <div className={`relative w-full h-full aspect-square flex items-center justify-center bg-neutral-100 rounded overflow-hidden ${className}`}>
         {design.colors.map((color, idx) => {
           const size = 100 - (idx * (100 / design.colors.length));
           if (size <= 0) return null;
           return (
             <div key={idx} className="absolute rounded-full"
               style={{
                 width: `${size}%`, height: `${size}%`, backgroundColor: color, zIndex: design.colors.length - idx
               }}
             />
           )
         })}
      </div>
    );
  }

  // Backward compatibility: design.layout used to mean number of columns (e.g. 3 for 3x3)
  // If design.layout is a string like "hexagonal", it will parse as NaN, so we fall back to Math.ceil(Math.sqrt(colors.length))
  let cols = Number(design.layout);
  if (isNaN(cols) || cols === 0) {
    cols = Math.ceil(Math.sqrt(design.colors.length));
  } else if (cols > 4) {
     // If a layout was saved as total cells (e.g. 9 or 16), adjust back to columns to not break display
     // Note: Our app primarily supports 2, 3, 4 columns.
     cols = Math.ceil(Math.sqrt(cols));
  }
  return (
    <div
      className={`grid gap-px bg-neutral-100 p-1 rounded aspect-square ${design.layoutType === 'checkerboard' ? 'bg-neutral-300' : ''} ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {design.colors.map((color, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const isChecker = (row + col) % 2 === 0;
        const finalColor = design.layoutType === 'checkerboard' && isChecker && color === '#ffffff' ? '#e5e5e5' : color;
        return (
          <div
            key={idx}
            className="w-full h-full"
            style={{ backgroundColor: finalColor }}
          />
        )
      })}
    </div>
  );
}
