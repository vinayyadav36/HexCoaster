import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Design, saveDesign, getTemplates, getPalettes } from '../lib/db';
import { useNavigate, useLocation } from 'react-router-dom';
import { DesignPreview } from './DesignPreview';
import { ColorPalette, DesignTemplate } from '../types';

type Props = {
  onDesignSaved: (design: Design) => void;
  initialDesign?: Design;
};

export function CoasterDesigner({ onDesignSaved, initialDesign }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [layout, setLayout] = useState<number>(initialDesign ? initialDesign.layout : 3);
  const [colors, setColors] = useState<string[]>(initialDesign ? initialDesign.colors : Array(9).fill('#ffffff'));
  const [designName, setDesignName] = useState<string>(initialDesign ? initialDesign.name : '');
  const [layoutType, setLayoutType] = useState<Design['layoutType']>(initialDesign?.layoutType || 'grid');

  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);

  useEffect(() => {
    loadTemplatesAndPalettes();
  }, []);

  const loadTemplatesAndPalettes = async () => {
    setTemplates(await getTemplates());
    setPalettes(await getPalettes());
  };

  // Keep internal state in sync with prop if we come from a router link
  useEffect(() => {
    if (initialDesign) {
      setLayout(initialDesign.layout);
      setColors(initialDesign.colors);
      setDesignName(initialDesign.name);
      setLayoutType(initialDesign.layoutType || 'grid');

      // Clear history state to avoid persisting on refresh
      navigate('.', { replace: true, state: { ...location.state, editDesign: undefined } });
    }
  }, [initialDesign, navigate, location.state]);

  const handleTemplateSelect = (t: DesignTemplate) => {
    const isStringLayout = typeof t.layout === 'string' && isNaN(Number(t.layout));
    setLayout(isStringLayout ? Math.ceil(Math.sqrt(t.colors.length)) : Number(t.layout) || Math.ceil(Math.sqrt(t.colors.length)));
    setColors([...t.colors]);
    // Try to guess layoutType from template layout field if it's a string, otherwise default to grid
    setLayoutType(isStringLayout ? t.layout as Design['layoutType'] : 'grid');
  };

  const handlePaletteSelect = (p: ColorPalette) => {
    const newColors = [...colors];
    for (let i = 0; i < newColors.length; i++) {
      newColors[i] = p.colors[i % p.colors.length];
    }
    setColors(newColors);
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const handleLayoutChange = (newLayout: number) => {
    setLayout(newLayout);
    setColors(Array(newLayout * newLayout).fill('#ffffff'));
  };

  const handleLayoutTypeChange = (newType: Design['layoutType']) => {
    setLayoutType(newType);
  };

  const handleSave = async () => {
    if (!designName.trim()) {
      alert('Please enter a name for your design.');
      return;
    }

    const design: Design = {
      id: initialDesign ? initialDesign.id : uuidv4(),
      name: designName,
      layout,
      colors,
      createdAt: initialDesign ? initialDesign.createdAt : Date.now(),
      layoutType,
    };

    await saveDesign(design);
    onDesignSaved(design);
  };

  const previewDesign: Design = {
    id: 'preview',
    name: 'preview',
    layout,
    colors,
    createdAt: Date.now(),
    layoutType
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-xl font-bold mb-4">{initialDesign ? 'Edit Coaster' : 'Design Your Coaster'}</h2>

      <div className="mb-6 space-y-4">
        {(templates.length > 0 || palettes.length > 0) && (
           <div className="mb-6 grid grid-cols-2 gap-4">
             {templates.length > 0 && (
               <div>
                 <label className="block text-sm font-medium text-neutral-700 mb-2">Templates</label>
                 <div className="flex flex-wrap gap-2">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateSelect(t)}
                        className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50"
                      >
                        {t.name}
                      </button>
                    ))}
                 </div>
               </div>
             )}
             {palettes.length > 0 && (
               <div>
                 <label className="block text-sm font-medium text-neutral-700 mb-2">Palettes</label>
                 <div className="flex flex-wrap gap-2">
                    {palettes.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePaletteSelect(p)}
                        className="flex gap-px border border-neutral-200 p-1 rounded hover:bg-neutral-50"
                        title={p.name}
                      >
                        {p.colors.slice(0, 4).map((c, i) => (
                          <div key={i} className="w-4 h-4" style={{ backgroundColor: c }} />
                        ))}
                      </button>
                    ))}
                 </div>
               </div>
             )}
           </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Grid Size</label>
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
          <label className="block text-sm font-medium text-neutral-700 mb-1">Layout Type</label>
          <div className="flex gap-2">
            {(['grid', 'checkerboard', 'hexagonal', 'circular'] as const).map(type => (
              <button
                key={type}
                onClick={() => handleLayoutTypeChange(type)}
                className={`px-3 py-1 rounded border capitalize ${layoutType === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Design Name *</label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., Ocean Waves"
          />
        </div>
      </div>

      <div className="flex flex-col items-center mb-6 gap-6">
        <div className="w-full max-w-xs aspect-square mx-auto">
           <DesignPreview design={previewDesign} className="w-full h-full rounded-lg shadow-sm border border-neutral-200" />
        </div>

        <div className="w-full">
           <label className="block text-sm font-medium text-neutral-700 mb-2">Edit Colors</label>
           <div className="flex flex-wrap gap-2 justify-center">
             {colors.map((color, idx) => (
               <div key={idx} className="relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden shadow-sm border border-neutral-200">
                 <input
                   type="color"
                   value={color}
                   onChange={(e) => handleColorChange(idx, e.target.value)}
                   className="absolute -inset-2 w-20 h-20 cursor-pointer"
                 />
               </div>
             ))}
           </div>
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
