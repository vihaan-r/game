import * as THREE from 'three';
import { assetLoader } from '../utils/AssetLoader.js';
import { RandomSeed } from '../utils/RandomSeed.js';
import { GameConfig } from '../constants/GameConfig.js';

export class SceneBuilder {
    constructor(scene, collisionManager, interactionSystem) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        this.interactionSystem = interactionSystem;
        this.rng = new RandomSeed();
        
        // Global ambient light (very dark)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        this.scene.add(ambientLight);
    }

    buildHouse() {
        // Clear previous
        this.collisionManager.clear();
        
        // Basic layout (simplified for brevity, a real game would load a level map or generate procedurally)
        this.createRoom('Living Room', 0, 0, 10, 10, 'wall_living_room', 'floor_wood');
        this.createRoom('Kitchen', 10, 0, 8, 8, 'wall_kitchen', 'floor_tile');
        this.createRoom('Bedroom', -10, 0, 8, 8, 'wall_bedroom', 'floor_wood');
        this.createCorridor(0, -10, 20, 4, 'wall_corridor', 'floor_wood');
        
        // Add doors
        this.createDoor(5, 0, 0, Math.PI/2, false, null); // Living to Kitchen
        this.createDoor(-5, 0, 0, Math.PI/2, false, null); // Living to Bedroom
        this.createDoor(0, 0, -5, 0, true, GameConfig.ITEM_KEY_FRONT_DOOR); // Front Door (Escape 1)
        
        // Add interactables (Drawers)
        this.placeDrawersAndItems();
        
        // Add lights
        this.createLight(0, 2.5, 0); // Living room
        this.createLight(10, 2.5, 0); // Kitchen
        this.createLight(-10, 2.5, 0); // Bedroom
        
        // Add Notes
        this.createNote(2, 1, 2, 0);
        this.createNote(-8, 1, 2, 1);
    }

    createRoom(name, x, z, width, depth, wallTexName, floorTexName) {
        const wallTex = assetLoader.getTexture(wallTexName) || assetLoader.getTexture('wall_living_room');
        const floorTex = assetLoader.getTexture(floorTexName) || assetLoader.getTexture('floor_wood');
        const ceilTex = assetLoader.getTexture('ceiling_default');

        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8 });
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
        const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 1.0 });

        const h = 3; // Wall height

        // Floor
        const floorGeo = new THREE.PlaneGeometry(width, depth);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0, z);
        this.scene.add(floor);

        // Ceiling
        const ceil = new THREE.Mesh(floorGeo, ceilMat);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(x, h, z);
        this.scene.add(ceil);

        // Walls (simplified, 4 solid walls, doors cut holes in a real implementation)
        const wallGeoX = new THREE.PlaneGeometry(width, h);
        const wallGeoZ = new THREE.PlaneGeometry(depth, h);

        const wN = new THREE.Mesh(wallGeoX, wallMat);
        wN.position.set(x, h/2, z - depth/2);
        this.scene.add(wN);
        this.collisionManager.addAABB(`wall_${name}_N`, x - width/2, x + width/2, z - depth/2 - 0.1, z - depth/2 + 0.1);

        const wS = new THREE.Mesh(wallGeoX, wallMat);
        wS.rotation.y = Math.PI;
        wS.position.set(x, h/2, z + depth/2);
        this.scene.add(wS);
        this.collisionManager.addAABB(`wall_${name}_S`, x - width/2, x + width/2, z + depth/2 - 0.1, z + depth/2 + 0.1);

        const wE = new THREE.Mesh(wallGeoZ, wallMat);
        wE.rotation.y = -Math.PI / 2;
        wE.position.set(x + width/2, h/2, z);
        this.scene.add(wE);
        this.collisionManager.addAABB(`wall_${name}_E`, x + width/2 - 0.1, x + width/2 + 0.1, z - depth/2, z + depth/2);

        const wW = new THREE.Mesh(wallGeoZ, wallMat);
        wW.rotation.y = Math.PI / 2;
        wW.position.set(x - width/2, h/2, z);
        this.scene.add(wW);
        this.collisionManager.addAABB(`wall_${name}_W`, x - width/2 - 0.1, x - width/2 + 0.1, z - depth/2, z + depth/2);
    }

    createCorridor(x, z, width, depth, wallTexName, floorTexName) {
        this.createRoom('Corridor', x, z, width, depth, wallTexName, floorTexName);
    }

    createDoor(x, y, z, rotation, isLocked, requiredKey) {
        const geo = new THREE.PlaneGeometry(1.2, 2.2);
        const tex = assetLoader.getTexture('door_closed');
        const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set(x, 1.1, z);
        mesh.rotation.y = rotation;
        this.scene.add(mesh);
        
        // Add to interaction system
        this.interactionSystem.addInteractable(mesh, 'DOOR', {
            isOpen: false,
            locked: isLocked,
            requiredKey: requiredKey,
            baseRotation: rotation
        });
        
        // Add collision (remove when open)
        this.collisionManager.addAABB(`door_${x}_${z}`, x - 0.6, x + 0.6, z - 0.1, z + 0.1);
    }
    
    createLight(x, y, z) {
        const bulbGeo = new THREE.SphereGeometry(0.1);
        const bulbMat = new THREE.MeshStandardMaterial({ emissive: 0xffffff, emissiveIntensity: 1 });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(x, y, z);
        
        const light = new THREE.PointLight(0xffddaa, 1, 10);
        bulb.add(light);
        
        this.scene.add(bulb);
        
        this.interactionSystem.addInteractable(bulb, 'LIGHT', {
            isOn: true,
            lightObject: light
        });
    }
    
    createNote(x, y, z, noteId) {
        const geo = new THREE.PlaneGeometry(0.3, 0.4);
        const mat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);
        
        this.interactionSystem.addInteractable(mesh, 'NOTE', { id: noteId });
    }

    placeDrawersAndItems() {
        // Create drawer slots
        const drawerPositions = [
            { x: 2, z: -4 }, { x: 8, z: 2 }, { x: -8, z: -2 }, { x: 0, z: -12 }
        ];
        
        const itemsToPlace = [
            GameConfig.ITEM_KEY_FRONT_DOOR,
            GameConfig.ITEM_KEY_CAR,
            GameConfig.ITEM_KEY_BASEMENT,
            GameConfig.ITEM_BATTERY,
            GameConfig.ITEM_BATTERY
        ];
        
        // Shuffle items and assign to drawers
        this.rng.shuffle(drawerPositions);
        
        drawerPositions.forEach((pos, index) => {
            const geo = new THREE.BoxGeometry(0.8, 0.4, 0.6);
            const tex = assetLoader.getTexture('drawer_closed');
            const mat = new THREE.MeshStandardMaterial({ map: tex });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(pos.x, 0.8, pos.z);
            this.scene.add(mesh);
            
            const item = index < itemsToPlace.length ? itemsToPlace[index] : null;
            
            this.interactionSystem.addInteractable(mesh, 'DRAWER', {
                isOpen: false,
                item: item
            });
            
            this.collisionManager.addAABB(`drawer_${index}`, pos.x-0.4, pos.x+0.4, pos.z-0.3, pos.z+0.3);
        });
    }
}
