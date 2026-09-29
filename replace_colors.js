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
  { from: /bg-blue-600/g, to: 'bg-primary' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-primary/90' },
  { from: /text-blue-600/g, to: 'text-primary' },
  { from: /hover:text-blue-600/g, to: 'hover:text-primary' },
  { from: /border-blue-600/g, to: 'border-primary' },
  { from: /bg-blue-50/g, to: 'bg-accent' },
  { from: /text-blue-700/g, to: 'text-primary' },
  { from: /hover:text-blue-700/g, to: 'hover:text-primary/90' },
  { from: /text-blue-800/g, to: 'text-primary/90' },
  { from: /hover:text-blue-800/g, to: 'hover:text-primary/90' },
  { from: /hover:bg-blue-50/g, to: 'hover:bg-accent' },
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
