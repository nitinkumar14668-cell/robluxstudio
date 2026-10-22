import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { RobloxInstance } from '../types/roblox';
import { soundEngine } from './audio';

export interface PhysicsBodyBinding {
  instanceId: string;
  body: CANNON.Body;
  mesh: THREE.Object3D;
  isAnchored: boolean;
  shapeType: string;
}

export class RobloxPhysicsEngine {
  public world: CANNON.World;
  public defaultMaterial: CANNON.Material;
  public playerMaterial: CANNON.Material;
  public bouncyMaterial: CANNON.Material;
  public slipperyMaterial: CANNON.Material;

  public playerBody: CANNON.Body | null = null;
  private bodiesMap: Map<string, PhysicsBodyBinding> = new Map();
  private lastStepTime: number = 0;
  public gravityY: number = -28;
  public isSimulationRunning: boolean = false;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, this.gravityY, 0),
    });

    // Default solver iterations for stable stacking
    this.world.defaultContactMaterial.contactEquationStiffness = 1e7;
    this.world.defaultContactMaterial.contactEquationRelaxation = 3;

    this.defaultMaterial = new CANNON.Material('default');
    this.playerMaterial = new CANNON.Material('player');
    this.bouncyMaterial = new CANNON.Material('bouncy');
    this.slipperyMaterial = new CANNON.Material('slippery');

    // Contact between Default parts
    const defaultContact = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.35,
        restitution: 0.2,
      }
    );
    this.world.addContactMaterial(defaultContact);

    // Contact with player: low friction so avatar doesn't get stuck on walls
    const playerContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.defaultMaterial,
      {
        friction: 0.05,
        restitution: 0.0,
      }
    );
    this.world.addContactMaterial(playerContact);

    // Contact with bouncy trampolines
    const bounceContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.bouncyMaterial,
      {
        friction: 0.2,
        restitution: 0.95,
      }
    );
    this.world.addContactMaterial(bounceContact);

    const partBounceContact = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.bouncyMaterial,
      {
        friction: 0.2,
        restitution: 0.85,
      }
    );
    this.world.addContactMaterial(partBounceContact);
  }

  setGravity(y: number) {
    this.gravityY = y;
    this.world.gravity.set(0, y, 0);
  }

  // Create or update a rigid body for a RobloxInstance
  syncInstance(instance: RobloxInstance, mesh: THREE.Object3D) {
    const existing = this.bodiesMap.get(instance.id);
    if (existing) {
      // If anchored state or size changed, recreate body
      if (existing.isAnchored !== instance.anchored) {
        this.removeInstance(instance.id);
      } else {
        // If static and not in simulation, keep synced with mesh position
        if (instance.anchored && !this.isSimulationRunning) {
          existing.body.position.set(instance.position.x, instance.position.y, instance.position.z);
          const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(instance.rotation.x),
            THREE.MathUtils.degToRad(instance.rotation.y),
            THREE.MathUtils.degToRad(instance.rotation.z)
          );
          const quat = new THREE.Quaternion().setFromEuler(euler);
          existing.body.quaternion.set(quat.x, quat.y, quat.z, quat.w);
        }
        return;
      }
    }

    if (!instance.canCollide) {
      return;
    }

    let shape: CANNON.Shape;
    const sx = Math.max(0.1, instance.size.x);
    const sy = Math.max(0.1, instance.size.y);
    const sz = Math.max(0.1, instance.size.z);

    if (instance.shape === 'Sphere') {
      shape = new CANNON.Sphere(Math.max(sx, sy, sz) / 2);
    } else if (instance.shape === 'Cylinder') {
      shape = new CANNON.Cylinder(sx / 2, sx / 2, sy, 16);
    } else {
      shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
    }

    const isAnchored = instance.anchored;
    // Calculate realistic mass for unanchored dynamic objects
    const volume = sx * sy * sz;
    const mass = isAnchored ? 0 : Math.max(1, volume * 0.7);

    let mat = this.defaultMaterial;
    if (instance.isJumpPad) mat = this.bouncyMaterial;
    else if (instance.material === 'Ice') mat = this.slipperyMaterial;

    const body = new CANNON.Body({
      mass,
      shape,
      material: mat,
      position: new CANNON.Vec3(instance.position.x, instance.position.y, instance.position.z),
      linearDamping: 0.05,
      angularDamping: 0.1,
    });

    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(instance.rotation.x),
      THREE.MathUtils.degToRad(instance.rotation.y),
      THREE.MathUtils.degToRad(instance.rotation.z)
    );
    const quat = new THREE.Quaternion().setFromEuler(euler);
    body.quaternion.set(quat.x, quat.y, quat.z, quat.w);

    // Collision sound impact listener for dynamic bodies
    if (!isAnchored) {
      body.addEventListener('collide', (event: { contact: { getImpactVelocityAlongNormal: () => number } }) => {
        if (!this.isSimulationRunning) return;
        try {
          const impactVel = Math.abs(event.contact.getImpactVelocityAlongNormal());
          if (impactVel > 2.5) {
            soundEngine.playImpact(impactVel, instance.material);
          }
        } catch {
          // Ignored
        }
      });
    }

    this.world.addBody(body);
    this.bodiesMap.set(instance.id, {
      instanceId: instance.id,
      body,
      mesh,
      isAnchored,
      shapeType: instance.shape || 'Block',
    });
  }

  removeInstance(id: string) {
    const binding = this.bodiesMap.get(id);
    if (binding) {
      this.world.removeBody(binding.body);
      this.bodiesMap.delete(id);
    }
  }

  // Setup Player Avatar Rigid Body
  setupPlayerBody(initialPos: THREE.Vector3): CANNON.Body {
    if (this.playerBody) {
      this.world.removeBody(this.playerBody);
    }

    // Realistic avatar compound capsule / cylinder
    const radius = 0.9;
    const height = 4.0;
    const sphereShape = new CANNON.Sphere(radius);

    const body = new CANNON.Body({
      mass: 65, // Standard player avatar mass in kg
      material: this.playerMaterial,
      position: new CANNON.Vec3(initialPos.x, initialPos.y + height / 2, initialPos.z),
      fixedRotation: true, // Keep avatar upright
      linearDamping: 0.1,
    });

    // Compound shapes for smooth floor stepping
    body.addShape(sphereShape, new CANNON.Vec3(0, -height / 2 + radius, 0));
    body.addShape(sphereShape, new CANNON.Vec3(0, height / 2 - radius, 0));
    body.addShape(new CANNON.Cylinder(radius, radius, height - radius * 2, 8));

    this.world.addBody(body);
    this.playerBody = body;
    return body;
  }

  removePlayerBody() {
    if (this.playerBody) {
      this.world.removeBody(this.playerBody);
      this.playerBody = null;
    }
  }

  // Apply outward blast impulse from a center point (Explosive force)
  applyExplosion(center: THREE.Vector3, force: number = 300, radius: number = 25) {
    this.bodiesMap.forEach((binding) => {
      if (!binding.isAnchored) {
        const bp = binding.body.position;
        const diff = new CANNON.Vec3(bp.x - center.x, bp.y - center.y, bp.z - center.z);
        const dist = diff.length();
        if (dist > 0.1 && dist < radius) {
          diff.normalize();
          const strength = (1 - dist / radius) * force;
          binding.body.applyImpulse(
            new CANNON.Vec3(diff.x * strength, (diff.y + 0.4) * strength, diff.z * strength),
            bp
          );
        }
      }
    });
  }

  // Step physics world and update meshes
  step(deltaTime: number) {
    const fixedTimeStep = 1 / 60;
    const dt = Math.min(deltaTime, 0.1);
    this.world.step(fixedTimeStep, dt, 3);

    // Sync dynamic rigid bodies to Three.js meshes
    this.bodiesMap.forEach((binding) => {
      if (!binding.isAnchored && binding.mesh) {
        binding.mesh.position.set(
          binding.body.position.x,
          binding.body.position.y,
          binding.body.position.z
        );
        binding.mesh.quaternion.set(
          binding.body.quaternion.x,
          binding.body.quaternion.y,
          binding.body.quaternion.z,
          binding.body.quaternion.w
        );
      }
    });
  }

  clear() {
    this.bodiesMap.forEach((b) => this.world.removeBody(b.body));
    this.bodiesMap.clear();
    if (this.playerBody) {
      this.world.removeBody(this.playerBody);
      this.playerBody = null;
    }
  }
}

export const physicsEngine = new RobloxPhysicsEngine();
