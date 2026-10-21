import { RobloxInstance, PublishedGame } from '../types/roblox';

/**
 * Creates Classic Baseplate workspace
 */
export function createBaseplateInstances(): RobloxInstance[] {
  return [
    {
      id: 'baseplate-1',
      name: 'Baseplate',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: -1, z: 0 },
      size: { x: 120, y: 2, z: 120 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#64748b', // Classic slate gray
      material: 'Plastic',
      transparency: 0,
      reflectance: 0.1,
      anchored: true,
      canCollide: true,
      castShadow: true,
    },
    {
      id: 'spawn-1',
      name: 'SpawnLocation',
      className: 'SpawnLocation',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: 0.25, z: 0 },
      size: { x: 8, y: 0.5, z: 8 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#e2e8f0',
      material: 'SmoothPlastic',
      transparency: 0,
      reflectance: 0.2,
      anchored: true,
      canCollide: true,
      castShadow: true,
      isCheckpoint: true,
    },
    {
      id: 'welcome-sign',
      name: 'Welcome Sign',
      className: 'Part',
      parentId: 'workspace',
      shape: 'Block',
      position: { x: 0, y: 3, z: -10 },
      size: { x: 10, y: 4, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#0284c7',
      material: 'Neon',
      transparency: 0,
      reflectance: 0.4,
      anchored: true,
      canCollide: true,
    },
    {
      id: 'npc-noob',
      name: 'Guide Noob',
      className: 'NPC',
      parentId: 'workspace',
      position: { x: 6, y: 0, z: -4 },
      size: { x: 2, y: 5, z: 2 },
      rotation: { x: 0, y: -30, z: 0 },
      color: '#f5cd2f',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0,
      anchored: true,
      canCollide: true,
      npcType: 'Noob',
      dialogue: 'Welcome to Roblox Studio! Click Play (F5) to test or use Home tools to build your world!',
    },
  ];
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
