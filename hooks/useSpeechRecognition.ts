
import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the Web Speech API, which is not standardized and often missing from default TS lib files.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

// The Web Speech API is not standardized, so we need to check for vendor prefixes.
const SpeechRecognition: SpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface SpeechRecognitionOptions {
  lang?: string;
}

export const useSpeechRecognition = ({ lang = 'fr-FR' }: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError("errors.speechRecognition.notSupported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true; // Get results as the user speaks
    recognition.continuous = false; // Stop after a pause

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("errors.speechRecognition.micNotAllowed");
      } else {
        setError(`errors.speechRecognition.genericError`); // Pass a generic key
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    // Cleanup function
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, [lang]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("errors.speechRecognition.startError");
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: !!SpeechRecognition,
  };
};
