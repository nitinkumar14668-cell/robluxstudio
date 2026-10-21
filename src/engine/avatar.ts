import * as THREE from 'three';
import { createAvatarFaceTexture } from './materials';

export interface RobloxAvatarInstance {
  root: THREE.Group;
  head: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  nameBillboard: THREE.Sprite;
  animate: (isMoving: boolean, delta: number, speed: number) => void;
  resetPose: () => void;
  shatter: (scene: THREE.Scene) => void;
  dispose: () => void;
}

export function createRobloxAvatar(
  playerName: string = 'BuilderPlayer',
  colors = {
    head: '#f5cd2f',
    torso: '#0284c7',
    leftArm: '#f5cd2f',
    rightArm: '#f5cd2f',
    leftLeg: '#16a34a',
    rightLeg: '#16a34a',
  }
): RobloxAvatarInstance {
  const root = new THREE.Group();
  root.name = 'RobloxCharacter';

  // Materials
  const plasticMat = (colorHex: string) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.35,
      metalness: 0.05,
    });

  // 1. Torso (2.0 wide, 2.0 tall, 1.0 deep)
  const torsoGeo = new THREE.BoxGeometry(2.0, 2.0, 1.0);
  const torsoMesh = new THREE.Mesh(torsoGeo, plasticMat(colors.torso));
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoMesh.position.set(0, 3.0, 0);
  root.add(torsoMesh);

  // 2. Head (1.2 x 1.2 x 1.2) sitting on torso
  const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const faceTexture = createAvatarFaceTexture();
  
  // Head multi-material (face on front side +Z)
  const headMatSide = plasticMat(colors.head);
  const headMatFace = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.head),
    map: faceTexture,
    roughness: 0.35,
    metalness: 0.05,
  });
  
  // Materials order: +X, -X, +Y, -Y, +Z (Front), -Z (Back)
  const headMaterials = [
    headMatSide,
    headMatSide,
    headMatSide,
    headMatSide,
    headMatFace, // Front face
    headMatSide,
  ];
  const headMesh = new THREE.Mesh(headGeo, headMaterials);
  headMesh.castShadow = true;
  headMesh.position.set(0, 4.6, 0);
  root.add(headMesh);

  // Builder Cap / Visor on top of head
  const hatGroup = new THREE.Group();
  const capGeo = new THREE.BoxGeometry(1.3, 0.3, 1.3);
  const capMesh = new THREE.Mesh(capGeo, plasticMat('#dc2626')); // Red cap
  capMesh.position.set(0, 0.65, 0);
  const visorGeo = new THREE.BoxGeometry(1.3, 0.1, 0.6);
  const visorMesh = new THREE.Mesh(visorGeo, plasticMat('#dc2626'));
  visorMesh.position.set(0, 0.55, 0.85);
  hatGroup.add(capMesh, visorMesh);
  headMesh.add(hatGroup);

  // 3. Left Arm (Pivot at shoulder: x = -1.5, y = 4.0)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-1.5, 4.0, 0);
  const armGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
  const leftArmMesh = new THREE.Mesh(armGeo, plasticMat(colors.leftArm));
  leftArmMesh.castShadow = true;
  leftArmMesh.position.set(0, -1.0, 0); // shift mesh down so pivot is at top shoulder
  leftArmGroup.add(leftArmMesh);
  root.add(leftArmGroup);

  // 4. Right Arm (Pivot at shoulder: x = 1.5, y = 4.0)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(1.5, 4.0, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, plasticMat(colors.rightArm));
  rightArmMesh.castShadow = true;
  rightArmMesh.position.set(0, -1.0, 0);
  rightArmGroup.add(rightArmMesh);
  root.add(rightArmGroup);

  // 5. Left Leg (Pivot at hip: x = -0.5, y = 2.0)
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.5, 2.0, 0);
  const legGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
  const leftLegMesh = new THREE.Mesh(legGeo, plasticMat(colors.leftLeg));
  leftLegMesh.castShadow = true;
  leftLegMesh.position.set(0, -1.0, 0);
  leftLegGroup.add(leftLegMesh);
  root.add(leftLegGroup);

  // 6. Right Leg (Pivot at hip: x = 0.5, y = 2.0)
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.5, 2.0, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, plasticMat(colors.rightLeg));
  rightLegMesh.castShadow = true;
  rightLegMesh.position.set(0, -1.0, 0);
  rightLegGroup.add(rightLegMesh);
  root.add(rightLegGroup);

  // 7. Player Name Tag Billboard above head
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.roundRect(10, 12, 236, 40, 10);
  ctx.fill();
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(playerName, 128, 32);

  const textTexture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: textTexture, depthTest: false });
  const nameBillboard = new THREE.Sprite(spriteMat);
  nameBillboard.scale.set(3, 0.75, 1);
  nameBillboard.position.set(0, 5.8, 0);
  root.add(nameBillboard);

  let walkCycle = 0;

  const animate = (isMoving: boolean, delta: number, speed: number) => {
    if (isMoving) {
      walkCycle += delta * speed * 0.7;
      const angle = Math.sin(walkCycle) * 0.75;
      leftArmGroup.rotation.x = angle;
      rightArmGroup.rotation.x = -angle;
      leftLegGroup.rotation.x = -angle;
      rightLegGroup.rotation.x = angle;
      // Slight torso bob
      torsoMesh.position.y = 3.0 + Math.abs(Math.sin(walkCycle * 2)) * 0.12;
      headMesh.position.y = 4.6 + Math.abs(Math.sin(walkCycle * 2)) * 0.12;
    } else {
      // Idle return
      leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, 0, 8, delta);
      rightArmGroup.rotation.x = THREE.MathUtils.damp(rightArmGroup.rotation.x, 0, 8, delta);
      leftLegGroup.rotation.x = THREE.MathUtils.damp(leftLegGroup.rotation.x, 0, 8, delta);
      rightLegGroup.rotation.x = THREE.MathUtils.damp(rightLegGroup.rotation.x, 0, 8, delta);
      torsoMesh.position.y = 3.0;
      headMesh.position.y = 4.6;
    }
  };

  const resetPose = () => {
    leftArmGroup.rotation.set(0, 0, 0);
    rightArmGroup.rotation.set(0, 0, 0);
    leftLegGroup.rotation.set(0, 0, 0);
    rightLegGroup.rotation.set(0, 0, 0);
    torsoMesh.position.set(0, 3.0, 0);
    headMesh.position.set(0, 4.6, 0);
    walkCycle = 0;
  };

  // Classic Roblox Ragdoll death - parts explode outwards and drop
  const shatter = (scene: THREE.Scene) => {
    const parts = [
      { mesh: headMesh, worldPos: new THREE.Vector3() },
      { mesh: torsoMesh, worldPos: new THREE.Vector3() },
      { mesh: leftArmMesh, worldPos: new THREE.Vector3() },
      { mesh: rightArmMesh, worldPos: new THREE.Vector3() },
      { mesh: leftLegMesh, worldPos: new THREE.Vector3() },
      { mesh: rightLegMesh, worldPos: new THREE.Vector3() },
    ];

    parts.forEach(({ mesh }) => {
      const clone = mesh.clone();
      mesh.getWorldPosition(clone.position);
      mesh.getWorldQuaternion(clone.quaternion);
      scene.add(clone);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 8 + 4,
        (Math.random() - 0.5) * 8
      );
      const rotVel = new THREE.Vector3(
        Math.random() * 6,
        Math.random() * 6,
        Math.random() * 6
      );

      let lifetime = 0;
      const dropInterval = setInterval(() => {
        lifetime += 0.03;
        vel.y -= 18 * 0.03; // gravity
        clone.position.addScaledVector(vel, 0.03);
        clone.rotation.x += rotVel.x * 0.03;
        clone.rotation.y += rotVel.y * 0.03;

        if (clone.position.y < 0.5) {
          clone.position.y = 0.5;
          vel.set(0, 0, 0);
        }

        if (lifetime > 3.0) {
          clearInterval(dropInterval);
          scene.remove(clone);
          if (clone.geometry) clone.geometry.dispose();
        }
      }, 30);
    });
  };

  const dispose = () => {
    torsoGeo.dispose();
    headGeo.dispose();
    armGeo.dispose();
    legGeo.dispose();
    capGeo.dispose();
    visorGeo.dispose();
  };

  return {
    root,
    head: headMesh,
    torso: torsoMesh,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
    nameBillboard,
    animate,
    resetPose,
    shatter,
    dispose,
  };
}
