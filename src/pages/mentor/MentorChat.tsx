import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, CheckCheck, Paperclip, Mic, Pin } from 'lucide-react';

interface StudentConversation {
  id: string;
  name: string;
  avatar: string;
  exam: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: 'mentor' | 'student';
  text: string;
  time: string;
  read: boolean;
}

const conversations: StudentConversation[] = [
  {
    id: 's1', name: 'Arjun Verma', avatar: 'https://i.pravatar.cc/40?u=arjun2',
    exam: 'IBPS Clerk', lastMessage: "I didn't understand the DI set", lastTime: '15m', unread: 2, online: true,
  },
  {
    id: 's2', name: 'Ananya Rajan', avatar: 'https://i.pravatar.cc/40?u=ananya',
    exam: 'SBI PO', lastMessage: 'Thank you sir!', lastTime: '1h', unread: 0, online: true,
  },
  {
    id: 's3', name: 'Karthik Menon', avatar: 'https://i.pravatar.cc/40?u=karthik',
    exam: 'IBPS PO', lastMessage: 'When is our next session?', lastTime: '2h', unread: 1, online: false,
  },
  {
    id: 's4', name: 'Sneha Gupta', avatar: 'https://i.pravatar.cc/40?u=sneha',
    exam: 'SBI Clerk', lastMessage: 'Done with today tasks!', lastTime: '3h', unread: 0, online: false,
  },
  {
    id: 's5', name: 'Priya Shetty', avatar: 'https://i.pravatar.cc/40?u=priya3',
    exam: 'SBI PO', lastMessage: 'Please give me extra quant task', lastTime: '6h', unread: 1, online: false,
  },
];

const mockMessages: Record<string, Message[]> = {
  s1: [
    { id: '1', sender: 'mentor', text: 'Good morning Arjun! Ready for today plan?', time: '8:12 AM', read: true },
    { id: '2', sender: 'student', text: "Sir I didn't understand the DI set from today's mock", time: '9:30 AM', read: true },
    { id: '3', sender: 'mentor', text: 'Which set exactly? The one with percentage change?', time: '9:32 AM', read: true },
    { id: '4', sender: 'student', text: 'Yes sir, the table DI with 5 categories', time: '9:33 AM', read: false },
    { id: '5', sender: 'student', text: 'I got confused with how to find the difference between years', time: '9:34 AM', read: false },
  ],
  s2: [
    { id: '1', sender: 'mentor', text: "Ananya, your RC score jumped to 88% today. Excellent work!", time: '11:00 AM', read: true },
    { id: '2', sender: 'student', text: 'Thank you sir! I followed your tips for the second passage.', time: '11:15 AM', read: true },
    { id: '3', sender: 'mentor', text: 'Keep doing that. Focus on Syllogism tomorrow.', time: '11:16 AM', read: true },
  ],
  s3: [
    { id: '1', sender: 'student', text: 'When is our next 1:1 session?', time: '2:00 PM', read: false },
  ],
};

const QUICK_REPLIES = [
  'Good progress today!',
  "Check today's task list",
  "I'll review and get back to you",
  'Practice more DI today',
  'We have a session on Saturday 10 AM',
];

const MentorChat: React.FC = () => {
  const [activeId, setActiveId] = useState('s1');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [msgMap, setMsgMap] = useState<Record<string, Message[]>>(mockMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, msgMap]);

  const activeStudent = conversations.find(c => c.id === activeId)!;
  const messages = msgMap[activeId] ?? [];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'mentor',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false,
    };
    setMsgMap(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
    setInput('');
  };

  const filtered = conversations.filter(c =>
    search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.exam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">

      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Student Chats</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-gray-50
                ${activeId === c.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}
            >
              <div className="relative flex-shrink-0">
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full border-2 border-gray-100" />
                {c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-900 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{c.lastTime}</p>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{c.exam}</p>
                <p className="text-[11px] text-gray-400 truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100 shadow-sm">
          <div className="relative">
            <img src={activeStudent.avatar} alt={activeStudent.name} className="w-10 h-10 rounded-full border-2 border-gray-100" />
            {activeStudent.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">{activeStudent.name}</h3>
            <p className="text-xs text-gray-400">{activeStudent.exam} · {activeStudent.online ? <span className="text-green-500">Online</span> : 'Offline'}</p>
          </div>
          <div className="flex gap-2">
            <button className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              Assign Task
            </button>
            <button className="text-xs text-gray-600 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              View Profile
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'mentor' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.sender === 'student' && (
                <img src={activeStudent.avatar} alt={activeStudent.name} className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
              )}
              <div className={`max-w-[70%] flex flex-col ${msg.sender === 'mentor' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.sender === 'mentor'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'mentor' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] text-gray-400">{msg.time}</span>
                  {msg.sender === 'mentor' && (
                    <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-400' : 'text-gray-300'}`} />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="px-4 py-2 bg-white border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_REPLIES.map(r => (
              <button
                key={r}
                onClick={() => sendMessage(r)}
                className="whitespace-nowrap text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors font-medium flex-shrink-0"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-end gap-2">
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 flex-shrink-0">
            <Paperclip className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              placeholder={`Message ${activeStudent.name}…`}
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
            />
          </div>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 flex-shrink-0">
            <Mic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sendMessage(input)}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;
