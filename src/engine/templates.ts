import { RobloxInstance, PublishedGame } from '../types/roblox';

/**
 * Creates Realistic Physics Playground (Powered by Cannon.js)
 */
export function createRealisticPhysicsPlaygroundInstances(): RobloxInstance[] {
  const instances: RobloxInstance[] = [
    // 1. Massive Baseplate
    {
      id: 'baseplate-1',
      name: 'Baseplate',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: -1, z: 0 },
      size: { x: 160, y: 2, z: 160 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#475569',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0.1,
      anchored: true,
      canCollide: true,
      castShadow: true,
    },
    // 2. Spawn Location
    {
      id: 'spawn-1',
      name: 'SpawnLocation',
      className: 'SpawnLocation',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: 0.25, z: 12 },
      size: { x: 8, y: 0.5, z: 8 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#f8fafc',
      material: 'SmoothPlastic',
      transparency: 0,
      reflectance: 0.2,
      anchored: true,
      canCollide: true,
      castShadow: true,
      isCheckpoint: true,
    },
    // 3. Welcome & Realistic Physics Signboard
    {
      id: 'sign-physics',
      name: 'Cannon.js Physics Sign',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: 3.5, z: 17 },
      size: { x: 12, y: 4, z: 1 },
      rotation: { x: 0, y: 180, z: 0 },
      color: '#0284c7',
      material: 'Neon',
      transparency: 0,
      reflectance: 0.4,
      anchored: true,
      canCollide: true,
    },
    // 4. Guide NPC Noob
    {
      id: 'npc-noob',
      name: 'Guide Noob',
      className: 'NPC',
      parentId: 'workspace',
      position: { x: 6, y: 0, z: 10 },
      size: { x: 2, y: 5, z: 2 },
      rotation: { x: 0, y: -45, z: 0 },
      color: '#f5cd2f',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0,
      anchored: true,
      canCollide: true,
      npcType: 'Noob',
      dialogue: 'Cannon.js Real-time Physics active! Push the unanchored wooden crates and watch them tumble with realistic gravity!',
    },
    // 5. Trampoline (Super Bouncy Pad)
    {
      id: 'trampoline-1',
      name: 'Super Trampoline',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: -14, y: 0.3, z: 0 },
      size: { x: 7, y: 0.6, z: 7 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#ec4899',
      material: 'Neon',
      transparency: 0,
      reflectance: 0.6,
      anchored: true,
      canCollide: true,
      castShadow: true,
      isJumpPad: true,
    },
    // 6. Speed Boost Pad
    {
      id: 'speedpad-1',
      name: 'Speed Boost Pad',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 14, y: 0.25, z: 0 },
      size: { x: 6, y: 0.5, z: 6 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#06b6d4',
      material: 'Neon',
      transparency: 0,
      reflectance: 0.5,
      anchored: true,
      canCollide: true,
      castShadow: true,
      isSpeedPad: true,
    },
    // 7. Bouncy Rolling Physics Beach Ball (Unanchored Sphere)
    {
      id: 'physics-sphere-1',
      name: 'Bouncy Physics Ball',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Sphere',
      position: { x: 4, y: 5, z: 0 },
      size: { x: 3.5, y: 3.5, z: 3.5 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#ef4444',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0.3,
      anchored: false, // DYNAMIC CANNON BODY
      canCollide: true,
      castShadow: true,
    },
    // 8. Collectible Coins
    {
      id: 'coin-1',
      name: 'CoinCollectible_1',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Cylinder',
      position: { x: -14, y: 8, z: 0 },
      size: { x: 1.6, y: 0.3, z: 1.6 },
      rotation: { x: 90, y: 0, z: 0 },
      color: '#facc15',
      material: 'Neon',
      transparency: 0,
      reflectance: 0.8,
      anchored: true,
      canCollide: false,
      isCoin: true,
      coinValue: 25,
    },
    {
      id: 'coin-2',
      name: 'CoinCollectible_2',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Cylinder',
      position: { x: 0, y: 3, z: -16 },
      size: { x: 1.6, y: 0.3, z: 1.6 },
      rotation: { x: 90, y: 0, z: 0 },
      color: '#facc15',
      material: 'Neon',
      transparency: 0,
      reflectance: 0.8,
      anchored: true,
      canCollide: false,
      isCoin: true,
      coinValue: 15,
    },
  ];

  // 9. Pyramidal Stack of Unanchored Pushable Crates (Cannon.js real-time rigid bodies)
  const crateColors = ['#b45309', '#d97706', '#92400e', '#78350f'];
  let crateIndex = 1;
  // Bottom row (3 crates)
  for (let i = -1; i <= 1; i++) {
    instances.push({
      id: `crate-${crateIndex++}`,
      name: `PushableCrate_B${i + 2}`,
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: i * 3.2, y: 1.6, z: -8 },
      size: { x: 3, y: 3, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      color: crateColors[(crateIndex - 1) % crateColors.length],
      material: 'Wood',
      transparency: 0,
      reflectance: 0.1,
      anchored: false, // DYNAMIC RIGID BODY
      canCollide: true,
      castShadow: true,
    });
  }
  // Middle row (2 crates)
  for (let i = -0.5; i <= 0.5; i += 1) {
    instances.push({
      id: `crate-${crateIndex++}`,
      name: `PushableCrate_M${crateIndex}`,
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: i * 3.2, y: 4.7, z: -8 },
      size: { x: 3, y: 3, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      color: crateColors[(crateIndex - 1) % crateColors.length],
      material: 'Wood',
      transparency: 0,
      reflectance: 0.1,
      anchored: false, // DYNAMIC RIGID BODY
      canCollide: true,
      castShadow: true,
    });
  }
  // Top crate (1 crate)
  instances.push({
    id: `crate-${crateIndex++}`,
    name: 'PushableCrate_Top',
    className: 'Part',
    parentId: 'workspace',
    shape: 'Block',
    position: { x: 0, y: 7.8, z: -8 },
    size: { x: 3, y: 3, z: 3 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#f59e0b',
    material: 'Wood',
    transparency: 0,
    reflectance: 0.15,
    anchored: false, // DYNAMIC RIGID BODY
    canCollide: true,
    castShadow: true,
  });

  // 10. Domino Topple Line (6 standing bricks ready to chain reaction)
  for (let d = 0; d < 5; d++) {
    instances.push({
      id: `domino-${d + 1}`,
      name: `Domino_${d + 1}`,
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 10, y: 2.5, z: -6 - d * 2.6 },
      size: { x: 2, y: 5, z: 0.6 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#3b82f6',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0.2,
      anchored: false, // DYNAMIC RIGID BODY
      canCollide: true,
      castShadow: true,
    });
  }

  return instances;
}

/**
 * Creates Classic Baseplate workspace
 */
export function createBaseplateInstances(): RobloxInstance[] {
  return createRealisticPhysicsPlaygroundInstances();
}

/**
 * Creates "Super Obby Tower 3D" template
 */
export function createObbyInstances(): RobloxInstance[] {
  const instances: RobloxInstance[] = [
    {
      id: 'baseplate-obby',
      name: 'Baseplate',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: -2, z: 0 },
      size: { x: 160, y: 2, z: 160 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#0f172a',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0,
      anchored: true,
      canCollide: true,
    },
    {
      id: 'spawn-obby',
      name: 'SpawnLocation',
      className: 'SpawnLocation',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: 0.25, z: 0 },
      size: { x: 8, y: 0.5, z: 8 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#38bdf8',
      material: 'SmoothPlastic',
      transparency: 0,
      reflectance: 0.2,
      anchored: true,
      canCollide: true,
      isCheckpoint: true,
    },
  ];

  // Stage 1: Easy stepping stones
  const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];
  for (let i = 0; i < 7; i++) {
    instances.push({
      id: `stage1-step-${i}`,
      name: `Step_${i + 1}`,
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: (i % 2 === 0 ? -2 : 2), y: 1 + i * 1.5, z: -10 - i * 6 },
      size: { x: 4, y: 1, z: 4 },
      rotation: { x: 0, y: i * 10, z: 0 },
      color: rainbowColors[i],
      material: 'Neon',
      transparency: 0,
      reflectance: 0.5,
      anchored: true,
      canCollide: true,
      castShadow: true,
    });

    // Add collectible coins on odd steps
    if (i % 2 === 1) {
      instances.push({
        id: `coin-step-${i}`,
        name: `Coin_${i}`,
        className: 'Part',
        parentId: 'workspace',
        shape: 'Cylinder',
        position: { x: (i % 2 === 0 ? -2 : 2), y: 3.2 + i * 1.5, z: -10 - i * 6 },
        size: { x: 1.5, y: 0.3, z: 1.5 },
        rotation: { x: 90, y: 0, z: 0 },
        color: '#eab308',
        material: 'Neon',
        transparency: 0,
        reflectance: 0.9,
        anchored: true,
        canCollide: false,
        isCoin: true,
        coinValue: 10,
      });
    }
  }

  // Checkpoint 1 Island
  instances.push({
    id: 'checkpoint-1',
    name: 'Checkpoint 1',
    className: 'SpawnLocation',
    parentId: 'workspace',
    shape: 'Block',
    position: { x: 0, y: 12, z: -56 },
    size: { x: 12, y: 1.5, z: 12 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#10b981',
    material: 'SmoothPlastic',
    transparency: 0,
    reflectance: 0.3,
    anchored: true,
    canCollide: true,
    isCheckpoint: true,
  });

  // Stage 2: Red Lava Jump Bar Stage
  instances.push({
    id: 'lava-floor',
    name: 'Lava Hazard Floor',
    className: 'Part',
    parentId: 'workspace',
    shape: 'Block',
    position: { x: 0, y: 11, z: -76 },
    size: { x: 14, y: 0.8, z: 24 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#dc2626',
    material: 'Neon',
    transparency: 0.1,
    reflectance: 0.8,
    anchored: true,
    canCollide: true,
    isLava: true,
  });

  // Safe stepping beams across lava
  for (let j = 0; j < 3; j++) {
    instances.push({
      id: `safe-beam-${j}`,
      name: `SafeBeam_${j + 1}`,
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: (j % 2 === 0 ? -3 : 3), y: 12.5, z: -68 - j * 6 },
      size: { x: 3, y: 1.2, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#475569',
      material: 'Metal',
      transparency: 0,
      reflectance: 0.2,
      anchored: true,
      canCollide: true,
    });
  }

  // Trampoline / High Jump Pad
  instances.push({
    id: 'jump-pad-1',
    name: 'Super Jump Pad',
    className: 'Part',
    parentId: 'workspace',
    shape: 'Cylinder',
    position: { x: 0, y: 13, z: -92 },
    size: { x: 6, y: 0.8, z: 6 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#ec4899',
    material: 'Neon',
    transparency: 0,
    reflectance: 0.5,
    anchored: true,
    canCollide: true,
    isJumpPad: true,
  });

  // High Victory Castle / Finish Platform
  instances.push({
    id: 'winner-platform',
    name: 'Victory Podium',
    className: 'Part',
    parentId: 'workspace',
    shape: 'Block',
    position: { x: 0, y: 28, z: -92 },
    size: { x: 18, y: 2, z: 18 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#facc15',
    material: 'Metal',
    transparency: 0,
    reflectance: 0.7,
    anchored: true,
    canCollide: true,
    isCheckpoint: true,
  });

  // Winner Trophy on top
  instances.push({
    id: 'winner-trophy',
    name: 'Gold Trophy',
    className: 'Part',
    parentId: 'workspace',
    shape: 'Cylinder',
    position: { x: 0, y: 31, z: -92 },
    size: { x: 3, y: 4, z: 3 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#fbbf24',
    material: 'Neon',
    transparency: 0,
    reflectance: 0.9,
    anchored: true,
    canCollide: false,
    isCoin: true,
    coinValue: 100,
  });

  return instances;
}

/**
 * Creates "Lava Escape Parkour" template
 */
export function createLavaEscapeInstances(): RobloxInstance[] {
  const instances: RobloxInstance[] = [
    {
      id: 'lava-sea',
      name: 'Lava Sea',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: -1, z: 0 },
      size: { x: 200, y: 2, z: 200 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#ff2200',
      material: 'Neon',
      transparency: 0.1,
      reflectance: 0.8,
      anchored: true,
      canCollide: true,
      isLava: true,
    },
    {
      id: 'spawn-lava',
      name: 'SpawnLocation',
      className: 'SpawnLocation',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: 1.5, z: 40 },
      size: { x: 10, y: 1, z: 10 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#334155',
      material: 'Metal',
      transparency: 0,
      reflectance: 0.3,
      anchored: true,
      canCollide: true,
      isCheckpoint: true,
    },
  ];

  // Floating obsidian rocks
  for (let i = 0; i < 12; i++) {
    instances.push({
      id: `rock-${i}`,
      name: `Obsidian_Pillar_${i}`,
      className: 'Part',
      parentId: 'workspace',
      shape: i % 3 === 0 ? 'Cylinder' : 'Block',
      position: {
        x: Math.sin(i * 0.8) * 16,
        y: 2 + i * 1.8,
        z: 30 - i * 10,
      },
      size: { x: 5, y: 2 + i * 0.5, z: 5 },
      rotation: { x: 0, y: i * 25, z: 0 },
      color: '#1e293b',
      material: 'Brick',
      transparency: 0,
      reflectance: 0.2,
      anchored: true,
      canCollide: true,
    });
  }

  // Speed Pad
  instances.push({
    id: 'speedpad-lava',
    name: 'Nitro Speed Pad',
    className: 'Part',
    parentId: 'workspace',
    shape: 'Block',
    position: { x: 0, y: 14, z: -25 },
    size: { x: 8, y: 0.5, z: 8 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#06b6d4',
    material: 'Neon',
    transparency: 0,
    reflectance: 0.8,
    anchored: true,
    canCollide: true,
    isSpeedPad: true,
  });

  return instances;
}

/**
 * Pre-populated initial published games
 */
export const DEFAULT_PUBLISHED_GAMES: PublishedGame[] = [
  {
    id: 'game-physics-playground',
    title: '⚡ Realistic Cannon.js Physics Playground',
    description: 'Real-time Cannon.js rigid body physics: pushable wooden crates, toppling domino chain, bouncy beach ball, neon trampolines, and collectible coins!',
    creator: 'nitinkumar14668',
    genre: 'Sandbox',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    visits: 21500,
    likes: 3100,
    instances: createRealisticPhysicsPlaygroundInstances(),
    lighting: {
      timeOfDay: 15,
      ambientColor: '#ffffff',
      fogDensity: 0.003,
      skyType: 'clear',
    },
  },
  {
    id: 'game-super-obby',
    title: '⭐ Super Obby Tower 3D',
    description: 'Jump through 15+ neon stages, dodge glowing lava blocks, use bounce trampolines and collect gold coins to reach the winner tower!',
    creator: 'Nitin_Dev',
    genre: 'Obby',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    visits: 14200,
    likes: 1250,
    instances: createObbyInstances(),
    lighting: {
      timeOfDay: 14,
      ambientColor: '#38bdf8',
      fogDensity: 0.005,
      skyType: 'clear',
    },
  },
  {
    id: 'game-lava-escape',
    title: '🌋 Lava Escape: Volcano Parkour',
    description: 'The floor is glowing molten lava! Jump across ancient obsidian ruins, speed boost through tunnels and escape the volcano eruption!',
    creator: 'RobloxMaster',
    genre: 'Adventure',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1200000,
    visits: 8900,
    likes: 740,
    instances: createLavaEscapeInstances(),
    lighting: {
      timeOfDay: 18,
      ambientColor: '#f97316',
      fogDensity: 0.012,
      skyType: 'sunset',
    },
  },
  {
    id: 'game-classic-baseplate',
    title: '🛠️ Nitin Sandbox Baseplate',
    description: 'A classic 120-stud Roblox testing sandbox with NPC guide, studs surface, and building blocks to experiment with scripts & physics.',
    creator: 'nitinkumar14668',
    genre: 'Sandbox',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 600000,
    visits: 3400,
    likes: 410,
    instances: createBaseplateInstances(),
    lighting: {
      timeOfDay: 12,
      ambientColor: '#ffffff',
      fogDensity: 0.003,
      skyType: 'clear',
    },
  },
];
