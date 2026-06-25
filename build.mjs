import { readdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("./", import.meta.url);

const files = (await readdir(root))
  .filter((f) => f.endsWith(".html") && f !== "index.html")
  .sort();

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function titleOf(file) {
  const html = await readFile(new URL(file, root), "utf8");
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : file;
}

const items = await Promise.all(
  files.map(async (file) => {
    const title = await titleOf(file);
    return `    <li><a href="${escapeHtml(file)}">${escapeHtml(title)}</a></li>`;
  })
);

const index = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Index</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 640px;
      margin: 3rem auto;
      padding: 0 1rem;
      line-height: 1.6;
    }
    h1 { font-size: 1.5rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a {
      display: block;
      padding: 0.75rem 1rem;
      background: #f4f4f5;
      border-radius: 8px;
      text-decoration: none;
      color: #18181b;
    }
    a:hover { background: #e4e4e7; }
  </style>
</head>
<body>
  <h1>Pages</h1>
  <ul>
${items.join("\n")}
  </ul>
</body>
</html>
`;

await writeFile(new URL("index.html", root), index);
console.log(`Generated index.html with ${files.length} link(s).`);
