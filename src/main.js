import { GameManager } from './game/GameManager.js';
import { MainMenu } from './ui/MainMenu.js';
import { HUD } from './ui/HUD.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { VictoryScreen } from './ui/VictoryScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { StoryScreen } from './ui/StoryScreen.js';
import { EventBus } from './utils/EventBus.js';
import { GameConfig } from './constants/GameConfig.js';
import { AudioManager } from './audio/AudioManager.js';

class App {
    constructor() {
        this.uiLayer = document.getElementById('ui-layer');
        
        // Initialize UI
        this.mainMenu = new MainMenu(this.uiLayer);
        this.hud = new HUD(this.uiLayer);
        this.pauseMenu = new PauseMenu(this.uiLayer);
        this.victoryScreen = new VictoryScreen(this.uiLayer);
        this.gameOverScreen = new GameOverScreen(this.uiLayer);
        this.storyScreen = new StoryScreen(this.uiLayer);
        
        // Initialize Audio
        AudioManager.init();
        
        // Preload essential sounds (placeholders will be generated if missing)
        AudioManager.loadSound('bgm_menu', '/assets/audio/bgm_menu.mp3', true, true);
        AudioManager.loadSound('bgm_gameplay', '/assets/audio/bgm_gameplay.mp3', true, true);
        AudioManager.loadSound('bgm_chase', '/assets/audio/bgm_chase.mp3', true, true);
        AudioManager.loadSound('sfx_door_creak', '/assets/audio/sfx_door_creak.mp3');
        AudioManager.loadSound('sfx_door_slam', '/assets/audio/sfx_door_slam.mp3');
        AudioManager.loadSound('sfx_drawer_open', '/assets/audio/sfx_drawer_open.mp3');
        AudioManager.loadSound('sfx_pickup_key', '/assets/audio/sfx_pickup_key.mp3');
        AudioManager.loadSound('sfx_ghost_idle', '/assets/audio/sfx_ghost_idle.mp3', false, true, true);
        AudioManager.loadSound('sfx_ghost_alert', '/assets/audio/sfx_ghost_alert.mp3');
        AudioManager.loadSound('sfx_footstep_wood', '/assets/audio/sfx_footstep_wood.mp3');
        AudioManager.loadSound('sfx_victory', '/assets/audio/sfx_victory.mp3');
        AudioManager.loadSound('sfx_gameover', '/assets/audio/sfx_gameover.mp3');
        
        // Initialize Game
        this.gameManager = new GameManager();
        
        this.setupStateHandling();
        
        // Start with audio unlock screen for mobile
        this.showAudioUnlock();
    }

    showAudioUnlock() {
        const unlockDiv = document.createElement('div');
        unlockDiv.className = 'ui-screen active-screen';
        unlockDiv.style.background = '#000';
        unlockDiv.innerHTML = `<h1 style="color:white; font-size:32px; cursor:pointer;">TAP TO BEGIN</h1>`;
        this.uiLayer.appendChild(unlockDiv);
        
        unlockDiv.addEventListener('click', () => {
            AudioManager.unlockAudio();
            unlockDiv.remove();
            EventBus.emit('game:mainmenu');
        });
    }

    setupStateHandling() {
        EventBus.on('game:mainmenu', () => {
            this.hideAllUI();
            this.mainMenu.show();
        });
        
        EventBus.on('game:start', () => {
            this.hideAllUI();
            this.hud.show();
        });
        
        EventBus.on('game:pause', () => {
            this.pauseMenu.show();
        });
        
        EventBus.on('game:resume', () => {
            this.pauseMenu.hide();
        });
        
        EventBus.on('game:victory', () => {
            this.hideAllUI();
            this.victoryScreen.show();
        });
        
        EventBus.on('game:over', () => {
            this.hideAllUI();
            this.gameOverScreen.show();
        });
    }

    hideAllUI() {
        this.mainMenu.hide();
        this.hud.hide();
        this.pauseMenu.hide();
        this.victoryScreen.hide();
        this.gameOverScreen.hide();
        this.storyScreen.hide();
    }
}

// Start app
window.onload = () => {
    new App();
};
