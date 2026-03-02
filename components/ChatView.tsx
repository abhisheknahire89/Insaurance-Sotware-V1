import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chat, Message, UserRole, PreCodedGpt, DoctorProfile, LabParameterInput } from '../types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { Icon } from './Icon';
import { PRE_CODED_GPTS } from '../constants';
import { synthesizeSpeech } from '../services/googleTtsService';

interface ChatViewProps {
  chat: Chat | null;
  onNewChat: (gpt?: PreCodedGpt) => void;
  updateChat: (chatId: string, messages: Message[]) => void;
  language: string;
  doctorProfile: DoctorProfile;
  setPendingFirstMessage: (message: string | null) => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (isOpen: boolean) => void;
  onSendMessage: (message: string) => void;
  isSending: boolean;
}

const languageToCodeMap: Record<string, string> = {
    'English': 'en-IN',
    'Marathi': 'mr-IN',
    'Hindi': 'hi-IN',
};

const LabResultForm: React.FC<{ onSubmit: (params: LabParameterInput[]) => void }> = ({ onSubmit }) => {
    const [params, setParams] = useState<LabParameterInput[]>([]);
    const [currentParam, setCurrentParam] = useState<LabParameterInput>({ name: '', value: '', units: '', referenceRange: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentParam({ ...currentParam, [e.target.name]: e.target.value });
    };

    const handleAddParam = () => {
        if (currentParam.name.trim() && currentParam.value.trim()) {
            setParams([...params, currentParam]);
            setCurrentParam({ name: '', value: '', units: '', referenceRange: '' });
        }
    };
    
    const handleRemoveParam = (index: number) => {
        setParams(params.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (params.length === 0 && (!currentParam.name.trim() || !currentParam.value.trim())) {
            return; // Don't submit an empty form
        }
        let finalParams = [...params];
        // Add the currently entered param if it's valid, even if "Add" wasn't clicked
        if (currentParam.name.trim() && currentParam.value.trim()) {
            finalParams.push(currentParam);
        }
        if (finalParams.length > 0) {
            onSubmit(finalParams);
        }
    };

    const canAdd = currentParam.name.trim() && currentParam.value.trim();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 animate-fadeInUp">
            <div className="w-full max-w-3xl bg-aivana-light-grey rounded-xl p-6 md:p-8 border border-aivana-light-grey/50">
                <div className="flex items-center gap-3 mb-4">
                    <Icon name="lab" className="w-8 h-8 text-aivana-accent" />
                    <h2 className="text-2xl font-bold text-white">Lab Result Analyzer</h2>
                </div>
                <p className="text-gray-400 mb-6 text-sm">Enter one or more lab parameters for a structured, evidence-based analysis.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Parameter Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-3 bg-aivana-dark rounded-lg">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">Parameter Name</label>
                            <input type="text" name="name" id="name" value={currentParam.name} onChange={handleInputChange} className="w-full bg-aivana-grey p-2 rounded-md border border-aivana-light-grey/80 focus:ring-aivana-accent focus:border-aivana-accent" placeholder="e.g., Hemoglobin" />
                        </div>
                        <div>
                            <label htmlFor="value" className="block text-xs font-medium text-gray-300 mb-1">Value</label>
                            <input type="text" name="value" id="value" value={currentParam.value} onChange={handleInputChange} className="w-full bg-aivana-grey p-2 rounded-md border border-aivana-light-grey/80 focus:ring-aivana-accent focus:border-aivana-accent" placeholder="e.g., 10.5" />
                        </div>
                        <div>
                            <label htmlFor="units" className="block text-xs font-medium text-gray-300 mb-1">Units</label>
                            <input type="text" name="units" id="units" value={currentParam.units} onChange={handleInputChange} className="w-full bg-aivana-grey p-2 rounded-md border border-aivana-light-grey/80 focus:ring-aivana-accent focus:border-aivana-accent" placeholder="e.g., g/dL" />
                        </div>
                        <button type="button" onClick={handleAddParam} disabled={!canAdd} className="w-full bg-aivana-accent/80 hover:bg-aivana-accent text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:bg-aivana-light-grey/50 disabled:cursor-not-allowed">
                            <Icon name="newChat" className="w-5 h-5"/> Add
                        </button>
                    </div>

                    {/* Display Added Parameters */}
                    {params.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2">
                            {params.map((param, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-aivana-dark rounded-md text-sm">
                                    <span className="font-semibold text-white">{param.name}:</span>
                                    <span className="text-gray-300">{param.value} {param.units}</span>
                                    <span className="text-gray-400 text-xs">(Ref: {param.referenceRange || 'N/A'})</span>
                                    <button onClick={() => handleRemoveParam(index)} className="p-1 text-red-400 hover:text-red-300"><Icon name="close" className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button type="submit" className="w-full !mt-6 bg-aivana-accent hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Icon name="diagnosis" className="w-5 h-5"/>
                        Submit for Analysis
                    </button>
                </form>
            </div>
        </div>
    );
};


export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  onNewChat,
  updateChat,
  language,
  setPendingFirstMessage,
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  onSendMessage,
  isSending,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeGpt = chat?.gptId ? PRE_CODED_GPTS.find(g => g.id === chat.gptId) : undefined;
  const shouldShowLabResultForm = chat && activeGpt?.customComponentId === 'LabResultAnalysis' && chat.messages.filter(m => m.sender === 'USER').length === 0;


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [chat?.messages]);
  
  const handleToggleTts = useCallback(async (message: Message) => {
    if (!audioRef.current) return;

    if (playingMessageId === message.id) {
        audioRef.current.pause();
        audioRef.current.src = '';
        setPlayingMessageId(null);
    } else {
        audioRef.current.pause();
        setPlayingMessageId(message.id); 

        const langCode = languageToCodeMap[language] || 'en-IN';
        const audioSrc = await synthesizeSpeech(message.text, langCode);

        if (audioSrc && audioRef.current) {
            audioRef.current.src = audioSrc;
            audioRef.current.play().catch(e => {
                console.error("Audio playback failed:", e);
                setPlayingMessageId(null);
            });
            
            audioRef.current.onended = () => {
                setPlayingMessageId(null);
            };
            audioRef.current.onerror = () => {
                console.error("Audio element error");
                setPlayingMessageId(null);
            };
        } else {
            console.error("Failed to get audio source from TTS API.");
            setPlayingMessageId(null); 
        }
    }
  }, [playingMessageId, language]);
  
  const handleUpdateMessage = (messageId: string, updates: Partial<Message>) => {
      if (!chat) return;
      const updatedMessages = chat.messages.map(m => m.id === messageId ? {...m, ...updates} : m);
      updateChat(chat.id, updatedMessages);
  };

  const handleLabResultSubmit = (labParams: LabParameterInput[]) => {
      const paramStrings = labParams.map(p => 
          `- Parameter: ${p.name}, Value: ${p.value} ${p.units}, Reference Range: ${p.referenceRange || 'N/A'}`
      );
      
      const prompt = `
          Analyze the following lab results for a patient.
          ${paramStrings.join('\n')}
          
          Based on established clinical guidelines, provide a detailed interpretation for each parameter, an overall summary, and flag any critical or abnormal values with recommended next steps. Your response must be in structured JSON format.
      `;
      onSendMessage(prompt);
  };
  
  const handleSendMessageOnWelcome = (message: string) => {
      if (!message.trim()) return;
      onNewChat();
      setPendingFirstMessage(message);
  };

  const lastAiMessage = useMemo(() => {
      if (!chat?.messages) return null;
      // Find last message from AI that isn't a placeholder and has text
      return [...chat.messages]
        .reverse()
        .find(m => m.sender === 'AI' && m.text && m.text !== '...');
  }, [chat?.messages]);

  const handlePlayLastMessage = useCallback(() => {
      if (lastAiMessage) {
          handleToggleTts(lastAiMessage);
      }
  }, [lastAiMessage, handleToggleTts]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col h-full">
          <WelcomeScreen onNewChat={onNewChat} />
          <div className="p-4 w-full max-w-4xl mx-auto">
              <ChatInput 
                onSendMessage={handleSendMessageOnWelcome} 
                isSending={isSending} 
                language={language}
              />
          </div>
      </div>
    );
  }
  
  if (shouldShowLabResultForm) {
      return <LabResultForm onSubmit={handleLabResultSubmit} />;
  }


  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 border-b border-aivana-light-grey">
            <h2 className="text-lg font-semibold truncate">
                {chat.title}
            </h2>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={`p-2 rounded-md transition-colors ${isRightSidebarOpen ? 'bg-aivana-accent text-white' : 'text-gray-400 hover:bg-aivana-grey hover:text-white'}`}
              aria-label="Toggle clinical co-pilot"
              title="Toggle clinical co-pilot"
            >
              <Icon name="sparkles" />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
          {chat.messages.map((message) => (
              <ChatMessage
                  key={message.id}
                  message={message}
                  onToggleTts={handleToggleTts}
                  playingMessageId={playingMessageId}
                  onUpdateMessage={handleUpdateMessage}
              />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 w-full max-w-4xl mx-auto">
          <ChatInput 
              onSendMessage={onSendMessage} 
              isSending={isSending} 
              onPlayLastMessage={handlePlayLastMessage}
              isTtsPlaying={!!lastAiMessage && playingMessageId === lastAiMessage.id}
              canPlayTts={!!lastAiMessage}
              language={language}
          />
        </div>
      </div>
       {/* Backdrop for mobile when panel is open */}
      {isRightSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-10 md:hidden"
            onClick={() => setIsRightSidebarOpen(false)}
          ></div>
      )}
    </div>
  );
};


const WelcomeScreen: React.FC<{ onNewChat: (gpt?: PreCodedGpt) => void }> = ({ onNewChat }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <div className="max-w-4xl w-full animate-fadeInUp" style={{ animationFillMode: 'backwards' }}>
                 <div className="flex items-center justify-center gap-4 mb-4">
                    <Icon name="logo" className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ animationDelay: '100ms' }}>
                    Aivana: Clinical Decision Support
                </h1>
                <p className="text-gray-400 mb-10 max-w-2xl mx-auto" style={{ animationDelay: '200ms' }}>
                   An AI assistant for healthcare professionals, aligned with evidence-based guidelines.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRE_CODED_GPTS.map((gpt, index) => (
                        <button
                            key={gpt.id}
                            onClick={() => onNewChat(gpt)}
                            className="text-left p-4 bg-aivana-light-grey/60 hover:bg-aivana-light-grey rounded-lg transition-all transform hover:scale-105 group animate-fadeInUp"
                            style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'backwards' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-aivana-grey rounded-md">
                                    {gpt.icon}
                                </div>
                                <h3 className="font-semibold text-white">{gpt.title}</h3>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{gpt.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};