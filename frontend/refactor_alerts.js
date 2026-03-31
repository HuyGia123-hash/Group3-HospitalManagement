const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/DoctorExamination.jsx',
  'src/pages/DoctorHome.jsx',
  'src/pages/NurseVitals.jsx',
  'src/components/NurseVitals.js',
  'src/components/DoctorExam.js'
];

files.forEach(relativePath => {
  const filePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace alert with toast
  content = content.replace(/alert\((.*?)\);?/g, (match, p1) => {
    let type = 'info';
    let text = p1.toLowerCase();
    if (text.includes("'thành công'") || text.includes('"thành công"') || text.includes("'đã'") || text.includes('"đã"')) {
      type = 'success';
    } else if (text.includes('lỗi') || text.includes('không') || text.includes('vui lòng')) {
      type = 'error';
    }
    return `toast.${type}(${p1});`;
  });

  // Check if anything changed
  if (content !== originalContent) {
    // Add toast import if missing
    if (!content.includes('import { toast } from')) {
      // Find the first import statement and insert after it, or insert at top
      const match = content.match(/import\s+.*?;?\n/);
      if (match) {
        content = content.replace(match[0], match[0] + "import { toast } from 'react-toastify';\n");
      } else {
        content = "import { toast } from 'react-toastify';\n" + content;
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${relativePath}`);
  }
});
