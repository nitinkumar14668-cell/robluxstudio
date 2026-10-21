import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RobloxInstance, TransformMode, PlayerStats } from '../types/roblox';
import { createStudsTexture, createSpawnTexture, createBrickTexture, createWoodTexture } from '../engine/materials';
import { createRobloxAvatar, RobloxAvatarInstance } from '../engine/avatar';
import { soundEngine } from '../engine/audio';

interface Viewport3DProps {
  instances: RobloxInstance[];
  selectedId: string | null;
  onSelectInstance: (id: string | null) => void;
  onUpdateInstance: (id: string, updates: Partial<RobloxInstance>) => void;
  transformMode: TransformMode;
  isPlayMode: boolean;
  playerStats: PlayerStats;
  onUpdatePlayerStats: (stats: Partial<PlayerStats>) => void;
  gridSnap: number;
  timeOfDay: number;
  skyType: 'clear' | 'sunset' | 'night' | 'cyberpunk';
  cameraPreset?: string | null;
  onClearCameraPreset?: () => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  instances,
  selectedId,
  onSelectInstance,
  onUpdateInstance,
  transformMode,
  isPlayMode,
  playerStats,
  onUpdatePlayerStats,
  gridSnap,
  timeOfDay,
  skyType,
  cameraPreset,
  onClearCameraPreset,
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
  const playerStatsRef = useRef<PlayerStats>(playerStats);
  playerStatsRef.current = playerStats;

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

  // Set camera preset if requested
  useEffect(() => {
    if (!cameraPreset || !cameraRef.current) return;
    const cam = cameraRef.current;
    if (cameraPreset === 'Top') {
      cam.position.set(0, 60, 0);
      cam.lookAt(0, 0, 0);
    } else if (cameraPreset === 'Front') {
      cam.position.set(0, 10, 45);
      cam.lookAt(0, 5, 0);
    } else if (cameraPreset === 'Right') {
      cam.position.set(45, 10, 0);
      cam.lookAt(0, 5, 0);
    } else if (cameraPreset === 'Isometric') {
      cam.position.set(35, 30, 35);
      cam.lookAt(0, 0, 0);
    }
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

    // Orbit & Camera Controls state
    let isMouseDown = false;
    let mouseButton = 0; // 0: left, 1: middle, 2: right
    let mouseX = 0;
    let mouseY = 0;
    let cameraSpherical = new THREE.Spherical(45, Math.PI / 3, Math.PI / 4);
    let cameraTarget = new THREE.Vector3(0, 2, 0);

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

      // Check Gizmo intersection on left click
      if (mouseButton === 0 && selectedIdRef.current && gizmoGroup.visible) {
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

      // If left click and not dragging gizmo, raycast to select instance in scene
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
            onSelectInstance(hitObj.userData.instanceId);
            soundEngine.playClick();
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

      if (!isMouseDown) return;

      // Handle Gizmo Dragging in Studio Edit Mode
      if (activeGizmoAxis && selectedIdRef.current && !isPlayModeRef.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
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
        const camRight = new THREE.Vector3();
        const camUp = new THREE.Vector3();
        camera.getWorldDirection(camRight);
        camRight.cross(camera.up).normalize();
        camUp.copy(camera.up).normalize();

        const moveVec = new THREE.Vector3()
          .addScaledVector(camRight, -deltaX * panSpeed)
          .addScaledVector(camUp, deltaY * panSpeed);

        cameraTarget.add(moveVec);
        camera.position.add(moveVec);
      }
    };

    const onPointerUp = () => {
      isMouseDown = false;
      activeGizmoAxis = null;
      isDraggingCamera = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isPlayModeRef.current) {
        playerCameraDistance = Math.max(4, Math.min(30, playerCameraDistance + e.deltaY * 0.02));
      } else {
        cameraSpherical.radius = Math.max(4, Math.min(250, cameraSpherical.radius + e.deltaY * 0.04));
        camera.position.setFromSpherical(cameraSpherical).add(cameraTarget);
        camera.lookAt(cameraTarget);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
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
        if (spawn) {
          playerPos.set(spawn.position.x, spawn.position.y + 3, spawn.position.z);
        } else {
          playerPos.set(0, 5, 0);
        }
        playerVelocity.set(0, 0, 0);
        onUpdatePlayerStats({ health: 100 });
        soundEngine.playSpawn();
      }, 700);
    };

