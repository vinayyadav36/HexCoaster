import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitOrder, OrderIntent } from '../lib/db';

type Props = {
  designId: string;
  designName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

export function OrderForm({ designId, designName, onSuccess, onCancel }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [material, setMaterial] = useState<'cork' | 'acrylic' | 'ceramic'>('cork');
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // State for showing the confirmation card
  const [submitted, setSubmitted] = useState(false);
  const [wasOfflineSubmit, setWasOfflineSubmit] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || quantity < 1) {
      alert('Please fill out all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const order: OrderIntent = {
      id: uuidv4(),
      designId,
      name,
      email,
      quantity,
      material,
      notes,
      submittedAt: Date.now(),
      status: 'pending',
    };

    await submitOrder(order);

    // Update pending badge if needed (handled by App.tsx through events/polling)
    window.dispatchEvent(new Event('order-submitted'));

    setWasOfflineSubmit(!isOnline);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center space-y-4">
        <h3 className="text-xl font-bold text-green-800">Order Interest Saved!</h3>
        {wasOfflineSubmit ? (
          <p className="text-green-700">You are offline. Your order is queued and will be synced when you reconnect.</p>
        ) : (
          <p className="text-green-700">Thank you for your interest. We will contact you soon!</p>
        )}
        <div className="bg-white p-4 rounded text-left border border-green-100 mt-4">
           <p className="text-sm"><strong>Name:</strong> {name}</p>
           <p className="text-sm"><strong>Email:</strong> {email}</p>
           <p className="text-sm"><strong>Quantity:</strong> {quantity}</p>
           <p className="text-sm capitalize"><strong>Material:</strong> {material}</p>
        </div>
        <button
          onClick={onSuccess}
          className="mt-4 bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none transition-colors"
        >
          Back to Designer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200">
          Saved offline — will submit when back online.
        </div>
      )}

      {designName && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Design</label>
          <input
            disabled
            type="text"
            value={designName}
            className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm text-neutral-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity *</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Material</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value as 'cork' | 'acrylic' | 'ceramic')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="cork">Cork</option>
            <option value="acrylic">Acrylic</option>
            <option value="ceramic">Ceramic</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white text-neutral-700 py-2 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors"
        >
          Submit Order
        </button>
      </div>
    </form>
  );
}
