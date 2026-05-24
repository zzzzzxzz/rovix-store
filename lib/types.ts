export type Product = {
  id: string;
  amount: number;
  price: number;
  badge: string;
};

export type CheckoutForm = {
  username: string;
  email: string;
  document: string;
};

export type PaymentStatus = "pending" | "approved" | "rejected" | "expired";

export type PixPayment = {
  id: string;
  status: PaymentStatus;
  qrCode: string;
  copyPaste: string;
  expiresAt: string;
};

export type Order = {
  id: string;
  productId: string;
  productAmount: number;
  value: number;
  customerName: string;
  customerEmail: string;
  paymentId: string;
  status: "processing";
  createdAt: string;
};
