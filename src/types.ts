export interface POItem {
  id: string;
  description: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  orderNumber: string;
  date: string;
  supplier: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  clinic: {
    name: string;
    address: string;
    personInCharge: string;
  };
  items: POItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Delivered' | 'Cancelled';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ClinicInfo {
  name: string;
  regNumber: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  pic: string;
  activeSuppliers: number;
  poThisMonth: number;
  spendingThisMonth: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  clinic: string;
  isApprovalEnabled: boolean;
  isPrimaryPIC: boolean;
  avatar?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  reliabilityScore: number;
  paymentTerms: string;
  lastOrderDate: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  category: string;
  supplier: string;
  unit: string;
  unitPrice: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastOrderedDate: string;
}
