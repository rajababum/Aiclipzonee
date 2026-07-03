export interface CourseVideo {
  title: string;
  duration: string;
  videoUrl: string; // YouTube embed URL or mock URL
}

export interface Course {
  id: string; // e.g. "ai-masterclass"
  title: string;
  price: string;
  amount: number;
  message: string;
  learn: string[];
  image: string;
  isPopular?: boolean;
  popularText?: string;
  videos: CourseVideo[];
}

export interface CourseRequest {
  id: string;
  userId?: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: number;
  expiresAt?: number;
  duration?: '1month' | '1year';
}

export interface Testimonial {
  name: string;
  location: string;
  course: string;
  text: string;
  avatar: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export interface ActivationKey {
  id: string; // the unique code e.g. "AI45NP"
  code: string;
  status: 'unused' | 'used';
  duration: '1month' | '1year';
  createdAt: number;
  claimedByEmail?: string;
  claimedByUid?: string;
  claimedAt?: number;
  expiresAt?: number;
  courseId?: string; // "all" or specific courseId e.g. "ai-masterclass"
  courseTitle?: string; // "All Courses" or specific course name
}

