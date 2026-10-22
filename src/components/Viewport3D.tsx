import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RobloxInstance, TransformMode, PlayerStats, MinecraftBlockType } from '../types/roblox';
import {
  createStudsTexture,
  createSpawnTexture,
  createBrickTexture,
  createWoodTexture,
  getMinecraftBlockMaterial,
} from '../engine/materials';
import { createRobloxAvatar, RobloxAvatarInstance } from '../engine/avatar';
import { soundEngine } from '../engine/audio';
import { physicsEngine } from '../engine/physics';

// ========================================================
// REUSABLE MATH OBJECTS (Zero GC in animation loop)
// ========================================================
const _tmpVecA = new THREE.Vector3();
const _tmpVecB = new THREE.Vector3();
const _tmpVecC = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _move = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _inputDir = new THREE.Vector3();
const _instPos = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _moveVec = new THREE.Vector3();
const _panVector = new THREE.Vector3();
const _hitPoint = new THREE.Vector3();
const _placementTargetPos = new THREE.Vector3();

// Cubic ease in/out for silky-smooth cinematic camera movement
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

interface CameraTransition {
  active: boolean;
  type: 'toTest' | 'toSelect' | 'preset' | 'focus';
  startTime: number;
  duration: number;
  startPos: THREE.Vector3;
  startLookAt: THREE.Vector3;
  targetPos: THREE.Vector3;
  targetLookAt: THREE.Vector3;
  arcHeight: number;
}

interface Viewport3DProps {
  instances: RobloxInstance[];
  selectedId: string | null;
  onSelectInstance: (id: string | null) => void;
  onUpdateInstance: (id: string, updates: Partial<RobloxInstance>) => void;
  onDeleteInstance?: (id: string) => void;
  onInsertBlock?: (pos: { x: number; y: number; z: number }, blockType: MinecraftBlockType) => void;
  activeBlockType?: MinecraftBlockType;
  onOpenStructureEditor?: () => void;
  transformMode: TransformMode;
  isPlayMode: boolean;
  playerStats: PlayerStats;
  onUpdatePlayerStats: (stats: Partial<PlayerStats>) => void;
  gridSnap: number;
  timeOfDay: number;
  skyType: 'clear' | 'sunset' | 'night' | 'cyberpunk';
  cameraPreset?: string | null;
  onClearCameraPreset?: () => void;
  joystickInput?: { x: number; y: number };
  isJumpPressed?: boolean;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  instances,
  selectedId,
  onSelectInstance,
  onUpdateInstance,
  onDeleteInstance,
  onInsertBlock,
  activeBlockType = 'wood',
  onOpenStructureEditor,
  transformMode,
  isPlayMode,
  playerStats,
  onUpdatePlayerStats,
  gridSnap,
  timeOfDay,
  skyType,
  cameraPreset,
  onClearCameraPreset,
  joystickInput,
  isJumpPressed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instancesRef = useRef<RobloxInstance[]>(instances);
  instancesRef.current = instances;
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;
  const isPlayModeRef = useRef<boolean>(isPlayMode);
  isPlayModeRef.current = isPlayMode;
  const transformModeRef = useRef<TransformMode>(transformMode);
  transformModeRef.current = transformMode;
  const gridSnapRef = useRef<number>(gridSnap);
  gridSnapRef.current = gridSnap;
  const activeBlockTypeRef = useRef<MinecraftBlockType>(activeBlockType);
  activeBlockTypeRef.current = activeBlockType;
  const onDeleteInstanceRef = useRef(onDeleteInstance);
  onDeleteInstanceRef.current = onDeleteInstance;
  const onInsertBlockRef = useRef(onInsertBlock);
  onInsertBlockRef.current = onInsertBlock;
  const onOpenStructureEditorRef = useRef(onOpenStructureEditor);
  onOpenStructureEditorRef.current = onOpenStructureEditor;
  const playerStatsRef = useRef<PlayerStats>(playerStats);
  playerStatsRef.current = playerStats;
  const joystickInputRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  joystickInputRef.current = joystickInput || { x: 0, y: 0 };
  const isJumpPressedRef = useRef<boolean>(false);
  isJumpPressedRef.current = Boolean(isJumpPressed);

  // Track meshes map
  const meshMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const avatarRef = useRef<RobloxAvatarInstance | null>(null);

