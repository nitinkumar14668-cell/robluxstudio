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

// ========================================================
// AUTHENTIC MINECRAFT PROCEDURAL BLOCK TEXTURES
// ========================================================

/**
 * Creates 16x16 pixelated Minecraft Grass top texture
 */
export function createMinecraftGrassTopTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_grass_top')) return textureCache.get('mc_grass_top')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const grassGreens = ['#55c23e', '#4bb335', '#5dc946', '#41a02e', '#65d54e', '#399427'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = grassGreens[Math.floor(Math.random() * grassGreens.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_grass_top', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Grass side texture (dirt with green dripping blades)
 */
export function createMinecraftGrassSideTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_grass_side')) return textureCache.get('mc_grass_side')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  // Dirt base
  const dirtBrowns = ['#866043', '#724f35', '#60412a', '#79553a', '#543823'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = dirtBrowns[Math.floor(Math.random() * dirtBrowns.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Grass fringe on top 3-5 rows
  const grassGreens = ['#55c23e', '#4bb335', '#41a02e', '#65d54e'];
  for (let x = 0; x < 16; x++) {
    const depth = 3 + (x % 3 === 0 ? 2 : x % 2 === 0 ? 1 : 0);
    for (let y = 0; y < depth; y++) {
      ctx.fillStyle = grassGreens[Math.floor(Math.random() * grassGreens.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_grass_side', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Dirt block texture
 */
export function createMinecraftDirtTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_dirt')) return textureCache.get('mc_dirt')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const dirtBrowns = ['#866043', '#724f35', '#60412a', '#79553a', '#543823', '#91694a'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = dirtBrowns[Math.floor(Math.random() * dirtBrowns.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_dirt', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Cobblestone texture
 */
export function createMinecraftCobblestoneTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_cobble')) return textureCache.get('mc_cobble')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const stones = ['#848484', '#6b6b6b', '#575757', '#9c9c9c', '#464646', '#3b3b3b'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = stones[Math.floor(Math.random() * stones.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Add cobblestone seam outlines
  ctx.fillStyle = '#2e2e2e';
  ctx.fillRect(0, 4, 16, 1);
  ctx.fillRect(0, 10, 16, 1);
  ctx.fillRect(5, 0, 1, 4);
  ctx.fillRect(11, 4, 1, 6);
  ctx.fillRect(4, 10, 1, 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_cobble', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Oak Planks texture
 */
export function createMinecraftPlanksTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_planks')) return textureCache.get('mc_planks')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const woods = ['#b88755', '#a57644', '#c99663', '#8f6436', '#ba8a58'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = woods[Math.floor(Math.random() * woods.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // 4 horizontal plank divider lines
  ctx.fillStyle = '#61411e';
  for (let y = 0; y < 16; y += 4) {
    ctx.fillRect(0, y, 16, 1);
  }
  // Alternating vertical joints
  ctx.fillRect(7, 0, 1, 4);
  ctx.fillRect(12, 4, 1, 4);
  ctx.fillRect(4, 8, 1, 4);
  ctx.fillRect(10, 12, 1, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_planks', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Diamond Ore / Block texture
 */
export function createMinecraftDiamondTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_diamond')) return textureCache.get('mc_diamond')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  // Cyan gemstone crystalline field
  const cyans = ['#5bfdfd', '#40e2e2', '#2fc4c4', '#7efefe', '#1fa6a6'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = cyans[Math.floor(Math.random() * cyans.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Inner beveled diamond pattern
  ctx.strokeStyle = '#e0ffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(2.5, 2.5, 11, 11);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_diamond', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Gold Block texture
 */
export function createMinecraftGoldTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_gold')) return textureCache.get('mc_gold')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const golds = ['#fed83d', '#e9b115', '#fce268', '#c4900a', '#fff199'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = golds[Math.floor(Math.random() * golds.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Gold border
  ctx.strokeStyle = '#946c05';
  ctx.strokeRect(1, 1, 14, 14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_gold', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft TNT block texture
 */
export function createMinecraftTntTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_tnt')) return textureCache.get('mc_tnt')!;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Red dynamite sticks top and bottom
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(0, 0, 32, 32);

  // White middle band
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 10, 32, 12);

  // Black TNT text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TNT', 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_tnt', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Glass texture
 */
export function createMinecraftGlassTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_glass')) return textureCache.get('mc_glass')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  // Clear background
  ctx.clearRect(0, 0, 16, 16);

  // Outer border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeRect(0.5, 0.5, 15, 15);

  // Highlight streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(3, 3, 2, 2);
  ctx.fillRect(5, 5, 2, 2);
  ctx.fillRect(10, 10, 2, 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_glass', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Glowstone texture
 */
export function createMinecraftGlowstoneTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_glowstone')) return textureCache.get('mc_glowstone')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const glows = ['#ffea78', '#f5b83d', '#fff3a3', '#d98b18', '#ffe44d'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = glows[Math.floor(Math.random() * glows.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_glowstone', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Obsidian texture
 */
export function createMinecraftObsidianTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_obsidian')) return textureCache.get('mc_obsidian')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const obsidians = ['#15101f', '#201830', '#2d1e45', '#100c19', '#392458'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = obsidians[Math.floor(Math.random() * obsidians.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_obsidian', texture);
  return texture;
}

/**
 * Creates 16x16 Minecraft Oak Leaves texture
 */
export function createMinecraftLeavesTexture(): THREE.CanvasTexture {
  if (textureCache.has('mc_leaves')) return textureCache.get('mc_leaves')!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const leaves = ['#2e7d32', '#388e3c', '#1b5e20', '#4caf50', '#256029'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = leaves[Math.floor(Math.random() * leaves.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('mc_leaves', texture);
  return texture;
}

/**
 * Get or create Three.js Material for a specific Minecraft Block Type
 */
export function getMinecraftBlockMaterial(
  blockType?: string,
  tintColor?: string
): THREE.Material | THREE.Material[] {
  const color = tintColor ? new THREE.Color(tintColor) : new THREE.Color('#ffffff');

  if (blockType === 'grass') {
    const topMat = new THREE.MeshStandardMaterial({
      map: createMinecraftGrassTopTexture(),
      roughness: 0.8,
      metalness: 0.05,
    });
    const sideMat = new THREE.MeshStandardMaterial({
      map: createMinecraftGrassSideTexture(),
      roughness: 0.9,
      metalness: 0.05,
    });
    const bottomMat = new THREE.MeshStandardMaterial({
      map: createMinecraftDirtTexture(),
      roughness: 0.95,
      metalness: 0.05,
    });
    // Box geometry materials order: [right, left, top, bottom, front, back]
    return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
  }

  if (blockType === 'dirt') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftDirtTexture(),
      roughness: 0.95,
      metalness: 0.05,
    });
  }

  if (blockType === 'cobblestone' || blockType === 'stone') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftCobblestoneTexture(),
      roughness: 0.9,
      metalness: 0.1,
    });
  }

  if (blockType === 'wood') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftPlanksTexture(),
      roughness: 0.75,
      metalness: 0.05,
    });
  }

  if (blockType === 'diamond') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftDiamondTexture(),
      roughness: 0.2,
      metalness: 0.3,
      emissive: new THREE.Color('#06b6d4'),
      emissiveIntensity: 0.25,
    });
  }

  if (blockType === 'gold') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftGoldTexture(),
      roughness: 0.3,
      metalness: 0.85,
    });
  }

  if (blockType === 'tnt') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftTntTexture(),
      roughness: 0.6,
      metalness: 0.05,
    });
  }

  if (blockType === 'glass') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftGlassTexture(),
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.5,
    });
  }

  if (blockType === 'glowstone') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftGlowstoneTexture(),
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color('#facc15'),
      emissiveIntensity: 0.8,
    });
  }

  if (blockType === 'obsidian') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftObsidianTexture(),
      roughness: 0.4,
      metalness: 0.2,
    });
  }

  if (blockType === 'leaves') {
    return new THREE.MeshStandardMaterial({
      map: createMinecraftLeavesTexture(),
      roughness: 0.8,
      metalness: 0.05,
    });
  }

  // Default fallback block
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5,
    metalness: 0.1,
  });
}

