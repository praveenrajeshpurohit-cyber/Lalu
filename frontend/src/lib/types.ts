export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "student" | "admin";
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string | null;
  price: number;
  discount_price?: number | null;
  validity_days: number;
  is_free: boolean;
  is_enrollable: boolean;
  instructor: string;
  duration?: string | null;
  level?: string | null;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  status: "active" | "expired" | "revoked";
  progress: number;
  enrolled_at: string;
  expires_at?: string | null;
};

export type Payment = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  course_id: string;
  course_title: string;
  amount: number;
  screenshot?: string | null;
  upi_ref?: string | null;
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  created_at: string;
  reviewed_at?: string | null;
};

export type ContentItem = {
  id: string;
  course_id: string;
  title: string;
  type: "video" | "pdf" | "assignment";
  data?: string | null;
  url?: string | null;
  description?: string | null;
  order: number;
  duration?: string | null;
  created_at: string;
};

export type LiveClass = {
  id: string;
  course_id?: string | null;
  title: string;
  description?: string | null;
  join_url: string;
  scheduled_at: string;
  duration_min: number;
  created_at: string;
};

export type Settings = {
  upi_id: string;
  upi_qr?: string | null;
  whatsapp_number: string;
  support_email: string;
  support_phone: string;
  teacher_bio: string;
  teacher_image?: string | null;
  teacher_qualifications: string;
  hero_title: string;
  hero_subtitle: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar?: string | null;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type Stats = {
  students: number;
  courses: number;
  enrollments: number;
  pending_payments: number;
  total_revenue: number;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  target: "all" | "user";
  user_id?: string | null;
  created_at: string;
  read_by: string[];
};
