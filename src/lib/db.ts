import localforage from 'localforage';

export type Design = {
  id: string;
  name: string;
  layout: number; // e.g. 2 for 2x2, 3 for 3x3
  colors: string[]; // hex codes
  createdAt: number;
};

export type OrderIntent = {
  id: string;
  designId: string;
  name: string;
  email: string;
  notes: string;
  createdAt: number;
  status: 'pending' | 'submitted';
};

export type Template = {
  id: string;
  name: string;
  colors: string[];
};

// Initialize stores
const designsStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'designs' });
const ordersStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'orders' });
const templatesStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'templates' });
const offlineQueueStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'offlineQueue' });

// --- Designs ---
export async function getDesigns(): Promise<Design[]> {
  const designs: Design[] = [];
  await designsStore.iterate((value: Design) => {
    designs.push(value);
  });
  return designs.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveDesign(design: Design): Promise<void> {
  await designsStore.setItem(design.id, design);
}

export async function getDesign(id: string): Promise<Design | null> {
  return await designsStore.getItem<Design>(id);
}

// --- Orders ---
export async function getOrders(): Promise<OrderIntent[]> {
  const orders: OrderIntent[] = [];
  await ordersStore.iterate((value: OrderIntent) => {
    orders.push(value);
  });
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function submitOrder(order: OrderIntent): Promise<void> {
  if (navigator.onLine) {
    order.status = 'submitted';
    await ordersStore.setItem(order.id, order);
  } else {
    order.status = 'pending';
    // Save locally to display for user
    await ordersStore.setItem(order.id, order);
    // Add to offline queue
    await offlineQueueStore.setItem(order.id, order);
  }
}

// --- Templates ---
export async function getTemplates(): Promise<Template[]> {
  const templates: Template[] = [];
  await templatesStore.iterate((value: Template) => {
    templates.push(value);
  });
  return templates;
}

export async function seedTemplates(): Promise<void> {
  const defaultTemplates: Template[] = [
    { id: 't1', name: 'Ocean', colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF'] },
    { id: 't2', name: 'Forest', colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D'] },
    { id: 't3', name: 'Sunset', colors: ['#FF7B00', '#FF8800', '#FF9500', '#FFA200'] },
  ];
  for (const t of defaultTemplates) {
    await templatesStore.setItem(t.id, t);
  }
}

// --- Offline Sync ---
export async function syncOfflineOrders(): Promise<void> {
  if (!navigator.onLine) return;

  const keys = await offlineQueueStore.keys();
  for (const key of keys) {
    const order = await offlineQueueStore.getItem<OrderIntent>(key);
    if (order) {
      order.status = 'submitted';
      await ordersStore.setItem(order.id, order); // Update main store
      await offlineQueueStore.removeItem(key); // Remove from queue
    }
  }
}

// Listen for online event to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineOrders);
}
