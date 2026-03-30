import * as THREE from 'three';
import { GameConfig } from '../constants/GameConfig.js';
import { EventBus } from '../utils/EventBus.js';
import { AudioManager } from '../audio/AudioManager.js';

export class InteractionSystem {
    constructor(camera, scene, inventorySystem) {
        this.camera = camera;
        this.scene = scene;
        this.inventorySystem = inventorySystem;
        this.raycaster = new THREE.Raycaster();
        this.interactables = [];
        this.currentHighlighted = null;
        
        // Setup interaction listener
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE' && this.currentHighlighted) {
                this.interact(this.currentHighlighted);
            }
        });

        EventBus.on('touch:interact', () => {
            if (this.currentHighlighted) {
                this.interact(this.currentHighlighted);
            }
        });
    }

    addInteractable(mesh, type, data = {}) {
        mesh.userData = { type, data, interactable: true };
        this.interactables.push(mesh);
    }

    update() {
        // Raycast from center of screen
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.interactables, false);
        
        if (intersects.length > 0 && intersects[0].distance < GameConfig.INTERACT_DISTANCE) {
            const object = intersects[0].object;
            if (this.currentHighlighted !== object) {
                this.currentHighlighted = object;
                EventBus.emit('hud:prompt', `Interact: ${object.userData.type}`);
            }
        } else {
            if (this.currentHighlighted) {
                this.currentHighlighted = null;
                EventBus.emit('hud:prompt', null);
            }
        }
    }

    interact(object) {
        const { type, data } = object.userData;
        
        switch(type) {
            case 'DOOR':
                this.handleDoor(object, data);
                break;
            case 'DRAWER':
                this.handleDrawer(object, data);
                break;
            case 'ITEM':
                this.handleItem(object, data);
                break;
            case 'LIGHT':
                this.handleLight(object, data);
                break;
            case 'CLOSET':
                this.handleCloset(object, data);
                break;
        }
    }

    handleDoor(object, data) {
        if (data.locked) {
            if (this.inventorySystem.hasItem(data.requiredKey)) {
                data.locked = false;
                EventBus.emit('hud:message', 'Door unlocked.');
                AudioManager.playSound('sfx_door_creak');
                this.animateDoor(object, data);
            } else {
                EventBus.emit('hud:message', 'It is locked.');
            }
        } else {
            AudioManager.playSound('sfx_door_creak');
            this.animateDoor(object, data);
        }
    }

    animateDoor(object, data) {
        data.isOpen = !data.isOpen;
        const targetRotation = data.isOpen ? Math.PI / 2 : 0;
        // Simple instant rotation for now, should be GSAP/lerp
        object.rotation.y = data.baseRotation + targetRotation;
    }

    handleDrawer(object, data) {
        if (!data.isOpen) {
            data.isOpen = true;
            AudioManager.playSound('sfx_drawer_open');
            // Swap texture or translate mesh
            object.position.z += 0.5; // Pull out
            
            if (data.item) {
                EventBus.emit('hud:message', `Found: ${data.item}`);
                this.inventorySystem.addItem(data.item);
                data.item = null; // Empty it
            } else {
                EventBus.emit('hud:message', 'Empty.');
            }
        }
    }

    handleItem(object, data) {
        this.inventorySystem.addItem(data.itemId);
        AudioManager.playSound('sfx_pickup_key');
        object.visible = false;
        object.userData.interactable = false;
        this.currentHighlighted = null;
        EventBus.emit('hud:prompt', null);
    }
    
    handleLight(object, data) {
        data.isOn = !data.isOn;
        data.lightObject.visible = data.isOn;
        object.material.emissiveIntensity = data.isOn ? 1 : 0;
    }
    
    handleCloset(object, data) {
        // Toggle hiding state
        EventBus.emit('player:hide', { closetId: data.id });
    }
}
