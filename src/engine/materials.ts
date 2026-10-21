import * as THREE from 'three';

// Procedural textures cache
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates classic Roblox circular stud texture for parts and baseplates
 */
export function createStudsTexture(): THREE.CanvasTexture {
  if (textureCache.has('studs')) {
    return textureCache.get('studs')!;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#a0a5ab';
  ctx.fillRect(0, 0, size, size);

  // Outer border lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  // Center stud circle
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.28;

  // Drop shadow
  ctx.beginPath();
  ctx.arc(centerX + 3, centerY + 3, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fill();

  // Stud bevel
  const grad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  grad.addColorStop(0, '#d8dce2');
  grad.addColorStop(1, '#696e75');
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Top cap of stud
  ctx.beginPath();
  ctx.arc(centerX, centerY - 1, radius * 0.88, 0, Math.PI * 2);
  ctx.fillStyle = '#a8adb4';
  ctx.fill();

  // Inner highlight ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 2, radius * 0.75, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Subtle "ROBLOX" embossed text center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('studs', texture);
  return texture;
}

/**
 * Creates classic Roblox SpawnLocation decal texture
 */
export function createSpawnTexture(): THREE.CanvasTexture {
  if (textureCache.has('spawn')) {
    return textureCache.get('spawn')!;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Neutral background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);

  // Outer yellow rim
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#facc15';
  ctx.strokeRect(10, 10, size - 20, size - 20);

  // Classic Spawn Sunburst / Target rings
  const cx = size / 2;
  const cy = size / 2;

  // Rays
  ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 95, angle - 0.12, angle + 0.12);
    ctx.closePath();
    ctx.fill();
  }

  // Concentric rings
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 45, 0, Math.PI * 2);
  ctx.fillStyle = '#0284c7';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Center star
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', cx, cy);

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#facc15';
  ctx.fillText('SPAWN', cx, cy + 85);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('spawn', texture);
  return texture;
}

/**
 * Creates classic Roblox smiling face decal for avatars
 */
export function createAvatarFaceTexture(): THREE.CanvasTexture {
  if (textureCache.has('avatar_face')) {
    return textureCache.get('avatar_face')!;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Classic cartoon smile face
  ctx.fillStyle = '#111827';

  // Left eye
  ctx.beginPath();
  ctx.ellipse(80, 95, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.ellipse(176, 95, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye shines
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(76, 88, 5, 0, Math.PI * 2);
  ctx.arc(172, 88, 5, 0, Math.PI * 2);
  ctx.fill();

  // Big classic curved smile
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(128, 125, 52, 0.25 * Math.PI, 0.75 * Math.PI, false);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('avatar_face', texture);
  return texture;
}

/**
 * Procedural Brick pattern texture
 */
export function createBrickTexture(): THREE.CanvasTexture {
  if (textureCache.has('brick')) {
    return textureCache.get('brick')!;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8f3328';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;

  // Horizontal mortar lines
  for (let y = 0; y <= size; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Vertical mortar lines alternating
  let row = 0;
  for (let y = 0; y < size; y += 32) {
    const offset = (row % 2) * 32;
    for (let x = offset; x <= size; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 32);
      ctx.stroke();
    }
    row++;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('brick', texture);
  return texture;
}

/**
 * Procedural Wood plank texture
 */
export function createWoodTexture(): THREE.CanvasTexture {
  if (textureCache.has('wood')) {
    return textureCache.get('wood')!;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(60, 30, 10, 0.35)';
  ctx.lineWidth = 1.5;

  // Grain lines
  for (let i = 0; i < 20; i++) {
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + Math.random() * 6 - 3, size * 0.7, y + Math.random() * 6 - 3, size, y);
    ctx.stroke();
  }

  // Plank divider
  ctx.strokeStyle = 'rgba(30, 15, 5, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('wood', texture);
  return texture;
}
