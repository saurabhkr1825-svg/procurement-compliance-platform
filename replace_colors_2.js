const fs = require('fs');
const path = require('path');

const directory = 'src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { from: /border-blue-100/g, to: 'border-primary/20' },
  { from: /border-blue-200/g, to: 'border-primary/30' },
  { from: /bg-blue-100/g, to: 'bg-accent' },
  { from: /focus:ring-blue-600/g, to: 'focus:ring-primary' },
  { from: /focus-visible:ring-blue-600/g, to: 'focus-visible:ring-primary' },
  { from: /bg-slate-900/g, to: 'bg-primary' },
  { from: /hover:bg-slate-800/g, to: 'hover:bg-primary/90' },
];

let filesModified = 0;

walkDir(directory, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
      filesModified++;
    }
  }
});

console.log('Total files modified: ' + filesModified);
