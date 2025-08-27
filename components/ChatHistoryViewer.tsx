import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../types';
import { Bot, User, Volume2, Square } from './icons';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../contexts/LanguageContext';

export function ChatHistoryViewer({ history }: { history: ChatMessage[] }): React.ReactNode {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  const { speak, cancel, isSpeaking, supported: isSynthesisSupported } = useSpeechSynthesis();
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

  const langCode = language === 'en' ? 'en-US' : language === 'ar' ? 'ar-SA' : 'fr-FR';
  const locale = language === 'ar' ? 'ar-EG' : language;


  useEffect(() => {
    // Scroll to the bottom on new messages, but 'auto' is less jarring for initial load.
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history]);

  // Custom hook to know when isSpeaking changes to false
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

  const handleToggleSpeak = (text: string, index: number) => {
      if (isSpeaking && currentlySpeakingIndex === index) {
          cancel();
      } else {
          speak({ text, lang: langCode });
          setCurrentlySpeakingIndex(index);
      }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm animate-fade-in flex flex-col h-[650px]">
      <h3 className="text-md font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-200 flex-shrink-0">
        {t('chatHistory.title')}
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'model' && 
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center self-start flex-shrink-0">
                <Bot className="w-5 h-5 text-slate-500"/>
              </div>
            }

            {msg.role === 'user' && isSynthesisSupported && (
                 <button 
                    onClick={() => handleToggleSpeak(msg.text, index)}
                    className="p-2 text-slate-400 hover:bg-slate-200 rounded-full self-center flex-shrink-0"
                    aria-label={isSpeaking && currentlySpeakingIndex === index ? t('chatHistory.stopReading') : t('chatHistory.readMessage')}
                >
                    {isSpeaking && currentlySpeakingIndex === index ? <Square className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-slate-500" />}
                </button>
            )}

            <div className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-lg rtl:rounded-bl-lg rtl:rounded-br-none'
                      : 'bg-slate-200 text-slate-800 rounded-bl-lg rtl:rounded-br-lg rtl:rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                 <p className="text-xs text-slate-400 mt-1 px-2">
                    {formatDate(msg.timestamp)}
                 </p>
            </div>

            {msg.role === 'model' && isSynthesisSupported && (
                 <button 
                    onClick={() => handleToggleSpeak(msg.text, index)}
                    className="p-2 text-slate-400 hover:bg-slate-200 rounded-full self-center flex-shrink-0"
                    aria-label={isSpeaking && currentlySpeakingIndex === index ? t('chatHistory.stopReading') : t('chatHistory.readMessage')}
                >
                    {isSpeaking && currentlySpeakingIndex === index ? <Square className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-slate-500" />}
                </button>
            )}


             {msg.role === 'user' && 
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center self-start flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600"/>
                </div>
            }
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}