const fs = require('fs');

const files = [
  'src/components/AdminPanel.tsx',
  'src/components/AuthUI.tsx',
  'src/components/ConsultationWorkspace.tsx',
  'src/components/DoctorDashboard.tsx',
  'src/components/DoctorScheduleManager.tsx',
  'src/components/AdminDashboard.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/alert\(/g, "toast.error(");
    // Remove duplicate toasts
    content = content.replace(/toast\.error\('Success/g, "toast.success('Success");
    fs.writeFileSync(file, content);
  }
});
