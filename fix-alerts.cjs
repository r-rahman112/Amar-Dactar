const fs = require('fs');

const files = [
  'src/components/AdminPanel.tsx',
  'src/components/AuthUI.tsx',
  'src/components/ConsultationWorkspace.tsx',
  'src/components/DoctorDashboard.tsx',
  'src/components/DoctorScheduleManager.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Change things like toast('...')
    content = content.replace(/toast\('([^']+)'\)/g, (match, p1) => {
      const lower = p1.toLowerCase();
      if (lower.includes('error') || lower.includes('fail') || lower.includes('please') || lower.includes('invalid')) {
        return `toast.error('${p1}')`;
      }
      if (lower.includes('success')) {
        return `toast.success('${p1}')`;
      }
      return match;
    });

    content = content.replace(/toast\("Password reset OTP verified! You can now reset your password."\)/g, "toast.success('Password reset OTP verified! You can now reset your password.')");
    
    // Now replace alert('...')
    content = content.replace(/alert\('([^']+)'\)/g, (match, p1) => {
      const lower = p1.toLowerCase();
      if (lower.includes('error') || lower.includes('fail') || lower.includes('please') || lower.includes('invalid')) {
        return `toast.error('${p1}')`;
      }
      if (lower.includes('success')) {
        return `toast.success('${p1}')`;
      }
      return `toast('${p1}')`;
    });

    content = content.replace(/alert\('Error:\s*'\s*\+\s*(.+?)\)/g, "toast.error('Error: ' + $1)");
    content = content.replace(/toast\('Error:\s*'\s*\+\s*(.+?)\)/g, "toast.error('Error: ' + $1)");

    fs.writeFileSync(file, content);
  }
});
console.log('Fixed alerts!');
