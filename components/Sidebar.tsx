import React from 'react';
import { PreCodedGpt, Chat, DoctorProfile } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  gpts: PreCodedGpt[];
  chats: Chat[];
  onNewChat: (gpt?: PreCodedGpt) => void;
  onSelectChat: (chatId: string) => void;
  activeChat: Chat | null;
  activeChatId: string | null;
  language: string;
  setLanguage: (language: string) => void;
  doctorProfile: DoctorProfile;
  setDoctorProfile: (profile: DoctorProfile) => void;
  onStartScribeSession: () => void;
  activeView: 'chat' | 'scribe';
  onShowPrintModal: () => void;
  onShowAboutModal: () => void;
  onGenerateCaseSummary: () => void;
}

const DoctorProfileSwitcher: React.FC<{
    profile: DoctorProfile;
    setProfile: (profile: DoctorProfile) => void;
}> = ({ profile, setProfile }) => {
    const profiles: DoctorProfile[] = [
        { qualification: 'BAMS', canPrescribeAllopathic: 'no' },
        { qualification: 'BHMS', canPrescribeAllopathic: 'no' },
        { qualification: 'MBBS', canPrescribeAllopathic: 'yes' },
    ];

    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
                Doctor Profile (Simulated)
            </label>
            <div className="flex bg-aivana-grey rounded-lg p-1">
                 {profiles.map(p => (
                     <button
                        key={p.qualification}
                        onClick={() => setProfile(p)}
                        className={`flex-1 text-xs px-2 py-1 rounded-md transition-colors ${profile.qualification === p.qualification ? 'bg-aivana-accent text-white font-semibold' : 'text-gray-300 hover:bg-aivana-light-grey'}`}
                     >
                         {p.qualification}
                     </button>
                 ))}
            </div>
        </div>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  gpts,
  chats,
  onNewChat,
  onSelectChat,
  activeChat,
  activeChatId,
  language,
  setLanguage,
  doctorProfile,
  setDoctorProfile,
  onStartScribeSession,
  activeView,
  onShowPrintModal,
  onShowAboutModal,
  onGenerateCaseSummary,
}) => {

  const canGenerateSummary = activeChat && activeChat.messages.length > 0;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-aivana-dark-sider z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:flex-shrink-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-aivana-light-grey flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Icon name="logo" className="w-8 h-8 text-white" />
                <span className="font-bold text-xl">Aivana</span>
                 <div className="border-l border-aivana-light-grey pl-2 ml-1 flex items-center gap-1.5">
                    <Icon name="book-open" className="w-6 h-6 text-aivana-primary-blue" />
                    <span className="text-xs font-semibold text-gray-400">Evidence-Based</span>
                </div>
            </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-md hover:bg-aivana-grey">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => onNewChat()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-aivana-accent hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Icon name="newChat" />
            New Conversation
          </button>
        </div>

        {/* Live Session Button */}
        <div className="px-4 pb-2 flex-shrink-0">
            <button
                onClick={onStartScribeSession}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-colors ${
                    activeView === 'scribe' 
                        ? 'border-purple-500 bg-purple-900/40 text-white' 
                        : 'border-aivana-grey hover:border-aivana-light-grey hover:bg-aivana-grey text-gray-300'
                }`}
            >
                <Icon name="sparkles" />
                Start Scribe Session
            </button>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 flex-shrink-0 border-b border-aivana-light-grey space-y-2">
            <button
                onClick={onGenerateCaseSummary}
                disabled={!canGenerateSummary}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-colors border-aivana-grey hover:border-aivana-light-grey hover:bg-aivana-grey text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Icon name="document-text" className="w-5 h-5"/>
                <span className="text-sm">Generate Case Summary</span>
            </button>
            <button
                onClick={onShowPrintModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-colors border-aivana-grey hover:border-aivana-light-grey hover:bg-aivana-grey text-gray-300"
            >
                <Icon name="print" className="w-5 h-5"/>
                <span className="text-sm">Print Emergency Cards</span>
            </button>
            <button
                onClick={onShowAboutModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-colors border-aivana-grey hover:border-aivana-light-grey hover:bg-aivana-grey text-gray-300"
            >
                <Icon name="info" className="w-5 h-5"/>
                <span className="text-sm">About & Disclaimer</span>
            </button>
        </div>

        {/* GPTs Section */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialized GPTs</h3>
            {gpts.map((gpt) => (
                <button
                    key={gpt.id}
                    onClick={() => onNewChat(gpt)}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        activeChatId && chats.find(c => c.id === activeChatId)?.gptId === gpt.id
                            ? 'bg-aivana-light-grey'
                            : 'hover:bg-aivana-grey'
                    }`}
                >
                    <div className="p-1.5 bg-aivana-grey rounded-md">{gpt.icon}</div>
                    <span className="text-sm font-medium">{gpt.title}</span>
                </button>
            ))}
        </nav>
        
        {/* Conversation History */}
        <div className="p-4 flex-1 overflow-y-auto border-t border-aivana-light-grey">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">History</h3>
           <div className="space-y-1">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left p-2 rounded-md truncate text-sm transition-colors ${
                  activeChatId === chat.id ? 'bg-aivana-light-grey font-semibold' : 'hover:bg-aivana-grey'
                }`}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-aivana-light-grey flex-shrink-0 space-y-4">
             <DoctorProfileSwitcher profile={doctorProfile} setProfile={setDoctorProfile} />
        </div>
      </div>
    </>
  );
};