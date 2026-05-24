export interface SupplierMedicine {
  id: string;
  medicine_name: string;
  dosage: string;
  category: string;
  supplier_name: string;
  unit: string;
  unit_price: number;
  availability: string | boolean;
}

export interface InventoryItem {
  id: string;
  medicine_name: string;
  dosage: string;
  supplier_name: string;
  current_stock_quantity: number;
  reorder_level: number;
  unit: string;
  updated_at: string;
}

export const defaultSupplierCatalog: SupplierMedicine[] = [
  { id: 'sc-1', medicine_name: 'Paracetamol', dosage: '500mg Tablet', category: 'Pain Relief', supplier_name: 'PharmaDirect Malaysia Sdn Bhd', unit: 'Box', unit_price: 45.00, availability: 'Available' },
  { id: 'sc-2', medicine_name: 'Ibuprofen', dosage: '200mg Tablet', category: 'Pain Relief', supplier_name: 'PharmaDirect Malaysia Sdn Bhd', unit: 'Box', unit_price: 38.00, availability: 'Available' },
  { id: 'sc-3', medicine_name: 'Amoxicillin', dosage: '250mg Capsule', category: 'Antibiotics', supplier_name: 'PharmaDirect Malaysia Sdn Bhd', unit: 'Bottle', unit_price: 12.50, availability: 'Available' },
  { id: 'sc-4', medicine_name: 'Salbutamol Inhaler', dosage: '100mcg', category: 'Respiratory', supplier_name: 'Sabah Pharma Distributions', unit: 'Unit', unit_price: 28.00, availability: 'Available' },
  { id: 'sc-5', medicine_name: 'Cetirizine', dosage: '10mg Tablet', category: 'Allergy', supplier_name: 'Sabah Pharma Distributions', unit: 'Box', unit_price: 22.00, availability: 'Temporarily Unavailable' },
  { id: 'sc-6', medicine_name: 'Loratadine', dosage: '10mg Tablet', category: 'Allergy', supplier_name: 'Sabah Pharma Distributions', unit: 'Box', unit_price: 25.00, availability: 'Available' },
  { id: 'sc-7', medicine_name: 'Insulin Pen Needles', dosage: '4mm', category: 'Diabetes Care', supplier_name: 'Sabah Pharma Distributions', unit: 'Box', unit_price: 55.00, availability: 'Available' },
  { id: 'sc-8', medicine_name: 'Surgical Gloves', dosage: 'Size M', category: 'Medical Supplies', supplier_name: 'MediSupply KL Sdn Bhd', unit: 'Box', unit_price: 32.00, availability: 'Available' },
  { id: 'sc-9', medicine_name: 'Alcohol Swabs', dosage: '70%', category: 'Medical Supplies', supplier_name: 'MediSupply KL Sdn Bhd', unit: 'Box', unit_price: 18.00, availability: 'Available' },
  { id: 'sc-10', medicine_name: 'Face Mask', dosage: '3-Ply', category: 'Medical Supplies', supplier_name: 'MediSupply KL Sdn Bhd', unit: 'Box', unit_price: 15.00, availability: 'Low Availability' },
  { id: 'sc-11', medicine_name: 'Bandage Roll', dosage: '10cm', category: 'Wound Care', supplier_name: 'Global Health Corp', unit: 'Unit', unit_price: 4.50, availability: 'Available' },
  { id: 'sc-12', medicine_name: 'Antiseptic Solution', dosage: '500ml', category: 'Wound Care', supplier_name: 'Global Health Corp', unit: 'Bottle', unit_price: 11.50, availability: 'Available' }
];

export const defaultClinicInventory: InventoryItem[] = [
  { id: 'ci-1', medicine_name: 'Paracetamol', dosage: '500mg', supplier_name: 'PharmaDirect Malaysia', current_stock_quantity: 4, reorder_level: 50, unit: 'Box of 100', updated_at: '2026-05-20T10:00:00Z' },
  { id: 'ci-2', medicine_name: 'Amoxicillin', dosage: '250mg', supplier_name: 'Sabah Pharma Distributions', current_stock_quantity: 120, reorder_level: 30, unit: 'Bottle', updated_at: '2026-05-21T09:15:00Z' },
  { id: 'ci-3', medicine_name: 'Cough Syrup', dosage: '100ml', supplier_name: 'Medisupply KL Sdn Bhd', current_stock_quantity: 0, reorder_level: 15, unit: 'Bottle', updated_at: '2026-05-18T14:30:00Z' },
  { id: 'ci-4', medicine_name: 'Insulin Pen', dosage: '3ml', supplier_name: 'Global Health Corp', current_stock_quantity: 8, reorder_level: 20, unit: 'Pack of 5', updated_at: '2026-05-21T11:00:00Z' },
  { id: 'ci-5', medicine_name: 'Surgical Gloves', dosage: 'Size 7', supplier_name: 'Borneo Medical Supp', current_stock_quantity: 45, reorder_level: 15, unit: 'Box of 50', updated_at: '2026-05-19T08:00:00Z' },
];
