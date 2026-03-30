import { EventBus } from '../utils/EventBus.js';

export class PauseMenu {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'ui-screen';
        this.element.id = 'pause-menu';
        this.element.style.background = 'rgba(0,0,0,0.8)';
        
        this.element.innerHTML = `
            <h1>PAUSED</h1>
            <button id="btn-resume">RESUME</button>
            <button id="btn-quit">QUIT TO MENU</button>
        `;
        
        this.container.appendChild(this.element);
        
        this.setupListeners();
    }

    setupListeners() {
        this.element.querySelector('#btn-resume').addEventListener('click', () => {
            EventBus.emit('game:resume');
        });
        
        this.element.querySelector('#btn-quit').addEventListener('click', () => {
            EventBus.emit('game:mainmenu');
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                // Toggle pause logic is handled by GameManager, but we can emit from here if needed
                // EventBus.emit('game:pause');
            }
        });
    }

    show() {
        this.element.classList.add('active-screen');
    }

    hide() {
        this.element.classList.remove('active-screen');
    }
}
