export type Role = "student" | "editor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: { url: string };
  role: Role;
  nationality?: string;
  university?: string | University;
  studyLevel?: string;
  isEmailVerified: boolean;
  isActive?: boolean;
  newsletterSubscribed: boolean;
  themePreference: "light" | "dark" | "system";
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  appliesTo: "article" | "job" | "accommodation" | "university" | "scholarship";
  icon?: string;
  color?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: { url: string; alt: string };
  author: User;
  categories: Category[];
  tags: string[];
  status: "draft" | "pending-review" | "published" | "archived";
  publishedAt?: string;
  views: number;
  likes: string[];
  likesCount: number;
  readingTimeMinutes: number;
  isFeatured: boolean;
  relatedArticles?: Article[];
  seo?: { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; ogImage?: string };
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  slug: string;
  company: { name: string; logo?: string; website?: string };
  description: string;
  responsibilities: string[];
  requirements: string[];
  location: { city: string; isRemote: boolean };
  employmentType: "part-time" | "full-time" | "internship" | "freelance" | "seasonal";
  workPermitRequired: boolean;
  languageRequirements: string[];
  salary?: { min?: number; max?: number; currency: string; period: "hour" | "month" | "year" };
  applicationUrl?: string;
  applicationEmail?: string;
  applicationDeadline?: string;
  category?: Category;
  status: "pending" | "approved" | "rejected" | "expired" | "filled";
  isFeatured: boolean;
  views: number;
  createdAt: string;
}

export interface Accommodation {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: "dormitory" | "studio" | "shared-apartment" | "private-apartment" | "homestay";
  location: {
    address: string;
    city: string;
    district?: string;
    nearestUniversity?: University;
  };
  price: { amount: number; currency: string; period: "month" | "semester"; utilitiesIncluded: boolean };
  capacity: { totalRooms?: number; availableRooms: number; roommates: number };
  amenities: string[];
  images: { url: string; alt: string }[];
  availableFrom?: string;
  status: "pending" | "approved" | "rejected" | "rented" | "expired";
  isFeatured: boolean;
  views: number;
  createdAt: string;
}

export interface University {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description: string;
  city: string;
  website?: string;
  fieldsOfStudy: string[];
  degreeLevels: string[];
  languagesOfInstruction: string[];
  tuitionRange?: { min?: number; max?: number; currency: string; period: "year" | "semester" };
  scholarshipsAvailable: boolean;
}

export interface Scholarship {
  _id: string;
  title: string;
  slug: string;
  provider: string;
  description: string;
  coverageType: "full-tuition" | "partial-tuition" | "living-stipend" | "full-ride" | "travel-grant";
  amount?: { value?: number; currency: string; isFullyFunded: boolean };
  eligibleDegreeLevels: string[];
  applicationDeadline: string;
  applicationUrl: string;
  status: "upcoming" | "open" | "closed";
  isFeatured: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  targetType: "Article";
  targetId: string;
  parentComment?: string | null;
  status: "pending" | "approved" | "rejected" | "spam";
  likes: string[];
  replies?: Comment[];
  createdAt: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginatedMeta;
}

export interface ApiFailure {
  success: false;
  statusCode: number;
  message: string;
  errors: { field: string; message: string }[];
}
