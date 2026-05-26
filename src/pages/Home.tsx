import { useState, useEffect } from 'react';
import { CoasterDesigner } from '../components/CoasterDesigner';
import { OrderForm } from '../components/OrderForm';
import { Design, getDesigns } from '../lib/db';

export function Home() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    const loaded = await getDesigns();
    setDesigns(loaded);
  };

  const handleDesignSaved = (design: Design) => {
    loadDesigns();
    setSelectedDesign(design);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <CoasterDesigner onDesignSaved={handleDesignSaved} />
      </div>

      <div className="space-y-8">
        {selectedDesign ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold mb-4">Order Intent: {selectedDesign.name}</h2>
            <div className="mb-4 flex justify-center">
               <div
                  className="grid gap-0.5 bg-neutral-200 p-1 rounded"
                  style={{ gridTemplateColumns: `repeat(${selectedDesign.layout}, minmax(0, 1fr))` }}
                >
                  {selectedDesign.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
            </div>
            <OrderForm designId={selectedDesign.id} onSuccess={() => setSelectedDesign(null)} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 text-center text-neutral-500">
            Select a design below or create a new one to place an order intent.
          </div>
        )}

        {designs.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-lg font-bold mb-4">Your Saved Designs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {designs.map(d => (
                <div
                  key={d.id}
                  className="cursor-pointer border border-neutral-200 rounded p-2 hover:border-blue-500 transition-colors"
                  onClick={() => setSelectedDesign(d)}
                >
                  <div
                    className="grid gap-0.5 bg-neutral-100 p-1 rounded aspect-square mb-2"
                    style={{ gridTemplateColumns: `repeat(${d.layout}, minmax(0, 1fr))` }}
                  >
                    {d.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-full h-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-center font-medium truncate">{d.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
