const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');
const staticDir = path.join(process.cwd(), 'static');
const outputFile = path.join(staticDir, 'llms-full.txt');
const llmsTxtFile = path.join(staticDir, 'llms.txt');

// Ensure static directory exists
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function generateContent() {
  const files = getAllFiles(docsDir);
  // Sort files for consistent output, preferably by path
  files.sort();

  let fullContent = "# Rhumb Language Documentation\n\n";
  fullContent += "This file contains the full documentation for the Rhumb programming language.\n\n";

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for draft: true in frontmatter
    const draftMatch = content.match(/^---\s+[\s\S]*?draft:\s*true[\s\S]*?---/);
    if (draftMatch) {
      console.log(`Skipping draft: ${file}`);
      return;
    }

    const relativePath = path.relative(docsDir, file);
    
    fullContent += `\n\n--- START OF FILE: ${relativePath} ---\n\n`;
    fullContent += content;
    fullContent += `\n\n--- END OF FILE: ${relativePath} ---\n`;
  });

  fs.writeFileSync(outputFile, fullContent);
  console.log(`Generated ${outputFile}`);

  const llmsTxtContent = `# Rhumb Language Context

Project Name: Rhumb Language
Description: The Rhumb programming language documentation.

Documentation Sets:
- Full Documentation: /llms-full.txt
`;
  fs.writeFileSync(llmsTxtFile, llmsTxtContent);
  console.log(`Generated ${llmsTxtFile}`);
}

generateContent();
