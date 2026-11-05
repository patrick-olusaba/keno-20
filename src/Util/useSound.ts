import { useEffect, useMemo, useRef } from "react";
import gameSound from "../assets/gamesound.mp3";
import winSound from "../assets/win-sound.mp3";
import loseSound from "../assets/lose-sound.mp3";
import popSound from "../assets/pop-sound.mp3";
import drawSound from "../assets/draw-sound.mp3";
import matchSound from "../assets/match-sound.mp3";
import betSound from "../assets/bet-sound.mp3";
import clearSound from "../assets/clear-sound.mp3";

export const useSound = (mute: boolean, loop: boolean) => {
    const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Sound files
    const soundFiles = useMemo(() => ({
        background: gameSound,
        win: winSound,
        lose: loseSound,
        click: popSound,
        draw: drawSound,
        match: matchSound,
        bet: betSound,
        clear: clearSound
    }), []);

    // Initialize background music
    useEffect(() => {
        const audio = soundsRef.current.background || new Audio(soundFiles.background);
        audio.loop = loop;
        audio.volume = mute ? 0 : 0.1;
        soundsRef.current.background = audio;

        // Attempt to play immediately
        if (mute) {
            audio.pause();
        } else {
            const tryPlayAudio = () => {
                audio.play().catch(() => {
                    const handleUserInteraction = () => {
                        audio.play().catch(err => console.log("Failed to play on user interaction", err));
                        document.removeEventListener("click", handleUserInteraction);
                    };
                    document.addEventListener("click", handleUserInteraction);
                });
            };

            tryPlayAudio();
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [mute, loop, soundFiles]);


    useEffect(() => {
        Object.values(soundsRef.current).forEach(audio => {
            if (audio) {
                if (mute) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                audio.volume = mute ? 0 : 0.5;
            }
        });
    }, [mute]);


    const playSound = (soundName: "win" | "lose" | "click" | "draw" | "match" | "bet" | "clear") => {
        if (mute) return;

        if (!soundsRef.current[soundName]) {
            soundsRef.current[soundName] = new Audio(soundFiles[soundName]);
            soundsRef.current[soundName].volume = 0.5;
        }

        const sound = soundsRef.current[soundName];
        sound.currentTime = 0;
        sound.play().catch(e => console.error("Failed to play sound", e));
    };

    return { playSound };
};

