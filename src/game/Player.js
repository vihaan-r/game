import * as THREE from 'three';
import { GameConfig } from '../constants/GameConfig.js';
import { EventBus } from '../utils/EventBus.js';
import { AudioManager } from '../audio/AudioManager.js';

export class Player {
    constructor(camera, collisionManager) {
        this.camera = camera;
        this.collisionManager = collisionManager;
        
        this.position = new THREE.Vector3(0, GameConfig.PLAYER_HEIGHT, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.stamina = GameConfig.MAX_STAMINA;
        this.isSprinting = false;
        this.isCrouching = false;
        this.isHiding = false;
        this.noiseLevel = GameConfig.NOISE_STATIONARY;
        
        // Flashlight
        this.flashlight = new THREE.SpotLight(0xffffff, 1.5, 20, Math.PI / 6, 0.5, 1);
        this.flashlight.position.set(0, 0, 0);
        this.flashlight.target.position.set(0, 0, -1);
        this.camera.add(this.flashlight);
        this.camera.add(this.flashlight.target);
        this.flashlightOn = false;
        this.flashlightBattery = 100;
        
        // Controls
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Head bobbing
        this.bobTime = 0;
        
        this.setupControls();
    }

    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (this.isHiding) return;
            switch(e.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'ShiftLeft': this.isSprinting = true; break;
                case 'KeyC': this.toggleCrouch(); break;
                case 'KeyF': this.toggleFlashlight(); break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'ShiftLeft': this.isSprinting = false; break;
            }
        });

        // Mouse Look (Pointer Lock)
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body && !this.isHiding) {
                this.camera.rotation.y -= e.movementX * 0.002;
                this.camera.rotation.x -= e.movementY * 0.002;
                this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
            }
        });

        // Mobile Joystick (handled via EventBus from HUD)
        EventBus.on('joystick:move', (data) => {
            if (this.isHiding) return;
            // data.x, data.y (-1 to 1)
            this.moveForward = data.y < -0.2;
            this.moveBackward = data.y > 0.2;
            this.moveLeft = data.x < -0.2;
            this.moveRight = data.x > 0.2;
            
            // Auto sprint if pushed to edge
            this.isSprinting = Math.sqrt(data.x*data.x + data.y*data.y) > 0.8;
        });

        EventBus.on('joystick:end', () => {
            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.isSprinting = false;
        });

        EventBus.on('touch:look', (data) => {
            if (this.isHiding) return;
            this.camera.rotation.y -= data.dx * 0.005;
            this.camera.rotation.x -= data.dy * 0.005;
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        });
    }

    toggleCrouch() {
        this.isCrouching = !this.isCrouching;
        const targetHeight = this.isCrouching ? GameConfig.PLAYER_CROUCH_HEIGHT : GameConfig.PLAYER_HEIGHT;
        // Simple lerp in update loop handles the transition
    }

    toggleFlashlight() {
        if (this.flashlightBattery > 0) {
            this.flashlightOn = !this.flashlightOn;
            this.flashlight.visible = this.flashlightOn;
        }
    }

    update(delta) {
        if (this.isHiding) return;

        // Stamina management
        if (this.isSprinting && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)) {
            this.stamina -= GameConfig.STAMINA_DRAIN * delta;
            if (this.stamina <= 0) {
                this.stamina = 0;
                this.isSprinting = false;
            }
        } else {
            this.stamina += GameConfig.STAMINA_REGEN * delta;
            if (this.stamina > GameConfig.MAX_STAMINA) this.stamina = GameConfig.MAX_STAMINA;
        }

        // Determine speed and noise
        let currentSpeed = GameConfig.PLAYER_WALK_SPEED;
        this.noiseLevel = GameConfig.NOISE_STATIONARY;

        if (this.isCrouching) {
            currentSpeed = GameConfig.PLAYER_CROUCH_SPEED;
            this.noiseLevel = GameConfig.NOISE_CROUCH;
        } else if (this.isSprinting && this.stamina > 0) {
            currentSpeed = GameConfig.PLAYER_SPRINT_SPEED;
            this.noiseLevel = GameConfig.NOISE_SPRINT;
        } else if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            this.noiseLevel = GameConfig.NOISE_WALK;
        }

        // Movement vector
        this.velocity.set(0, 0, 0);
        if (this.moveForward) this.velocity.z -= 1;
        if (this.moveBackward) this.velocity.z += 1;
        if (this.moveLeft) this.velocity.x -= 1;
        if (this.moveRight) this.velocity.x += 1;

        this.velocity.normalize().multiplyScalar(currentSpeed * delta);
        
        // Apply camera rotation to movement
        this.velocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);

        // Collision detection
        const oldX = this.position.x;
        const oldZ = this.position.z;
        const newX = oldX + this.velocity.x;
        const newZ = oldZ + this.velocity.z;

        const resolved = this.collisionManager.resolveCollision(oldX, oldZ, newX, newZ, GameConfig.PLAYER_RADIUS);
        
        this.position.x = resolved.x;
        this.position.z = resolved.z;

        // Head bobbing
        if (this.velocity.lengthSq() > 0.0001) {
            this.bobTime += delta * (this.isSprinting ? 15 : 10);
            const bobOffset = Math.sin(this.bobTime) * 0.04;
            
            // Footstep sounds
            if (Math.sin(this.bobTime) > 0.9 && Math.sin(this.bobTime - delta * 10) <= 0.9) {
                AudioManager.playSound('sfx_footstep_wood'); // Simplified, should check floor material
            }
            
            // Apply height
            const targetHeight = this.isCrouching ? GameConfig.PLAYER_CROUCH_HEIGHT : GameConfig.PLAYER_HEIGHT;
            this.position.y = THREE.MathUtils.lerp(this.position.y, targetHeight + bobOffset, 0.1);
        } else {
            const targetHeight = this.isCrouching ? GameConfig.PLAYER_CROUCH_HEIGHT : GameConfig.PLAYER_HEIGHT;
            this.position.y = THREE.MathUtils.lerp(this.position.y, targetHeight, 0.1);
        }

        this.camera.position.copy(this.position);

        // Flashlight battery
        if (this.flashlightOn) {
            this.flashlightBattery -= delta * 0.5; // Drain rate
            if (this.flashlightBattery <= 0) {
                this.flashlightBattery = 0;
                this.flashlightOn = false;
                this.flashlight.visible = false;
            }
            EventBus.emit('hud:battery', this.flashlightBattery);
        }
        
        EventBus.emit('hud:stamina', this.stamina);
    }
}
