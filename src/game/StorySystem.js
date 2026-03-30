import { EventBus } from '../utils/EventBus.js';

export const STORY_NOTES = [
    "She never left. Even after we buried her. The neighbors said they could hear her walking at night. We thought they were lying. We were wrong.",
    "I tried to leave through the front door. She was there. Standing in the dark. I think she knew what I was planning.",
    "The water helps. She hates the sound of running water. Use it to cover your noise when she's close.",
    "There are three ways out. The car, the front door, the tunnel under the house. She can't follow you once you're truly outside. But she'll try.",
    "I almost made it. The hatch key was right where I left it — under the bathroom sink. But she heard me on the stairs. If you're reading this, you're smarter than I was. Don't run. She hears running. Walk. Always walk."
];

export class StorySystem {
    constructor() {
        this.notesFound = [];
        
        EventBus.on('interact:note', (noteId) => {
            this.showNote(noteId);
        });
    }

    showNote(noteId) {
        if (!this.notesFound.includes(noteId)) {
            this.notesFound.push(noteId);
        }
        
        const text = STORY_NOTES[noteId];
        EventBus.emit('ui:show_note', text);
    }
}
