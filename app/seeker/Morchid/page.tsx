'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  BookmarkIcon,
  ClockIcon,
  ArrowPathIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  PlusIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/app/lib/auth';

// Types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  opportunities?: Opportunity[];
  isStreaming?: boolean;
  metadata?: {
    llm_used?: boolean;
    nlweb_used?: boolean;
    query_type?: string;
  };
}

interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'funding' | 'training';
  description?: string;
  location?: string;
  organization?: string;
  company?: string;
  deadline?: string;
  salary_range?: string;
  source_type?: 'internal' | 'scraped' | 'partner';
  source_url?: string;
  score?: number;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  created_at: Date;
  updated_at: Date;
  messages_count: number;
}

interface SeekerProfile {
  first_name?: string;
  last_name?: string;
  latest_job_title?: string;
  fields_of_experience?: string[];
  years_of_experience?: number;
}

interface CVStatus {
  hasCV: boolean;
  cvCount: number;
  cvName?: string;
}

// Markdown-like text renderer
const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    if (processedLine.startsWith('• ') || processedLine.startsWith('- ')) {
      const content = processedLine.substring(2);
      return (
        <div key={lineIndex} className="flex items-start gap-2 my-1">
          <span className="text-[#556B2F] mt-1">•</span>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }
    
    const numberMatch = processedLine.match(/^(\d+)\.\s(.*)$/);
    if (numberMatch) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 my-1">
          <span className="text-[#556B2F] font-medium min-w-[20px]">{numberMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: numberMatch[2] }} />
        </div>
      );
    }
    
    if (processedLine.match(/^[🔍💡📝💼🎯📋🛠️🎤📚🌍📍🔧💰✅]/)) {
      return (
        <div key={lineIndex} className="mt-3 mb-2 font-medium text-gray-800">
          <span dangerouslySetInnerHTML={{ __html: processedLine }} />
        </div>
      );
    }
    
    if (!processedLine.trim()) {
      return <div key={lineIndex} className="h-2" />;
    }
    
    return (
      <div key={lineIndex} className="my-0.5">
        <span dangerouslySetInnerHTML={{ __html: processedLine }} />
      </div>
    );
  });
};

// Source type badge config
const sourceConfig = {
  internal: { label: 'NGO Partner', color: 'bg-[#556B2F]/10 text-[#556B2F]' },
  scraped: { label: 'External', color: 'bg-blue-100 text-blue-700' },
  partner: { label: 'Partner', color: 'bg-purple-100 text-purple-700' }
};

