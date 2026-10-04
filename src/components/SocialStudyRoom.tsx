import React, { useState, useEffect } from 'react';
import { RoomPeer, RoomReaction, StudyRoom, UserProfile } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Users, 
  Flame, 
  Send, 
  Sparkles, 
  Plus, 
  Radio, 
  Check, 
  Volume2,
  Lock,
  Compass
} from 'lucide-react';

interface SocialStudyRoomProps {
  profile: UserProfile;
  currentSubject: string;
  onJoinRoomActivity?: () => void;
}

const DEFAULT_ROOMS: StudyRoom[] = [
  {
    id: 'room-oxford',
    name: 'Radcliffe Camera Silent Library',
    category: 'library',
    description: 'Pin-drop quiet cathedral of books. Zero chatter, absolute deep work concentration.',
    ambientSoundSuggested: 'rain',
    peers: [
      {
        id: 'p-1',
        name: 'Elena Rostova',
        avatar: '👩‍🔬',
        subject: 'Differential Geometry',
        state: 'focusing',
        minutesFocusedToday: 135,
        streak: 12,
        lastActive: 'Just now'
      },
      {
        id: 'p-2',
        name: 'Liam Chen',
        avatar: '👨‍💻',
        subject: 'Distributed Raft Consensus',
        state: 'focusing',
        minutesFocusedToday: 180,
        streak: 19,
        lastActive: 'Just now'
      },
      {
        id: 'p-3',
        name: 'Sophia Martinez',
        avatar: '👩‍⚕️',
        subject: 'Cardiovascular Pathology',
        state: 'focusing',
        minutesFocusedToday: 90,
        streak: 5,
        lastActive: '2m ago'
      },
      {
        id: 'p-4',
        name: 'Tariq Al-Mansoor',
        avatar: '👨‍🎓',
        subject: 'Macroeconomic Econometrics',
        state: 'break',
        minutesFocusedToday: 110,
        streak: 8,
        lastActive: 'Just now'
      }
    ]
  },
  {
    id: 'room-shibuya',
    name: 'Shibuya Raindrop Lo-Fi Cafe',
    category: 'cafe',
    description: 'Gentle espresso machine hum, rain against large glass windows, and chilled focus.',
    ambientSoundSuggested: 'rain',
    peers: [
      {
        id: 'p-5',
        name: 'Kenji Takahashi',
        avatar: '👨‍🎨',
        subject: 'Architectural Rendering',
        state: 'focusing',
        minutesFocusedToday: 160,
        streak: 14,
        lastActive: 'Just now'
      },
      {
        id: 'p-6',
        name: 'Chloe Dubois',
        avatar: '👩‍🏫',
        subject: 'Comparative Literature',
        state: 'focusing',
        minutesFocusedToday: 75,
        streak: 3,
        lastActive: '1m ago'
      }
    ]
  },
  {
    id: 'room-cram',
    name: 'Finals Cram Survival Zone',
    category: 'cram',
    description: 'High intensity sprints for upcoming midterms & final exams. Study sprints with synchronized breaks.',
    ambientSoundSuggested: 'binaural',
    peers: [
      {
        id: 'p-7',
        name: 'Aiden Brooks',
        avatar: '👨‍🔬',
        subject: 'Organic Chemistry II',
        state: 'focusing',
        minutesFocusedToday: 210,
        streak: 9,
        lastActive: 'Just now'
      },
      {
        id: 'p-8',
        name: 'Nadia Petrova',
        avatar: '👩‍⚖️',
        subject: 'Constitutional Law Precedents',
        state: 'focusing',
        minutesFocusedToday: 195,
        streak: 15,
        lastActive: 'Just now'
      }
    ]
  }
];