    // Render loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);

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
      // Also support W (Up), S (Down), A (Left), and Arrow Keys:
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
        const moveSpeed = (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight'] ? 60 : 25) * delta;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

        const move = new THREE.Vector3();
        if (isUp) move.addScaledVector(forward, moveSpeed);
        if (isDown) move.addScaledVector(forward, -moveSpeed);
        if (isLeft) move.addScaledVector(right, -moveSpeed);
        if (isRight) move.addScaledVector(right, moveSpeed);
        if (keysRef.current['KeyE'] || keysRef.current['e']) move.y += moveSpeed;
        if (keysRef.current['KeyQ'] || keysRef.current['q']) move.y -= moveSpeed;

        camera.position.add(move);
        cameraTarget.add(move);
      }

      // PLAY MODE: Physics, Avatar controller, collisions
      if (isPlayModeRef.current && avatarRef.current) {
        avatarRef.current.root.visible = true;
        const stats = playerStatsRef.current;
        const speed = stats.walkSpeed || 16;
        const jumpImpulse = stats.jumpPower || 45;

        // Calculate input movement relative to camera yaw
        let moveX = 0;
        let moveZ = 0;
        if (isUp) moveZ -= 1;    // U = Up / Forward
        if (isDown) moveZ += 1;  // D = Down / Backward
        if (isLeft) moveX -= 1;  // L = Left side
        if (isRight) moveX += 1; // R = Right side

        const isMoving = moveX !== 0 || moveZ !== 0;

        if (isMoving) {
          const inputDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
          inputDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);

          playerVelocity.x = inputDir.x * speed;
          playerVelocity.z = inputDir.z * speed;

          // Rotate character towards movement direction
          const targetCharYaw = Math.atan2(inputDir.x, inputDir.z);
          avatarRef.current.root.rotation.y = THREE.MathUtils.damp(
            avatarRef.current.root.rotation.y,
            targetCharYaw,
            14,
            delta
          );
        } else {
          playerVelocity.x = THREE.MathUtils.damp(playerVelocity.x, 0, 12, delta);
          playerVelocity.z = THREE.MathUtils.damp(playerVelocity.z, 0, 12, delta);
        }

        // Jump
        if (keysRef.current['Space'] && isGrounded) {
          playerVelocity.y = jumpImpulse;
          isGrounded = false;
          soundEngine.playJump();
        }

        // Gravity
        playerVelocity.y -= 75 * delta;

        // Trial movement
        const nextPos = playerPos.clone().addScaledVector(playerVelocity, delta);

        // Simple AABB Box Collision with Solid / CanCollide Instances
        isGrounded = false;
        const playerRadius = 0.9;
        const playerHeight = 4.8;

        for (const inst of instancesRef.current) {
          // If instance is coin and intersects
          if (inst.isCoin) {
            const dist = nextPos.distanceTo(
              new THREE.Vector3(inst.position.x, inst.position.y, inst.position.z)
            );
            if (dist < 2.5) {
              soundEngine.playCoin();
              onUpdatePlayerStats({
                coins: (playerStatsRef.current.coins || 0) + (inst.coinValue || 10),
              });
              // Remove coin from scene
              onUpdateInstance(inst.id, { transparency: 1, canCollide: false, isCoin: false });
            }
          }

          // If instance is SpeedPad
          if (inst.isSpeedPad) {
            const dist = nextPos.distanceTo(
              new THREE.Vector3(inst.position.x, inst.position.y, inst.position.z)
            );
            if (dist < 4.0) {
              onUpdatePlayerStats({ walkSpeed: 32 });
              setTimeout(() => {
                onUpdatePlayerStats({ walkSpeed: 16 });
              }, 4000);
            }
          }

          // If instance is JumpPad / Trampoline
          if (inst.isJumpPad) {
            const dist = nextPos.distanceTo(
              new THREE.Vector3(inst.position.x, inst.position.y, inst.position.z)
            );
            if (dist < 4.0 && Math.abs(nextPos.y - inst.position.y) < 2.5) {
              soundEngine.playBounce();
              playerVelocity.y = 70;
              isGrounded = false;
            }
          }

          // If instance is Lava kill brick
          if (inst.isLava) {
            const minX = inst.position.x - inst.size.x / 2 - playerRadius;
            const maxX = inst.position.x + inst.size.x / 2 + playerRadius;
            const minY = inst.position.y - inst.size.y / 2;
            const maxY = inst.position.y + inst.size.y / 2 + playerHeight;
            const minZ = inst.position.z - inst.size.z / 2 - playerRadius;
            const maxZ = inst.position.z + inst.size.z / 2 + playerRadius;

            if (
              nextPos.x >= minX &&
              nextPos.x <= maxX &&
              nextPos.y >= minY &&
              nextPos.y <= maxY &&
              nextPos.z >= minZ &&
              nextPos.z <= maxZ
            ) {
              respawnPlayer();
              break;
            }
          }

          // Physical collisions (if canCollide is true)
          if (inst.canCollide !== false) {
            const minX = inst.position.x - inst.size.x / 2 - playerRadius;
            const maxX = inst.position.x + inst.size.x / 2 + playerRadius;
            const minZ = inst.position.z - inst.size.z / 2 - playerRadius;
            const maxZ = inst.position.z + inst.size.z / 2 + playerRadius;
            const topY = inst.position.y + inst.size.y / 2;
            const bottomY = inst.position.y - inst.size.y / 2;

            if (nextPos.x >= minX && nextPos.x <= maxX && nextPos.z >= minZ && nextPos.z <= maxZ) {
              // Landing on top of part
              if (playerPos.y >= topY - 0.5 && nextPos.y <= topY + 0.2) {
                nextPos.y = topY;
                playerVelocity.y = 0;
                isGrounded = true;
              }
              // Hitting underside of part
              else if (playerPos.y + playerHeight <= bottomY + 0.5 && nextPos.y + playerHeight >= bottomY) {
                nextPos.y = bottomY - playerHeight;
                playerVelocity.y = -2;
              }
            }
          }
        }