// Opportunity Card Component
const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
  const typeConfig = {
    job: { icon: BriefcaseIcon, color: 'bg-blue-500', label: 'Job' },
    funding: { icon: CurrencyDollarIcon, color: 'bg-[#556B2F]', label: 'Funding' },
    training: { icon: AcademicCapIcon, color: 'bg-purple-500', label: 'Training' }
  };
  
  const config = typeConfig[opportunity.type] || typeConfig.job;
  const Icon = config.icon;
  const source = sourceConfig[opportunity.source_type || 'scraped'];
  const matchPercent = opportunity.score ? Math.round(opportunity.score * 100) : 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#556B2F]/50 transition-all duration-300 hover:shadow-md group cursor-pointer">
      <div className="flex items-start gap-3">
        <div className={`${config.color} p-2 rounded-lg shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.color} text-white font-medium`}>
              {config.label}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${source.color} font-medium`}>
              {source.label}
            </span>
            {matchPercent >= 70 && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <StarIcon className="w-3 h-3" />
                {matchPercent}% Match
              </span>
            )}
          </div>
          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#556B2F] transition-colors">
            {opportunity.title}
          </h4>
          {(opportunity.organization || opportunity.company) && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              🏢 {opportunity.organization || opportunity.company}
            </p>
          )}
          {opportunity.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              📍 {opportunity.location}
            </p>
          )}
          {opportunity.salary_range && (
            <p className="text-xs text-[#556B2F] flex items-center gap-1 mt-1">
              💰 {opportunity.salary_range}
            </p>
          )}
          {opportunity.deadline && (
            <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
              ⏰ Deadline: {opportunity.deadline}
            </p>
          )}
          {opportunity.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{opportunity.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {matchPercent > 0 && matchPercent < 70 && (
            <span className="text-[10px] text-gray-400">{matchPercent}%</span>
          )}
          <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#556B2F] transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default function MorchidChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [seekerProfile, setSeekerProfile] = useState<SeekerProfile | null>(null);
  const [cvStatus, setCvStatus] = useState<CVStatus>({ hasCV: false, cvCount: 0 });
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setIsLoadingHistory(false);
        initializeWelcomeMessage();
        return;
      }

      try {
        const profileResponse = await fetch(`/api/seeker/profile?userId=${user.id}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setSeekerProfile(profileData.profile);
        }

        const historyResponse = await fetch(`/api/morchid?userId=${user.id}`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          processConversationHistory(historyData.conversations || []);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingHistory(false);
        initializeWelcomeMessage();
      }
    };

    loadUserData();
  }, [user?.id]);

  const processConversationHistory = (rawConversations: any[]) => {
    if (!rawConversations.length) return;

    const grouped: { [key: string]: any[] } = {};
    rawConversations.forEach((conv) => {
      const date = new Date(conv.created_at).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(conv);
    });

    const convList: Conversation[] = Object.entries(grouped).map(([date, items]) => ({
      id: items[0].id,
      title: items[0].user_message.slice(0, 40) + (items[0].user_message.length > 40 ? '...' : ''),
      preview: items[0].ai_response.slice(0, 60) + '...',
      created_at: new Date(items[0].created_at),
      updated_at: new Date(items[items.length - 1].created_at),
      messages_count: items.length * 2
    }));

    setConversations(convList.slice(0, 10));
  };

  const initializeWelcomeMessage = () => {
    const greeting = seekerProfile?.first_name 
      ? `Hello ${seekerProfile.first_name}! 👋` 
      : 'Hello! 👋';
    
    const personalizedIntro = seekerProfile?.latest_job_title
      ? `I see you're a ${seekerProfile.latest_job_title}. `
      : '';

    const welcomeMessage: Message = {
      id: 'welcome',
      text: `${greeting} I'm **Morchid**, your intelligent career assistant powered by AI.

${personalizedIntro}I'm here to help you navigate your career journey with:

🔍 **Smart Job Search** - Find opportunities matching your skills
📝 **CV Optimization** - Get AI-powered feedback on your resume
💼 **Career Guidance** - Personalized advice for your growth
🎯 **Interview Prep** - Practice and tips for success

I have access to real opportunities from our database and can provide specific, actionable insights. What would you like to explore today?`,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    const convId = currentConversationId || generateConversationId();
    if (!currentConversationId) {
      setCurrentConversationId(convId);
    }

    const streamingId = `streaming_${Date.now()}`;
    setMessages(prev => [...prev, {
      id: streamingId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      const previousQueries = messages
        .filter(m => m.sender === 'user')
        .slice(-5)
        .map(m => m.text);

      const response = await fetch('/api/morchid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          userId: user?.id || 'anonymous',
          conversationId: convId,
          previousQueries,
          userProfile: seekerProfile,
          options: {
            includeOpportunities: true,
            useNLWeb: true,
            streaming: false
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Morchid');
      }

      const data = await response.json();
      
      setMessages(prev => prev.map(m => {
        if (m.id === streamingId) {
          return {
            ...m,
            id: `msg_${Date.now()}`,
            text: data.response || 'I apologize, but I couldn\'t process your request. Please try again.',
            isStreaming: false,
            opportunities: data.opportunities || [],
            metadata: {
              llm_used: data.llm_used,
              nlweb_used: data.nlweb_used,
              query_type: data.query_type
            }
          };
        }
        return m;
      }));

      if (data.user_has_cv !== undefined) {
        setCvStatus({
          hasCV: data.user_has_cv,
          cvCount: data.cv_count || 0
        });
      }

      if (user?.id) {
        const newConv: Conversation = {
          id: convId,
          title: currentMessage.slice(0, 40) + (currentMessage.length > 40 ? '...' : ''),
          preview: data.response?.slice(0, 60) + '...',
          created_at: new Date(),
          updated_at: new Date(),
          messages_count: messages.length + 2
        };
        setConversations(prev => {
          const existing = prev.findIndex(c => c.id === convId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { ...updated[existing], ...newConv };
            return updated;
          }
          return [newConv, ...prev].slice(0, 10);
        });
      }

    } catch (error) {
      console.error('Error calling Morchid API:', error);
      setMessages(prev => prev.map(m => {
        if (m.id === streamingId) {
          return {
            ...m,
            id: `error_${Date.now()}`,
            text: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
            isStreaming: false
          };
        }
        return m;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    initializeWelcomeMessage();
    setHistoryPanelOpen(false);
  };

  const loadConversation = async (convId: string) => {
    if (!user?.id) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/morchid/conversation?id=${convId}&userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = [];
        data.messages?.forEach((msg: any) => {
          loadedMessages.push({
            id: `user_${msg.id}`,
            text: msg.user_message,
            sender: 'user',
            timestamp: new Date(msg.created_at)
          });
          loadedMessages.push({
            id: `bot_${msg.id}`,
            text: msg.ai_response,
            sender: 'bot',
            timestamp: new Date(msg.created_at),
            opportunities: msg.conversation_context?.opportunities
          });
        });
        setMessages(loadedMessages);
        setCurrentConversationId(convId);
        setHistoryPanelOpen(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const quickActions = [
    { label: 'Find Jobs', icon: BriefcaseIcon, query: 'Help me find relevant job opportunities based on my profile' },
    { label: 'Review CV', icon: DocumentTextIcon, query: 'I want to improve my CV. What should I focus on?' },
    { label: 'Career Path', icon: SparklesIcon, query: 'What career paths would be good for someone with my experience?' },
    { label: 'Interview Tips', icon: AcademicCapIcon, query: 'Give me interview preparation tips for NGO positions' },
    { label: 'Funding', icon: CurrencyDollarIcon, query: 'Show me available funding opportunities' },
    { label: 'Training', icon: BookmarkIcon, query: 'What training programs would help me grow?' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#556B2F] to-[#6B8E23] rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Morchid AI Assistant</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Ready to help with your career journey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* CV Status Badge */}
          {user && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              cvStatus.hasCV ? 'bg-[#556B2F]/10 text-[#556B2F]' : 'bg-amber-100 text-amber-700'
            }`}>
              <DocumentTextIcon className="w-4 h-4" />
              {cvStatus.hasCV ? `${cvStatus.cvCount} CV${cvStatus.cvCount > 1 ? 's' : ''}` : 'No CV'}
            </div>
          )}

          {/* History Toggle */}
          <button
            onClick={() => setHistoryPanelOpen(!historyPanelOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm text-gray-600"
          >
            <ClockIcon className="w-4 h-4" />
            History
            {conversations.length > 0 && (
              <span className="bg-[#556B2F] text-white text-xs px-1.5 py-0.5 rounded-full">
                {conversations.length}
              </span>
            )}
          </button>

          {/* New Chat Button */}
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            New Chat
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 text-[#556B2F] animate-spin" />
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23] shadow-md'
                          : 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23] shadow-md'
                      }`}>
                        {message.sender === 'user' ? (
                          <UserIcon className="w-4 h-4 text-white" />
                        ) : (
                          <SparklesIcon className="w-4 h-4 text-white" />
                        )}
                      </div>

                      <div className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white shadow-lg'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}>
                        {message.isStreaming ? (
                          <div className="flex items-center gap-2 py-1">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-[#6B8E23] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-[#6B8E23] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-[#6B8E23] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-sm text-gray-400">Thinking...</span>
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed">
                            {message.sender === 'user' ? (
                              <p>{message.text}</p>
                            ) : (
                              renderFormattedText(message.text)
                            )}
                          </div>
                        )}

                        <div className={`flex items-center gap-2 mt-2 text-xs ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {message.metadata?.llm_used && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#556B2F]/10 text-[#556B2F] rounded-full text-[10px]">
                              <SparklesIcon className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {message.opportunities && message.opportunities.length > 0 && (
                      <div className="mt-3 ml-10 space-y-2">
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <MagnifyingGlassIcon className="w-3 h-3" />
                          Found {message.opportunities.length} opportunities
                        </p>
                        <div className="grid gap-2">
                          {message.opportunities.slice(0, 3).map((opp) => (
                            <OpportunityCard key={opp.id} opportunity={opp} />
                          ))}
                        </div>
                        {message.opportunities.length > 3 && (
                          <button className="text-sm text-[#556B2F] hover:text-[#6B8E23] font-medium flex items-center gap-1">
                            View all {message.opportunities.length} opportunities
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* History Slide Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 z-10 ${
          historyPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Conversation History</h3>
              <button
                onClick={() => setHistoryPanelOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversation history</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                      currentConversationId === conv.id 
                        ? 'bg-[#556B2F]/10 border border-[#556B2F]/30' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <ChatBubbleLeftRightIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        currentConversationId === conv.id ? 'text-[#556B2F]' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          currentConversationId === conv.id ? 'text-[#556B2F]' : 'text-gray-700'
                        }`}>
                          {conv.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{conv.preview}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          {conv.created_at.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 md:px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-500 mb-3 text-center">Quick actions to get started:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInputMessage(action.query)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#556B2F]/50 hover:bg-[#556B2F]/5 hover:text-[#556B2F] transition-all duration-200 shadow-sm"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-[#556B2F]/50 focus-within:bg-white transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about jobs, career advice, CV tips..."
              className="flex-1 resize-none bg-transparent px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="flex-shrink-0 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-xl p-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300"
            >
              {isTyping ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Morchid uses AI to provide career guidance. Responses are personalized based on your profile and CV.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
