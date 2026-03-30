import { Howl, Howler } from 'howler';
import { EventBus } from '../utils/EventBus.js';

class AudioManagerClass {
    constructor() {
        this.sounds = {};
        this.masterVolume = 1.0;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
        this.currentBGM = null;
        
        EventBus.on('settings:update', (settings) => {
            this.setVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume);
        });
    }

    init() {
        // Load settings
        const settings = JSON.parse(localStorage.getItem('mara_settings') || '{}');
        this.masterVolume = settings.masterVolume !== undefined ? settings.masterVolume : 1.0;
        this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 1.0;
        this.sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 1.0;
        
        Howler.volume(this.masterVolume);
    }

    setVolumes(master, music, sfx) {
        this.masterVolume = master;
        this.musicVolume = music;
        this.sfxVolume = sfx;
        Howler.volume(this.masterVolume);
        
        // Update currently playing BGM
        if (this.currentBGM && this.sounds[this.currentBGM]) {
            this.sounds[this.currentBGM].volume(this.musicVolume);
        }
    }

    loadSound(name, path, isMusic = false, loop = false, is3D = false) {
        this.sounds[name] = new Howl({
            src: [path],
            loop: loop,
            volume: isMusic ? this.musicVolume : this.sfxVolume,
            onloaderror: () => {
                console.warn(`Failed to load audio: ${path}`);
            }
        });
        this.sounds[name].isMusic = isMusic;
        this.sounds[name].is3D = is3D;
    }

    playSound(name, id = null) {
        if (!this.sounds[name]) return null;
        const sound = this.sounds[name];
        sound.volume(sound.isMusic ? this.musicVolume : this.sfxVolume);
        return sound.play(id);
    }

    stopSound(name) {
        if (!this.sounds[name]) return;
        this.sounds[name].stop();
    }

    playBGM(name) {
        if (this.currentBGM === name) return;
        
        if (this.currentBGM && this.sounds[this.currentBGM]) {
            this.sounds[this.currentBGM].fade(this.musicVolume, 0, 2000);
            setTimeout(() => {
                this.stopSound(this.currentBGM);
                this.currentBGM = name;
                if (this.sounds[name]) {
                    this.sounds[name].volume(0);
                    this.sounds[name].play();
                    this.sounds[name].fade(0, this.musicVolume, 2000);
                }
            }, 2000);
        } else {
            this.currentBGM = name;
            if (this.sounds[name]) {
                this.sounds[name].volume(this.musicVolume);
                this.sounds[name].play();
            }
        }
    }

    updateSpatialAudio(name, soundId, sourcePos, listenerPos) {
        if (!this.sounds[name] || soundId === null) return;
        
        // Simple distance-based volume for spatial effect
        const dx = sourcePos.x - listenerPos.x;
        const dy = sourcePos.y - listenerPos.y;
        const dz = sourcePos.z - listenerPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        const maxDist = 20;
        let vol = 1.0 - (dist / maxDist);
        if (vol < 0) vol = 0;
        
        // Pan based on relative X position (simplified)
        // In a real 3D engine we'd use listener orientation, but this is a rough approximation
        let pan = dx / 5.0; 
        if (pan > 1) pan = 1;
        if (pan < -1) pan = -1;

        this.sounds[name].volume(vol * this.sfxVolume, soundId);
        this.sounds[name].stereo(pan, soundId);
    }
    
    unlockAudio() {
        // Mobile requires user interaction to unlock audio context
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
    }
}

export const AudioManager = new AudioManagerClass();
