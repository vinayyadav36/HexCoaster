import { useState, useEffect } from 'react';
import { Design, getDesigns, deleteDesign } from '../lib/db';
import { useNavigate } from 'react-router-dom';

export function Gallery() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    const loaded = await getDesigns();
    setDesigns(loaded);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this design?')) {
      await deleteDesign(id);
      loadDesigns();
    }
  };

  const handleEdit = (design: Design, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/', { state: { editDesign: design } });
  };

  const handleOrder = (design: Design, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/', { state: { orderDesign: design } });
  };

  const renderMiniPreview = (d: Design) => {
    if (d.layoutType === 'hexagonal') {
      return (
        <div className="flex flex-wrap justify-center gap-px bg-neutral-100 p-1 rounded aspect-square overflow-hidden items-center">
          {d.colors.map((color, idx) => (
             <div key={idx} className="w-1/3 h-1/3" style={{
               clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
               backgroundColor: color,
               margin: '-2px'
             }} />
          ))}
        </div>
      );
    }
    if (d.layoutType === 'circular') {
      return (
         <div className="relative w-full h-full aspect-square flex items-center justify-center bg-neutral-100 rounded">
           {d.colors.map((color, idx) => {
             const size = 100 - (idx * (100 / d.colors.length));
             if (size <= 0) return null;
             return (
               <div key={idx} className="absolute rounded-full"
                 style={{
                   width: `${size}%`, height: `${size}%`, backgroundColor: color, zIndex: d.colors.length - idx
                 }}
               />
             )
           })}
        </div>
      );
    }

    const cols = Math.ceil(Math.sqrt(Number(d.layout) || d.colors.length));
    return (
      <div
        className={`grid gap-px bg-neutral-100 p-1 rounded aspect-square ${d.layoutType === 'checkerboard' ? 'bg-neutral-300' : ''}`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {d.colors.map((color, idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const isChecker = (row + col) % 2 === 0;
          const finalColor = d.layoutType === 'checkerboard' && isChecker && color === '#ffffff' ? '#e5e5e5' : color;
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Design Gallery</h1>
          <p className="text-neutral-500">Your saved creations.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
        >
          New Design
        </button>
      </div>

      {designs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-neutral-200">
          <p className="text-neutral-500 text-lg mb-4">No saved designs yet — start designing!</p>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Go to Designer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map(d => (
            <div key={d.id} className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                {renderMiniPreview(d)}
              </div>
              <h3 className="font-bold text-lg truncate mb-1" title={d.name}>{d.name}</h3>
              <p className="text-sm text-neutral-500 mb-4 flex justify-between">
                <span className="capitalize">{d.layoutType || 'Grid'} ({d.colors.length} cells)</span>
                <span>{new Date(d.createdAt).toLocaleDateString()}</span>
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                <button
                  onClick={(e) => handleOrder(d, e)}
                  className="flex-1 bg-neutral-900 text-white px-3 py-1.5 rounded text-sm hover:bg-neutral-800"
                >
                  Order
                </button>
                <button
                  onClick={(e) => handleEdit(d, e)}
                  className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded text-sm hover:bg-neutral-200 border border-neutral-300"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleDelete(d.id, e)}
                  className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-100 border border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
