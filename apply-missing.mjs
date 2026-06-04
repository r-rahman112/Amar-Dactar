import fs from 'fs';

const translationsMap = {
  "Doctor Verifications": "ডাক্তার যাচাইকরণ",
  "Consent History": "সম্মতির ইতিহাস",
  "Status updated to ${status}": "স্ট্যাটাস আপডেট করা হয়েছে ${status}",
  "Or": "অথবা",
  "Continue with Google": "Google দিয়ে চালিয়ে যান",
  "Continue with Facebook": "Facebook দিয়ে চালিয়ে যান",
  "Continue with Apple": "Apple দিয়ে চালিয়ে যান",
  "আমি বুঝতে পারছি যে \"আমার ডাক্তার\" একটি AI সহায়ক প্ল্যাটফর্ম।": "আমি বুঝতে পারছি যে \"আমার ডাক্তার\" একটি AI সহায়ক প্ল্যাটফর্ম।",
  "AI কোনো চিকিৎসক নয় এবং এটি রোগ নির্ণয় বা চিকিৎসা প্রেসক্রাইব করে না।": "AI কোনো চিকিৎসক নয় এবং এটি রোগ নির্ণয় বা চিকিৎসা প্রেসক্রাইব করে না।",
  "জরুরি অবস্থায় আমি সরাসরি চিকিৎসকের সাথে যোগাযোগ করব।": "জরুরি অবস্থায় আমি সরাসরি চিকিৎসকের সাথে যোগাযোগ করব।",
  "Cancel": "বাতিল করুন",
  "I Accept": "আমি সম্মত",
  "Go to Home Page": "হোম পেজে যান",
  "আমার ডাক্তার": "আমার ডাক্তার",
  "Healthcare Disclaimer Consent History": "স্বাস্থ্যসেবা দাবিত্যাগ সম্মতির ইতিহাস",
  "Permanent records of users accepting the AI disclaimer.": "ব্যবহারকারীদের AI দাবিত্যাগ গ্রহণের স্থায়ী রেকর্ড।",
  "Email": "ইমেইল",
  "IP Address": "IP ঠিকানা",
  "Accepted On": "গৃহীত হয়েছে",
  "Schedule Consultation": "পরামর্শের সময়সূচী",
  "Select Time Slot": "সময় স্লট নির্বাচন করুন",
  "Secured Booking": "নিরাপদ বুকিং",
  "My Appointments": "আমার অ্যাপয়েন্টমেন্ট",
  "No appointments found.": "কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।",
  "Confirm": "নিশ্চিত করুন",
  "Mark Completed": "সম্পন্ন হিসেবে চিহ্নিত করুন",
  "Loading secure doctor portal...": "নিরাপদ ডক্টর পোর্টাল লোড হচ্ছে...",
  "Schedule": "সময়সূচী",
  "Verification": "যাচাইকরণ",
  "Manage your appointments and virtual clinic securely.": "আপনার অ্যাপয়েন্টমেন্ট এবং ভার্চুয়াল ক্লিনিক নিরাপদে পরিচালনা করুন।",
  "Active Consultations": "সক্রিয় পরামর্শ",
  "Available to withdraw:": "উত্তোলনের জন্য উপলব্ধ:",
  "Monthly Earnings": "মাসিক আয়",
  "Daily:": "দৈনিক:",
  "Weekly:": "সাপ্তাহিক:",
  "Duration": "সময়কাল",
  "Actions": "পদক্ষেপ",
  "Active": "সক্রিয়",
  "Pending": "অপেক্ষমাণ",
  "Enter Chat": "চ্যাটে প্রবেশ করুন",
  "View Summary": "সারাংশ দেখুন",
  "No consultation records found.": "পরামর্শের কোনো রেকর্ড পাওয়া যায়নি।",
  "Doctor Settings": "ডাক্তার সেটিংস",
  "Settings saved (Mock)!": "সেটিংস সংরক্ষিত হয়েছে!",
  "BMDC Registration No": "BMDC রেজিস্ট্রেশন নম্বর",
  "Available Hours": "উপলব্ধ সময়",
  "Save Changes": "পরিবর্তনগুলি সংরক্ষণ করুন",
  "Reason:": "কারণ:",
  "Please submit your credentials to activate your account and receive patient consultations.": "দয়া করে আপনার প্রশংসাপত্র জমা দিন।",
  "BMDC Registration Certificate": "BMDC রেজিস্ট্রেশন সার্টিফিকেট",
  "View Current Document": "বর্তমান নথি দেখুন",
  "Medical Degree Certificate": "মেডিকেল ডিগ্রি সার্টিফিকেট",
  "NID Front": "NID (সামনে)",
  "NID Back": "NID (পিছনে)",
  "Professional Photo": "পেশাদার ছবি",
  "Submit Documents for Review": "পর্যালোচনার জন্য নথি জমা দিন",
  "Available Days": "উপলব্ধ দিন",
  "Working Hours (Start)": "কাজের সময় (শুরু)",
  "Working Hours (End)": "কাজের সময় (শেষ)",
  "Consultation Duration (Minutes)": "পরামর্শের সময়কাল (মিনিট)",
  "15 Minutes": "১৫ মিনিট",
  "30 Minutes": "৩০ মিনিট",
  "45 Minutes": "৪৫ মিনিট",
  "60 Minutes": "৬০ মিনিট",
  "Save Schedule": "সময়সূচী সংরক্ষণ করুন",
  "Loading verifications...": "যাচাইকরণ লোড হচ্ছে...",
  "Approve or reject doctor applications.": "ডাক্তারের আবেদন অনুমোদন বা বাতিল করুন।",
  "Submitted At": "জমা দেওয়ার সময়",
  "Review Documents": "নথি পর্যালোচনা করুন",
  "No verifications found.": "কোনো যাচাইকরণ পাওয়া যায়নি।",
  "BMDC Certificate": "BMDC সার্টিফিকেট",
  "Medical Degree": "মেডিকেল ডিগ্রি",
  "Enter rejection reason:": "বাতিল করার কারণ লিখুন:",
  "Reject Application": "আবেদন বাতিল করুন",
  "Approve as Verified": "যাচাইকৃত হিসেবে অনুমোদন করুন",
  "FAQ": "সাধারণ জিজ্ঞাসা",
  "Secure Health Vault": "নিরাপদ হেলথ ভল্ট",
  "Encrypted personal medical records": "এনক্রিপ্ট করা ব্যক্তিগত মেডিকেল রেকর্ড",
  "Search records...": "রেকর্ড খুঁজুন...",
  "End-to-End Encrypted": "এন্ড-টু-এন্ড এনক্রিপ্ট করা",
  "Your records are encrypted at rest. Only you and authorized doctors during active consultations can access them.": "আপনার রেকর্ড নিরাপদ। কেবল আপনি এবং অনুমতিপ্রাপ্ত ডাক্তাররাই দেখতে পারবেন।",
  "Encrypting and Uploading...": "এনক্রিপ্ট এবং আপলোড করা হচ্ছে...",
  "Upload New Record": "নতুন রেকর্ড আপলোড করুন",
  "Securely store Medical Reports, Prescriptions, X-Rays, Lab Results.": "আপনার রিপোর্ট, প্রেসক্রিপশন নিরাপদে সংরক্ষণ করুন।",
  "No records found": "কোনো রেকর্ড পাওয়া যায়নি",
  "Upload your first document to securely store it.": "নিরাপদে সংরক্ষণ করতে আপনার প্রথম নথিটি আপলোড করুন।",
  "Notifications": "বিজ্ঞপ্তি",
  "unread messages": "অপঠিত বার্তা",
  "Consultation Session Expired": "পরামর্শ সেশনের সময় শেষ হয়েছে",
  "Purchase additional consultation time to continue chatting with your doctor or return to the home page.": "পরামর্শ চালিয়ে যেতে অতিরিক্ত সময় কিনুন।",
  "Advanced Report": "অ্যাডভান্সড রিপোর্ট",
  "Patient Vault": "পেশেন্ট ভল্ট",
  "Read-only: Session History Preserved": "শুধুমাত্র পঠনযোগ্য: সেশনের ইতিহাস সংরক্ষিত",
  "Health Vault": "হেলথ ভল্ট",
  "No upcoming appointments": "কোন আসন্ন অ্যাপয়েন্টমেন্ট নেই",
  "You must accept the healthcare disclaimer to create an account.": "অ্যাকাউন্ট তৈরি করতে আপনাকে শর্তাবলী মেনে নিতে হবে।",
  "Your Mobile Number": "আপনার মোবাইল নম্বর",
  "Address": "ঠিকানা",
  "Enter your full address": "আপনার সম্পূর্ণ ঠিকানা লিখুন",
  "Do you smoke?": "আপনি কি ধূমপান করেন?",
  "Select Status": "অবস্থা নির্বাচন করুন",
  "Non-Smoker": "অ-ধূমপায়ী",
  "Occasional Smoker": "মাঝে মাঝে ধূমপায়ী",
  "Regular Smoker": "নিয়মিত ধূমপায়ী",
  "Please provide a contact for emergencies.": "জরুরি অবস্থার জন্য একটি যোগাযোগ প্রদান করুন।",
  "Session Warning": "সেশনের সতর্কতা",
  "Your session is about to expire": "আপনার সেশনের সময় শেষ হতে চলেছে",
  "For your security, you will be automatically logged out due to inactivity in:": "আপনার নিরাপত্তার জন্য, নিষ্ক্রিয়তার কারণে আপনাকে লগ আউট করা হবে:",
  "Keep Me Logged In": "আমাকে লগ ইন রাখুন",
  "Success": "সফল",
  "Error": "ত্রুটি",
  "e.g. 2026-06-01, 2026-06-02": "যেমন 2026-06-01, 2026-06-02",
  "Admin Panel Security Details": "অ্যাডমিন প্যানেলের নিরাপত্তার বিস্তারিত",
  "Dashboard Analytics": "ড্যাশবোর্ড অ্যানালিটিক্স",
  "Total Active Patients": "মোট সক্রিয় রোগী",
  "Total Doctors": "মোট ডাক্তার",
  "Pending Verifications": "অপেক্ষমাণ যাচাইকরণ",
  "System Errors": "সিস্টেম ত্রুটি",
  "Loading secure modules...": "সুরক্ষিত মডিউলগুলি লোড হচ্ছে...",
  "Upload Medical Report": "মেডিক্যাল রিপোর্ট আপলোড করুন",
  "Choose or drag a PDF/Image file here": "একটি PDF/ছবি ফাইল এখানে টেনে আনুন বা নির্বাচন করুন",
  "Analyze Report": "রিপোর্ট বিশ্লেষণ করুন",
  "Assess Patient Risk Level": "রোগীর ঝুঁকির মাত্রা মূল্যায়ন করুন",
  "Describe Patient Symptoms": "রোগীর লক্ষণগুলো বর্ণনা করুন",
  "e.g., constant headache, fever since 2 days...": "যেমন, একটানা মাথাব্যথা, ২ দিন ধরে জ্বর...",
  "Complete Payment": "পেমেন্ট সম্পন্ন করুন",
  "Select Payment Method": "পেমেন্ট পদ্ধতি নির্বাচন করুন",
  "Pay Securely": "সুরক্ষিতভাবে পে করুন",
  "Log Out": "লগ আউট"
};

const bnJsonPath = 'src/locales/bn.json';
const enJsonPath = 'src/locales/en.json';
const missingJsonPath = 'missing.json';

const bn = JSON.parse(fs.readFileSync(bnJsonPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
const missingKeys = Object.keys(JSON.parse(fs.readFileSync(missingJsonPath, 'utf8')));

missingKeys.forEach(key => {
  if (key && key.trim() && key !== "@" && key !== ":" && key !== "T" && key !== "a" && key.length > 1) {
    if (!bn[key]) {
      bn[key] = translationsMap[key] || key;
    }
    if (!en[key]) {
      en[key] = key;
    }
  }
});

// Also manually append the ones from manual injection scripts:
Object.keys(translationsMap).forEach(key => {
    bn[key] = translationsMap[key];
    en[key] = key;
});

fs.writeFileSync(bnJsonPath, JSON.stringify(bn, null, 2));
fs.writeFileSync(enJsonPath, JSON.stringify(en, null, 2));

console.log('Translations merged successfully.');