  // References to scene, camera, renderer
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Studio Selection Outline box
  const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);

  // Transform Gizmo handles group
  const gizmoGroupRef = useRef<THREE.Group | null>(null);

  // Key states
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Camera Interpolation & Cinematic Transitions
  const transitionRef = useRef<CameraTransition>({
    active: false,
    type: 'toTest',
    startTime: 0,
    duration: 1000,
    startPos: new THREE.Vector3(30, 25, 30),
    startLookAt: new THREE.Vector3(0, 2, 0),
    targetPos: new THREE.Vector3(0, 5, 14),
    targetLookAt: new THREE.Vector3(0, 4, 0),
    arcHeight: 2.5,
  });

  const studioCameraState = useRef({
    position: new THREE.Vector3(30, 25, 30),
    target: new THREE.Vector3(0, 2, 0),
    spherical: new THREE.Spherical(45, Math.PI / 3, Math.PI / 4),
  });

  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));

  const triggerTransitionRef = useRef<(
    type: 'preset' | 'focus' | 'toSelect' | 'toTest',
    targetPos: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    duration?: number,
    arcHeight?: number
  ) => void>(() => {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      keysRef.current[e.code] = true;
      if (e.key) keysRef.current[e.key.toLowerCase()] = true;

      // 'F' key: Smooth cinematic focus on selected instance in Select mode
      if ((e.code === 'KeyF' || e.key?.toLowerCase() === 'f') && !isPlayModeRef.current && selectedIdRef.current) {
        const mesh = meshMapRef.current.get(selectedIdRef.current);
        const cam = cameraRef.current;
        if (mesh && cam) {
          const targetLookAt = mesh.position.clone();
          _tmpVecA.subVectors(cam.position, targetLookAt);
          const currentDist = Math.max(8, _tmpVecA.length());
          const targetDist = Math.max(12, Math.min(32, currentDist * 0.75));
          _tmpVecA.normalize().multiplyScalar(targetDist);
          const targetPos = targetLookAt.clone().add(_tmpVecA);
          targetPos.y = Math.max(3.5, targetPos.y);

          triggerTransitionRef.current('focus', targetPos, targetLookAt, 650, 1.2);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.key) keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Set camera preset if requested with smooth cinematic transition
  useEffect(() => {
    if (!cameraPreset || !cameraRef.current) return;
    const targetPos = new THREE.Vector3(35, 30, 35);
    const targetLookAt = new THREE.Vector3(0, 2, 0);

    if (cameraPreset === 'Top') {
      targetPos.set(0, 60, 0.1);
      targetLookAt.set(0, 0, 0);
    } else if (cameraPreset === 'Front') {
      targetPos.set(0, 10, 45);
      targetLookAt.set(0, 5, 0);
    } else if (cameraPreset === 'Right') {
      targetPos.set(45, 10, 0);
      targetLookAt.set(0, 5, 0);
    } else if (cameraPreset === 'Isometric') {
      targetPos.set(35, 30, 35);
      targetLookAt.set(0, 0, 0);
    }

    triggerTransitionRef.current('preset', targetPos, targetLookAt, 750, 1.8);
    if (onClearCameraPreset) onClearCameraPreset();
  }, [cameraPreset, onClearCameraPreset]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL / Smart TV capability
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = (probeCanvas.getContext('webgl2') ||
          probeCanvas.getContext('webgl') ||
          probeCanvas.getContext('experimental-webgl')) as
          | WebGLRenderingContext
          | WebGL2RenderingContext
          | null;
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as unknown as { RENDERER?: number }).RENDERER;
        const gpu = param ? String(gl.getParameter(param)) : '';
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = Math.max(300, container.clientWidth || window.innerWidth || 800);
    const height = Math.max(300, container.clientHeight || window.innerHeight || 600);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer with TV & low-power GPU fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'default',
        preserveDrawingBuffer: true,
      });
    } catch {
      // Fallback renderer without antialias or special buffers for Smart TVs
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        precision: 'mediump',
      });
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // RoomEnvironment reflection with safe fallback
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback for TVs that don't support PMREM float textures
    }

    // Studio Lights
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const d = 80;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Studio Selection Box
    const selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0x00a2ff);
    selectionBox.visible = false;
    scene.add(selectionBox);
    selectionBoxRef.current = selectionBox;

    // Gizmo handles group
    const gizmoGroup = new THREE.Group();
    gizmoGroup.visible = false;
    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;

    // Create 3D Gizmo arrows (X = Red, Y = Green, Z = Blue)
    const createGizmoArrow = (dir: THREE.Vector3, color: number, name: string) => {
      const arrowGroup = new THREE.Group();
      arrowGroup.name = name;
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12),
        new THREE.MeshBasicMaterial({ color, depthTest: false })
      );
      shaft.position.y = 1.6;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.8, 12),
        new THREE.MeshBasicMaterial({ color, depthTest: false })
      );
      tip.position.y = 3.6;
      arrowGroup.add(shaft, tip);
      arrowGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      return arrowGroup;
    };

    gizmoGroup.add(createGizmoArrow(new THREE.Vector3(1, 0, 0), 0xef4444, 'gizmo_x')); // Red X
    gizmoGroup.add(createGizmoArrow(new THREE.Vector3(0, 1, 0), 0x22c55e, 'gizmo_y')); // Green Y
    gizmoGroup.add(createGizmoArrow(new THREE.Vector3(0, 0, 1), 0x3b82f6, 'gizmo_z')); // Blue Z

    // Player Avatar
    const avatar = createRobloxAvatar('BuilderPlayer');
    avatar.root.visible = false;
    scene.add(avatar.root);
    avatarRef.current = avatar;

    // ========================================================
    // MINECRAFT PLACEMENT GHOST & VOXEL BREAK PARTICLES
    // ========================================================
    const ghostGeom = new THREE.BoxGeometry(1, 1, 1);
    const ghostMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const placementGhost = new THREE.Mesh(ghostGeom, ghostMat);
    const innerGhost = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.96, 0.96),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.35 })
    );
    placementGhost.add(innerGhost);
    placementGhost.visible = false;
    scene.add(placementGhost);

    // Particle pool for block breaking (Zero GC in animation loop)
    interface VoxelParticle {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
    }
    const particlePool: VoxelParticle[] = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    const miniCubeGeom = new THREE.BoxGeometry(0.35, 0.35, 0.35);

    for (let p = 0; p < 30; p++) {
      const pMesh = new THREE.Mesh(
        miniCubeGeom,
        new THREE.MeshBasicMaterial({ color: 0x866043 })
      );
      pMesh.visible = false;
      particleGroup.add(pMesh);
      particlePool.push({
        mesh: pMesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.35,
      });
    }

    const spawnBreakParticles = (pos: THREE.Vector3, colorHex = '#866043') => {
      let spawned = 0;
      for (let i = 0; i < particlePool.length; i++) {
        const p = particlePool[i];
        if (!p.mesh.visible && spawned < 10) {
          p.mesh.position.set(
            pos.x + (Math.random() - 0.5) * 1.5,
            pos.y + (Math.random() - 0.5) * 1.5,
            pos.z + (Math.random() - 0.5) * 1.5
          );
          p.vel.set(
            (Math.random() - 0.5) * 12,
            Math.random() * 8 + 4,
            (Math.random() - 0.5) * 12
          );
          (p.mesh.material as THREE.MeshBasicMaterial).color.set(colorHex);
          p.life = 0;
          p.mesh.visible = true;
          spawned++;
        }
      }
    };

    // Orbit & Camera Controls state
    let isMouseDown = false;
    let mouseButton = 0; // 0: left, 1: middle, 2: right
    let mouseX = 0;
    let mouseY = 0;
    let cameraSpherical = new THREE.Spherical(45, Math.PI / 3, Math.PI / 4);
    let cameraTarget = new THREE.Vector3(0, 2, 0);

    // Initialize triggerTransitionRef callback for camera glides
    triggerTransitionRef.current = (
      type,
      targetPos,
      targetLookAt,
      duration = 750,
      arcHeight = 1.5
    ) => {
      if (!cameraRef.current) return;
      transitionRef.current = {
        active: true,
        type,
        startTime: performance.now(),
        duration,
        startPos: cameraRef.current.position.clone(),
        startLookAt: currentLookAtRef.current.clone(),
        targetPos: targetPos.clone(),
        targetLookAt: targetLookAt.clone(),
        arcHeight,
      };
    };

    // Gizmo dragging state
    let activeGizmoAxis: string | null = null;
    let gizmoDragPlane = new THREE.Plane();
    let gizmoDragOffset = new THREE.Vector3();
    let isDraggingCamera = false;

    // Player physics state in play mode
    let playerPos = new THREE.Vector3(0, 3, 0);
    let playerVelocity = new THREE.Vector3();
    let isGrounded = false;
    let playerYaw = 0;
    let playerCameraPitch = 0.3;
    let playerCameraDistance = 14;

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseButton = e.button;
      isMouseDown = true;

      // Cancel any ongoing transition gracefully when user interacts
      if (transitionRef.current.active) {
        transitionRef.current.active = false;
        if (!isPlayModeRef.current) {
          cameraSpherical.setFromVector3(_tmpVecA.subVectors(camera.position, cameraTarget));
        }
      }

      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isPlayModeRef.current) {
        // In Play mode, any mouse button (Left or Right) rotates avatar camera
        isDraggingCamera = true;
        return;
      }

      if (mouseButton === 2) {
        isDraggingCamera = true;
        return;
      }

      // Check Gizmo intersection on left click in standard transform modes
      if (
        mouseButton === 0 &&
        selectedIdRef.current &&
        gizmoGroup.visible &&
        transformModeRef.current !== 'place' &&
        transformModeRef.current !== 'mine'
      ) {
        raycaster.setFromCamera(mouseNDC, camera);
        const gizmoHits = raycaster.intersectObjects(gizmoGroup.children, true);
        if (gizmoHits.length > 0) {
          let topParent = gizmoHits[0].object;
          while (topParent.parent && topParent.parent !== gizmoGroup) {
            topParent = topParent.parent;
          }
          activeGizmoAxis = topParent.name;
          
          // Form a plane perpendicular to camera direction for dragging
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          gizmoDragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), gizmoGroup.position);
          
          const hitPoint = new THREE.Vector3();
          raycaster.ray.intersectPlane(gizmoDragPlane, hitPoint);
          gizmoDragOffset.subVectors(gizmoGroup.position, hitPoint);
          return;
        }
      }

      // 1. MINECRAFT BLOCK PLACEMENT MODE
      if (mouseButton === 0 && transformModeRef.current === 'place') {
        if (placementGhost.visible) {
          soundEngine.playBlockPlace(activeBlockTypeRef.current);
          if (onInsertBlockRef.current) {
            onInsertBlockRef.current(
              {
                x: placementGhost.position.x,
                y: placementGhost.position.y,
                z: placementGhost.position.z,
              },
              activeBlockTypeRef.current
            );
          }
          return;
        }
      }

      // 2. MINECRAFT MINE / TAP & DRAG REMOVAL MODE
      if (mouseButton === 0 && transformModeRef.current === 'mine') {
        raycaster.setFromCamera(mouseNDC, camera);
        const interactiveMeshes: THREE.Object3D[] = [];
        meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));

        const hits = raycaster.intersectObjects(interactiveMeshes, true);
        if (hits.length > 0) {
          let hitObj: THREE.Object3D | null = hits[0].object;
          while (hitObj && !hitObj.userData.instanceId && hitObj.parent) {
            hitObj = hitObj.parent;
          }
          if (hitObj && hitObj.userData.instanceId && hitObj.userData.instanceId !== 'baseplate-1') {
            const instId = hitObj.userData.instanceId;
            const inst = instancesRef.current.find((i) => i.id === instId);
            soundEngine.playBlockBreak(inst?.blockType || inst?.material || 'stone');
            spawnBreakParticles(hitObj.position, inst?.color || '#866043');
            if (onDeleteInstanceRef.current) {
              onDeleteInstanceRef.current(instId);
            }
            return;
          }
        }
        return;
      }

      // 3. SELECT & FULL EDIT MODE
      if (mouseButton === 0) {
        raycaster.setFromCamera(mouseNDC, camera);
        const interactiveMeshes: THREE.Object3D[] = [];
        meshMapRef.current.forEach((obj) => {
          interactiveMeshes.push(obj);
        });

        const hits = raycaster.intersectObjects(interactiveMeshes, true);
        if (hits.length > 0) {
          // Find root instance mesh
          let hitObj: THREE.Object3D | null = hits[0].object;
          while (hitObj && !hitObj.userData.instanceId && hitObj.parent) {
            hitObj = hitObj.parent;
          }
          if (hitObj && hitObj.userData.instanceId) {
            const id = hitObj.userData.instanceId;
            onSelectInstance(id);
            soundEngine.playClick();
            // Open full structure customizer
            if (onOpenStructureEditorRef.current) {
              onOpenStructureEditorRef.current();
            }
          }
        } else {
          // Click on empty space -> drag to look / orbit camera
          onSelectInstance(null);
          isDraggingCamera = true;
        }
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // 1. MINECRAFT PLACE MODE GHOST HOVER & SNAPPING
      if (transformModeRef.current === 'place' && !isPlayModeRef.current) {
        raycaster.setFromCamera(mouseNDC, camera);
        const interactiveMeshes: THREE.Object3D[] = [];
        meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
        const hits = raycaster.intersectObjects(interactiveMeshes, true);
        if (hits.length > 0 && hits[0].point) {
          const snap = gridSnapRef.current || 2;
          const hit = hits[0];
          const normal = hit.face ? hit.face.normal : _up;
          const targetX = hit.point.x + normal.x * (snap * 0.5);
          const targetY = hit.point.y + normal.y * (snap * 0.5);
          const targetZ = hit.point.z + normal.z * (snap * 0.5);
          const snappedX = Math.round(targetX / snap) * snap;
          const snappedY = Math.max(snap * 0.5, Math.round(targetY / snap) * snap);
          const snappedZ = Math.round(targetZ / snap) * snap;
          placementGhost.position.set(snappedX, snappedY, snappedZ);
          placementGhost.scale.set(snap, snap, snap);
          placementGhost.visible = true;
        } else {
          placementGhost.visible = false;
        }
      } else {
        placementGhost.visible = false;
      }

      // 2. MINECRAFT MINE / DRAG TO DESTROY BLOCKS (Desktop mouse hold & drag)
      if (isMouseDown && mouseButton === 0 && transformModeRef.current === 'mine' && !isPlayModeRef.current) {
        raycaster.setFromCamera(mouseNDC, camera);
        const interactiveMeshes: THREE.Object3D[] = [];
        meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
        const hits = raycaster.intersectObjects(interactiveMeshes, true);
        if (hits.length > 0) {
          let hitObj: THREE.Object3D | null = hits[0].object;
          while (hitObj && !hitObj.userData.instanceId && hitObj.parent) {
            hitObj = hitObj.parent;
          }
          if (hitObj && hitObj.userData.instanceId && hitObj.userData.instanceId !== 'baseplate-1') {
            const instId = hitObj.userData.instanceId;
            const inst = instancesRef.current.find((i) => i.id === instId);
            soundEngine.playBlockBreak(inst?.blockType || inst?.material || 'stone');
            spawnBreakParticles(hitObj.position, inst?.color || '#866043');
            if (onDeleteInstanceRef.current) {
              onDeleteInstanceRef.current(instId);
            }
          }
        }
        return;
      }

      if (!isMouseDown) return;

      // Handle Gizmo Dragging in Studio Edit Mode
      if (activeGizmoAxis && selectedIdRef.current && !isPlayModeRef.current) {
        raycaster.setFromCamera(mouseNDC, camera);

        const hitPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(gizmoDragPlane, hitPoint)) {
          const newPos = hitPoint.add(gizmoDragOffset);
          const inst = instancesRef.current.find((i) => i.id === selectedIdRef.current);
          if (inst) {
            const snap = gridSnapRef.current || 1;
            const mode = transformModeRef.current;
            
            if (mode === 'move') {
              let updatedPos = { ...inst.position };
              if (activeGizmoAxis === 'gizmo_x') {
                updatedPos.x = Math.round(newPos.x / snap) * snap;
              } else if (activeGizmoAxis === 'gizmo_y') {
                updatedPos.y = Math.round(newPos.y / snap) * snap;
              } else if (activeGizmoAxis === 'gizmo_z') {
                updatedPos.z = Math.round(newPos.z / snap) * snap;
              }
              onUpdateInstance(inst.id, { position: updatedPos });
            } else if (mode === 'scale') {
              let updatedSize = { ...inst.size };
              const dragFactor = (deltaX - deltaY) * 0.1;
              if (activeGizmoAxis === 'gizmo_x') {
                updatedSize.x = Math.max(0.5, Math.round((updatedSize.x + dragFactor) / snap) * snap);
              } else if (activeGizmoAxis === 'gizmo_y') {
                updatedSize.y = Math.max(0.5, Math.round((updatedSize.y + dragFactor) / snap) * snap);
              } else if (activeGizmoAxis === 'gizmo_z') {
                updatedSize.z = Math.max(0.5, Math.round((updatedSize.z + dragFactor) / snap) * snap);
              }
              onUpdateInstance(inst.id, { size: updatedSize });
            } else if (mode === 'rotate') {
              let updatedRot = { ...inst.rotation };
              const rotAngle = Math.round((deltaX * 0.5) / 15) * 15;
              if (activeGizmoAxis === 'gizmo_y') {
                updatedRot.y = (updatedRot.y + rotAngle) % 360;
              } else if (activeGizmoAxis === 'gizmo_x') {
                updatedRot.x = (updatedRot.x + rotAngle) % 360;
              } else if (activeGizmoAxis === 'gizmo_z') {
                updatedRot.z = (updatedRot.z + rotAngle) % 360;
              }
              onUpdateInstance(inst.id, { rotation: updatedRot });
            }
          }
        }
        return;
      }

      // In Play Mode: Mouse Orbit Camera
      if (isPlayModeRef.current) {
        if (isMouseDown || isDraggingCamera) {
          playerYaw -= deltaX * 0.007;
          playerCameraPitch = Math.max(0.05, Math.min(Math.PI / 2.2, playerCameraPitch + deltaY * 0.007));
        }
        return;
      }

      // Studio Edit Mode Camera Navigation:
      // Right Click OR Left Click drag on empty space: Orbit Look Around
      if (mouseButton === 2 || isDraggingCamera) {
        cameraSpherical.theta -= deltaX * 0.007;
        cameraSpherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cameraSpherical.phi - deltaY * 0.007));
        camera.position.setFromSpherical(cameraSpherical).add(cameraTarget);
        camera.lookAt(cameraTarget);
      }
      // Middle Click or Alt+Right: Pan Camera
      else if (mouseButton === 1 || (mouseButton === 2 && e.altKey)) {
        const panSpeed = 0.03 * (cameraSpherical.radius / 30);
        camera.getWorldDirection(_camRight);
        _camRight.cross(camera.up).normalize();
        _camUp.copy(camera.up).normalize();

        _moveVec.set(0, 0, 0)
          .addScaledVector(_camRight, -deltaX * panSpeed)
          .addScaledVector(_camUp, deltaY * panSpeed);

        cameraTarget.add(_moveVec);
        camera.position.add(_moveVec);
      }
    };

    const onPointerUp = () => {
      isMouseDown = false;
      activeGizmoAxis = null;
      isDraggingCamera = false;
    };

    // ========================================================
    // ADVANCED MULTI-TOUCH CAMERA CONTROLLER (PINCH & PAN)
    // ========================================================
    interface TouchPoint {
      id: number;
      x: number;
      y: number;
      startX: number;
      startY: number;
      startTime: number;
    }
    const touchMap = new Map<number, TouchPoint>();
    let prevPinchDist = 0;
    let prevMidpoint = { x: 0, y: 0 };

    const onTouchStart = (e: TouchEvent) => {
      // Cancel active camera transition on touch interaction
      if (transitionRef.current.active) {
        transitionRef.current.active = false;
        if (!isPlayModeRef.current) {
          cameraSpherical.setFromVector3(_tmpVecA.subVectors(camera.position, cameraTarget));
        }
      }

      const now = performance.now();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        touchMap.set(t.identifier, {
          id: t.identifier,
          x: t.clientX,
          y: t.clientY,
          startX: t.clientX,
          startY: t.clientY,
          startTime: now,
        });
      }

      const touches = Array.from(touchMap.values());
      if (touches.length === 1) {
        // Single finger start: record for orbit or tap selection
        mouseX = touches[0].x;
        mouseY = touches[0].y;
        isDraggingCamera = true;

        // Mobile immediate tap-to-mine check
        if (transformModeRef.current === 'mine' && !isPlayModeRef.current) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseNDC.x = ((touches[0].x - rect.left) / rect.width) * 2 - 1;
          mouseNDC.y = -((touches[0].y - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseNDC, camera);
          const interactiveMeshes: THREE.Object3D[] = [];
          meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
          const hits = raycaster.intersectObjects(interactiveMeshes, true);
          if (hits.length > 0) {
            let hitObj: THREE.Object3D | null = hits[0].object;
            while (hitObj && !hitObj.userData.instanceId && hitObj.parent) {
              hitObj = hitObj.parent;
            }
            if (hitObj && hitObj.userData.instanceId && hitObj.userData.instanceId !== 'baseplate-1') {
              const instId = hitObj.userData.instanceId;
              const inst = instancesRef.current.find((i) => i.id === instId);
              soundEngine.playBlockBreak(inst?.blockType || inst?.material || 'stone');
              spawnBreakParticles(hitObj.position, inst?.color || '#866043');
              if (onDeleteInstanceRef.current) {
                onDeleteInstanceRef.current(instId);
              }
              isDraggingCamera = false;
              return;
            }
          }
        }

        // Mobile place mode preview on touch start
        if (transformModeRef.current === 'place' && !isPlayModeRef.current) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseNDC.x = ((touches[0].x - rect.left) / rect.width) * 2 - 1;
          mouseNDC.y = -((touches[0].y - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseNDC, camera);
          const interactiveMeshes: THREE.Object3D[] = [];
          meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
          const hits = raycaster.intersectObjects(interactiveMeshes, true);
          if (hits.length > 0 && hits[0].point) {
            const snap = gridSnapRef.current || 2;
            const hit = hits[0];
            const normal = hit.face ? hit.face.normal : _up;
            const targetX = hit.point.x + normal.x * (snap * 0.5);
            const targetY = hit.point.y + normal.y * (snap * 0.5);
            const targetZ = hit.point.z + normal.z * (snap * 0.5);
            const snappedX = Math.round(targetX / snap) * snap;
            const snappedY = Math.max(snap * 0.5, Math.round(targetY / snap) * snap);
            const snappedZ = Math.round(targetZ / snap) * snap;
            placementGhost.position.set(snappedX, snappedY, snappedZ);
            placementGhost.scale.set(snap, snap, snap);
            placementGhost.visible = true;
          }
        }
      } else if (touches.length >= 2) {
        // Multi-touch gestures (Pinch-to-zoom & Two-finger pan)
        const t0 = touches[0];
        const t1 = touches[1];
        prevPinchDist = Math.hypot(t0.x - t1.x, t0.y - t1.y);
        prevMidpoint = {
          x: (t0.x + t1.x) / 2,
          y: (t0.y + t1.y) / 2,
        };
        isDraggingCamera = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // Update coordinates for active touches
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const existing = touchMap.get(t.identifier);
        if (existing) {
          existing.x = t.clientX;
          existing.y = t.clientY;
        }
      }

      const touches = Array.from(touchMap.values());

      // 1-FINGER GESTURE: Drag-to-mine, Place Preview, or Smooth Orbit Rotation
      if (touches.length === 1) {
        const t = touches[0];
        const deltaX = t.x - mouseX;
        const deltaY = t.y - mouseY;
        mouseX = t.x;
        mouseY = t.y;

        // MINECRAFT TOUCH DRAG-TO-MINE
        if (transformModeRef.current === 'mine' && !isPlayModeRef.current) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseNDC.x = ((t.x - rect.left) / rect.width) * 2 - 1;
          mouseNDC.y = -((t.y - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseNDC, camera);
          const interactiveMeshes: THREE.Object3D[] = [];
          meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
          const hits = raycaster.intersectObjects(interactiveMeshes, true);
          if (hits.length > 0) {
            let hitObj: THREE.Object3D | null = hits[0].object;
            while (hitObj && !hitObj.userData.instanceId && hitObj.parent) {
              hitObj = hitObj.parent;
            }
            if (hitObj && hitObj.userData.instanceId && hitObj.userData.instanceId !== 'baseplate-1') {
              const instId = hitObj.userData.instanceId;
              const inst = instancesRef.current.find((i) => i.id === instId);
              soundEngine.playBlockBreak(inst?.blockType || inst?.material || 'stone');
              spawnBreakParticles(hitObj.position, inst?.color || '#866043');
              if (onDeleteInstanceRef.current) {
                onDeleteInstanceRef.current(instId);
              }
            }
          }
          return;
        }

        // MINECRAFT TOUCH PLACE GHOST MOVE
        if (transformModeRef.current === 'place' && !isPlayModeRef.current) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseNDC.x = ((t.x - rect.left) / rect.width) * 2 - 1;
          mouseNDC.y = -((t.y - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseNDC, camera);
          const interactiveMeshes: THREE.Object3D[] = [];
          meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
          const hits = raycaster.intersectObjects(interactiveMeshes, true);
          if (hits.length > 0 && hits[0].point) {
            const snap = gridSnapRef.current || 2;
            const hit = hits[0];
            const normal = hit.face ? hit.face.normal : _up;
            const targetX = hit.point.x + normal.x * (snap * 0.5);
            const targetY = hit.point.y + normal.y * (snap * 0.5);
            const targetZ = hit.point.z + normal.z * (snap * 0.5);
            const snappedX = Math.round(targetX / snap) * snap;
            const snappedY = Math.max(snap * 0.5, Math.round(targetY / snap) * snap);
            const snappedZ = Math.round(targetZ / snap) * snap;
            placementGhost.position.set(snappedX, snappedY, snappedZ);
            placementGhost.scale.set(snap, snap, snap);
            placementGhost.visible = true;
          }
          return;
        }

        if (isPlayModeRef.current) {
          playerYaw -= deltaX * 0.006;
          playerCameraPitch = Math.max(0.05, Math.min(Math.PI / 2.2, playerCameraPitch + deltaY * 0.006));
        } else {
          cameraSpherical.theta -= deltaX * 0.006;
          cameraSpherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cameraSpherical.phi - deltaY * 0.006));
          camera.position.setFromSpherical(cameraSpherical).add(cameraTarget);
          camera.lookAt(cameraTarget);
        }
      }
      // 2-FINGER GESTURE: Pinch-To-Zoom & Multi-Touch Panning simultaneously
      else if (touches.length >= 2) {
        const t0 = touches[0];
        const t1 = touches[1];
        const currentPinchDist = Math.hypot(t0.x - t1.x, t0.y - t1.y);
        const currentMid = {
          x: (t0.x + t1.x) / 2,
          y: (t0.y + t1.y) / 2,
        };

        // 1. PINCH TO ZOOM
        if (prevPinchDist > 0 && currentPinchDist > 0) {
          const pinchDelta = (prevPinchDist - currentPinchDist);
          if (isPlayModeRef.current) {
            playerCameraDistance = Math.max(3.0, Math.min(35.0, playerCameraDistance + pinchDelta * 0.05));
          } else {
            cameraSpherical.radius = Math.max(4.0, Math.min(300.0, cameraSpherical.radius + pinchDelta * 0.07));
            camera.position.setFromSpherical(cameraSpherical).add(cameraTarget);
            camera.lookAt(cameraTarget);
          }
        }
        prevPinchDist = currentPinchDist;

        // 2. TWO-FINGER PANNING (Parallel to Camera Screen Plane)
        if (prevMidpoint.x !== 0 && prevMidpoint.y !== 0) {
          const deltaMidX = currentMid.x - prevMidpoint.x;
          const deltaMidY = currentMid.y - prevMidpoint.y;

          if (!isPlayModeRef.current) {
            const panSpeed = 0.0016 * Math.max(10, cameraSpherical.radius);
            camera.getWorldDirection(_forward);
            _camRight.crossVectors(_forward, camera.up).normalize();
            _camUp.crossVectors(_camRight, _forward).normalize();

            _panVector.set(0, 0, 0)
              .addScaledVector(_camRight, -deltaMidX * panSpeed)
              .addScaledVector(_camUp, deltaMidY * panSpeed);

            cameraTarget.add(_panVector);
            camera.position.add(_panVector);
          } else {
            // In Play mode, two finger vertical pan adjusts camera height smoothly
            playerCameraPitch = Math.max(0.05, Math.min(Math.PI / 2.2, playerCameraPitch - deltaMidY * 0.003));
          }
        }
        prevMidpoint = currentMid;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const now = performance.now();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const record = touchMap.get(t.identifier);

        // Tap Detection in Studio Mode
        if (record && !isPlayModeRef.current) {
          const moveDist = Math.hypot(t.clientX - record.startX, t.clientY - record.startY);
          const duration = now - record.startTime;

          // 1. PLACE MODE: Tap to place block at ghost location
          if (transformModeRef.current === 'place' && placementGhost.visible && moveDist < 16 && duration < 400) {
            soundEngine.playBlockPlace(activeBlockTypeRef.current);
            if (onInsertBlockRef.current) {
              onInsertBlockRef.current(
                {
                  x: placementGhost.position.x,
                  y: placementGhost.position.y,
                  z: placementGhost.position.z,
                },
                activeBlockTypeRef.current
              );
            }
          }
          // 2. SELECT & EDIT MODE: Tap to inspect and open structure editor
          else if (moveDist < 14 && duration < 350 && transformModeRef.current !== 'mine') {
            const rect = renderer.domElement.getBoundingClientRect();
            mouseNDC.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
            mouseNDC.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouseNDC, camera);

            const interactiveMeshes: THREE.Object3D[] = [];
            meshMapRef.current.forEach((obj) => interactiveMeshes.push(obj));
            const hits = raycaster.intersectObjects(interactiveMeshes, true);
            if (hits.length > 0) {
              let hitObj: THREE.Object3D | null = hits[0].object;
              while (hitObj && !hitObj.userData.instanceId && hitObj.parent) {
                hitObj = hitObj.parent;
              }
              if (hitObj && hitObj.userData.instanceId) {
                const id = hitObj.userData.instanceId;
                onSelectInstance(id);
                soundEngine.playClick();
                if (onOpenStructureEditorRef.current) {
                  onOpenStructureEditorRef.current();
                }
              }
            } else {
              onSelectInstance(null);
            }
          }
        }

        touchMap.delete(t.identifier);
      }

      if (touchMap.size === 0) {
        prevPinchDist = 0;
        prevMidpoint = { x: 0, y: 0 };
        isDraggingCamera = false;
        isMouseDown = false;
      } else if (touchMap.size === 1) {
        const remaining = Array.from(touchMap.values())[0];
        mouseX = remaining.x;
        mouseY = remaining.y;
        prevPinchDist = 0;
        prevMidpoint = { x: 0, y: 0 };
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isPlayModeRef.current) {
        playerCameraDistance = Math.max(3.0, Math.min(35.0, playerCameraDistance + e.deltaY * 0.02));
      } else {
        cameraSpherical.radius = Math.max(4.0, Math.min(300.0, cameraSpherical.radius + e.deltaY * 0.04));
        camera.position.setFromSpherical(cameraSpherical).add(cameraTarget);
        camera.lookAt(cameraTarget);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Respawns player at SpawnLocation or default checkpoint
    const respawnPlayer = () => {
      soundEngine.playOof();
      if (avatarRef.current) {
        avatarRef.current.shatter(scene);
      }

      setTimeout(() => {
        const spawn = instancesRef.current.find((i) => i.className === 'SpawnLocation');
        const spawnPos = spawn
          ? new THREE.Vector3(spawn.position.x, spawn.position.y + 3.0, spawn.position.z)
          : new THREE.Vector3(0, 5, 0);
        playerPos.copy(spawnPos);

        if (physicsEngine.playerBody) {
          physicsEngine.playerBody.position.set(spawnPos.x, spawnPos.y + 2.0, spawnPos.z);
          physicsEngine.playerBody.velocity.set(0, 0, 0);
          physicsEngine.playerBody.angularVelocity.set(0, 0, 0);
        }

        playerVelocity.set(0, 0, 0);
        onUpdatePlayerStats({ health: 100 });
        soundEngine.playSpawn();
      }, 700);
    };

    // Render loop
    let frameId = 0;
    const clock = new THREE.Clock();
    let prevPlayMode = false;
    let footstepTimer = 0;

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Handle Play Mode transitions (Select Mode <-> Test Mode)
      if (isPlayModeRef.current && !prevPlayMode) {
        prevPlayMode = true;
        physicsEngine.isSimulationRunning = true;
        const spawn = instancesRef.current.find((i) => i.className === 'SpawnLocation');
        const startPos = spawn
          ? new THREE.Vector3(spawn.position.x, spawn.position.y + 2.5, spawn.position.z)
          : new THREE.Vector3(0, 4, 0);
        playerPos.copy(startPos);
        physicsEngine.setupPlayerBody(startPos);

        // CINEMATIC TRANSITION: Select Mode -> Test Mode
        // Save current studio camera viewpoint and controls state
        studioCameraState.current.position.copy(camera.position);
        studioCameraState.current.target.copy(cameraTarget);
        studioCameraState.current.spherical.copy(cameraSpherical);

        // Compute initial target 3rd person follow camera position
        _camOffset.set(
          Math.sin(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance,
          Math.sin(playerCameraPitch) * playerCameraDistance + 3.0,
          Math.cos(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance
        );
        _targetCamPos.copy(playerPos).add(_camOffset);
        _targetLookAt.set(playerPos.x, playerPos.y + 2.5, playerPos.z);

        // Launch smooth swooping transition (1.1s duration with 3.2-unit parabolic arc)
        transitionRef.current = {
          active: true,
          type: 'toTest',
          startTime: performance.now(),
          duration: 1100,
          startPos: camera.position.clone(),
          startLookAt: currentLookAtRef.current.clone(),
          targetPos: _targetCamPos.clone(),
          targetLookAt: _targetLookAt.clone(),
          arcHeight: 3.2,
        };
      } else if (!isPlayModeRef.current && prevPlayMode) {
        prevPlayMode = false;
        physicsEngine.isSimulationRunning = false;
        physicsEngine.removePlayerBody();

        // Restore dynamic objects to original placed coordinates
        instancesRef.current.forEach((inst) => {
          const m = meshMapRef.current.get(inst.id);
          if (m) {
            m.position.set(inst.position.x, inst.position.y, inst.position.z);
            m.rotation.set(
              (inst.rotation.x * Math.PI) / 180,
              (inst.rotation.y * Math.PI) / 180,
              (inst.rotation.z * Math.PI) / 180
            );
            physicsEngine.syncInstance(inst, m);
          }
        });

        // CINEMATIC TRANSITION: Test Mode -> Select Mode
        // Smoothly glide back to the saved studio editor perspective
        const returnPos = studioCameraState.current.position;
        const returnTarget = studioCameraState.current.target;

        transitionRef.current = {
          active: true,
          type: 'toSelect',
          startTime: performance.now(),
          duration: 950,
          startPos: camera.position.clone(),
          startLookAt: currentLookAtRef.current.clone(),
          targetPos: returnPos.clone(),
          targetLookAt: returnTarget.clone(),
          arcHeight: 2.8,
        };
      }

      // Studio Selection Box Update
      if (selectedIdRef.current && !isPlayModeRef.current) {
        const mesh = meshMapRef.current.get(selectedIdRef.current);
        if (mesh) {
          selectionBox.setFromObject(mesh);
          selectionBox.visible = true;

          // Position gizmo at object center
          gizmoGroup.position.copy(mesh.position);
          gizmoGroup.visible = true;

          // Scale gizmo based on camera distance so it stays consistent size
          const dist = camera.position.distanceTo(gizmoGroup.position);
          const factor = Math.max(0.5, dist * 0.06);
          gizmoGroup.scale.set(factor, factor, factor);
        } else {
          selectionBox.visible = false;
          gizmoGroup.visible = false;
        }
      } else {
        selectionBox.visible = false;
        gizmoGroup.visible = false;
      }

      // Direction checks:
      // U = Up / Forward, D = Down / Backward, L = Left side, R = Right side
      const isUp = Boolean(
        keysRef.current['KeyU'] ||
        keysRef.current['u'] ||
        keysRef.current['KeyW'] ||
        keysRef.current['w'] ||
        keysRef.current['ArrowUp']
      );

      const isDown = Boolean(
        keysRef.current['KeyD'] ||
        keysRef.current['d'] ||
        keysRef.current['KeyS'] ||
        keysRef.current['s'] ||
        keysRef.current['ArrowDown']
      );

      const isLeft = Boolean(
        keysRef.current['KeyL'] ||
        keysRef.current['l'] ||
        keysRef.current['KeyA'] ||
        keysRef.current['a'] ||
        keysRef.current['ArrowLeft']
      );

      const isRight = Boolean(
        keysRef.current['KeyR'] ||
        keysRef.current['r'] ||
        keysRef.current['ArrowRight']
      );

      // Freecam keyboard navigation in Studio Mode (U, D, L, R, WASD, Q, E)
      if (!isPlayModeRef.current && (isUp || isDown || isLeft || isRight || keysRef.current['KeyE'] || keysRef.current['e'] || keysRef.current['KeyQ'] || keysRef.current['q'])) {
        if (transitionRef.current.active) {
          transitionRef.current.active = false;
          cameraSpherical.setFromVector3(_tmpVecA.subVectors(camera.position, cameraTarget));
        }
        const moveSpeed = (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight'] ? 60 : 25) * delta;
        camera.getWorldDirection(_forward);
        _right.crossVectors(_forward, camera.up).normalize();

        _move.set(0, 0, 0);
        if (isUp) _move.addScaledVector(_forward, moveSpeed);
        if (isDown) _move.addScaledVector(_forward, -moveSpeed);
        if (isLeft) _move.addScaledVector(_right, -moveSpeed);
        if (isRight) _move.addScaledVector(_right, moveSpeed);
        if (keysRef.current['KeyE'] || keysRef.current['e']) _move.y += moveSpeed;
        if (keysRef.current['KeyQ'] || keysRef.current['q']) _move.y -= moveSpeed;

        camera.position.add(_move);
        cameraTarget.add(_move);
      }

      // Step Cannon.js Physics Simulation
      physicsEngine.step(delta);

      // PLAY MODE: Physics, Avatar controller, collisions
      if (isPlayModeRef.current && avatarRef.current && physicsEngine.playerBody) {
        avatarRef.current.root.visible = true;
        const pBody = physicsEngine.playerBody;
        const stats = playerStatsRef.current;
        const speed = stats.walkSpeed || 16;
        const jumpImpulse = stats.jumpPower || 45;

        // Calculate input movement relative to camera yaw
        // Primary input: Touch Virtual Analog Joystick
        const joy = joystickInputRef.current || { x: 0, y: 0 };
        let moveX = joy.x;
        let moveZ = joy.y; // -1 = forward (Up), +1 = backward (Down)

        // Blended keyboard fallback (WASD / U,D,L,R / Arrow keys)
        if (isUp) moveZ -= 1;
        if (isDown) moveZ += 1;
        if (isLeft) moveX -= 1;
        if (isRight) moveX += 1;

        const inputMagnitude = Math.hypot(moveX, moveZ);
        const isMoving = inputMagnitude > 0.05;

        if (isMoving) {
          const moveSpeed = speed * Math.min(1, inputMagnitude);
          _inputDir.set(moveX / inputMagnitude, 0, moveZ / inputMagnitude);
          _inputDir.applyAxisAngle(_up, playerYaw);

          // Apply velocity directly to Cannon rigid body
          pBody.velocity.x = _inputDir.x * moveSpeed;
          pBody.velocity.z = _inputDir.z * moveSpeed;

          // Rotate character towards movement direction
          const targetCharYaw = Math.atan2(_inputDir.x, _inputDir.z);
          avatarRef.current.root.rotation.y = THREE.MathUtils.damp(
            avatarRef.current.root.rotation.y,
            targetCharYaw,
            14,
            delta
          );

          // Footstep audio
          footstepTimer += delta;
          if (footstepTimer > 0.36) {
            footstepTimer = 0;
            soundEngine.playFootstep();
          }
        } else {
          pBody.velocity.x *= 0.78;
          pBody.velocity.z *= 0.78;
        }

        // Ground check: check vertical velocity or contact
        const isGrounded = Math.abs(pBody.velocity.y) < 0.3 || pBody.position.y <= 2.2;

        // Jump: triggered by touch on-screen jump button or space
        const wantsJump = Boolean(isJumpPressedRef.current || keysRef.current['Space']);
        if (wantsJump && isGrounded) {
          pBody.velocity.y = jumpImpulse;
          soundEngine.playJump();
        }

        // Current world position from Cannon body
        playerPos.set(pBody.position.x, pBody.position.y - 1.8, pBody.position.z);

        // Check interactive Roblox triggers (Coins, Pads, Trampolines, Hazards)
        for (const inst of instancesRef.current) {
          _instPos.set(inst.position.x, inst.position.y, inst.position.z);
          const distToPlayer = playerPos.distanceTo(_instPos);

          // If instance is coin and intersects
          if (inst.isCoin && distToPlayer < 2.5) {
            soundEngine.playCoin();
            onUpdatePlayerStats({
              coins: (playerStatsRef.current.coins || 0) + (inst.coinValue || 10),
            });
            onUpdateInstance(inst.id, { transparency: 1, canCollide: false, isCoin: false });
          }

          // If instance is SpeedPad
          if (inst.isSpeedPad && distToPlayer < 3.8) {
            onUpdatePlayerStats({ walkSpeed: 32 });
            setTimeout(() => {
              onUpdatePlayerStats({ walkSpeed: 16 });
            }, 4000);
          }

          // If instance is JumpPad / Trampoline
          if (inst.isJumpPad && distToPlayer < 3.8 && Math.abs(playerPos.y - _instPos.y) < 2.5) {
            soundEngine.playBounce();
            pBody.velocity.y = 65; // High physics bounce
          }

          // If instance is Lava kill brick
          if (inst.isLava) {
            const minX = inst.position.x - inst.size.x / 2 - 1.0;
            const maxX = inst.position.x + inst.size.x / 2 + 1.0;
            const minY = inst.position.y - inst.size.y / 2;
            const maxY = inst.position.y + inst.size.y / 2 + 4.0;
            const minZ = inst.position.z - inst.size.z / 2 - 1.0;
            const maxZ = inst.position.z + inst.size.z / 2 + 1.0;

            if (
              playerPos.x >= minX && playerPos.x <= maxX &&
              playerPos.y >= minY && playerPos.y <= maxY &&
              playerPos.z >= minZ && playerPos.z <= maxZ
            ) {
              respawnPlayer();
              break;
            }
          }
        }

        // Void kill check (fell off map)
        if (pBody.position.y < -35) {
          respawnPlayer();
        }

        // Apply position to avatar mesh & animate limbs
        avatarRef.current.root.position.copy(playerPos);
        avatarRef.current.animate(isMoving, delta, speed);
      } else if (avatarRef.current) {
        avatarRef.current.root.visible = false;
        avatarRef.current.resetPose();
      }

      // ========================================================
      // CINEMATIC CAMERA INTERPOLATION ENGINE
      // ========================================================
      const trans = transitionRef.current;
      if (trans.active) {
        const now = performance.now();
        const elapsed = (now - trans.startTime) / trans.duration;
        const progress = Math.min(Math.max(elapsed, 0), 1);
        const ease = easeInOutCubic(progress);

        if (trans.type === 'toTest') {
          // Dynamically track avatar as simulation begins
          _camOffset.set(
            Math.sin(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance,
            Math.sin(playerCameraPitch) * playerCameraDistance + 3.0,
            Math.cos(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance
          );
          _targetCamPos.copy(playerPos).add(_camOffset);
          _targetLookAt.set(playerPos.x, playerPos.y + 2.5, playerPos.z);

          camera.position.lerpVectors(trans.startPos, _targetCamPos, ease);
          // Parabolic swooping altitude arc
          const arc = Math.sin(progress * Math.PI) * trans.arcHeight;
          camera.position.y += arc;

          currentLookAtRef.current.lerpVectors(trans.startLookAt, _targetLookAt, ease);
          camera.lookAt(currentLookAtRef.current);

          if (progress >= 1) {
            trans.active = false;
          }
        } else if (trans.type === 'toSelect') {
          camera.position.lerpVectors(trans.startPos, trans.targetPos, ease);
          const arc = Math.sin(progress * Math.PI) * trans.arcHeight;
          camera.position.y += arc;

          currentLookAtRef.current.lerpVectors(trans.startLookAt, trans.targetLookAt, ease);
          camera.lookAt(currentLookAtRef.current);

          if (progress >= 1) {
            trans.active = false;
            camera.position.copy(trans.targetPos);
            cameraTarget.copy(trans.targetLookAt);
            cameraSpherical.setFromVector3(_tmpVecA.subVectors(camera.position, cameraTarget));
          }
        } else {
          // 'preset' or 'focus'
          camera.position.lerpVectors(trans.startPos, trans.targetPos, ease);
          const arc = Math.sin(progress * Math.PI) * trans.arcHeight;
          camera.position.y += arc;

          currentLookAtRef.current.lerpVectors(trans.startLookAt, trans.targetLookAt, ease);
          camera.lookAt(currentLookAtRef.current);

          if (progress >= 1) {
            trans.active = false;
            camera.position.copy(trans.targetPos);
            cameraTarget.copy(trans.targetLookAt);
            cameraSpherical.setFromVector3(_tmpVecA.subVectors(camera.position, cameraTarget));
          }
        }
      } else {
        // Standard mode camera update (Non-transitioning)
        if (isPlayModeRef.current) {
          _camOffset.set(
            Math.sin(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance,
            Math.sin(playerCameraPitch) * playerCameraDistance + 3.0,
            Math.cos(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance
          );
          camera.position.copy(playerPos).add(_camOffset);
          currentLookAtRef.current.set(playerPos.x, playerPos.y + 2.5, playerPos.z);
          camera.lookAt(currentLookAtRef.current);
        } else {
          currentLookAtRef.current.copy(cameraTarget);
        }
      }

      // Update Minecraft voxel break particles (Zero GC)
      for (let i = 0; i < particlePool.length; i++) {
        const p = particlePool[i];
        if (p.mesh.visible) {
          p.life += delta;
          if (p.life >= p.maxLife) {
            p.mesh.visible = false;
          } else {
            p.vel.y -= 26 * delta; // Gravity
            p.mesh.position.addScaledVector(p.vel, delta);
            p.mesh.rotation.x += 10 * delta;
            p.mesh.rotation.y += 10 * delta;
            const scale = Math.max(0.01, 1 - p.life / p.maxLife);
            p.mesh.scale.set(scale, scale, scale);
          }
        }
      }

      // Placement ghost breathing glow pulse
      if (placementGhost.visible) {
        innerGhost.scale.setScalar(0.95 + Math.sin(performance.now() * 0.008) * 0.03);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Instances with Three.js Meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMeshMap = meshMapRef.current;
    const activeIds = new Set(instances.map((i) => i.id));

    // Remove deleted meshes
    currentMeshMap.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        currentMeshMap.delete(id);
        physicsEngine.removeInstance(id);
      }
    });

    const studsTexture = createStudsTexture();
    const spawnTexture = createSpawnTexture();
    const brickTexture = createBrickTexture();
    const woodTexture = createWoodTexture();

    // Add or update meshes
    instances.forEach((inst) => {
      let mesh = currentMeshMap.get(inst.id);

      if (!mesh) {
        // Create new Mesh based on Shape
        let geom: THREE.BufferGeometry;
        const sx = inst.size.x;
        const sy = inst.size.y;
        const sz = inst.size.z;

        if (inst.shape === 'Sphere') {
          geom = new THREE.SphereGeometry(sx / 2, 24, 24);
        } else if (inst.shape === 'Cylinder') {
          geom = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 24);
        } else if (inst.shape === 'Wedge') {
          // Custom wedge geometry (triangle prism)
          const wedgeGeom = new THREE.BufferGeometry();
          const vertices = new Float32Array([
            // Bottom face
            -sx/2, -sy/2, -sz/2,
             sx/2, -sy/2, -sz/2,
             sx/2, -sy/2,  sz/2,
            -sx/2, -sy/2, -sz/2,
             sx/2, -sy/2,  sz/2,
            -sx/2, -sy/2,  sz/2,
            // Back face
            -sx/2, -sy/2, -sz/2,
             sx/2,  sy/2, -sz/2,
             sx/2, -sy/2, -sz/2,
            -sx/2, -sy/2, -sz/2,
            -sx/2,  sy/2, -sz/2,
             sx/2,  sy/2, -sz/2,
            // Slanted slope face
            -sx/2,  sy/2, -sz/2,
            -sx/2, -sy/2,  sz/2,
             sx/2, -sy/2,  sz/2,
            -sx/2,  sy/2, -sz/2,
             sx/2, -sy/2,  sz/2,
             sx/2,  sy/2, -sz/2,
            // Left triangle
            -sx/2, -sy/2, -sz/2,
            -sx/2, -sy/2,  sz/2,
            -sx/2,  sy/2, -sz/2,
            // Right triangle
             sx/2, -sy/2, -sz/2,
             sx/2,  sy/2, -sz/2,
             sx/2, -sy/2,  sz/2,
          ]);
          wedgeGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          wedgeGeom.computeVertexNormals();
          geom = wedgeGeom;
        } else if (inst.className === 'NPC') {
          // NPC dummy group
          const npcAvatar = createRobloxAvatar(inst.name, {
            head: '#f5cd2f',
            torso: '#22c55e',
            leftArm: '#f5cd2f',
            rightArm: '#f5cd2f',
            leftLeg: '#1e3a8a',
            rightLeg: '#1e3a8a',
          });
          const group = npcAvatar.root;
          group.userData = { instanceId: inst.id };
          group.position.set(inst.position.x, inst.position.y, inst.position.z);
          group.rotation.set(
            (inst.rotation.x * Math.PI) / 180,
            (inst.rotation.y * Math.PI) / 180,
            (inst.rotation.z * Math.PI) / 180
          );
          scene.add(group);
          currentMeshMap.set(inst.id, group);
          return;
        } else {
          // Default Block
          geom = new THREE.BoxGeometry(sx, sy, sz);
        }

        // Material creation
        let mat: THREE.Material | THREE.Material[];
        const color = new THREE.Color(inst.color || '#94a3b8');

        if (inst.blockType) {
          mat = getMinecraftBlockMaterial(inst.blockType, inst.color);
        } else if (inst.className === 'SpawnLocation') {
          mat = new THREE.MeshStandardMaterial({
            map: spawnTexture,
            color: color,
            roughness: 0.2,
            metalness: 0.1,
          });
        } else if (inst.material === 'Neon') {
          mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.85,
            roughness: 0.1,
          });
        } else if (inst.material === 'Brick') {
          mat = new THREE.MeshStandardMaterial({
            map: brickTexture,
            color: color,
            roughness: 0.8,
            metalness: 0.05,
          });
        } else if (inst.material === 'Wood') {
          mat = new THREE.MeshStandardMaterial({
            map: woodTexture,
            color: color,
            roughness: 0.7,
            metalness: 0.05,
          });
        } else if (inst.name === 'Baseplate') {
          const baseplateStuds = studsTexture.clone();
          baseplateStuds.repeat.set(sx / 4, sz / 4);
          mat = new THREE.MeshStandardMaterial({
            map: baseplateStuds,
            color: color,
            roughness: 0.5,
            metalness: 0.1,
          });
        } else {
          // Plastic with studs on top face
          mat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: inst.material === 'SmoothPlastic' ? 0.2 : 0.45,
            metalness: inst.material === 'Metal' ? 0.8 : 0.05,
            transparent: inst.transparency > 0,
            opacity: 1 - (inst.transparency || 0),
          });
        }

        mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = inst.castShadow ?? true;
        mesh.receiveShadow = true;
        mesh.userData = {
          instanceId: inst.id,
          blockType: inst.blockType,
          color: inst.color,
        };
        scene.add(mesh);
        currentMeshMap.set(inst.id, mesh);
      }

      // Update transform & properties
      mesh.position.set(inst.position.x, inst.position.y, inst.position.z);
      mesh.rotation.set(
        (inst.rotation.x * Math.PI) / 180,
        (inst.rotation.y * Math.PI) / 180,
        (inst.rotation.z * Math.PI) / 180
      );

      // Re-scale if size changed and not NPC
      if (mesh instanceof THREE.Mesh && inst.className !== 'NPC') {
        const bbox = new THREE.Box3().setFromBufferAttribute(
          mesh.geometry.attributes.position as THREE.BufferAttribute
        );
        const geoSize = new THREE.Vector3();
        bbox.getSize(geoSize);
        if (geoSize.x > 0 && geoSize.y > 0 && geoSize.z > 0) {
          mesh.scale.set(
            inst.size.x / geoSize.x,
            inst.size.y / geoSize.y,
            inst.size.z / geoSize.z
          );
        }

        // Update material color & transparency or Minecraft block texture
        if (inst.blockType) {
          if (mesh.userData.blockType !== inst.blockType || mesh.userData.color !== inst.color) {
            mesh.material = getMinecraftBlockMaterial(inst.blockType, inst.color);
            mesh.userData.blockType = inst.blockType;
            mesh.userData.color = inst.color;
          }
        } else {
          const mat = mesh.material;
          if (mat && !Array.isArray(mat)) {
            const stdMat = mat as THREE.MeshStandardMaterial;
            if (stdMat.color) stdMat.color.set(inst.color || '#94a3b8');
            if (inst.material === 'Neon' && stdMat.emissive) {
              stdMat.emissive.set(inst.color || '#94a3b8');
              stdMat.emissiveIntensity = 0.85;
            }
            stdMat.transparent = (inst.transparency || 0) > 0;
            stdMat.opacity = 1 - (inst.transparency || 0);
          }
        }
      }

      // Synchronize with Cannon.js physics engine
      physicsEngine.syncInstance(inst, mesh);
    });
  }, [instances]);

  // Lighting & Skybox update
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (skyType === 'sunset') {
      scene.background = new THREE.Color('#381b47');
      scene.fog = new THREE.FogExp2('#4a225d', 0.007);
    } else if (skyType === 'night') {
      scene.background = new THREE.Color('#090d16');
      scene.fog = new THREE.FogExp2('#0c1322', 0.005);
    } else if (skyType === 'cyberpunk') {
      scene.background = new THREE.Color('#030712');
      scene.fog = new THREE.FogExp2('#1e1b4b', 0.008);
    } else {
      // Classic Roblox Studio clear blue sky
      scene.background = new THREE.Color('#60a5fa');
      scene.fog = new THREE.FogExp2('#93c5fd', 0.003);
    }
  }, [timeOfDay, skyType]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#18181b]">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* ViewSelector / Orientation Cube in Top-Right Corner */}
      <div className="absolute top-3 right-3 bg-[#1e1e24]/90 backdrop-blur-md border border-neutral-700/60 rounded-lg p-1.5 shadow-xl flex flex-col items-center text-[10px] font-mono text-neutral-300">
        <span className="text-[9px] text-neutral-400 font-bold mb-1 tracking-wider uppercase">ViewCube</span>
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button
            onClick={() => {
              triggerTransitionRef.current(
                'preset',
                new THREE.Vector3(0, 60, 0.1),
                new THREE.Vector3(0, 0, 0),
                700,
                2.0
              );
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Top View"
          >
            TOP
          </button>
          <div />

          <button
            onClick={() => {
              triggerTransitionRef.current(
                'preset',
                new THREE.Vector3(-50, 8, 0),
                new THREE.Vector3(0, 5, 0),
                700,
                1.5
              );
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Left View"
          >
            L
          </button>
          <button
            onClick={() => {
              triggerTransitionRef.current(
                'preset',
                new THREE.Vector3(0, 10, 50),
                new THREE.Vector3(0, 5, 0),
                700,
                1.5
              );
            }}
            className="w-7 h-7 bg-neutral-700 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Front View"
          >
            F
          </button>
          <button
            onClick={() => {
              triggerTransitionRef.current(
                'preset',
                new THREE.Vector3(50, 8, 0),
                new THREE.Vector3(0, 5, 0),
                700,
                1.5
              );
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Right View"
          >
            R
          </button>

          <div />
          <button
            onClick={() => {
              triggerTransitionRef.current(
                'preset',
                new THREE.Vector3(35, 30, 35),
                new THREE.Vector3(0, 0, 0),
                700,
                1.5
              );
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Isometric"
          >
            ISO
          </button>
          <div />
        </div>
      </div>

      {/* Navigation hints badge at bottom-left */}
      <div className="absolute bottom-3 left-3 bg-[#1e1e24]/90 backdrop-blur-xs border border-neutral-700/80 rounded-md px-3 py-1.5 text-[11px] text-neutral-300 pointer-events-none flex items-center gap-2.5 shadow-xl font-mono">
        <span className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 font-bold border border-neutral-700">U/D/L/R</span> Fly
        </span>
        <span className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 font-bold border border-neutral-700">F</span> Focus
        </span>
        <div className="h-3 w-px bg-neutral-700" />
        <span><strong className="text-white">🖱️ Drag:</strong> Orbit</span>
        {isPlayMode && <span><strong className="text-amber-400">Space:</strong> Jump</span>}
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
          Cinematic Interpolation
        </span>
      </div>
    </div>
  );
};
