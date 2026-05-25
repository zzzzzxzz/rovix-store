export type Product = {
  id: string;
  kind?: "robux" | "gamepass" | "cart";
  title?: string;
  game?: string;
  gameSlug?: string;
  amount: number;
  price: number;
  badge: string;
  icon?: string;
  accent?: string;
  itemCount?: number;
  gamepassCount?: number;
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
  productTitle?: string;
  productKind?: Product["kind"];
  productGame?: string;
  productQuantity?: number;
  productGamepassCount?: number;
  value: number;
  customerName: string;
  customerEmail: string;
  paymentId: string;
  status: "processing";
  createdAt: string;
};
