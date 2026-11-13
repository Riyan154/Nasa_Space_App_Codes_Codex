import { mkdir, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'adventure.css', 'builder.css', 'favicon.svg', 'src']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log('Built static game in dist/');
