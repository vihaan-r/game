import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetLoader {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        this.textures = {};
        this.models = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    async loadTexture(name, path) {
        this.totalAssets++;
        return new Promise((resolve) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    this.textures[name] = texture;
                    this.loadedAssets++;
                    resolve(texture);
                },
                undefined,
                (err) => {
                    console.warn(`Failed to load texture ${path}, using fallback.`);
                    // Create a 4x4 white fallback texture
                    const canvas = document.createElement('canvas');
                    canvas.width = 4; canvas.height = 4;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, 4, 4);
                    const tex = new THREE.CanvasTexture(canvas);
                    this.textures[name] = tex;
                    this.loadedAssets++;
                    resolve(tex);
                }
            );
        });
    }

    async loadModel(name, path) {
        this.totalAssets++;
        return new Promise((resolve) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    this.models[name] = gltf.scene;
                    this.loadedAssets++;
                    resolve(gltf.scene);
                },
                undefined,
                (err) => {
                    console.warn(`Failed to load model ${path}, using fallback.`);
                    const geometry = new THREE.BoxGeometry(1, 2, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 });
                    const mesh = new THREE.Mesh(geometry, material);
                    this.models[name] = mesh;
                    this.loadedAssets++;
                    resolve(mesh);
                }
            );
        });
    }

    getTexture(name) {
        return this.textures[name];
    }

    getModel(name) {
        return this.models[name] ? this.models[name].clone() : null;
    }
}

export const assetLoader = new AssetLoader();
