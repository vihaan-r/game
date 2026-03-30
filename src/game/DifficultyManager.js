import { GameConfig } from '../constants/GameConfig.js';

export class DifficultyManager {
    constructor() {
        this.currentDifficulty = GameConfig.DIFF_NORMAL;
        this.modifiers = {
            ghostSpeedMult: 1.0,
            searchDurationAdd: 0,
            noiseThresholdSub: 0,
            canGhostOpenDoors: false,
            startWithFlashlight: true,
            ghostActive: true
        };
    }

    setDifficulty(diff) {
        this.currentDifficulty = diff;
        
        switch (diff) {
            case GameConfig.DIFF_PRACTICE:
                this.modifiers.ghostActive = false;
                this.modifiers.startWithFlashlight = true;
                break;
            case GameConfig.DIFF_NORMAL:
                this.modifiers.ghostActive = true;
                this.modifiers.ghostSpeedMult = 1.0;
                this.modifiers.searchDurationAdd = 0;
                this.modifiers.noiseThresholdSub = 0;
                this.modifiers.canGhostOpenDoors = false;
                this.modifiers.startWithFlashlight = true;
                break;
            case GameConfig.DIFF_EXTREME:
                this.modifiers.ghostActive = true;
                this.modifiers.ghostSpeedMult = 1.5;
                this.modifiers.searchDurationAdd = 20;
                this.modifiers.noiseThresholdSub = 0.2;
                this.modifiers.canGhostOpenDoors = true;
                this.modifiers.startWithFlashlight = false;
                break;
        }
    }
    
    getModifiers() {
        return this.modifiers;
    }
}
