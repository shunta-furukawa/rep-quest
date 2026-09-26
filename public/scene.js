import * as THREE from './vendor/three.module.js';

// A single canvas travels between views, avoiding multiple WebGL contexts on iOS.
export function createScene() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', '髪色を選べる3D冒険者と焚き火の拠点。左右にドラッグすると回転します。');
  canvas.setAttribute('role', 'img');
  canvas.style.touchAction = 'pan-y';
  const world = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.8, 3.8, 2.6, -2.6, .1, 60);
  camera.position.set(5, 4.5, 8); camera.lookAt(0, 1.2, 0);
  world.add(new THREE.HemisphereLight(0xa7d6e2, 0x27302d, 2.1));
  const sunlight = new THREE.DirectionalLight(0xffdcab, 3.4);
  sunlight.position.set(-3, 7, 4); sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(512, 512);
  Object.assign(sunlight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .1, far: 20 });
  sunlight.shadow.normalBias = .04; world.add(sunlight);
  const rim = new THREE.DirectionalLight(0x59bad2, 2.2); rim.position.set(3, 4, -4); world.add(rim);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Map();
  function material(color, glow = false) {
    const key = `${color}:${glow}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: .1, ...(glow ? { emissive: color, emissiveIntensity: 2 } : {}) }));
    return materials.get(key);
  }
  function box(parent, pos, size, color, options = {}) {
    const m = new THREE.Mesh(cube, options.mat || material(color, options.glow));
    m.position.set(...pos); m.scale.set(...size); m.castShadow = true; m.receiveShadow = true;
    if (options.z) m.rotation.z = options.z;
    parent.add(m); return m;
  }
  const staticBoxes = [];
  function terrain(x, y, z, w, h, d, color) { staticBoxes.push({ x, y, z, w, h, d, color }); }
  // Voxel-cut stone island, individual cobbles, grasses, pine trees and old gate.
  terrain(0, -.32, 0, 5.8, .6, 4.5, '#273b43');
  terrain(0, -.62, .15, 4.8, .4, 3.7, '#21313c');
  for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) {
    const noise = Math.sin(x * 73 + z * 31);
    terrain(x * .62, -.015 + noise * .018, z * .6, .59, .15, .57, ['#64736c', '#586965', '#718074'][Math.abs(x + z) % 3]);
    if ((x === -4 || x === 4) && z % 2 === 0) terrain(x * .62, .10, z * .6, .2, .25, .2, '#4c785c');
  }
  function tree(x, z, size) {
    terrain(x, .85 * size, z, .28 * size, 1.7 * size, .3 * size, '#5c4535');
    for (let i = 0; i < 4; i++) terrain(x, (1.4 + i * .36) * size, z, (1.45 - i * .27) * size, .45 * size, (1.35 - i * .24) * size, i % 2 ? '#315e50' : '#254d44');
  }
  tree(-2.1, -1.5, 1); tree(-1.25, -1.9, .72); tree(2.2, -1.65, .8);
  for (let i = 0; i < 6; i++) for (const x of [.55, 1.75]) terrain(x, .24 + i * .32, -1.65, .34, .30, .40, i % 2 ? '#6b7c7d' : '#516b70');
  terrain(1.15, 2.05, -1.65, 1.55, .32, .46, '#7b8982');
  terrain(1.15, 2.32, -1.65, .40, .20, .46, '#8f9786');
  // Supplies beside camp.
  terrain(2.12, .3, .92, .48, .50, .48, '#754f31');
  terrain(2.12, .30, 1.175, .52, .08, .06, '#b4864e');
  terrain(2.12, .56, .92, .52, .06, .52, '#a47844');
  terrain(-1.7, .24, .7, .58, .42, .6, '#66513a');
  terrain(-1.7, .48, .7, .64, .12, .66, '#9b7a4f');
  const staticMesh = new THREE.InstancedMesh(cube, new THREE.MeshStandardMaterial({ roughness: .95 }), staticBoxes.length);
  const transform = new THREE.Object3D();
  staticBoxes.forEach((b, i) => {
    transform.position.set(b.x, b.y, b.z); transform.scale.set(b.w, b.h, b.d); transform.rotation.set(0, 0, 0); transform.updateMatrix();
    staticMesh.setMatrixAt(i, transform.matrix); staticMesh.setColorAt(i, new THREE.Color(b.color));
  });
  staticMesh.castShadow = true; staticMesh.receiveShadow = true; world.add(staticMesh);
  const portal = new THREE.Group(); portal.position.set(1.15, 1.17, -1.42); world.add(portal);
  const runeMaterial = new THREE.MeshBasicMaterial({ color: '#74e5ee' });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    box(portal, [Math.cos(a) * .40, Math.sin(a) * .64, 0], [.075, .12, .055], '#83e9ee', { mat: runeMaterial, z: -a });
  }
  const fire = new THREE.Group(); fire.position.set(1.12, .15, .65); world.add(fire);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    box(fire, [Math.cos(a) * .40, .035, Math.sin(a) * .40], [.25, .20, .25], '#7e8275');
  }
  const logA = box(fire, [0, .12, 0], [.75, .18, .18], '#61412c'); logA.rotation.y = .5;
  const logB = box(fire, [0, .15, 0], [.18, .18, .70], '#885635'); logB.rotation.y = .5;
  const flames = [];
  for (let i = 0; i < 8; i++) {
    const m = box(fire, [Math.sin(i * 3) * .18, .32 + i * .05, Math.cos(i * 2) * .12], [.16, .26, .16], i % 2 ? '#ffd28a' : '#f59339', { glow: true });
    flames.push({ mesh: m, y: m.position.y });
  }
  const fireLight = new THREE.PointLight('#ff9c4a', 3, 5, 2); fireLight.position.set(1.12, 1.0, .65); world.add(fireLight);

  const hero = new THREE.Group(); hero.position.set(-.55, .11, .30); world.add(hero);
  let yaw = .18;
  const body = new THREE.Group(); body.position.y = 1.04; hero.add(body);
  const hairMat = new THREE.MeshStandardMaterial({ color: '#302824', roughness: .95 });
  const tunic = material('#377879'), leather = material('#704731'), trim = material('#c9a46b');
  const steel = new THREE.MeshStandardMaterial({ color: '#9babaf', roughness: .50, metalness: .65 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#92744a', roughness: .6, metalness: .1 });
  box(body, [0, .14, 0], [.70, .78, .43], '', { mat: tunic });
  box(body, [0, -.17, .01], [.76, .14, .48], '', { mat: leather });
  box(body, [.08, -.17, .265], [.15, .13, .055], '', { mat: trim });
  box(body, [-.13, .15, .25], [.10, .63, .05], '', { mat: leather, z: -.3 });
  // Separate head and voxel hair chunks keep customization consistent from every angle.
  const head = new THREE.Group(); head.position.set(0, .91, 0); body.add(head);
  box(head, [0, 0, 0], [.65, .63, .54], '#d7ad87');
  box(head, [0, -.30, .0], [.25, .16, .28], '#c99a75');
  box(head, [-.355, -.07, 0], [.10, .20, .19], '#d4a67b');
  box(head, [.355, -.07, 0], [.10, .20, .19], '#d4a67b');
  for (const x of [-.17, .17]) {
    box(head, [x, .00, .280], [.11, .11, .035], '#15282c');
    box(head, [x - .02, .02, .301], [.03, .03, .015], '#fff1d8');
  }
  box(head, [0, -.12, .30], [.09, .07, .09], '#c18f6c');
  box(head, [0, .36, -.02], [.74, .15, .66], '', { mat: hairMat });
  box(head, [0, .15, -.29], [.73, .45, .10], '', { mat: hairMat });
  for (let i = 0; i < 5; i++) {
    box(head, [-.29 + i * .145, .29 + (i % 2) * .065, .31], [.15, .19 + (i % 3) * .06, .12], '', { mat: hairMat });
    box(head, [-.28 + i * .145, .49 + (i % 2) * .05, -.03], [.16, .14, .45], '', { mat: hairMat });
  }
  box(head, [-.34, .09, .0], [.13, .34, .52], '', { mat: hairMat });
  box(head, [.34, .15, -.02], [.13, .25, .52], '', { mat: hairMat });
  box(body, [0, .5, .04], [.76, .16, .53], '#5faaa2');
  const cape = box(body, [0, -.05, -.29], [.71, .94, .12], '#28535c'); cape.rotation.x = -.10;
  const rightArm = new THREE.Group(); rightArm.position.set(-.49, .39, 0); body.add(rightArm);
  const leftArm = new THREE.Group(); leftArm.position.set(.49, .39, 0); body.add(leftArm);
  for (const arm of [rightArm, leftArm]) {
    box(arm, [0, -.15, 0], [.25, .37, .31], '', { mat: tunic });
    box(arm, [0, -.42, 0], [.23, .22, .25], '#d4a67b');
    box(arm, [0, -.58, .025], [.25, .18, .30], '', { mat: leather });
  }
  const shoulderR = box(rightArm, [0, .02, 0], [.35, .23, .40], '', { mat: steel });
  const shoulderL = box(leftArm, [0, .02, 0], [.35, .23, .40], '', { mat: steel });
  const sword = new THREE.Group(); sword.position.set(0, -.54, .24); rightArm.add(sword);
  box(sword, [0, -.02, 0], [.11, .35, .11], '', { mat: leather });
  box(sword, [0, .17, 0], [.40, .09, .15], '', { mat: trim });
  box(sword, [0, .64, 0], [.16, .86, .075], '', { mat: bladeMat });
  box(sword, [0, 1.09, 0], [.10, .10, .075], '', { mat: bladeMat });
  const shield = new THREE.Group(); shield.position.set(0, -.37, .30); leftArm.add(shield);
  box(shield, [0, 0, 0], [.59, .73, .15], '', { mat: trim });
  box(shield, [0, 0, .09], [.47, .61, .08], '#76563a');
  box(shield, [0, 0, .145], [.10, .55, .025], '#5e9998');
  box(shield, [0, .08, .145], [.34, .08, .03], '#5e9998');
  const legs = [];
  for (const x of [-.21, .21]) {
    const leg = new THREE.Group(); leg.position.set(x, .68, 0); hero.add(leg); legs.push(leg);
    box(leg, [0, -.20, 0], [.27, .48, .30], '#344a50');
    box(leg, [0, -.47, .055], [.31, .22, .42], '', { mat: leather });
    box(leg, [0, -.60, .055], [.33, .08, .43], '#ad8652');
  }
  const particles = new THREE.InstancedMesh(cube, new THREE.MeshBasicMaterial({ color: '#77e7ea', transparent: true, opacity: .75 }), 20);
  particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(particles);
  let action = 'idle', actionAt = -10, mode = 'idle', visible = true, mount = null, frame = 0, previous = 0, lost = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    if (!mount) return;
    const width = mount.clientWidth, height = mount.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height, halfHeight = Math.max(2.2, 3.25 / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  let pointer = null;
  canvas.addEventListener('pointerdown', e => { pointer = { id: e.pointerId, x: e.clientX }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!pointer || e.pointerId !== pointer.id) return;
    yaw += (e.clientX - pointer.x) * .012; pointer.x = e.clientX;
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => pointer = null);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; resize(); });
  function loop(now) {
    frame = requestAnimationFrame(loop);
    if (!visible || lost || document.hidden || now - previous < 1000 / 30) return;
    previous = now;
    const t = now / 1000, phase = t - actionAt, moving = !reduced;
    const attack = phase < .65 && action === 'attack' ? Math.sin(phase / .65 * Math.PI) : 0;
    const heavy = phase < .9 && action === 'heavy' ? Math.sin(phase / .9 * Math.PI) : 0;
    const cheer = phase < 2 && action === 'celebrate' ? Math.sin(Math.min(phase / .4, 1) * Math.PI / 2) : 0;
    hero.rotation.y = yaw + (moving ? attack * .23 : 0);
    body.position.y = 1.04 + (moving ? Math.sin(t * 2.2) * .025 + Math.abs(Math.sin(phase * 7)) * cheer * .10 - heavy * .12 : 0);
    head.rotation.y = moving ? Math.sin(t * .6) * .07 : 0;
    rightArm.rotation.x = moving ? -.1 - attack * 1.8 - heavy * 2.1 - cheer * 2.5 : 0;
    rightArm.rotation.z = moving ? -.09 - attack * .75 : -.09;
    leftArm.rotation.x = mode === 'guard' ? -1.05 : moving ? -.06 - cheer * 1.8 : 0;
    leftArm.rotation.z = .08;
    legs[0].rotation.x = moving ? attack * -.3 : 0;
    legs[1].rotation.x = moving ? attack * .18 : 0;
    cape.rotation.x = -.1 + (moving ? Math.sin(t * 2) * .04 : 0);
    flames.forEach(({ mesh, y }, i) => { mesh.position.y = y + (moving ? Math.sin(t * 6 + i * 2) * .065 : 0); mesh.scale.y = .22 + (moving ? Math.sin(t * 7 + i) * .08 : 0); });
    fireLight.intensity = 3 + (moving ? Math.sin(t * 7) * .4 : 0);
    portal.rotation.z = moving ? Math.sin(t * .6) * .03 : 0;
    for (let i = 0; i < 20; i++) {
      const life = (t * .3 + i / 20) % 1;
      const burst = Math.max(attack, heavy, cheer);
      transform.position.set(-.55 + Math.sin(i * 7 + life) * (.7 + burst * .5), .4 + life * (2.4 + burst), .3 + Math.cos(i * 4) * .65);
      transform.rotation.set(0, t + i, .5); const size = (1 - life) * .035 * (burst ? 1.8 : 1);
      transform.scale.setScalar(size); transform.updateMatrix(); particles.setMatrixAt(i, transform.matrix);
    }
    particles.instanceMatrix.needsUpdate = true;
    renderer.render(world, camera);
  }
  frame = requestAnimationFrame(loop);
  return {
    mount(element) { if (mount !== element) { observer.disconnect(); mount = element; element.replaceChildren(canvas); observer.observe(element); } resize(); },
    setVisible(value) { visible = value; },
    setMode(value) { mode = value; },
    setCharacter(hair, level) {
      hairMat.color.set(hair);
      shoulderL.visible = shoulderR.visible = level >= 5;
      bladeMat.color.set(level >= 10 ? '#8bf0f2' : level >= 5 ? '#b9c9d1' : '#92744a');
      bladeMat.emissive.set(level >= 10 ? '#3acddb' : '#000000');
      bladeMat.emissiveIntensity = level >= 10 ? .65 : 0;
    },
    play(value) { action = value; actionAt = performance.now() / 1000; },
    dispose() { cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); cube.dispose(); for (const m of materials.values()) m.dispose(); },
  };
}
