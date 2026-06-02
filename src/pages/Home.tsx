import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoasterDesigner } from '../components/CoasterDesigner';
import { OrderForm } from '../components/OrderForm';
import { Design, getDesigns } from '../lib/db';
import { DesignPreview } from '../components/DesignPreview';

export function Home() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadDesigns();
  }, []);

  useEffect(() => {
    if (location.state?.orderDesign) {
      setSelectedDesign(location.state.orderDesign);
      // Clear state so it doesn't persist on refresh
      navigate('.', { replace: true, state: { ...location.state, orderDesign: undefined } });
    }
  }, [location.state, navigate]);

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
        <CoasterDesigner onDesignSaved={handleDesignSaved} initialDesign={location.state?.editDesign} />
      </div>

      <div className="space-y-8">
        {selectedDesign ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold mb-4">Order Intent: {selectedDesign.name}</h2>
            <div className="mb-4 flex justify-center">
               <DesignPreview design={selectedDesign} className="w-32 h-32" />
            </div>
            <OrderForm designId={selectedDesign.id} designName={selectedDesign.name} onSuccess={() => setSelectedDesign(null)} />
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
                  className="cursor-pointer border border-neutral-200 rounded p-2 hover:border-blue-500 transition-colors flex flex-col"
                  onClick={() => setSelectedDesign(d)}
                >
                  <div className="mb-2">
                    <DesignPreview design={d} />
                  </div>
                  <p className="text-sm text-center font-medium truncate mt-auto">{d.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
