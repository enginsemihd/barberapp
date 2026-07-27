import type { Appointment, Customer, Service, ShopSettings, Staff } from "./types";

// Geçici mock veri katmanı — Supabase projesi kurulunca bu dosyanın yerini
// gerçek sorgular (bkz. lib/supabase/*) alacak. Sayfa bileşenleri bu veriyi
// props gibi tüketiyor, kaynağı değiştirmek sayfaları etkilemeyecek.

export const shopSettings: ShopSettings = {
  name: "Usta Berber Salonu",
  address: "Gaziantep, İncilipınar Mah. No:14",
  hours: "Sal–Paz 09:00–20:00",
  rating: 4.9,
  reviewCount: 312,
  depositPercent: 50,
  cancellationWindowHours: 6,
};

export const services: Service[] = [
  { id: "sac-kesimi", name: "Saç Kesimi", category: "Saç", durationMinutes: 30, price: 350, icon: "✂️", active: true },
  { id: "cocuk-kesimi", name: "Çocuk Kesimi", category: "Saç", durationMinutes: 25, price: 300, icon: "✂️", active: true },
  { id: "sac-yikama-fon", name: "Saç Yıkama & Fön", category: "Saç", durationMinutes: 15, price: 250, icon: "💧", active: false },
  { id: "sakal-tirasi", name: "Sakal Tıraşı", category: "Sakal", durationMinutes: 20, price: 250, icon: "🪒", active: true },
  { id: "ustura-sakal", name: "Ustura Sakal", category: "Sakal", durationMinutes: 30, price: 300, icon: "🪒", active: true },
  { id: "sac-sakal", name: "Saç + Sakal", category: "Paketler", durationMinutes: 45, price: 500, icon: "💈", active: true },
  { id: "damat-tirasi", name: "Damat Tıraşı", category: "Paketler", durationMinutes: 60, price: 3000, icon: "💈", active: true },
];

export const staff: Staff[] = [
  { id: "mert", name: "Mert Usta", role: "owner", tag: "Klasik kesim, sakal şekillendirme", color: "var(--moss)", initial: "M", days: [0, 1, 2, 3, 4, 5] },
  { id: "emre", name: "Emre Usta", role: "barber", tag: "Fade, çocuk kesimi", color: "var(--brass)", initial: "E", days: [1, 2, 3, 4, 5, 6] },
  { id: "can", name: "Can Usta", role: "barber", tag: "Ustura sakal", color: "var(--rust)", initial: "C", days: [0, 1, 3, 4, 5] },
];

export const timeSlots = ["10:00", "10:30", "11:00", "13:30", "14:30", "15:00", "15:30", "16:00", "17:45"];
export const fullSlots = new Set(["10:30", "15:30"]);

// Randevu saatini "şu andan" göreli üretir — böylece iptal politikası demosu
// (6 saat kuralı) her zaman doğru senaryoyu gösterir, mock veri "geçmişte
// kalmış" bir tarihe sabitlenip anlamsızlaşmaz.
function relativeSlot(hoursFromNow: number, durationMinutes: number) {
  const start = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  start.setSeconds(0, 0);
  start.setMinutes(Math.round(start.getMinutes() / 15) * 15);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  return { date, startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`, endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}` };
}

export const myAppointments: Appointment[] = [
  {
    id: "a1",
    customerName: "Kerem Aydın",
    serviceId: "sac-kesimi",
    staffId: "mert",
    ...relativeSlot(3, 30), // 6 saatlik ücretsiz iptal penceresinin içinde — iptal edilirse ön ödeme iade edilmez
    status: "confirmed",
    price: 350,
    depositAmount: 175,
    paymentStatus: "deposit_paid",
  },
  {
    id: "a2",
    customerName: "Kerem Aydın",
    serviceId: "sac-sakal",
    staffId: "can",
    ...relativeSlot(50, 45), // pencerenin dışında — iptal edilirse tam iade
    status: "confirmed",
    price: 500,
    depositAmount: 250,
    paymentStatus: "deposit_paid",
  },
  {
    id: "a3",
    customerName: "Kerem Aydın",
    serviceId: "sakal-tirasi",
    staffId: "emre",
    ...relativeSlot(-72, 20),
    status: "completed",
    price: 250,
    depositAmount: 125,
    paymentStatus: "paid_in_full",
  },
];

