
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Recursively lists all files and folders in the specified directory.
 * @param {string} dir - The directory to scan.
 * @returns {Array} Array of file/folder objects.
 */
function listDirectory(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    if (item === '.' || item === '..') return;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const fileItem = {
      name: item,
      // Create a relative path (optional, adjust as needed)
      path: fullPath.replace(__dirname, ''),
      date: stat.mtime,
      size: stat.isFile() ? stat.size : null,
      type: stat.isDirectory() ? 'FOLDER' : 'FILE',
      children: []
    };
    if (stat.isDirectory()) {
      fileItem.children = listDirectory(fullPath);
    }
    results.push(fileItem);
  });

  return results;
}

// API endpoint for returning the file structure from the DATABASE folder
app.get('/api/files', (req, res) => {
  const databasePath = path.join(__dirname, 'DATABASE');
  if (!fs.existsSync(databasePath)) {
    return res.status(404).json({ error: 'DATABASE folder not found.' });
  }
  const files = listDirectory(databasePath);
  res.json(files);
});

// For all other routes, serve the index.html from the public folder
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
