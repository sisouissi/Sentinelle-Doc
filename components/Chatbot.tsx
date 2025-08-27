
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Send, Bot, Microphone, Volume2, Square } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatbotProps {
  history: ChatMessage[];
  onSendMessage: (message: string, context?: ChatMessage['questionContext']) => void;
  isAiTyping: boolean;
}

const QuickResponsePanel = ({ options, onSelect }: { options: string[], onSelect: (option: string) => void}) => (
    <div className="p-4 border-t border-slate-200 animate-fade-in">
        <div className="grid grid-cols-1 gap-2">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(option)}
                    className="w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors text-center"
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


export function Chatbot({ history, onSendMessage, isAiTyping }: ChatbotProps): React.ReactNode {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();

  const langCode = language === 'en' ? 'en-US' : language === 'ar' ? 'ar-SA' : 'fr-FR';

  const { isListening, transcript, startListening, stopListening, isSupported: isRecognitionSupported, error: recognitionError } = useSpeechRecognition({ lang: langCode });
  const { speak, cancel, isSpeaking, supported: isSynthesisSupported } = useSpeechSynthesis();
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

  const lastMessage = history[history.length - 1];
  const isInteractiveQuestion = lastMessage?.role === 'model' && !!lastMessage.options?.length;

  useEffect(() => {
    if (transcript) {
        setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiTyping]);

  const useIsSpeakingChanged = (callback: () => void) => {
    const prevIsSpeaking = useRef(isSpeaking);
    useEffect(() => {
        if (prevIsSpeaking.current && !isSpeaking) {
            callback();
        }
        prevIsSpeaking.current = isSpeaking;
    }, [isSpeaking, callback]);
  };
  
  useIsSpeakingChanged(() => {
      setCurrentlySpeakingIndex(null);
  });

  const handleSendMessage = (message: string) => {
    if (isInteractiveQuestion) {
       onSendMessage(message, { originalQuestion: lastMessage.text });
    } else {
       onSendMessage(message);
       setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAiTyping && !isInteractiveQuestion) {
      handleSendMessage(input.trim());
    }
  };

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleToggleSpeak = (text: string, index: number) => {
    if (isSpeaking && currentlySpeakingIndex === index) {
      cancel();
    } else {
      speak({ text, lang: langCode });
      setCurrentlySpeakingIndex(index);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-slate-200 flex items-center">
         <div className="bg-blue-100 p-2 rounded-full mr-3 ml-0 rtl:ml-3 rtl:mr-0">
             <Bot className="w-6 h-6 text-blue-600" />
         </div>
        <h2 className="text-lg font-semibold text-slate-800">{t('chatbot.title')}</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center self-start flex-shrink-0"><Bot className="w-5 h-5 text-slate-500"/></div>}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-lg rtl:rounded-bl-lg rtl:rounded-br-none'
                  : 'bg-slate-200 text-slate-800 rounded-bl-lg rtl:rounded-br-lg rtl:rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'model' && isSynthesisSupported && (
                <button
                    onClick={() => handleToggleSpeak(msg.text, index)}
                    className="p-2 text-slate-500 hover:bg-slate-200 rounded-full self-center flex-shrink-0"
                    aria-label={isSpeaking && currentlySpeakingIndex === index ? t('chatbot.stopReading') : t('chatbot.readMessage')}
                >
                    {isSpeaking && currentlySpeakingIndex === index ? <Square className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-slate-500" />}
                </button>
            )}
          </div>
        ))}
        {isAiTyping && (
           <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center self-start flex-shrink-0"><Bot className="w-5 h-5 text-slate-500"/></div>
             <div className="bg-slate-200 text-slate-800 rounded-2xl rounded-bl-lg rtl:rounded-br-lg rtl:rounded-bl-none px-4 py-3">
                <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {isInteractiveQuestion ? (
        <QuickResponsePanel
            options={lastMessage.options!}
            onSelect={handleSendMessage}
        />
      ) : (
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? t('chatbot.listening') : t('chatbot.placeholder')}
                className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isAiTyping}
              />
               {isRecognitionSupported && (
                    <button
                        type="button"
                        onClick={handleToggleListen}
                        disabled={isAiTyping}
                        className={`relative p-3 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isListening ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} disabled:bg-slate-400`}
                        aria-label={isListening ? t('chatbot.stopListening') : t('chatbot.startListening')}
                    >
                        {isListening && <span className="absolute inset-0 bg-white/30 rounded-full animate-ping"></span>}
                        {isListening ? <Square className="w-5 h-5" /> : <Microphone className="w-5 h-5" />}
                    </button>
                )}
              <button
                type="submit"
                disabled={isAiTyping || !input.trim() || isListening}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                 aria-label={t('chatbot.sendMessage')}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
             {recognitionError && <p className="text-xs text-red-500 mt-2 text-center">{t(recognitionError, {
                // You can pass default values or context here if your t function supports it
             })}</p>}
          </div>
      )}
    </div>
  );
}
