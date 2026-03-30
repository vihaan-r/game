import { GameConfig } from '../constants/GameConfig.js';

export class RandomSeed {
    constructor(seed = GameConfig.SESSION_SEED) {
        this.seed = seed;
    }

    // Simple LCG (Linear Congruential Generator)
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    // Get random integer between min and max (inclusive)
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    // Shuffle array in place
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
