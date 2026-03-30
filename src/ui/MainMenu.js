import { EventBus } from '../utils/EventBus.js';
import { GameConfig } from '../constants/GameConfig.js';

export class MainMenu {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'ui-screen';
        this.element.id = 'main-menu';
        
        this.element.innerHTML = `
            <h1>MARA</h1>
            <button id="btn-normal">NORMAL</button>
            <button id="btn-extreme">EXTREME</button>
            <button id="btn-practice">PRACTICE</button>
            <button id="btn-settings">SETTINGS</button>
            <button id="btn-about">ABOUT</button>
            
            <div id="settings-panel" style="display:none; background:rgba(0,0,0,0.8); padding:20px; border:1px solid red; margin-top:20px;">
                <h2 style="color:red;">SETTINGS</h2>
                <label style="color:white;">Master Volume: <input type="range" id="vol-master" min="0" max="1" step="0.1" value="1"></label><br>
                <label style="color:white;">Music Volume: <input type="range" id="vol-music" min="0" max="1" step="0.1" value="1"></label><br>
                <label style="color:white;">SFX Volume: <input type="range" id="vol-sfx" min="0" max="1" step="0.1" value="1"></label><br>
                <button id="btn-close-settings" style="font-size:16px; padding:5px;">CLOSE</button>
            </div>
        `;
        
        this.container.appendChild(this.element);
        
        this.setupListeners();
    }

    setupListeners() {
        this.element.querySelector('#btn-normal').addEventListener('click', () => {
            EventBus.emit('game:start', { difficulty: GameConfig.DIFF_NORMAL });
        });
        
        this.element.querySelector('#btn-extreme').addEventListener('click', () => {
            EventBus.emit('game:start', { difficulty: GameConfig.DIFF_EXTREME });
        });
        
        this.element.querySelector('#btn-practice').addEventListener('click', () => {
            EventBus.emit('game:start', { difficulty: GameConfig.DIFF_PRACTICE });
        });
        
        const settingsPanel = this.element.querySelector('#settings-panel');
        this.element.querySelector('#btn-settings').addEventListener('click', () => {
            settingsPanel.style.display = 'block';
        });
        
        this.element.querySelector('#btn-close-settings').addEventListener('click', () => {
            settingsPanel.style.display = 'none';
            // Save settings
            const settings = {
                masterVolume: parseFloat(this.element.querySelector('#vol-master').value),
                musicVolume: parseFloat(this.element.querySelector('#vol-music').value),
                sfxVolume: parseFloat(this.element.querySelector('#vol-sfx').value)
            };
            localStorage.setItem('mara_settings', JSON.stringify(settings));
            EventBus.emit('settings:update', settings);
        });
    }

    show() {
        this.element.classList.add('active-screen');
    }

    hide() {
        this.element.classList.remove('active-screen');
    }
}
