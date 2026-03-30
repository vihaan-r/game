import * as THREE from 'three';
import { GameConfig } from '../constants/GameConfig.js';
import { EventBus } from '../utils/EventBus.js';
import { AudioManager } from '../audio/AudioManager.js';

export class Ghost {
    constructor(scene, player, difficultyModifiers) {
        this.scene = scene;
        this.player = player;
        this.modifiers = difficultyModifiers;
        
        this.state = 'IDLE';
        this.position = new THREE.Vector3(0, 1, -10); // Starting pos
        this.targetPosition = new THREE.Vector3();
        
        this.speed = GameConfig.GHOST_WANDER_SPEED * this.modifiers.ghostSpeedMult;
        
        // Create mesh (fallback if GLB fails)
        const geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
        const material = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x222222 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        
        // Point light for creepy glow
        this.light = new THREE.PointLight(0xff0000, 0.5, 5);
        this.mesh.add(this.light);
        
        this.stateTimer = 0;
        this.searchDuration = 15 + this.modifiers.searchDurationAdd;
        
        // Waypoints (simplified for now)
        this.waypoints = [
            new THREE.Vector3(0, 1, -10),
            new THREE.Vector3(5, 1, -10),
            new THREE.Vector3(-5, 1, -5)
        ];
        this.currentWaypointIndex = 0;
        
        this.active = this.modifiers.ghostActive;
        this.mesh.visible = this.active;
    }

    update(delta) {
        if (!this.active) return;

        const distToPlayer = this.position.distanceTo(this.player.position);
        
        // Update audio panning
        AudioManager.updateSpatialAudio('sfx_ghost_idle', null, this.position, this.player.position);

        switch(this.state) {
            case 'IDLE':
                this.stateTimer -= delta;
                if (this.stateTimer <= 0) {
                    this.state = 'WANDER';
                    this.pickNextWaypoint();
                }
                break;
                
            case 'WANDER':
                this.speed = GameConfig.GHOST_WANDER_SPEED * this.modifiers.ghostSpeedMult;
                this.moveTowards(this.targetPosition, delta);
                
                if (this.position.distanceTo(this.targetPosition) < 0.5) {
                    this.state = 'IDLE';
                    this.stateTimer = Math.random() * 10 + 5;
                }
                
                // Check noise
                if (this.player.noiseLevel > (0.5 - this.modifiers.noiseThresholdSub) && distToPlayer < GameConfig.GHOST_HEARING_RADIUS) {
                    this.state = 'INVESTIGATE';
                    this.targetPosition.copy(this.player.position);
                }
                
                // Check sight (simplified distance check for now)
                if (distToPlayer < 8 && !this.player.isHiding) {
                    this.state = 'ALERT';
                    this.stateTimer = 0.8;
                    AudioManager.playSound('sfx_ghost_alert');
                }
                break;
                
            case 'INVESTIGATE':
                this.speed = GameConfig.GHOST_INVESTIGATE_SPEED * this.modifiers.ghostSpeedMult;
                this.moveTowards(this.targetPosition, delta);
                
                if (this.position.distanceTo(this.targetPosition) < 1.0) {
                    this.state = 'WANDER';
                }
                
                if (distToPlayer < 8 && !this.player.isHiding) {
                    this.state = 'ALERT';
                    this.stateTimer = 0.8;
                    AudioManager.playSound('sfx_ghost_alert');
                }
                break;
                
            case 'ALERT':
                this.stateTimer -= delta;
                if (this.stateTimer <= 0) {
                    this.state = 'CHASE';
                    AudioManager.playBGM('bgm_chase');
                }
                break;
                
            case 'CHASE':
                this.speed = GameConfig.GHOST_CHASE_SPEED * this.modifiers.ghostSpeedMult;
                this.targetPosition.copy(this.player.position);
                this.moveTowards(this.targetPosition, delta);
                
                if (this.player.isHiding) {
                    this.state = 'SEARCH';
                    this.stateTimer = this.searchDuration;
                    AudioManager.playBGM('bgm_gameplay');
                }
                
                if (distToPlayer < GameConfig.GHOST_CATCH_DISTANCE) {
                    this.state = 'ATTACK';
                    EventBus.emit('game:over', { reason: 'caught' });
                }
                break;
                
            case 'SEARCH':
                this.stateTimer -= delta;
                // Wander near last known pos
                this.speed = GameConfig.GHOST_INVESTIGATE_SPEED;
                
                if (this.stateTimer <= 0) {
                    this.state = 'WANDER';
                }
                
                if (!this.player.isHiding && distToPlayer < 8) {
                    this.state = 'CHASE';
                    AudioManager.playBGM('bgm_chase');
                }
                break;
                
            case 'ATTACK':
                // Handled by game over state
                break;
        }
        
        // Update vignette based on distance
        if (distToPlayer < 15) {
            const intensity = 1.0 - (distToPlayer / 15);
            EventBus.emit('hud:danger', intensity);
        } else {
            EventBus.emit('hud:danger', 0);
        }
    }

    moveTowards(target, delta) {
        const dir = new THREE.Vector3().subVectors(target, this.position).normalize();
        // Ignore Y for simple movement
        dir.y = 0;
        this.position.add(dir.multiplyScalar(this.speed * delta));
        this.mesh.position.copy(this.position);
        this.mesh.lookAt(target.x, this.mesh.position.y, target.z);
    }

    pickNextWaypoint() {
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
        this.targetPosition.copy(this.waypoints[this.currentWaypointIndex]);
    }
}
