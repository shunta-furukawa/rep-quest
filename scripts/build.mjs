import { cp, rm, mkdir } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('public', 'dist', { recursive: true });
await mkdir('dist/vendor', { recursive: true });
for (const file of ['three.module.js', 'three.core.js']) await cp(`node_modules/three/build/${file}`, `dist/vendor/${file}`);
await cp('node_modules/three/LICENSE', 'dist/vendor/THREE-LICENSE.txt');
console.log('Built REP QUEST → dist');
