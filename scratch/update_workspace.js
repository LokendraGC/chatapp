const fs = require('fs');
const path = require('path');

function findFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, ext));
    } else {
      if (file.endsWith(ext)) results.push(file);
    }
  });
  return results;
}

const files = findFiles('c:\\laragon\\www\\chatapp\\app\\api', '.ts');

// Files to skip
const skipFiles = [
  'c:\\laragon\\www\\chatapp\\app\\api\\auth\\callback\\route.ts',
  'c:\\laragon\\www\\chatapp\\app\\api\\webhooks\\clerk\\route.ts',
  'c:\\laragon\\www\\chatapp\\app\\api\\webhooks\\route.ts'
];

files.forEach(file => {
  if (skipFiles.includes(file)) return;

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const pattern1 = /clerkUser\.emailAddresses\[0\]\?\.emailAddress/g;
  const pattern2 = /clerkUser\?\.emailAddresses\[0\]\?\.emailAddress/g;

  if (pattern1.test(content) || pattern2.test(content)) {
    if (!content.includes('getWorkspaceEmail')) {
      content = 'import { getWorkspaceEmail } from "@/lib/workspace";\n' + content;
    }
    
    content = content.replace(pattern1, '(await getWorkspaceEmail(clerkUser) || "")');
    content = content.replace(pattern2, '(await getWorkspaceEmail(clerkUser) || "")');

    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
