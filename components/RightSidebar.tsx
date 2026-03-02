import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { Chat, CoPilotSuggestion, Message } from '../types';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeChat: Chat | null;
  onSendMessage: (message: string) => void;
}

type CardKey = 'refinements' | 'questions' | 'tests' | 'management' | 'evidence';

const CollapsibleCard: React.FC<{ title: string; icon: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, icon, children, isOpen, onToggle }) => {
    return (
        <div className="bg-aivana-grey rounded-lg transition-all duration-300">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-3 text-left hover:bg-aivana-light-grey/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <Icon name={icon} className="w-5 h-5 text-aivana-accent" />
                    <h3 className="font-semibold text-sm text-white">{title}</h3>
                </div>
                <Icon name="chevronDown" className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-3 border-t border-aivana-light-grey/50 animate-fadeInUp">
                    {children}
                </div>
            )}
        </div>
    );
};

const ActionButton: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-aivana-grey hover:bg-aivana-light-grey transition-colors w-full text-center">
        <Icon name={icon} className="w-5 h-5 text-gray-300" />
        <span className="text-xs text-gray-300">{label}</span>
    </button>
);


export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose, activeChat, onSendMessage }) => {
    const [openCards, setOpenCards] = useState<Record<CardKey, boolean>>({
        refinements: false,
        questions: false,
        tests: true,
        management: false,
        evidence: false,
    });

    const toggleCard = (key: CardKey) => {
        setOpenCards(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleActionClick = (key: CardKey) => {
        // Open the clicked card and close others for focus
        setOpenCards({
            refinements: false,
            questions: false,
            tests: false,
            management: false,
            evidence: false,
            [key]: true
        });
    };

    const coPilotData = useMemo<CoPilotSuggestion | null>(() => {
        if (!activeChat) return null;
        const lastAiMessage = [...activeChat.messages]
            .reverse()
            .find(m => m.sender === 'AI' && m.structuredData?.type === 'copilot');
        
        if (lastAiMessage && lastAiMessage.structuredData?.type === 'copilot') {
            return lastAiMessage.structuredData.data;
        }
        return null;
    }, [activeChat]);

    if (!isOpen) {
        return null;
    }

    return (
        <aside className="fixed top-0 right-0 h-full w-full max-w-sm md:relative md:max-w-none md:w-96 bg-aivana-dark-sider border-l border-aivana-light-grey flex flex-col z-20 md:z-0 transform transition-transform md:translate-x-0 animate-fadeInUp"
            style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
            <header className="flex items-center justify-between p-4 border-b border-aivana-light-grey flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Icon name="sparkles" className="w-6 h-6 text-yellow-300" />
                    <h2 className="text-lg font-bold text-white">Clinical Co-Pilot</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-aivana-light-grey md:hidden">
                    <Icon name="close" className="w-5 h-5" />
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Quick Differential Summary */}
                <div className="bg-aivana-grey p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 text-white">Quick Differential Summary</h3>
                    {coPilotData?.differentials && coPilotData.differentials.length > 0 ? (
                        <div className="space-y-2 text-xs">
                            {coPilotData.differentials.slice(0, 3).map((d, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="truncate pr-2">{d.diagnosis}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                        d.confidence === 'High' ? 'bg-green-500/20 text-green-300' :
                                        d.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-red-500/20 text-red-300'
                                    }`}>{d.confidence}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">No diagnostic suggestions available yet. Send a message to begin.</p>
                    )}
                </div>

                {/* Primary Actions */}
                <div className="grid grid-cols-3 gap-2">
                   <ActionButton icon="refresh" label="Order Tests" onClick={() => handleActionClick('tests')} />
                   <ActionButton icon="chart-line" label="Follow-up" onClick={() => handleActionClick('questions')} />
                   <ActionButton icon="beaker" label="Management" onClick={() => handleActionClick('management')} />
                   <ActionButton icon="share" label="Share" onClick={() => {}} />
                   <ActionButton icon="document-text" label="Export" onClick={() => {}} />
                   <ActionButton icon="sparkles" label="Refine" onClick={() => handleActionClick('refinements')} />
                </div>
                
                {/* Expandable Cards */}
                {coPilotData ? (
                    <>
                        <CollapsibleCard title="Refinement Suggestions" icon="sparkles" isOpen={openCards.refinements} onToggle={() => toggleCard('refinements')}>
                           <div className="space-y-3">
                                {coPilotData.refinementSuggestions.map((s, i) => (
                                    <div key={i} className="text-xs text-gray-300 p-2 bg-aivana-dark rounded-md">
                                        <p className="font-semibold text-white">{s.label}</p>
                                        <p className="italic text-gray-400 my-1">Why: {s.why}</p>
                                        <button onClick={() => onSendMessage(s.examplePrompt)} className="mt-2 w-full text-center text-xs font-semibold text-white bg-aivana-accent/80 hover:bg-aivana-accent py-1.5 rounded-md transition-colors">
                                            Apply Suggestion
                                        </button>
                                    </div>
                                ))}
                           </div>
                        </CollapsibleCard>

                        <CollapsibleCard title="Follow-up Questions" icon="chart-line" isOpen={openCards.questions} onToggle={() => toggleCard('questions')}>
                             <div className="space-y-2">
                                {coPilotData.followUpQuestions.map((q, i) => (
                                    <p key={i} className="text-xs text-gray-300 p-2 bg-aivana-dark rounded-md">{q.question}</p>
                                ))}
                             </div>
                        </CollapsibleCard>

                        <CollapsibleCard title="Recommended Tests" icon="refresh" isOpen={openCards.tests} onToggle={() => toggleCard('tests')}>
                             <div className="space-y-2">
                                {coPilotData.recommendedTests.map((t, i) => (
                                    <p key={i} className="text-xs text-gray-300 p-2 bg-aivana-dark rounded-md">
                                        <span className="font-semibold text-white">{t.testName}</span> - Priority: {t.priority}
                                    </p>
                                ))}
                             </div>
                        </CollapsibleCard>
                        
                        <CollapsibleCard title="Management / Next Steps" icon="beaker" isOpen={openCards.management} onToggle={() => toggleCard('management')}>
                              <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                                {coPilotData.managementNextSteps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ul>
                        </CollapsibleCard>

                        <CollapsibleCard title="Evidence & Citations" icon="book-open" isOpen={openCards.evidence} onToggle={() => toggleCard('evidence')}>
                             <div className="space-y-2">
                                {coPilotData.evidenceAndCitations.map((e, i) => (
                                     <a href={e.url} target="_blank" rel="noopener noreferrer" key={i} className="text-xs text-blue-400 hover:underline block p-2 bg-aivana-dark rounded-md truncate">{e.citation}</a>
                                ))}
                             </div>
                        </CollapsibleCard>
                    </>
                ) : (
                     <p className="text-center text-sm text-gray-500 pt-8">Suggestions will appear here as the conversation develops.</p>
                )}

            </div>
            <footer className="p-4 border-t border-aivana-light-grey text-center">
                 <p className="text-xs text-gray-500">
                    AI suggestions are for clinical support only and require verification by a licensed professional.
                 </p>
            </footer>
        </aside>
    );
};