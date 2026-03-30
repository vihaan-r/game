# Mara - 3D Horror Survival Game

A complete, production-ready 3D horror survival mobile game built with Three.js and packaged for Android via Capacitor.js.

## Overview
You accepted a house-sitting job for quick cash. The owners are away. The pay is high. But you are not alone. "Mara", the spirit of the previous owner, haunts the halls. Find keys, manage your flashlight battery, hide in closets, and find one of three escape routes before she catches you.

## Features
- **3D Environment:** Procedurally built house using Three.js with 2D textures.
- **Adaptive AI:** Mara learns your habits. She remembers where you hide, which escape routes you favor, and adjusts her patrol routes across sessions.
- **Spatial Audio:** Hear Mara's footsteps and whispers relative to your position.
- **Mobile First:** Virtual joystick and touch-look controls.
- **Three Escape Routes:** Front Door, Car, or Basement Tunnel.
- **Difficulty Modes:** Practice (No Ghost), Normal, Extreme.

## Prerequisites
- Node.js 20+
- Android Studio (for local Android builds) or just use GitHub Actions.

## Local Development
1. Clone the repository.
2. Run `npm install`
3. Run `npm run dev` to start the Vite development server.
4. Open the provided localhost URL in your browser.

## Asset Replacement Guide
The game comes with a script that automatically generates placeholder assets (white squares, silent audio, empty 3D models) so the game compiles immediately. To make the game yours, replace the placeholders in `public/assets/` with your real assets. **Keep the exact filenames.**

| Path | Type | Description |
|---|---|---|
| `textures/wall_*.png` | Image | Wall textures for different rooms (recommend 1024x1024) |
| `textures/floor_*.png` | Image | Floor textures |
| `textures/door_closed.png` | Image | Door sprite |
| `textures/ui/blood_overlay.png` | Image | Red vignette for danger (transparent center) |
| `models/ghost.glb` | 3D Model | Mara's character model |
| `audio/bgm_gameplay.mp3` | Audio | Tension background music |
| `audio/sfx_ghost_alert.mp3` | Audio | Jumpscare sound |

*Recommended free sources:* Poly Pizza (CC0 models), Freesound.org (CC0 audio), Ambientcg.com (PBR textures).

## Building the APK

### Via GitHub Actions (Easiest)
1. Fork or push this repository to GitHub.
2. Go to the "Actions" tab.
3. Select "Build Android APK" and click "Run workflow".
4. Once complete, download the `horror-game-debug.apk` artifact.

### Locally
1. `npm run build`
2. `npx cap sync android`
3. Open the `android` folder in Android Studio and build the APK, or run `cd android && ./gradlew assembleDebug`.

## Controls
**Mobile:**
- Left side: Virtual Joystick (Move/Sprint)
- Right side: Swipe to Look
- Double-tap right side: Toggle Flashlight
- Tap highlighted objects: Interact

**Desktop:**
- WASD: Move
- Mouse: Look
- Shift: Sprint
- C: Crouch
- F: Toggle Flashlight
- E: Interact

## License
MIT License.
