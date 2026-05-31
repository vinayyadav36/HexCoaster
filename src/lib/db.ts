import localforage from 'localforage';
import { CoasterDesign, OrderSubmission, ColorPalette, DesignTemplate } from '../types';

// Export types from types/index.ts for backward compatibility in components for now
export type { CoasterDesign as Design, OrderSubmission as OrderIntent, ColorPalette, DesignTemplate as Template } from '../types';

// Initialize stores
const designsStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'designs' });
const ordersStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'orders' });
const templatesStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'templates' });
const palettesStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'palettes' });
const offlineQueueStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'offlineQueue' });
const configStore = localforage.createInstance({ name: 'HexCoaster', storeName: 'config' });

// --- Designs ---
export async function getDesigns(): Promise<CoasterDesign[]> {
  const designs: CoasterDesign[] = [];
  await designsStore.iterate((value: CoasterDesign) => {
    designs.push(value);
  });
  return designs.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveDesign(design: CoasterDesign): Promise<void> {
  await designsStore.setItem(design.id, design);
}

export async function getDesign(id: string): Promise<CoasterDesign | null> {
  return await designsStore.getItem<CoasterDesign>(id);
}

export async function deleteDesign(id: string): Promise<void> {
  await designsStore.removeItem(id);
}

// --- Orders ---
export async function getOrders(): Promise<OrderSubmission[]> {
  const orders: OrderSubmission[] = [];
  await ordersStore.iterate((value: OrderSubmission) => {
    orders.push(value);
  });
  return orders.sort((a, b) => b.submittedAt - a.submittedAt);
}

// Simple hash function for payload duplication check
const hashPayload = (order: OrderSubmission) => {
  return btoa(`${order.designId}-${order.email}-${order.quantity}-${order.material}-${order.notes}`);
};

export async function submitOrder(order: OrderSubmission): Promise<void> {
  const hash = hashPayload(order);
  order.payloadHash = hash;

  if (navigator.onLine) {
    order.status = 'submitted';
    await ordersStore.setItem(order.id, order);
  } else {
    order.status = 'pending';
    order.retryCount = 0;
    // Save locally to display for user
    await ordersStore.setItem(order.id, order);
    // Add to offline queue
    await offlineQueueStore.setItem(order.id, order);
  }
}

export async function updateOrderStatus(id: string, status: OrderSubmission['status']): Promise<void> {
  const order = await ordersStore.getItem<OrderSubmission>(id);
  if (order) {
    order.status = status;
    await ordersStore.setItem(order.id, order);
  }
}

export async function getPendingOrdersCount(): Promise<number> {
  const keys = await offlineQueueStore.keys();
  return keys.length;
}

// --- Templates ---
export async function getTemplates(): Promise<DesignTemplate[]> {
  const templates: DesignTemplate[] = [];
  await templatesStore.iterate((value: DesignTemplate) => {
    templates.push(value);
  });
  return templates;
}

export async function saveTemplate(template: DesignTemplate): Promise<void> {
  await templatesStore.setItem(template.id, template);
}

export async function deleteTemplate(id: string): Promise<void> {
  await templatesStore.removeItem(id);
}

// --- Palettes ---
export async function getPalettes(): Promise<ColorPalette[]> {
  const palettes: ColorPalette[] = [];
  await palettesStore.iterate((value: ColorPalette) => {
    palettes.push(value);
  });
  return palettes;
}

export async function savePalette(palette: ColorPalette): Promise<void> {
  await palettesStore.setItem(palette.id, palette);
}

export async function deletePalette(id: string): Promise<void> {
  await palettesStore.removeItem(id);
}

// --- Seeding ---
export async function seedDefaultData(): Promise<void> {
  const seeded = await configStore.getItem<boolean>('seeded');
  if (seeded) return;

  const defaultPalettes: ColorPalette[] = [
    { id: 'p1', name: 'Ocean Blues', colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#0096C7'], theme: 'cool' },
    { id: 'p2', name: 'Forest Greens', colors: ['#081C15', '#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D'], theme: 'nature' },
    { id: 'p3', name: 'Sunset Warm', colors: ['#FF7B00', '#FF8800', '#FF9500', '#FFA200', '#FFAA00', '#FFB700'], theme: 'warm' },
    { id: 'p4', name: 'Monochrome Studio', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'], theme: 'mono' },
    { id: 'p5', name: 'Neon Dark', colors: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#111111', '#222222'], theme: 'neon' },
  ];

  for (const p of defaultPalettes) {
    await palettesStore.setItem(p.id, p);
  }

  const defaultTemplates: DesignTemplate[] = [
    { id: 't1', name: 'Ocean Hex', layout: 'hexagonal', colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#03045E'] },
    { id: 't2', name: 'Forest Rings', layout: 'circular', colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D'] },
    { id: 't3', name: 'Sunset Check', layout: 'checkerboard', colors: ['#FF7B00', '#FFA200', '#FF7B00', '#FFA200', '#FF7B00', '#FFA200', '#FF7B00', '#FFA200', '#FF7B00'] },
  ];
  for (const t of defaultTemplates) {
    await templatesStore.setItem(t.id, t);
  }

  await configStore.setItem('seeded', true);
}

export async function seedTemplates(): Promise<void> {
  return seedDefaultData();
}

// --- Offline Sync ---
export async function syncOfflineOrders(): Promise<void> {
  if (!navigator.onLine) return;

  const queuedOrders: OrderSubmission[] = [];
  await offlineQueueStore.iterate((value: OrderSubmission) => {
    queuedOrders.push(value);
  });

  // Sort chronologically
  queuedOrders.sort((a, b) => a.submittedAt - b.submittedAt);

  const processedHashes = new Set<string>();
  let count = 0;

  for (const order of queuedOrders) {
    if (order.payloadHash && processedHashes.has(order.payloadHash)) {
      // Duplicate, remove from queue without processing
      await offlineQueueStore.removeItem(order.id);
      continue;
    }

    if (order.payloadHash) {
      processedHashes.add(order.payloadHash);
    }

    try {
      // Process submission
      order.status = 'submitted';
      await ordersStore.setItem(order.id, order); // Update main store
      await offlineQueueStore.removeItem(order.id); // Remove from queue
      count++;
    } catch {
      // Increment retry
      order.retryCount = (order.retryCount || 0) + 1;
      if (order.retryCount > 3) {
        // Drop after 3 retries or mark failed
        order.status = 'pending';
        await ordersStore.setItem(order.id, order);
        await offlineQueueStore.removeItem(order.id);
      } else {
        await offlineQueueStore.setItem(order.id, order);
      }
    }
  }

  if (count > 0) {
    alert(`${count} order(s) synced`);
    window.dispatchEvent(new Event('orders-synced'));
  }
}

// Listen for online event to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineOrders);
}
