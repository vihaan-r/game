import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const publicAssetsDir = path.join(rootDir, 'public', 'assets');

// Minimal valid files
// 4x4 white PNG
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAABVJREFUGFdj/P///38GMIxMQAoYGBgA9yA/wZ1z8eAAAAAASUVORK5CYII=";

// 1 second silent MP3 (minimal valid frame)
const base64Mp3 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dX////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAcAAAGkAAAAAAAAA0gAAAAAOTku";

// Minimal GLB (empty scene)
const base64Glb = "Z2xURgIAAADwAAAAOAAAAHsiYXNzZXQiOnsidmVyc2lvbiI6IjIuMCJ9LCJzY2VuZXMiOlt7fV0sInNjZW5lIjowfQ==";

const assets = [
    'textures/wall_living_room.png',
    'textures/wall_bedroom.png',
    'textures/wall_bathroom.png',
    'textures/wall_kitchen.png',
    'textures/wall_corridor.png',
    'textures/wall_basement.png',
    'textures/floor_wood.png',
    'textures/floor_tile.png',
    'textures/floor_concrete.png',
    'textures/ceiling_default.png',
    'textures/door_closed.png',
    'textures/door_open.png',
    'textures/drawer_closed.png',
    'textures/drawer_open.png',
    'textures/closet_closed.png',
    'textures/closet_open.png',
    'textures/lightbulb_on.png',
    'textures/lightbulb_off.png',
    'textures/key_item.png',
    'textures/car_exterior.png',
    'textures/trapdoor_closed.png',
    'textures/trapdoor_open.png',
    'textures/ui/menu_background.png',
    'textures/ui/logo.png',
    'textures/ui/blood_overlay.png',
    'textures/ui/inventory_slot.png',
    'models/ghost.glb',
    'models/player_hands.glb',
    'models/car.glb',
    'audio/bgm_menu.mp3',
    'audio/bgm_gameplay.mp3',
    'audio/bgm_chase.mp3',
    'audio/sfx_door_creak.mp3',
    'audio/sfx_door_slam.mp3',
    'audio/sfx_footstep_wood.mp3',
    'audio/sfx_footstep_tile.mp3',
    'audio/sfx_footstep_concrete.mp3',
    'audio/sfx_ghost_idle.mp3',
    'audio/sfx_ghost_alert.mp3',
    'audio/sfx_ghost_chase.mp3',
    'audio/sfx_pickup_key.mp3',
    'audio/sfx_drawer_open.mp3',
    'audio/sfx_heartbeat.mp3',
    'audio/sfx_victory.mp3',
    'audio/sfx_gameover.mp3',
    'audio/sfx_stair_step.mp3',
    'audio/sfx_car_start.mp3',
    'video/story_intro.mp4' // We'll just use a dummy file for mp4
];

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

console.log('Checking and generating placeholder assets...');

assets.forEach(asset => {
    const fullPath = path.join(publicAssetsDir, asset);
    
    if (fs.existsSync(fullPath)) {
        console.log(`✓ [${asset}] — real asset found`);
    } else {
        ensureDirectoryExistence(fullPath);
        
        let buffer;
        if (asset.endsWith('.png')) {
            buffer = Buffer.from(base64Png, 'base64');
        } else if (asset.endsWith('.mp3')) {
            buffer = Buffer.from(base64Mp3, 'base64');
        } else if (asset.endsWith('.glb')) {
            buffer = Buffer.from(base64Glb, 'base64');
        } else {
            // Empty file for mp4 or others
            buffer = Buffer.from('');
        }
        
        fs.writeFileSync(fullPath, buffer);
        console.log(`⚠ [${asset}] — placeholder generated`);
    }
});

console.log('Asset check complete.');
