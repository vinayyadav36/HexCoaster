import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitOrder, OrderIntent } from '../lib/db';

type Props = {
  designId: string;
  onSuccess: () => void;
};

export function OrderForm({ designId, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    const order: OrderIntent = {
      id: uuidv4(),
      designId,
      name,
      email,
      notes,
      createdAt: Date.now(),
      status: 'pending',
    };

    await submitOrder(order);

    if (isOnline) {
      alert('Order interest submitted successfully!');
    } else {
      alert('You are offline. Your order interest has been queued and will be submitted when you are back online.');
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200">
          You are currently offline. Orders will be saved locally and submitted later.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors"
      >
        Submit Order Interest
      </button>
    </form>
  );
}
