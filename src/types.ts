export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
  iconName: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarBg: string;
  initials: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'audio';
  url?: string;
  size?: string;
  base64Data?: string;
  mimeType?: string;
}

export interface DoctorInfo {
  id: string;
  fullName: string;
  degree: string;
  specialty: string;
  experience: string;
  consultationFee: number;
  availableStatus: string;
  photoUrl: string;
  bmdcRegistration: string;
  hospitalAffiliation: string;
  ratings: string;
  reviews: number;
  availableHours: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: AttachmentItem[];
  recommendedDoctors?: DoctorInfo[];
}

export interface ConsultationSession {
  id: string;
  title: string;
  date: string;
  category: string;
  messages: Message[];
}
