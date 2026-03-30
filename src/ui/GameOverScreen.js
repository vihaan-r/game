import { EventBus } from '../utils/EventBus.js';

export class GameOverScreen {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'ui-screen';
        this.element.id = 'gameover-screen';
        this.element.style.background = '#880000';
        
        this.element.innerHTML = `
            <h1 style="color:black; text-shadow:none;">YOU DIED</h1>
            <button id="btn-g-menu" style="color:black; border-color:black;">MAIN MENU</button>
        `;
        
        this.container.appendChild(this.element);
        
        this.setupListeners();
    }

    setupListeners() {
        this.element.querySelector('#btn-g-menu').addEventListener('click', () => {
            EventBus.emit('game:mainmenu');
        });
    }

    show() {
        this.element.classList.add('active-screen');
    }

    hide() {
        this.element.classList.remove('active-screen');
    }
}
