import fs from 'fs';
import path from 'path';

const filePaths = [
  'src/components/PatientRegistration.tsx',
  'src/components/AuthUI.tsx',
  'src/components/Logo.tsx'
];

let addedTranslations: Record<string, string> = {
  // New translations mapped
};

function add(bn: string, en: string) {
  addedTranslations[en] = bn;
  return `t('${en}')`;
}

function processContent(content: string) {
  let newContent = content;
  
  if (!newContent.includes('useTranslation')) {
    newContent = "import { useTranslation } from '../contexts/LanguageContext';\n" + newContent;
  }
  
  if (newContent.includes('export default function PatientRegistration')) {
    newContent = newContent.replace('export default function PatientRegistration({ onSuccess, onLoginClick }: PatientRegistrationProps) {', 'export default function PatientRegistration({ onSuccess, onLoginClick }: PatientRegistrationProps) {\n  const { t } = useTranslation();');
  } else if (newContent.includes('export default function AuthUI')) {
    // AuthUI might already have useTranslation
  } else if (newContent.includes('export default function Logo')) {
    newContent = newContent.replace('export default function Logo({ className = "" }: LogoProps) {', 'export default function Logo({ className = "" }: LogoProps) {\n  const { t } = useTranslation();');
  }

  const replacements: Array<[RegExp, string | ((...args: any[]) => string)]> = [
    // Account Step
    [/১\. একাউন্ট/g, () => add('১. একাউন্ট', '1. Account')],
    [/২\. প্রাথমিক তথ্য/g, () => add('২. প্রাথমিক তথ্য', '2. Basic Info')],
    [/৩\. স্বাস্থ্য তথ্য/g, () => add('৩. স্বাস্থ্য তথ্য', '3. Medical Info')],
    [/৪\. পর্যালোচনা/g, () => add('৪. পর্যালোচনা', '4. Review')],
    [/একাউন্ট তৈরি করুন/g, () => add('একাউন্ট তৈরি করুন', 'Create Account')],
    [/পুরো নাম <span/g, () => `{\`${add('পুরো নাম', 'Full Name')} \`} <span`],
    [/আপনার পুরো নাম লিখুন/g, () => add('আপনার পুরো নাম লিখুন', 'Enter your full name').slice(3, -2)],
    [/মোবাইল নম্বর <span/g, () => `{\`${add('মোবাইল নম্বর', 'Mobile Number')} \`}<span`],
    [/ইমেইল ঠিকানা <span/g, () => `{\`${add('ইমেইল ঠিকানা', 'Email Address')} \`}<span`],
    [/আপনার ইমেইল/g, () => add('আপনার ইমেইল', 'Your Email').slice(3, -2)],
    [/পাসওয়ার্ড <span/g, () => `{\`${add('পাসওয়ার্ড', 'Password')} \`}<span`],
    [/নতুন পাসওয়ার্ড তৈরি করুন/g, () => add('নতুন পাসওয়ার্ড তৈরি করুন', 'Create new password').slice(3, -2)],
    [/পাসওয়ার্ড নিশ্চিত করুন <span/g, () => `{\`${add('পাসওয়ার্ড নিশ্চিত করুন', 'Confirm Password')} \`}<span`],
    [/পুনরায় পাসওয়ার্ড লিখুন/g, () => add('পুনরায় পাসওয়ার্ড লিখুন', 'Re-enter password').slice(3, -2)],
    
    // Strengths
    [/খুব দুর্বল/g, () => add('খুব দুর্বল', 'Very Weak').slice(3, -2)],
    [/মাঝারি/g, () => add('মাঝারি', 'Medium').slice(3, -2)],
    [/শক্তিশালী/g, () => add('শক্তিশালী', 'Strong').slice(3, -2)],
    [/খুব শক্তিশালী/g, () => add('খুব শক্তিশালী', 'Very Strong').slice(3, -2)],
    [/পাসওয়ার্ড/g, () => add('পাসওয়ার্ড', 'Password')],
    [/৮টি অক্ষর/g, () => add('৮টি অক্ষর', '8 characters')],
    [/বড় হাতের অক্ষর \(A-Z\)/g, () => add('বড় হাতের অক্ষর (A-Z)', 'Uppercase (A-Z)')],
    [/ছোট হাতের অক্ষর \(a-z\)/g, () => add('ছোট হাতের অক্ষর (a-z)', 'Lowercase (a-z)')],
    [/সংখ্যা \(0-9\)/g, () => add('সংখ্যা (0-9)', 'Number (0-9)')],
    [/বিশেষ অক্ষর \(!@#\$%\)/g, () => add('বিশেষ অক্ষর (!@#$%)', 'Special character (!@#$%)')],

    /// Basic Info
    [/রোগীর প্রাথমিক তথ্য/g, () => add('রোগীর প্রাথমিক তথ্য', 'Patient Basic Info')],
    [/সঠিক চিকিৎসা পাওয়ার জন্য প্রাথমিক তথ্য পূরণ করুন।/g, () => add('সঠিক চিকিৎসা পাওয়ার জন্য প্রাথমিক তথ্য পূরণ করুন।', 'Please fill in your basic info for proper treatment.')],
    [/জন্ম তারিখ <span/g, () => `{\`${add('জন্ম তারিখ', 'Date of Birth')} \`}<span`],
    [/বয়স/g, () => add('বয়স', 'Age')],
    [/অটো গণনা করা হবে/g, () => add('অটো গণনা করা হবে', 'Auto calculated')],
    [/বছর/g, () => add('বছর', 'Years')],
    [/লিঙ্গ <span/g, () => `{\`${add('লিঙ্গ', 'Gender')} \`}<span`],
    [/নির্বাচন করুন/g, () => add('নির্বাচন করুন', 'Select')],
    [/পুরুষ/g, () => add('পুরুষ', 'Male')],
    [/নারী/g, () => add('নারী', 'Female')],
    [/অন্যান্য/g, () => add('অন্যান্য', 'Other')],
    [/রক্তের গ্রুপ/g, () => add('রক্তের গ্রুপ', 'Blood Group')],
    [/জানি না \/ নির্বাচন করুন/g, () => add('জানি না / নির্বাচন করুন', 'Unknown / Select')],
    
    [/উচ্চতা \(সেমি\)/g, () => add('উচ্চতা (সেমি)', 'Height (cm)')],
    [/যেমন: 165/g, () => add('যেমন: 165', 'e.g. 165').slice(3, -2)],
    [/ওজন \(কেজি\)/g, () => add('ওজন (কেজি)', 'Weight (kg)')],
    [/যেমন: 65/g, () => add('যেমন: 65', 'e.g. 65').slice(3, -2)],
    [/BMI গণনা:/g, () => add('BMI গণনা:', 'BMI Calculation:')],
    
    // Status
    [/কম ওজন/g, () => add('কম ওজন', 'Underweight').slice(3, -2)],
    [/স্বাভাবিক/g, () => add('স্বাভাবিক', 'Normal').slice(3, -2)],
    [/অতিরিক্ত ওজন/g, () => add('অতিরিক্ত ওজন', 'Overweight').slice(3, -2)],

    // Emergency Contact
    [/জরুরি যোগাযোগ/g, () => add('জরুরি যোগাযোগ', 'Emergency Contact')],
    [/নাম <span/g, () => `{\`${add('নাম', 'Name')} \`}<span`],
    [/সম্পর্ক/g, () => add('সম্পর্ক', 'Relation')],
    [/পিতা\/মাতা\/ভাই/g, () => add('পিতা/মাতা/ভাই', 'Father/Mother/Brother').slice(3, -2)],
    [/মোবাইল <span/g, () => `{\`${add('মোবাইল', 'Mobile')} \`}<span`],

    // Medical Info
    [/স্বাস্থ্য সংক্রান্ত তথ্য/g, () => add('স্বাস্থ্য সংক্রান্ত তথ্য', 'Health Information')],
    [/এটি ঐচ্ছিক। আপনি চাইলে এখনই এটি পূরণ করতে পারেন অথবা পরে ড্যাশবোর্ড থেকে আপডেট করতে পারেন।/g, () => add('এটি ঐচ্ছিক। আপনি চাইলে এখনই এটি পূরণ করতে পারেন অথবা পরে ড্যাশবোর্ড থেকে আপডেট করতে পারেন।', 'This is optional. You can fill it now or update later from dashboard.')],
    [/অপশনাল/g, () => add('অপশনাল', 'Optional')],
    [/ডায়াবেটিস আছে\?/g, () => add('ডায়াবেটিস আছে?', 'Have Diabetes?').slice(3, -2)],
    [/উচ্চ রক্তচাপ আছে\?/g, () => add('উচ্চ রক্তচাপ আছে?', 'Have High BP?').slice(3, -2)],
    [/হাঁপানি আছে\?/g, () => add('হাঁপানি আছে?', 'Have Asthma?').slice(3, -2)],
    [/হৃদরোগ আছে\?/g, () => add('হৃদরোগ আছে?', 'Have Heart Disease?').slice(3, -2)],
    [/হ্যাঁ/g, () => add('হ্যাঁ', 'Yes')],
    [/না/g, () => add('না', 'No')],
    [/দীর্ঘমেয়াদি রোগ আছে\?/g, () => add('দীর্ঘমেয়াদি রোগ আছে?', 'Have Chronic Diseases?')],
    [/বিস্তারিত লিখুন \(যদি থাকে\)/g, () => add('বিস্তারিত লিখুন (যদি থাকে)', 'Please detail (if any)').slice(3, -2)],
    [/বর্তমানে সেবনকৃত ওষুধ/g, () => add('বর্তমানে সেবনকৃত ওষুধ', 'Current Medications')],
    [/ওষুধের নাম লিখুন/g, () => add('ওষুধের নাম লিখুন', 'Enter medicine names').slice(3, -2)],
    [/কোনো ওষুধে এলার্জি আছে\?/g, () => add('কোনো ওষুধে এলার্জি আছে?', 'Any drug allergies?')],
    [/ওষুধের নাম লিখুন \(যদি থাকে\)/g, () => add('ওষুধের নাম লিখুন (যদি থাকে)', 'Enter medicine names (if any)').slice(3, -2)],

    // Review
    [/পর্যালোচনা করুন/g, () => add('পর্যালোচনা করুন', 'Review')],
    [/দয়া করে আপনার দেওয়া তথ্যগুলো যাচাই করুন এবং নিশ্চিত করুন।/g, () => add('দয়া করে আপনার দেওয়া তথ্যগুলো যাচাই করুন এবং নিশ্চিত করুন।', 'Please verify and confirm your provided information.')],
    [/পরিবর্তন/g, () => add('পরিবর্তন', 'Change')],
    [/প্রাথমিক তথ্য/g, () => add('প্রাথমিক তথ্য', 'Basic Info')],
    [/স্বাস্থ্য তথ্য/g, () => add('স্বাস্থ্য তথ্য', 'Health Info')],
    [/আপডেট করা হয়েছে/g, () => add('আপডেট করা হয়েছে', 'Updated')],
    [/আপডেট করা হয়নি/g, () => add('আপডেট করা হয়নি', 'Not Updated')],
    [/আমি প্রত্যয়ন করছি যে উপরে প্রদত্ত সমস্ত তথ্য আমার জ্ঞান অনুযায়ী সত্য এবং চিকিৎসায় ব্যবহারের জন্য সঠিক।/g, () => add('আমি প্রত্যয়ন করছি যে উপরে প্রদত্ত সমস্ত তথ্য আমার জ্ঞান অনুযায়ী সত্য এবং চিকিৎসায় ব্যবহারের জন্য সঠিক।', 'I certify that all provided information is true to my knowledge and correct for medical usage.')],

    // Footer
    [/লগইন করুন/g, () => add('লগইন করুন', 'Log in')],
    [/অ্যাকাউন্ট আছে\?/g, () => add('অ্যাকাউন্ট আছে?', 'Already have an account?')],
    [/পূর্ববর্তী ধাপ/g, () => add('পূর্ববর্তী ধাপ', 'Previous Step')],
    [/পরবর্তী ধাপ/g, () => add('পরবর্তী ধাপ', 'Next Step')],
    [/অপেক্ষা করুন.../g, () => add('অপেক্ষা করুন...', 'Please wait...')],
    [/প্রোফাইল তৈরি করুন/g, () => add('প্রোফাইল তৈরি করুন', 'Create Profile')],
    
    // Auth UI specifics
    [/এআই সহকারীর সাথে কথা বলতে লগইন করুন/g, () => add('এআই সহকারীর সাথে কথা বলতে লগইন করুন', 'Login to chat with AI Assistant')],
    
    // Logo
    [/আমার ডাক্তার/g, () => add('আমার ডাক্তার', 'Amar Daktar')]
  ];

  for (const [regex, replacement] of replacements) {
    if (typeof replacement === 'function') {
      newContent = newContent.replace(regex, (match) => {
        const rep = replacement(match);
        // If it's returning t('XYZ').slice(3, -2), we handle it. But we actually let the replace function handle JSX properly.
        // Wait, for placeholders we return raw string without `{t('...')}`.
        if (rep.startsWith("t('")) {
           return `{${rep}}`;
        }
        return rep;
      });
    }
  }

  // Handle placeholders explicitly since they need t('key') without brackets inside quotes
  // We already sliced them in the replacement mappings where appropriate.

  return newContent;
}

for (const fp of filePaths) {
  const p = path.resolve(fp);
  if (fs.existsSync(p)) {
    console.log('Processing', p);
    let original = fs.readFileSync(p, 'utf8');
    let updated = processContent(original);
    
    // Manual fixes for placeholders and some edge cases
    updated = updated.replace(/placeholder="([^"]+)"/g, (match, p1) => {
      if (addedTranslations[p1] || p1 === 'Enter your full name' || p1 === '01XXXXXXXXX' || p1 === 'Your Email' || p1 === 'Create new password' || p1 === 'Re-enter password' || p1 === 'e.g. 165' || p1 === 'e.g. 65' || p1 === 'Father/Mother/Brother' || p1 === 'Please detail (if any)' || p1 === 'Enter medicine names' || p1 === 'Enter medicine names (if any)') {
        return 'placeholder={t("' + p1 + '")}';
      }
      return match;
    });

    // Fix error messages
    updated = updated.replace(/'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ঘর পূরণ করুন।'/g, "t('Please fill all required fields.')");
    add('অনুগ্রহ করে সমস্ত প্রয়োজনীয় ঘর পূরণ করুন।', 'Please fill all required fields.');
    
    updated = updated.replace(/'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।'/g, "t('Please enter a valid email address.')");
    add('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।', 'Please enter a valid email address.');
    
    updated = updated.replace(/'অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন \(যেমন: 01xxxxxxxxx\)।'/g, "t('Please enter a valid mobile number (e.g., 01xxxxxxxxx).')");
    add('অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন (যেমন: 01xxxxxxxxx)।', 'Please enter a valid mobile number (e.g., 01xxxxxxxxx).');
    
    updated = updated.replace(/'পাসওয়ার্ডকে অবশ্যই সমস্ত শর্ত পূরণ করতে হবে।'/g, "t('Password must meet all requirements.')");
    add('পাসওয়ার্ডকে অবশ্যই সমস্ত শর্ত পূরণ করতে হবে।', 'Password must meet all requirements.');
    
    updated = updated.replace(/'পাসওয়ার্ড মিলছে না।'/g, "t('Passwords do not match.')");
    add('পাসওয়ার্ড মিলছে না।', 'Passwords do not match.');
    
    updated = updated.replace(/'অনুগ্রহ করে প্রাথমিক তথ্য এবং জরুরি যোগাযোগের ঘরগুলো পূরণ করুন।'/g, "t('Please fill out basic info and emergency contact.')");
    add('অনুগ্রহ করে প্রাথমিক তথ্য এবং জরুরি যোগাযোগের ঘরগুলো পূরণ করুন।', 'Please fill out basic info and emergency contact.');

    // Fix manual brackets issues like {{t('...')}} instead of {t('...')}
    updated = updated.replace(/\{\{t\('([^']+)'\)\}\}/g, "{t('$1')}");
    updated = updated.replace(/>\{t\('([^']+)'\)\}</g, ">{t('$1')}<");
    
    // Fix Age and Gender rendering
    updated = updated.replace(/\{age \!== '' \? \`\$\{age\} বছর\` : 'অটো গণনা করা হবে'\}/g, "{age !== '' ? `${age} ${t('Years')}` : t('Auto calculated')}");
    updated = updated.replace(/formData\.gender === 'Male' \? 'পুরুষ' : formData\.gender === 'Female' \? 'নারী' : formData\.gender \|\| '-'/g, "formData.gender === 'Male' ? t('Male') : formData.gender === 'Female' ? t('Female') : formData.gender || '-'");

    fs.writeFileSync(p, updated, 'utf8');
  }
}

// Write the new translation mapping to a JSON file so that I can copy paste it
fs.writeFileSync('translations.json', JSON.stringify(addedTranslations, null, 2), 'utf8');
console.log('Done!');
