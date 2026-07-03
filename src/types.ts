export interface Course {
  title: string;
  price: string;
  amount: number;
  message: string;
  learn: string[];
  image: string;
  isPopular?: boolean;
  popularText?: string;
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
