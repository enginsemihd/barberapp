export type ServiceCategory = "Saç" | "Sakal" | "Paketler";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  icon: string;
  active: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: "owner" | "barber";
  tag: string;
  color: string;
  initial: string;
  days: number[]; // 0=Pzt..6=Paz, working days
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
export type PaymentStatus = "unpaid" | "deposit_paid" | "paid_in_full";

export interface Appointment {
  id: string;
  customerName: string;
  serviceId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  price: number;
  depositAmount: number;
  paymentStatus: PaymentStatus;
  /** Set only when the customer cancels: whether the deposit was refunded (cancelled outside the policy window) or forfeited (cancelled inside it). */
  refundEligible?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notificationChannel: "whatsapp" | "sms";
  totalVisits: number;
  lastVisit: string | null; // YYYY-MM-DD
  notes?: string;
}

export interface ShopSettings {
  name: string;
  address: string;
  hours: string;
  rating: number;
  reviewCount: number;
  depositPercent: number;
  cancellationWindowHours: number;
}
