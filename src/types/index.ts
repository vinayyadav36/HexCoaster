export type CoasterDesign = {
  id: string;
  name: string;
  layout: number; // total cells
  colors: string[];
  createdAt: number;
  layoutType?: 'hexagonal' | 'circular' | 'checkerboard' | 'grid';
};

export type OrderSubmission = {
  id: string;
  designId: string;
  name: string;
  email: string;
  quantity: number;
  material: 'cork' | 'acrylic' | 'ceramic';
  notes?: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'submitted';
  submittedAt: number;
  // Offline queue specifics
  payloadHash?: string;
  retryCount?: number;
};

export type ColorPalette = {
  id: string;
  name: string;
  colors: string[];
  theme: string;
};

export type DesignTemplate = {
  id: string;
  name: string;
  layout: string | number;
  colors: string[];
};

export type UserRole = "admin" | "visitor";
