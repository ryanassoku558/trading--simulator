import { mkdir, copyFile } from 'node:fs/promises';
const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'style.css', 'app.js', 'trading.js', 'supabase.js']) {
  await copyFile(new URL(`../${name}`, import.meta.url), new URL(name, output));
}
console.log('Static app built in dist/');
