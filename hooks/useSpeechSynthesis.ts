
import { useState, useEffect } from 'react';

interface SpeechOptions {
    text: string;
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setSupported(true);
        }

        const handleVoicesChanged = () => {
            // Re-check voices when they are loaded.
        };
        
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
    }, []);

    const speak = ({ text, lang = 'fr-FR', rate = 1, pitch = 1, volume = 1 }: SpeechOptions) => {
        if (!supported) return;

        // Cancel any previous speech to avoid queueing
        if (isSpeaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        // Find a matching voice if available
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(voice => voice.lang === lang || voice.lang.startsWith(lang.split('-')[0]));
        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('SpeechSynthesis Error', event);
            setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const cancel = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return { speak, cancel, isSpeaking, supported };
};
