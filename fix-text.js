import fs from 'fs';

const files = [
  'src/components/PaidDoctorChat.tsx',
  'src/components/ConsultationWorkspace.tsx',
  'src/components/PatientDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if(content.includes('text-[9px]')) {
    content = content.replace(/text-\[9px\]/g, 'text-[10px]');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
