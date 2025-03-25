const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

/**
 * Recursively scans the specified directory and returns an array of file/folder objects.
 * @param {string} dir - The directory to scan.
 * @returns {Array} - Array of file/folder objects.
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
      path: fullPath.replace(__dirname, ''), // make the path relative to the server root
      date: stat.mtime,
      size: stat.isFile() ? stat.size : null,
      type: stat.isDirectory() ? "FOLDER" : "FILE",
      children: []
    };
    if (stat.isDirectory()) {
      fileItem.children = listDirectory(fullPath);
    }
    results.push(fileItem);
  });
  return results;
}

// Serve static files from the current directory (so index.html is accessible)
app.use(express.static(__dirname));

// Endpoint to return the directory structure as JSON.
app.get('/files', (req, res) => {
  const databasePath = path.join(__dirname, 'DATABASE');
  if (!fs.existsSync(databasePath)) {
    return res.status(404).json({ error: "DATABASE folder not found." });
  }
  const files = listDirectory(databasePath);
  res.json(files);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
