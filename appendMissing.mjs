import fs from 'fs';
import path from 'path';

const bnJsonPath = path.resolve('src/locales/bn.json');
const enJsonPath = path.resolve('src/locales/en.json');

const bn = JSON.parse(fs.readFileSync(bnJsonPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

const newTranslations = {
  "All Users": "সব ব্যবহারকারী",
  "Suspended Users": "স্থগিত ব্যবহারকারী",
  "Banned Users": "নিষিদ্ধ ব্যবহারকারী",
  "Export Data": "ডেটা এক্সপোর্ট",
  "Profile Edit": "প্রোফাইল সম্পাদনা",
  "Account Settings": "অ্যাকাউন্ট সেটিংস",
  "Admin": "অ্যাডমিন",
  "Superuser": "সুপারইউজার",
  "This module is currently in development. You will be able to manage this section here in the next update.": "এই মডিউলটি বর্তমানে ডেভেলপমেন্টে রয়েছে। আপনি পরবর্তী আপডেটে এখানে এই বিভাগটি পরিচালনা করতে পারবেন।",
  "Please translate and explain this biochemistry panel report of mine.": "অনুগ্রহ করে আমার এই বায়োকেমিস্ট্রি প্যানেল রিপোর্টটি অনুবাদ এবং ব্যাখ্যা করুন।",
  "I have been experiencing mild fatigue and nasal stiffness today...": "আমি আজ হালকা ক্লান্তি এবং নাক বন্ধ অনুভব করছি...",
  "SECURE CHAT": "নিরাপদ চ্যাট",
  "Virtual Assistant Specialist: General Family Health & Diagnostics Translator": "ভার্চুয়াল অ্যাসিস্ট্যান্ট স্পেশালিস্ট: সাধারণ পরিবার স্বাস্থ্য এবং ডায়াগনস্টিকস অনুবাদক",
  "HIPAA compliant transmission": "HIPAA কমপ্লায়েন্ট ট্রান্সমিশন",
  "Find a Doctor": "ডাক্তার খুঁজুন",
  "Book online or in-person consultations": "অনলাইন বা ইন-পার্সন পরামর্শ বুক করুন",
  "Specialty": "বিশেষত্ব",
  "Location": "অবস্থান",
  "Virtual Medical Enclave Active": "ভার্চুয়াল মেডিকেল এনক্লেভ সক্রিয়",
  "Understand your vitals trends, evaluate active medication counts, translate uploaded clinical files, and access 24/7 symptom logs. No public tracking active.": "আপনার ভাইটালের প্রবণতা বুঝুন, সক্রিয় ওষুধের সংখ্যা মূল্যায়ন করুন, আপলোড করা ক্লিনিকাল ফাইল অনুবাদ করুন এবং সার্বক্ষণিক উপসর্গের লগ অ্যাক্সেস করুন। কোনো পাবলিক ট্র্যাকিং সক্রিয় নেই।",
  "Current Wellness Vitals summary": "বর্তমান ওয়েলনেস ভাইটালস সারাংশ",
  "Recent Consultation Notes": "সাম্প্রতিক পরামর্শ নোট",
  "Direct transcripts of simulations": "সিমুলেশনের সরাসরি প্রতিলিপি",
  "Open active chat console": "সক্রিয় চ্যাট কনসোল খুলুন",
  "Uploaded Medical Reports Registry": "আপলোড করা মেডিকেল রিপোর্ট রেজিস্ট্রি",
  "Secure, non-shared diagnostic catalog": "নিরাপদ, নন-শেয়ার্ড ডায়াগনস্টিক ক্যাটালগ",
  "Upcoming Appointments": "আসন্ন অ্যাপয়েন্টমেন্ট",
  "Clinical schedules timeline": "ক্লিনিকাল সময়সূচী টাইমলাইন",
  "Intake Reminders": "ইনটেক রিমাইন্ডার",
  "Interactive dosage tracker": "ইন্টারেক্টিভ ডোজ ট্র্যাকার",
  "Security Activity Timeline": "সিকিউরিটি অ্যাক্টিভিটি টাইমলাইন",
  "Verifiable logging of local actions": "স্থানীয় কর্মের যাচাইযোগ্য লগিং",
  "01XXXXXXXXX": "01XXXXXXXXX",
  "Full Name": "পুরো নাম",
  "Mobile Number": "মোবাইল নম্বর",
  "Email Address": "ইমেইল ঠিকানা",
  "Account Information": "অ্যাকাউন্ট তথ্য",
  "Patient Profile": "রোগীর প্রোফাইল",
  "Medical Information": "চিকিৎসা সংক্রান্ত তথ্য",
  "Personal ID": "ব্যক্তিগত আইডি",
  "Joined": "যোগ দিয়েছেন",
  "Unknown": "অজ্ঞাত",
  "Export Excel": "এক্সেল এক্সপোর্ট",
  "Export CSV": "সিএসভি এক্সপোর্ট",
  "ID": "আইডি",
  "Search users by name, id or email...": "নাম, আইডি বা ইমেইল দিয়ে ব্যবহারকারী খুঁজুন..."
};

Object.keys(newTranslations).forEach(key => {
  bn[key] = newTranslations[key];
  en[key] = key;
});

fs.writeFileSync(bnJsonPath, JSON.stringify(bn, null, 2));
fs.writeFileSync(enJsonPath, JSON.stringify(en, null, 2));

console.log("Appended.");
