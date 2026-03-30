import { GameConfig } from '../constants/GameConfig.js';
import { EventBus } from '../utils/EventBus.js';

export class EscapeSystem {
    constructor(inventorySystem) {
        this.inventorySystem = inventorySystem;
        
        EventBus.on('interact:escape', (data) => {
            this.tryEscape(data.route);
        });
    }

    tryEscape(route) {
        switch(route) {
            case 'FRONT_DOOR':
                if (this.inventorySystem.hasItem(GameConfig.ITEM_KEY_FRONT_DOOR)) {
                    this.triggerVictory('FRONT_DOOR');
                } else {
                    EventBus.emit('hud:message', 'The front door is locked. I need a key.');
                }
                break;
            case 'CAR':
                if (this.inventorySystem.hasItem(GameConfig.ITEM_KEY_CAR)) {
                    this.triggerVictory('CAR');
                } else {
                    EventBus.emit('hud:message', 'I need the car keys.');
                }
                break;
            case 'BASEMENT':
                if (this.inventorySystem.hasItem(GameConfig.ITEM_KEY_BASEMENT)) {
                    this.triggerVictory('BASEMENT');
                } else {
                    EventBus.emit('hud:message', 'The hatch is padlocked.');
                }
                break;
        }
    }

    triggerVictory(route) {
        // Save to ghost memory
        const memory = JSON.parse(localStorage.getItem('mara_memory') || '{"mara_escape_routes_used":[]}');
        if (!memory.mara_escape_routes_used.includes(route)) {
            memory.mara_escape_routes_used.push(route);
        }
        localStorage.setItem('mara_memory', JSON.stringify(memory));
        
        EventBus.emit('game:victory', { route });
    }
}
