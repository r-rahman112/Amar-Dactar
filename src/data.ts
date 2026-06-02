import { FeatureItem, StepItem, TestimonialItem, FAQItem } from './types';

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: 'symptom-analysis',
    title: 'Symptom Analysis',
    description: 'Describe how you feel in natural language. Our advanced healthcare AI evaluates symptoms in real-time, providing immediate educational insights into potential causes.',
    iconName: 'Activity',
    badge: 'Real-time'
  },
  {
    id: 'report-explanation',
    title: 'Report Explanation',
    description: 'Upload complex lab results, blood panels, or imaging reports. We scan and translate dense medical codes, metrics, and jargon into easy-to-understand explanations.',
    iconName: 'FileText',
    badge: 'Popular'
  },
  {
    id: 'doctor-recommendation',
    title: 'Doctor Recommendation',
    description: 'Based on your specific virtual consultation findings, get curated guidance on which clinical specialist to see (e.g., Cardiologist, Dermatologist, or General Practitioner).',
    iconName: 'UserCheck'
  },
  {
    id: 'health-history',
    title: 'Health History Tracking',
    description: 'Visualize your vital trends, historical consultation findings, and symptom progression over time with an automated, elegant chronological wellness dashboard.',
    iconName: 'TrendingUp'
  },
  {
    id: 'secure-records',
    title: 'Secure Medical Records',
    description: 'Your health records are safeguarded with bank-grade AES-256 encryption. We enforce zero-knowledge architecture, ensuring only you can read your medical files.',
    iconName: 'ShieldAlert'
  }
];

export const STEPS_DATA: StepItem[] = [
  {
    step: 1,
    title: 'Describe Symptoms',
    description: 'Input your physical feelings, timing, and severity using simple everyday text or voice transcriptions.',
    iconName: 'MessageSquareText'
  },
  {
    step: 2,
    title: 'Upload Reports',
    description: 'Securely upload PDFs, image files, or typed-out medical transcripts of clinical tests or lab reports.',
    iconName: 'UploadCloud'
  },
  {
    step: 3,
    title: 'Get AI Guidance',
    description: 'Obtain instant structured summaries, highlighted risk markers, wellness timelines, and tailored checklist next-steps.',
    iconName: 'Sparkles'
  }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'testimonial-1',
    name: 'Sarah Jenkins',
    role: 'Fitness Coach',
    quote: 'I uploaded my quarterly blood biochemistry sheet and got back a breakdown that actually made perfect sense. It highlighted my iron patterns and let me tweak my nutrition before my doctor visit!',
    rating: 5,
    avatarBg: 'bg-blue-100 text-blue-700',
    initials: 'SJ'
  },
  {
    id: 'testimonial-2',
    name: 'Dr. Aaron Patel',
    role: 'Emergency Resident Partner',
    quote: 'As a clinician, I love how this triage tool prepares patients. It organizes complex symptoms into a neat timeline, allowing patients to ask much more focused questions during clinical consultations.',
    rating: 5,
    avatarBg: 'bg-emerald-100 text-emerald-700',
    initials: 'AP'
  },
  {
    id: 'testimonial-3',
    name: 'Marcus Vance',
    role: 'Software Architect',
    quote: 'Having a secure, intuitive vault that explains random symptom flare-ups gives our family massive peace of mind. It feels extremely precise, completely safe, and remarkably easy to use.',
    rating: 5,
    avatarBg: 'bg-indigo-100 text-indigo-700',
    initials: 'MV'
  }
];

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Medical Advice',
    question: 'Is this AI assistant a replacement for a license-holding doctor?',
    answer: 'Absolutely not. This platform represents an educational self-help tool powered by general healthcare guidelines. It does not write prescriptions, make clinical diagnoses, or provide treatment advice. Always consult a certified healthcare professional for medical diagnoses and treatments.'
  },
  {
    id: 'faq-2',
    category: 'Privacy',
    question: 'How is the privacy of my medical data and uploaded reports handled?',
    answer: 'We utilize strict local-first philosophies and advanced end-to-end envelope encryption. Your documents are stored with zero-knowledge keys, meaning neither we nor third parties can view your records. We adhere strictly to secure cloud standards and global privacy regulations.'
  },
  {
    id: 'faq-3',
    category: 'Capabilities',
    question: 'What types of medical files and reports are currently supported?',
    answer: 'You can upload PDF files, high-resolution camera pictures, or scans containing blood biochemistry test lists, metabolic panels, urine tests, lipid profiles, and generic medical text documents.'
  },
  {
    id: 'faq-4',
    category: 'Pricing',
    question: 'Are there any fees or hidden subscriptions to use the landing page triage?',
    answer: 'No, this open consultation demo represents a free, educational tool to help test and guide wellness workflows. No credit card or active subscription is required to experience our core simulations.'
  },
  {
    id: 'faq-5',
    category: 'Accuracy',
    question: 'How accurate is the AI symptom evaluation and reports explanation engine?',
    answer: 'Our advanced NLP models are built upon clinical reference corpora and guidelines. While they score exceptionally high in accurately parsing and segmenting metrics or summarizing medical vocabulary, they must remain restricted to informational screening and triage support only.'
  }
];
