import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic,  ArrowRight, CheckCheck, Clock, Search, X } from 'lucide-react';

interface Message {
  id: string;
  sender: 'student' | 'mentor';
  text: string;
  time: string;
  read: boolean;
  type?: 'text' | 'voice' | 'attachment';
  attachmentName?: string;
  isTyping?: boolean;
}

const QUICK_REPLIES = [
  "I didn't understand this topic",
  "My test score was low",
  "Please give revision plan",
  "I need extra practice task",
  "When is our next session?",
];

// ─── Typing Indicator Component ──────────────────────────────────────────────

const TypingIndicator = ({ avatar, name }: { avatar: string; name: string }) => (
  <div className="flex gap-3 mb-3">
    <img src={avatar} alt={name} className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
    <div className="max-w-[72%]">
      <div className="bg-white text-gray-900 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">{name} is typing...</span>
        </div>
      </div>
    </div>
  </div>
);

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'mentor',
    text: 'Good morning! Ready for today\'s plan? Focus on Simplification and Number Series today.',
    time: '8:12 AM',
    read: true,
    type: 'text',
  },
  {
    id: '2',
    sender: 'mentor',
    text: "Arjun, today's focus is Simplification accuracy — not speed. Do all 30 questions. Mark every wrong one. I want to see less than 5 wrong by the end of this week.",
    time: '8:12 AM',
    read: true,
    type: 'voice',
  },
  {
    id: '3',
    sender: 'student',
    text: 'Yes sir, I will start right away.',
    time: '8:25 AM',
    read: true,
    type: 'text',
  },
  {
    id: '4',
    sender: 'mentor',
    text: 'Good work today! DI set was 71% — that\'s a 14% jump from last week.',
    time: '11:40 PM',
    read: true,
    type: 'text',
  },
  {
    id: '5',
    sender: 'mentor',
    text: 'The RC was below expectations — you\'re rushing the second passage. Tomorrow: attempt 1 passage slowly, 1 under time pressure. Compare.',
    time: '11:41 PM',
    read: true,
    type: 'text',
  },
];

interface StudentChatPageProps {
  mentorName?: string;
  mentorAvatar?: string;
  mentorOnline?: boolean;
}

const StudentChatPage: React.FC<StudentChatPageProps> = ({
  mentorName = 'Rajesh Kumar',
  mentorAvatar = 'https://i.pravatar.cc/150?u=rajesh',
  mentorOnline = true,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMentorTyping, setIsMentorTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'student',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false,
      type: 'text',
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setIsTyping(false);

    // Show mentor typing indicator
    setIsMentorTyping(true);

    // Simulate mentor reply with typing delay
    setTimeout(() => {
      setIsMentorTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'mentor',
          text: 'Got it! I will review and update your task plan accordingly.',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          read: true,
          type: 'text',
        },
      ]);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);

      // Create file attachment messages
      newFiles.forEach(file => {
        const fileMsg: Message = {
          id: `file-${Date.now()}-${Math.random()}`,
          sender: 'student',
          text: `📎 ${file.name}`,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          read: false,
          type: 'attachment',
          attachmentName: file.name,
        };
        setMessages(prev => [...prev, fileMsg]);
      });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const groupedMessages = messages
    .filter(msg => !searchQuery || msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
      const date = 'Today';
      if (!acc.find(g => g.date === date)) acc.push({ date, msgs: [] });
      acc.find(g => g.date === date)!.msgs.push(msg);
      return acc;
    }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">

      {/* Chat Header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="relative">
          <img src={mentorAvatar} alt={mentorName} className="w-11 h-11 rounded-full border-2 border-blue-100" />
          {mentorOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900">{mentorName}</h3>
          <p className={`text-xs font-medium ${mentorOnline ? 'text-green-500' : 'text-gray-400'}`}>
            {mentorOnline ? '● Online · Responds within 2 hrs' : '● Offline'}
          </p>
        </div>
        <button className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                aria-label={`View ${mentorName}'s profile`}>
          View Profile
        </button>
        <button
          onClick={() => setIsSearchMode(!isSearchMode)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label={isSearchMode ? "Close search" : "Search messages"}
        >
          {isSearchMode ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Bar */}
      {isSearchMode && (
        <div className="px-5 py-3 bg-white border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="text-center mb-4">
              <span className="inline-block bg-gray-200 text-gray-500 text-[11px] px-3 py-1 rounded-full font-medium">
                {group.date}
              </span>
            </div>
            {group.msgs.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 mb-3 ${msg.sender === 'student' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.sender === 'mentor' && (
                  <img src={mentorAvatar} alt={mentorName} className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
                )}
                <div className={`max-w-[72%] ${msg.sender === 'student' ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Voice Note */}
                  {msg.type === 'voice' ? (
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm border ${msg.sender === 'mentor' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white text-gray-900 border-gray-200'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <button className={`w-7 h-7 rounded-full flex items-center justify-center ${msg.sender === 'mentor' ? 'bg-white/20' : 'bg-blue-100'}`}>
                          <span className="text-xs">▶</span>
                        </button>
                        <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
                          <div className="w-2/5 h-full bg-white/70 rounded-full" />
                        </div>
                        <span className={`text-xs ${msg.sender === 'mentor' ? 'text-white/70' : 'text-gray-400'}`}>0:42</span>
                      </div>
                      <p className={`text-xs leading-relaxed mt-1 italic ${msg.sender === 'mentor' ? 'text-blue-100' : 'text-gray-500'}`}>
                        Voice Note · {msg.time}
                      </p>
                    </div>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed
                      ${msg.sender === 'student'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'student' && (
                      <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-400' : 'text-gray-300'}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Typing Indicator */}
            {isMentorTyping && (
              <TypingIndicator avatar={mentorAvatar} name={mentorName} />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_REPLIES.map(reply => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              className="whitespace-nowrap text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors font-medium flex-shrink-0"
              aria-label={`Send quick reply: ${reply}`}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-end gap-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload files to share with mentor"
        />

        <button
          onClick={triggerFileUpload}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
          aria-label="Attach file to message"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
            placeholder="Type a message…"
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
            aria-label="Type your message to mentor"
          />
        </div>
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
                aria-label="Record voice message">
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={() => sendMessage(input)}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-md"
          aria-label="Send message"
          disabled={!input.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StudentChatPage;
