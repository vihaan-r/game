export class SaveSystem {
    static loadSettings() {
        const defaultSettings = {
            masterVolume: 1.0,
            musicVolume: 1.0,
            sfxVolume: 1.0,
            invertY: false,
            showFPS: false,
            quality: 'Medium'
        };
        try {
            const saved = localStorage.getItem('mara_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    static saveSettings(settings) {
        localStorage.setItem('mara_settings', JSON.stringify(settings));
    }

    static loadGhostMemory() {
        const defaultMemory = {
            mara_escape_routes_used: [],
            mara_hiding_spots_used: [],
            mara_avg_noise_level: 0.5,
            mara_sessions_played: 0,
            mara_rooms_avoided: []
        };
        try {
            const saved = localStorage.getItem('mara_memory');
            return saved ? { ...defaultMemory, ...JSON.parse(saved) } : defaultMemory;
        } catch (e) {
            return defaultMemory;
        }
    }

    static saveGhostMemory(memory) {
        localStorage.setItem('mara_memory', JSON.stringify(memory));
    }
}
