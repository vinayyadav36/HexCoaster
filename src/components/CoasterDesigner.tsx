import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Design, saveDesign } from '../lib/db';

type Props = {
  onDesignSaved: (design: Design) => void;
};

export function CoasterDesigner({ onDesignSaved }: Props) {
  const [layout, setLayout] = useState<number>(3); // 3x3 default
  const [colors, setColors] = useState<string[]>(Array(9).fill('#ffffff'));
  const [designName, setDesignName] = useState<string>('');

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const handleLayoutChange = (newLayout: number) => {
    setLayout(newLayout);
    setColors(Array(newLayout * newLayout).fill('#ffffff'));
  };

  const handleSave = async () => {
    if (!designName.trim()) {
      alert('Please enter a name for your design.');
      return;
    }

    const design: Design = {
      id: uuidv4(),
      name: designName,
      layout,
      colors,
      createdAt: Date.now(),
    };

    await saveDesign(design);
    onDesignSaved(design);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-xl font-bold mb-4">Design Your Coaster</h2>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Layout</label>
          <div className="flex gap-2">
            {[2, 3, 4].map(l => (
              <button
                key={l}
                onClick={() => handleLayoutChange(l)}
                className={`px-3 py-1 rounded border ${layout === l ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
              >
                {l}x{l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Design Name</label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., Ocean Waves"
          />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div
          className="grid gap-1 bg-neutral-200 p-2 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${layout}, minmax(0, 1fr))` }}
        >
          {colors.map((color, idx) => (
            <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(idx, e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div
                className="w-full h-full rounded shadow-sm border border-neutral-100/20"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Save Design
      </button>
    </div>
  );
}
