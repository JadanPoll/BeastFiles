import fs from "fs";
import path from "path";

/**
 * Recursively lists all files and folders in the directory.
 * @param {string} dir - Path to scan.
 * @returns {Array} - List of files and folders.
 */
function listDirectory(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    if (item === "." || item === "..") return;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const fileItem = {
      name: item,
      path: fullPath.replace(process.cwd(), ""), // Make relative to the root
      date: stat.mtime,
      size: stat.isFile() ? stat.size : null,
      type: stat.isDirectory() ? "FOLDER" : "FILE",
      children: [],
    };
    if (stat.isDirectory()) {
      fileItem.children = listDirectory(fullPath);
    }
    results.push(fileItem);
  });

  return results;
}

export default function handler(req, res) {
  const databasePath = path.join(process.cwd(), "DATABASE");

  if (!fs.existsSync(databasePath)) {
    return res.status(404).json({ error: "DATABASE folder not found." });
  }

  const files = listDirectory(databasePath);
  res.status(200).json(files);
}
