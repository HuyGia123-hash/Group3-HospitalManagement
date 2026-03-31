const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/NurseVitals.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/alert\(([\s\S]*?)\);?/g, (match, p1) => {
  let type = 'info';
  let text = p1.toLowerCase();
  if (text.includes("'thành công'") || text.includes('"thành công"') || text.includes("'đã'") || text.includes('"đã"')) {
    type = 'success';
  } else if (text.includes('lỗi') || text.includes('không') || text.includes('vui lòng') || text.includes('phải')) {
    type = 'error';
  }
  return `toast.${type}(${p1});`;
});

if (!content.includes('import { toast } from')) {
    const match = content.match(/import\s+.*?;?\n/);
    if (match) {
        content = content.replace(match[0], match[0] + "import { toast } from 'react-toastify';\n");
    } else {
        content = "import { toast } from 'react-toastify';\n" + content;
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed NurseVitals.jsx');
