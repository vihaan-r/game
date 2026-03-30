import * as THREE from 'three';
import { GameConfig } from '../constants/GameConfig.js';
import { EventBus } from '../utils/EventBus.js';
import { Player } from './Player.js';
import { Ghost } from './Ghost.js';
import { SceneBuilder } from './SceneBuilder.js';
import { InteractionSystem } from './InteractionSystem.js';
import { InventorySystem } from './InventorySystem.js';
import { EscapeSystem } from './EscapeSystem.js';
import { StorySystem } from './StorySystem.js';
import { CollisionManager } from '../physics/CollisionManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { DifficultyManager } from './DifficultyManager.js';

export class GameManager {
    constructor() {
        this.state = GameConfig.STATE_LOADING;
        
        // Three.js setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.05);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile() });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Systems
        this.collisionManager = new CollisionManager();
        this.inventorySystem = new InventorySystem();
        this.escapeSystem = new EscapeSystem(this.inventorySystem);
        this.storySystem = new StorySystem();
        this.difficultyManager = new DifficultyManager();
        this.interactionSystem = new InteractionSystem(this.camera, this.scene, this.inventorySystem);
        this.sceneBuilder = new SceneBuilder(this.scene, this.collisionManager, this.interactionSystem);
        
        // Entities
        this.player = new Player(this.camera, this.collisionManager);
        this.ghost = null; // Initialized on game start
        
        this.clock = new THREE.Clock();
        
        this.setupEvents();
        
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    setupEvents() {
        EventBus.on('game:start', (data) => {
            this.difficultyManager.setDifficulty(data.difficulty);
            this.startGame();
        });
        
        EventBus.on('game:pause', () => {
            if (this.state === GameConfig.STATE_PLAYING) {
                this.state = GameConfig.STATE_PAUSED;
                document.exitPointerLock();
            }
        });
        
        EventBus.on('game:resume', () => {
            if (this.state === GameConfig.STATE_PAUSED) {
                this.state = GameConfig.STATE_PLAYING;
                if (!this.isMobile()) {
                    document.body.requestPointerLock();
                }
            }
        });
        
        EventBus.on('game:victory', (data) => {
            this.state = GameConfig.STATE_VICTORY;
            document.exitPointerLock();
            AudioManager.playBGM('sfx_victory'); // Assuming victory is a music track or long SFX
        });
        
        EventBus.on('game:over', (data) => {
            this.state = GameConfig.STATE_GAME_OVER;
            document.exitPointerLock();
            AudioManager.playSound('sfx_gameover');
        });
        
        EventBus.on('game:mainmenu', () => {
            this.state = GameConfig.STATE_MAIN_MENU;
            document.exitPointerLock();
            AudioManager.playBGM('bgm_menu');
        });
    }

    startGame() {
        // Reset state
        this.inventorySystem.clear();
        this.player.position.set(0, GameConfig.PLAYER_HEIGHT, 0);
        this.player.stamina = GameConfig.MAX_STAMINA;
        this.player.flashlightBattery = 100;
        
        // Build level
        this.sceneBuilder.buildHouse();
        
        // Spawn ghost
        if (this.ghost) {
            this.scene.remove(this.ghost.mesh);
        }
        this.ghost = new Ghost(this.scene, this.player, this.difficultyManager.getModifiers());
        
        this.state = GameConfig.STATE_PLAYING;
        
        if (!this.isMobile()) {
            document.body.requestPointerLock();
        }
        
        AudioManager.playBGM('bgm_gameplay');
        this.clock.start();
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta to prevent huge jumps
        
        if (this.state === GameConfig.STATE_PLAYING) {
            this.player.update(delta);
            if (this.ghost) this.ghost.update(delta);
            this.interactionSystem.update();
            
            this.renderer.render(this.scene, this.camera);
        } else if (this.state === GameConfig.STATE_MAIN_MENU) {
            // Render a slow panning background for menu
            this.camera.rotation.y += delta * 0.05;
            this.renderer.render(this.scene, this.camera);
        }
    }
}
