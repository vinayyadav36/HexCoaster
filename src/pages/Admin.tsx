import { useState, useEffect } from 'react';
import { Design, OrderIntent, getDesigns, getOrders, seedTemplates } from '../lib/db';
import { DesignPreview } from '../components/DesignPreview';

export function Admin() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<OrderIntent[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedDesigns = await getDesigns();
    const loadedOrders = await getOrders();
    setDesigns(loadedDesigns);
    setOrders(loadedOrders);
  };

  const handleSeed = async () => {
    await seedTemplates();
    alert('Default templates seeded!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage designs and orders.</p>
        </div>
        <button
          onClick={handleSeed}
          className="bg-neutral-100 text-neutral-700 py-2 px-4 rounded-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors font-medium border border-neutral-300"
        >
          Seed Default Templates
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h2 className="text-xl font-bold mb-4">Order Intents ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-neutral-500">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const design = designs.find(d => d.id === order.designId);
                return (
                  <div key={order.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{order.name}</h3>
                        <a href={`mailto:${order.email}`} className="text-sm text-blue-600 hover:underline">{order.email}</a>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {order.status}
                      </span>
                    </div>
                    {order.notes && (
                      <p className="text-sm text-neutral-600 mt-2 bg-neutral-50 p-2 rounded">
                        "{order.notes}"
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center space-x-4">
                      {design ? (
                        <>
                          <DesignPreview design={design} className="w-16 h-16" />
                          <span className="text-sm text-neutral-600">Design: {design.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-red-500">Design not found (ID: {order.designId})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h2 className="text-xl font-bold mb-4">All Designs ({designs.length})</h2>
          {designs.length === 0 ? (
            <p className="text-neutral-500">No designs saved yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {designs.map(d => (
                <div key={d.id} className="border border-neutral-200 rounded p-2 flex flex-col">
                  <div className="mb-2">
                    <DesignPreview design={d} />
                  </div>
                  <p className="text-sm text-center font-medium truncate mt-auto" title={d.name}>{d.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