        // Void kill check (fell off map)
        if (nextPos.y < -35) {
          respawnPlayer();
        } else {
          playerPos.copy(nextPos);
        }

        // Apply position to avatar mesh
        avatarRef.current.root.position.copy(playerPos);
        avatarRef.current.animate(isMoving, delta, speed);

        // Update 3rd person follow camera
        const camOffset = new THREE.Vector3(
          Math.sin(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance,
          Math.sin(playerCameraPitch) * playerCameraDistance + 3.0,
          Math.cos(playerYaw) * Math.cos(playerCameraPitch) * playerCameraDistance
        );

        camera.position.copy(playerPos).add(camOffset);
        camera.lookAt(playerPos.x, playerPos.y + 3.0, playerPos.z);
      } else if (avatarRef.current) {
        avatarRef.current.root.visible = false;
        avatarRef.current.resetPose();
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
        let mat: THREE.Material;
        const color = new THREE.Color(inst.color || '#94a3b8');

        if (inst.className === 'SpawnLocation') {
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
        mesh.userData = { instanceId: inst.id };
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

        // Update material color & transparency
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.set(inst.color || '#94a3b8');
          if (inst.material === 'Neon') {
            mat.emissive.set(inst.color || '#94a3b8');
            mat.emissiveIntensity = 0.85;
          }
          mat.transparent = (inst.transparency || 0) > 0;
          mat.opacity = 1 - (inst.transparency || 0);
        }
      }
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
              if (cameraRef.current) {
                cameraRef.current.position.set(0, 60, 0);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Top View"
          >
            TOP
          </button>
          <div />

          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(-50, 8, 0);
                cameraRef.current.lookAt(0, 5, 0);
              }
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Left View"
          >
            L
          </button>
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(0, 10, 50);
                cameraRef.current.lookAt(0, 5, 0);
              }
            }}
            className="w-7 h-7 bg-neutral-700 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Front View"
          >
            F
          </button>
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(50, 8, 0);
                cameraRef.current.lookAt(0, 5, 0);
              }
            }}
            className="w-7 h-7 bg-neutral-800 hover:bg-sky-600 rounded text-center leading-7 font-bold text-white transition-colors"
            title="Right View"
          >
            R
          </button>

          <div />
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(35, 30, 35);
                cameraRef.current.lookAt(0, 0, 0);
              }
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
      <div className="absolute bottom-3 left-3 bg-[#1e1e24]/90 backdrop-blur-xs border border-neutral-700/80 rounded-md px-3 py-1.5 text-[11px] text-neutral-300 pointer-events-none flex items-center gap-3 shadow-xl font-mono">
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 font-bold border border-neutral-700">U</span> Up
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 font-bold border border-neutral-700">D</span> Down
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 font-bold border border-neutral-700">L</span> Left
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 font-bold border border-neutral-700">R</span> Right
        </span>
        <div className="h-3 w-px bg-neutral-700" />
        <span><strong className="text-white">🖱️ Mouse Drag:</strong> Camera View</span>
        {isPlayMode && <span><strong className="text-amber-400">Space:</strong> Jump</span>}
      </div>
    </div>
  );
};
