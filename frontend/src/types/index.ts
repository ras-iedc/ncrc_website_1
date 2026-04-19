export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  phone?: string;
  dob?: string;
  address?: string;
  membershipId?: string;
  avatarPath?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: string;
  description?: string;
  invoicePath?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'NEWS' | 'NOTICE' | 'TOURNAMENT';
  published: boolean;
  createdAt: string;
  author: { name: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