export const shopAppointments: Appointment[] = [
  { id: "d1", customerName: "Kerem Aydın", serviceId: "sac-sakal", staffId: "mert", date: "2026-07-21", startTime: "09:00", endTime: "10:00", status: "confirmed", price: 500, depositAmount: 250, paymentStatus: "deposit_paid" },
  { id: "d2", customerName: "Kerem Aydın", serviceId: "sac-kesimi", staffId: "mert", date: "2026-07-21", startTime: "14:30", endTime: "15:00", status: "confirmed", price: 350, depositAmount: 175, paymentStatus: "deposit_paid" },
  { id: "d3", customerName: "Deniz Kaya", serviceId: "sac-kesimi", staffId: "mert", date: "2026-07-21", startTime: "16:30", endTime: "17:00", status: "pending", price: 350, depositAmount: 175, paymentStatus: "unpaid" },
  { id: "d4", customerName: "Ali Veli", serviceId: "sac-kesimi", staffId: "emre", date: "2026-07-21", startTime: "10:30", endTime: "11:00", status: "cancelled", price: 350, depositAmount: 175, paymentStatus: "unpaid" },
  { id: "d5", customerName: "Burak Şen", serviceId: "sakal-tirasi", staffId: "emre", date: "2026-07-21", startTime: "12:00", endTime: "12:30", status: "confirmed", price: 250, depositAmount: 125, paymentStatus: "deposit_paid" },
  { id: "d6", customerName: "Onur Yıldız", serviceId: "cocuk-kesimi", staffId: "emre", date: "2026-07-21", startTime: "15:30", endTime: "16:00", status: "pending", price: 300, depositAmount: 150, paymentStatus: "unpaid" },
  { id: "d7", customerName: "Selim Ak", serviceId: "sac-sakal", staffId: "can", date: "2026-07-21", startTime: "11:30", endTime: "12:15", status: "confirmed", price: 500, depositAmount: 250, paymentStatus: "deposit_paid" },
  { id: "d8", customerName: "Barış Er", serviceId: "ustura-sakal", staffId: "can", date: "2026-07-21", startTime: "17:45", endTime: "18:15", status: "confirmed", price: 300, depositAmount: 150, paymentStatus: "deposit_paid" },
];

export const customers: Customer[] = [
  { id: "c1", name: "Kerem Aydın", phone: "0532 111 22 33", notificationChannel: "whatsapp", totalVisits: 12, lastVisit: "2026-07-21" },
  { id: "c2", name: "Deniz Kaya", phone: "0533 222 33 44", notificationChannel: "whatsapp", totalVisits: 3, lastVisit: "2026-07-21" },
  { id: "c3", name: "Ali Veli", phone: "0534 333 44 55", notificationChannel: "sms", totalVisits: 1, lastVisit: "2026-07-14", notes: "Geçmiş randevuyu iptal etti" },
  { id: "c4", name: "Burak Şen", phone: "0535 444 55 66", notificationChannel: "whatsapp", totalVisits: 7, lastVisit: "2026-07-21" },
  { id: "c5", name: "Onur Yıldız", phone: "0536 555 66 77", notificationChannel: "sms", totalVisits: 2, lastVisit: "2026-07-21" },
  { id: "c6", name: "Selim Ak", phone: "0537 666 77 88", notificationChannel: "whatsapp", totalVisits: 15, lastVisit: "2026-07-21" },
  { id: "c7", name: "Barış Er", phone: "0538 777 88 99", notificationChannel: "whatsapp", totalVisits: 5, lastVisit: "2026-07-21" },
];

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getStaff(id: string): Staff | undefined {
  return staff.find((s) => s.id === id);
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("tr-TR")}₺`;
}
