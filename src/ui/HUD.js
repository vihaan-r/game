import { EventBus } from '../utils/EventBus.js';

export class HUD {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'ui-screen';
        this.element.id = 'hud';
        this.element.style.pointerEvents = 'none'; // Let clicks pass through to game
        
        this.element.innerHTML = `
            <div id="blood-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:radial-gradient(circle, transparent 50%, rgba(255,0,0,0) 100%); transition: background 0.2s;"></div>
            
            <div style="position:absolute; top:20px; left:20px; color:white; font-size:18px;">
                Battery: <span id="battery-val">100</span>%
            </div>
            <div style="position:absolute; top:20px; right:20px; color:white; font-size:18px;">
                Stamina: <span id="stamina-val">100</span>
            </div>
            
            <div id="interact-prompt" style="position:absolute; bottom:20%; left:50%; transform:translateX(-50%); color:white; font-size:24px; text-shadow:0 0 5px black; display:none;">
                Press E to Interact
            </div>
            
            <div id="message-toast" style="position:absolute; top:10%; left:50%; transform:translateX(-50%); color:red; font-size:20px; opacity:0; transition: opacity 0.5s;">
                Message
            </div>
            
            <div id="inventory-display" style="position:absolute; bottom:20px; right:20px; display:flex; gap:10px;">
                <!-- Items go here -->
            </div>
            
            <!-- Mobile Joystick Area -->
            <div id="joystick-area" style="position:absolute; bottom:20px; left:20px; width:150px; height:150px; background:rgba(255,255,255,0.1); border-radius:50%; display:none; pointer-events:auto;">
                <div id="joystick-knob" style="position:absolute; top:50px; left:50px; width:50px; height:50px; background:rgba(255,255,255,0.5); border-radius:50%;"></div>
            </div>
        `;
        
        this.container.appendChild(this.element);
        
        this.batteryEl = this.element.querySelector('#battery-val');
        this.staminaEl = this.element.querySelector('#stamina-val');
        this.promptEl = this.element.querySelector('#interact-prompt');
        this.messageEl = this.element.querySelector('#message-toast');
        this.bloodEl = this.element.querySelector('#blood-overlay');
        this.inventoryEl = this.element.querySelector('#inventory-display');
        
        this.setupListeners();
        this.setupMobileControls();
    }

    setupListeners() {
        EventBus.on('hud:battery', (val) => {
            this.batteryEl.innerText = Math.floor(val);
        });
        
        EventBus.on('hud:stamina', (val) => {
            this.staminaEl.innerText = Math.floor(val);
        });
        
        EventBus.on('hud:prompt', (text) => {
            if (text) {
                this.promptEl.innerText = text;
                this.promptEl.style.display = 'block';
            } else {
                this.promptEl.style.display = 'none';
            }
        });
        
        EventBus.on('hud:message', (text) => {
            this.messageEl.innerText = text;
            this.messageEl.style.opacity = 1;
            setTimeout(() => {
                this.messageEl.style.opacity = 0;
            }, 3000);
        });
        
        EventBus.on('hud:danger', (intensity) => {
            this.bloodEl.style.background = `radial-gradient(circle, transparent 50%, rgba(255,0,0,${intensity * 0.8}) 100%)`;
        });
        
        EventBus.on('hud:inventory_update', (items) => {
            this.inventoryEl.innerHTML = '';
            items.forEach(item => {
                const div = document.createElement('div');
                div.style.width = '40px';
                div.style.height = '40px';
                div.style.border = '1px solid white';
                div.style.display = 'flex';
                div.style.justifyContent = 'center';
                div.style.alignItems = 'center';
                div.style.color = 'white';
                div.style.fontSize = '10px';
                div.innerText = item.replace('KEY_', '');
                this.inventoryEl.appendChild(div);
            });
        });
    }

    setupMobileControls() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) return;
        
        const joystickArea = this.element.querySelector('#joystick-area');
        const joystickKnob = this.element.querySelector('#joystick-knob');
        joystickArea.style.display = 'block';
        
        let isDragging = false;
        let centerX = 75;
        let centerY = 75;
        
        joystickArea.addEventListener('touchstart', (e) => {
            isDragging = true;
            this.updateJoystick(e.touches[0], joystickArea, joystickKnob, centerX, centerY);
        });
        
        joystickArea.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            this.updateJoystick(e.touches[0], joystickArea, joystickKnob, centerX, centerY);
        });
        
        joystickArea.addEventListener('touchend', () => {
            isDragging = false;
            joystickKnob.style.transform = `translate(0px, 0px)`;
            EventBus.emit('joystick:end');
        });
        
        // Right side screen for look
        document.addEventListener('touchmove', (e) => {
            if (e.touches[0].clientX > window.innerWidth / 2 && !isDragging) {
                // Simplified touch look
                if (this.lastTouchX !== undefined) {
                    const dx = e.touches[0].clientX - this.lastTouchX;
                    const dy = e.touches[0].clientY - this.lastTouchY;
                    EventBus.emit('touch:look', { dx, dy });
                }
                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchend', () => {
            this.lastTouchX = undefined;
            this.lastTouchY = undefined;
        });
    }

    updateJoystick(touch, area, knob, cx, cy) {
        const rect = area.getBoundingClientRect();
        let x = touch.clientX - rect.left - cx;
        let y = touch.clientY - rect.top - cy;
        
        const dist = Math.sqrt(x*x + y*y);
        const maxDist = 50;
        
        if (dist > maxDist) {
            x = (x / dist) * maxDist;
            y = (y / dist) * maxDist;
        }
        
        knob.style.transform = `translate(${x}px, ${y}px)`;
        
        EventBus.emit('joystick:move', { x: x / maxDist, y: y / maxDist });
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }
}
