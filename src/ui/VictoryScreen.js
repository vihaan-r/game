import { EventBus } from '../utils/EventBus.js';

export class VictoryScreen {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'ui-screen';
        this.element.id = 'victory-screen';
        this.element.style.background = '#000';
        
        this.element.innerHTML = `
            <h1 style="color:white;">YOU ESCAPED</h1>
            <p id="victory-text" style="color:#aaa; font-size:20px; margin-bottom:40px;"></p>
            <button id="btn-v-menu">MAIN MENU</button>
        `;
        
        this.container.appendChild(this.element);
        
        this.setupListeners();
    }

    setupListeners() {
        this.element.querySelector('#btn-v-menu').addEventListener('click', () => {
            EventBus.emit('game:mainmenu');
        });
        
        EventBus.on('game:victory', (data) => {
            const textEl = this.element.querySelector('#victory-text');
            if (data.route === 'FRONT_DOOR') {
                textEl.innerText = "You escaped through the front door. She is still inside.";
            } else if (data.route === 'CAR') {
                textEl.innerText = "You drove away. She watched you leave.";
            } else if (data.route === 'BASEMENT') {
                textEl.innerText = "You crawled out of the darkness. She never followed.";
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
