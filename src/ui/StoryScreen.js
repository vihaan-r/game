import { EventBus } from '../utils/EventBus.js';

export class StoryScreen {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'ui-screen';
        this.element.id = 'story-screen';
        this.element.style.background = 'rgba(0,0,0,0.9)';
        
        this.element.innerHTML = `
            <div id="story-content" style="color:white; font-size:24px; max-width:80%; text-align:center; line-height:1.5;"></div>
            <button id="btn-close-story" style="position:absolute; bottom:20px;">CLOSE</button>
        `;
        
        this.container.appendChild(this.element);
        
        this.setupListeners();
    }

    setupListeners() {
        this.element.querySelector('#btn-close-story').addEventListener('click', () => {
            this.hide();
            // Resume game if it was paused for story
            EventBus.emit('game:resume');
        });
        
        EventBus.on('ui:show_note', (text) => {
            this.element.querySelector('#story-content').innerText = text;
            this.show();
            EventBus.emit('game:pause'); // Pause game while reading
        });
    }

    show() {
        this.element.classList.add('active-screen');
    }

    hide() {
        this.element.classList.remove('active-screen');
    }
}
