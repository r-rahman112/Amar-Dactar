import fs from 'fs';

function fixFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('useTranslation')) {
    content = content.replace(/(import React.*?;\n)/, `$1import { useTranslation } from '../contexts/LanguageContext';\n`);
  }

  if (!content.includes('const { t } = useTranslation()') && !content.includes('const { t, language } = useTranslation()')) {
    content = content.replace(/(export default function \w+\([^)]*\)\s*\{*\n*)/, `$1  const { t } = useTranslation();\n`);
  }

  replacements.forEach(([from, to]) => {
     content = content.replace(from, to);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

const plan = [
  ['src/components/SymptomModal.tsx', [
    [/>\s*Assess Patient Risk Level\s*</g, ">{t('Assess Patient Risk Level')}<"],
    [/>\s*Describe Patient Symptoms\s*</g, ">{t('Describe Patient Symptoms')}<"],
    [/placeholder="e\.g\., constant headache, fever since 2 days..."/g, "placeholder={t('e.g., constant headache, fever since 2 days...')}"]
  ]],
  ['src/components/ReportModal.tsx', [
    [/>\s*Upload Medical Report\s*</g, ">{t('Upload Medical Report')}<"],
    [/>\s*Choose or drag a PDF\/Image file here\s*</g, ">{t('Choose or drag a PDF/Image file here')}<"],
    [/>\s*Analyze Report\s*</g, ">{t('Analyze Report')}<"]
  ]],
  ['src/components/PaymentModal.tsx', [
    [/>\s*Complete Payment\s*</g, ">{t('Complete Payment')}<"],
    [/>\s*Select Payment Method\s*</g, ">{t('Select Payment Method')}<"],
    [/>\s*Pay Securely\s*</g, ">{t('Pay Securely')}<"]
  ]],
];

plan.forEach(([passFile, reps]) => fixFile(passFile, reps));