export const SocialStudyRoom: React.FC<SocialStudyRoomProps> = ({
  profile,
  currentSubject,
  onJoinRoomActivity
}) => {
  const [rooms, setRooms] = useState<StudyRoom[]>(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-oxford');
  const [reactions, setReactions] = useState<RoomReaction[]>([]);
  const [intentionInput, setIntentionInput] = useState<string>('');
  const [intentions, setIntentions] = useState<{ id: string; author: string; text: string; time: string }[]>([
    { id: 'i-1', author: 'Elena Rostova', text: 'Finishing Riemannian curvature tensors problem set.', time: '12m ago' },
    { id: 'i-2', author: 'Liam Chen', text: 'Implementing Byzantine fault tolerance test harness.', time: '25m ago' }
  ]);
  const [customRoomCode, setCustomRoomCode] = useState<string>('');
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');

  const currentRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // BroadcastChannel for cross-tab communication
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('stanlake_focus_lounge');
      channel.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'REACTION') {
          setReactions(prev => [data.reaction, ...prev].slice(0, 8));
          soundEngine.playTick();
        } else if (data.type === 'INTENTION') {
          setIntentions(prev => [data.intention, ...prev].slice(0, 15));
        }
      };
    } catch {
      // BroadcastChannel unsupported or restricted in this environment
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  const broadcastEvent = (type: string, payload: Record<string, unknown>) => {
    try {
      const channel = new BroadcastChannel('stanlake_focus_lounge');
      channel.postMessage({ type, ...payload });
      channel.close();
    } catch {}
  };

  const sendReaction = (emoji: string, text: string) => {
    const newReaction: RoomReaction = {
      id: 'react-' + Date.now(),
      peerName: profile.name,
      emoji,
      text,
      timestamp: Date.now()
    };
    setReactions(prev => [newReaction, ...prev].slice(0, 8));
    soundEngine.playChime('bell');
    broadcastEvent('REACTION', { reaction: newReaction });

    if (onJoinRoomActivity) {
      onJoinRoomActivity();
    }
  };

  const handlePostIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentionInput.trim()) return;

    const newInt = {
      id: 'int-' + Date.now(),
      author: profile.name,
      text: intentionInput.trim(),
      time: 'Just now'
    };

    setIntentions(prev => [newInt, ...prev].slice(0, 15));
    setIntentionInput('');
    broadcastEvent('INTENTION', { intention: newInt });
  };

  const handleCreateCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const createdRoom: StudyRoom = {
      id: 'room-' + Date.now(),
      name: newRoomName.trim(),
      category: 'custom',
      description: `Private study room (Invite Code: ${code}). Real-time peer accountability.`,
      ambientSoundSuggested: 'rain',
      peers: [
        {
          id: 'self-peer',
          name: profile.name,
          avatar: profile.avatar || '👨‍🎓',
          subject: currentSubject || 'Focused Study',
          state: 'focusing',
          minutesFocusedToday: profile.totalFocusMinutes,
          streak: profile.currentStreak,
          lastActive: 'Just now',
          isSelf: true
        }
      ]
    };

    setRooms(prev => [...prev, createdRoom]);
    setActiveRoomId(createdRoom.id);
    setIsCreatingRoom(false);
    setNewRoomName('');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomCode.trim()) return;

    const existing = rooms.find(r => r.id === customRoomCode.trim().toLowerCase());
    if (existing) {
      setActiveRoomId(existing.id);
      setCustomRoomCode('');
    } else {
      alert(`Connected to Study Room #${customRoomCode.toUpperCase()}! Your presence is now active.`);
      setCustomRoomCode('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Study Lounge</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE SYNC</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Study alongside dedicated students worldwide or invite your friends using private room codes.
          </p>
        </div>

        {/* Room Switcher / Join Code */}
        <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Room Code (e.g. CRAM9)"
            value={customRoomCode}
            onChange={e => setCustomRoomCode(e.target.value)}
            className="w-44 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 uppercase tracking-wider font-mono focus:outline-none focus:border-neutral-600"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer"
          >
            Join
          </button>
        </form>
      </div>

      {/* Room Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoomId(room.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              activeRoomId === room.id
                ? 'border-emerald-600 bg-neutral-900 shadow-md ring-1 ring-emerald-500/20'
                : 'border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="capitalize font-mono">{room.category}</span>
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <Users className="w-3.5 h-3.5" />
                <span>{room.peers.length + 1} online</span>
              </span>
            </div>

            <h3 className="text-sm font-semibold text-white mt-2 truncate">
              {room.name}
            </h3>

            <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
              {room.description}
            </p>

            {activeRoomId === room.id && (
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Currently In This Lounge</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Active Room Detail & Peers Grid */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{currentRoom.name}</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{currentRoom.description}</p>
          </div>

          {/* Quick Real-Time Peer Cheering Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-neutral-400 mr-1 hidden sm:inline">Send Peer Cheer:</span>
            <button
              onClick={() => sendReaction('👋', 'sent a high-five!')}
              title="Send High-Five"
              className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs text-white transition-colors cursor-pointer"
            >
              👋 High-Five
            </button>
            <button
              onClick={() => sendReaction('☕', 'boosted the lounge with espresso!')}
              title="Coffee Boost"
              className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs text-white transition-colors cursor-pointer"
            >
              ☕ Coffee
            </button>
            <button
              onClick={() => sendReaction('🔥', 'is on fire with deep focus!')}
              title="Focus Flame"
              className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs text-white transition-colors cursor-pointer"
            >
              🔥 Focus
            </button>
            <button
              onClick={() => sendReaction('⚡', 'says keep crushing the material!')}
              title="Zap Momentum"
              className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs text-white transition-colors cursor-pointer"
            >
              ⚡ Momentum
            </button>
          </div>
        </div>

        {/* Floating Reactions Bar */}
        {reactions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {reactions.map(r => (
              <div
                key={r.id}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-neutral-950/80 border border-neutral-800 rounded-full text-xs text-neutral-200 animate-fadeIn"
              >
                <span>{r.emoji}</span>
                <span className="font-semibold text-emerald-400">{r.peerName}</span>
                <span className="text-neutral-400">{r.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Peers Presence Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Students in Room</span>
            <span>Total: {currentRoom.peers.length + 1} Scholars</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Self Card */}
            <div className="p-3.5 rounded-xl border border-emerald-800/80 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{profile.avatar || '👨‍🎓'}</span>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1">
                      <span>{profile.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">(You)</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {profile.totalFocusMinutes}m focused today
                    </div>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                  <span>{profile.currentStreak}d</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-900/40">
                <span className="text-neutral-300 truncate">
                  {currentSubject || 'General Deep Work'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-900/60 text-emerald-200">
                  In Session
                </span>
              </div>
            </div>

            {/* Other Peers */}
            {currentRoom.peers.map(peer => (
              <div
                key={peer.id}
                className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{peer.avatar}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{peer.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {peer.minutesFocusedToday}m focused today
                      </div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                    <span>{peer.streak}d</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-900">
                  <span className="text-neutral-400 truncate max-w-[140px]" title={peer.subject}>
                    {peer.subject}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      peer.state === 'focusing'
                        ? 'bg-neutral-800 text-emerald-300'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {peer.state === 'focusing' ? 'Focusing' : 'Resting'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intention Sharing Board */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Session Intentions Board
            </span>
            <span className="text-[11px] text-neutral-500">Public accountability</span>
          </div>

          <form onSubmit={handlePostIntention} className="flex gap-2">
            <input
              type="text"
              placeholder="Post your session intention (e.g., 'Writing 3 essay paragraphs without opening Twitter')..."
              value={intentionInput}
              onChange={e => setIntentionInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {intentions.map(int => (
              <div
                key={int.id}
                className="flex items-start justify-between gap-3 p-2.5 bg-neutral-950 border border-neutral-800/60 rounded-lg text-xs"
              >
                <div>
                  <span className="font-semibold text-white mr-2">{int.author}:</span>
                  <span className="text-neutral-300">{int.text}</span>
                </div>
                <span className="text-[10px] text-neutral-500 whitespace-nowrap font-mono">{int.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Custom Room Banner */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
        {isCreatingRoom ? (
          <form onSubmit={handleCreateCustomRoom} className="space-y-3">
            <h4 className="text-xs font-semibold text-white">Create a Private Study Lounge</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room Name (e.g. Stanford MCAT Prep Sprint)"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer"
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingRoom(false)}
                className="px-3 py-1.5 border border-neutral-800 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              Want to study with your specific class group or study buddy?
            </div>
            <button
              onClick={() => setIsCreatingRoom(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Room</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
