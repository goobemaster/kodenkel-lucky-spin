import { Application } from './main';

export class Sound {
    private static instance: Sound;
    private musicAudio: HTMLAudioElement;
    private effectAudio: {[index: string]: HTMLAudioElement} = {};

    constructor() {
        this.effectAudio[SoundFX.BELL] = new Audio('assets/sound/' + SoundFX.BELL);
        this.effectAudio[SoundFX.DING] = new Audio('assets/sound/' + SoundFX.DING);
        this.effectAudio[SoundFX.DOOR_OPEN] = new Audio('assets/sound/' + SoundFX.DOOR_OPEN);
        this.effectAudio[SoundFX.BLEAT] = new Audio('assets/sound/' + SoundFX.BLEAT);
    }

    private static getInstance(): Sound {
        if (Sound.instance === undefined) Sound.instance = new Sound();
        return Sound.instance;
    }

    public static loopMusic(url: string): void {
        let sound = Sound.getInstance();
        
        if (sound.musicAudio !== undefined && sound.musicAudio instanceof HTMLAudioElement) {
            sound.musicAudio.pause();
            delete sound.musicAudio;
        }
        sound.musicAudio = new Audio('assets/music/' + url);
        sound.musicAudio.play();
        sound.musicAudio.onended = () => {
            setTimeout(() => {
                sound.musicAudio.play();
            }, 5000);
        };
    }

    public static playFX(effect: SoundFX): void {
        if (!Application.isSoundOn()) return;
        
        let sound = Sound.getInstance();
        if (!sound.effectAudio.hasOwnProperty(effect)) return;

        sound.effectAudio[effect].play();
    }
}

export enum SoundFX {
    BELL = 'toyop.mp3',
    DING = 'clock.mp3',
    DOOR_OPEN = 'doorwood.mp3',
    BLEAT = 'bleat.mp3'
}