export type InstanceType = 
  | 'Part'
  | 'SpawnLocation'
  | 'Model'
  | 'Folder'
  | 'Script'
  | 'PointLight'
  | 'SpotLight'
  | 'Sound'
  | 'NPC';

export type PartShape = 'Block' | 'Sphere' | 'Cylinder' | 'Wedge' | 'Truss';

export type PartMaterial = 
  | 'Plastic'
  | 'SmoothPlastic'
  | 'Neon'
  | 'Wood'
  | 'Metal'
  | 'Grass'
  | 'Brick'
  | 'Glass'
  | 'Ice';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type MinecraftBlockType =
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'cobblestone'
  | 'wood'
  | 'brick'
  | 'glass'
  | 'diamond'
  | 'gold'
  | 'tnt'
  | 'glowstone'
  | 'obsidian'
  | 'sand'
  | 'leaves'
  | 'lava';

export interface RobloxInstance {
  id: string;
  name: string;
  className: InstanceType;
  parentId: string | null;
  children?: string[]; // IDs of children
  
  // Transform & Geometry (for Parts / Spawns / Lights)
  shape?: PartShape;
  blockType?: MinecraftBlockType;
  position: Vector3D;
  size: Vector3D;
  rotation: Vector3D; // degrees (Pitch, Yaw, Roll)
  
  // Appearance
  color: string; // Hex color
  material: PartMaterial;
  transparency: number; // 0 (solid) to 1 (invisible)
  reflectance: number; // 0 to 1
  castShadow?: boolean;
  
  // Physics & Mechanics
  anchored: boolean;
  canCollide: boolean;
  canTouch?: boolean;
  
  // Interactive special behaviors
  isLava?: boolean; // damages / kills on touch
  isSpeedPad?: boolean; // boosts walk speed
  isJumpPad?: boolean; // high jump
  isCoin?: boolean; // collectible coin
  coinValue?: number;
  isCheckpoint?: boolean;
  isTNT?: boolean; // explosive Minecraft block
  
  // Light specific
  lightColor?: string;
  lightIntensity?: number;
  lightRange?: number;
  
  // Script specific
  scriptContent?: string;
  scriptEnabled?: boolean;
  
  // NPC specific
  npcType?: 'Noob' | 'Zombie' | 'Guide';
  dialogue?: string;
}

export type TransformMode = 'select' | 'move' | 'scale' | 'rotate' | 'place' | 'mine';

export type StudioTab = 'home' | 'model' | 'test' | 'view' | 'plugins';

export interface PublishedGame {
  id: string;
  title: string;
  description: string;
  creator: string;
  genre: 'Obby' | 'Adventure' | 'Tycoon' | 'Simulator' | 'Sandbox' | 'Racing';
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
  visits: number;
  likes: number;
  instances: RobloxInstance[];
  lighting: {
    timeOfDay: number; // 0 to 24 (hours)
    ambientColor: string;
    fogDensity: number;
    skyType: 'clear' | 'sunset' | 'night' | 'cyberpunk';
  };
}

export interface OutputLog {
  id: string;
  type: 'print' | 'warn' | 'error' | 'info';
  text: string;
  timestamp: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  coins: number;
  score: number;
  checkpoint: Vector3D | null;
  walkSpeed: number;
  jumpPower: number;
}
