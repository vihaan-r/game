import { EventBus } from '../utils/EventBus.js';

export class InventorySystem {
    constructor() {
        this.items = [];
        this.maxSlots = 5;
        
        EventBus.on('inventory:add', (item) => this.addItem(item));
        EventBus.on('inventory:remove', (item) => this.removeItem(item));
    }

    addItem(item) {
        if (this.items.length < this.maxSlots) {
            this.items.push(item);
            EventBus.emit('hud:inventory_update', this.items);
            return true;
        }
        EventBus.emit('hud:message', 'Inventory full!');
        return false;
    }

    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            EventBus.emit('hud:inventory_update', this.items);
            return true;
        }
        return false;
    }

    hasItem(item) {
        return this.items.includes(item);
    }
    
    clear() {
        this.items = [];
        EventBus.emit('hud:inventory_update', this.items);
    }
}
