
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, AppSection, UserProfile, Project, Message } from './types';
import { 
  INTEREST_CATEGORIES, 
  HOBBY_CATEGORIES, 
  PET_OPTIONS, 
  GENDER_OPTIONS, 
  SEXUALITY_OPTIONS 
} from './constants';
import Layout from './components/Layout';
import ProfileCard from './components/ProfileCard';
import { 
  Mail, Phone, Lock, Eye, EyeOff, Github, Linkedin, Terminal, 
  ChevronRight, Check, Upload, MapPin, Search, Send, Plus, 
  Trash2, MessageCircle, GitBranch, Star, ExternalLink, 
  Ghost, X, Zap, ShieldCheck, Edit3, Calendar, Heart, 
  User as UserIcon, Settings, Beer, Cigarette, Dog, Coffee
} from 'lucide-react';
import { verifyIdentity } from './services/gemini';

// --- PROJECT POOL FOR UNIQUE PROFILES ---
const DUMMY_PROJECT_POOL: Project[] = [
  { id: 'p101', name: 'Z-Compiler', description: 'A custom high-level language compiler targeting WebAssembly with zero-cost abstractions.', techStack: ['Rust', 'Wasm', 'LLVM'], stars: 2400, forks: 180 },
  { id: 'p102', name: 'Neural-Audio', description: 'Real-time neural network for background noise cancellation in high-fidelity audio streams.', techStack: ['Python', 'TensorFlow', 'C++'], stars: 1500, forks: 95 },
  { id: 'p103', name: 'Flux-DB', description: 'A time-series database optimized for high-throughput IoT telemetry data with compression.', techStack: ['Go', 'TimescaleDB', 'gRPC'], stars: 3100, forks: 240 },
  { id: 'p104', name: 'Aether-OS', description: 'A microkernel-based operating system focused on formal verification and memory safety.', techStack: ['Zig', 'x86_64', 'QEMU'], stars: 890, forks: 60 },
  { id: 'p105', name: 'Lumina-CSS', description: 'A utility-first CSS-in-JS library with compile-time optimization and zero runtime overhead.', techStack: ['TypeScript', 'Babel', 'PostCSS'], stars: 4200, forks: 310 },
  { id: 'p106', name: 'Vault-Sync', description: 'P2P encrypted file synchronization using a distributed hash table (DHT).', techStack: ['Rust', 'libp2p', 'SQLite'], stars: 1100, forks: 88 },
  { id: 'p107', name: 'Deep-Scan', description: 'Automated static analysis tool for detecting Reentrancy and Integer Overflow in Solidity.', techStack: ['Solidity', 'Rust', 'JavaScript'], stars: 560, forks: 42 },
  { id: 'p108', name: 'Pixel-Engine', description: 'A 2D game engine built from scratch with custom collision physics and sprite batching.', techStack: ['C++', 'SDL2', 'OpenGL'], stars: 1300, forks: 120 },
  { id: 'p109', name: 'Graph-Flow', description: 'Visual node-based editor for creating complex serverless workflows and API pipelines.', techStack: ['React', 'D3.js', 'Node.js'], stars: 2700, forks: 195 },
  { id: 'p110', name: 'Bio-Signal', description: 'An open-source platform for visualizing EEG data in real-time using Bluetooth Low Energy.', techStack: ['C#', 'Unity', 'Arduino'], stars: 450, forks: 30 }
];

// --- VIBES & LANDSCAPES FOR AI DIVERSITY ---
const PERSON_VIBES = [
  "wearing a modern stylish hoodie, urban loft office background with warm lighting",
  "wearing a professional minimalist blazer, bright glass startup headquarters, clean lighting",
  "wearing tech-wear apparel, futuristic lab with glowing monitors and blue light",
  "wearing a casual denim jacket, cozy home library filled with technical books, soft lighting",
  "wearing a sharp black turtleneck, dark dark academic office, dramatic cinematic lighting"
];

const LANDSCAPES = [
  "a breathtaking view of a neon cyberpunk city at twilight, rainy reflections",
  "a serene tropical beach at sunset with golden glowing sand and turquoise waves",
  "majestic snow-capped mountain peaks during the blue hour with glowing mist",
  "a futuristic floating forest with ethereal bioluminescent plants and waterfalls",
  "a vast red desert landscape on mars with twin moons in a starry sky"
];

// --- MOCK DATA GENERATOR ---
const generateMockUser = (id: string, name: string, gender: string, sexuality: string, age: number): UserProfile => {
  const shuffledPool = [...DUMMY_PROJECT_POOL].sort(() => 0.5 - Math.random());
  const userProjects = shuffledPool.slice(0, 3);

  // Derive stable indices from the ID string to ensure consistent yet different profiles
  const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const vibeIndex = charCodeSum % PERSON_VIBES.length;
  const landscapeIndex = (charCodeSum + 7) % LANDSCAPES.length;

  const encodePrompt = (p: string) => encodeURIComponent(p);
  
  let basePrompt = '';
  if (gender.toLowerCase().includes('female')) {
    basePrompt = `highly detailed cinematic portrait of a beautiful professional female software engineer, ${PERSON_VIBES[vibeIndex]}, ultra-realistic, 8k resolution, masterpiece, detailed skin texture, expressive eyes`;
  } else if (gender.toLowerCase().includes('male')) {
    basePrompt = `highly detailed cinematic portrait of a handsome professional male software engineer, ${PERSON_VIBES[vibeIndex]}, ultra-realistic, 8k resolution, masterpiece, detailed skin texture, strong features`;
  } else {
    basePrompt = `highly detailed cinematic portrait of a stylish non-binary software professional, ${PERSON_VIBES[vibeIndex]}, ultra-realistic, 8k resolution, masterpiece, detailed skin texture, artistic expression`;
  }

  const landscapePrompt = `${LANDSCAPES[landscapeIndex]}, cinematic perspective, 8k resolution, high contrast, vibrant colors, masterpiece`;

  return {
    id,
    fullName: name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: '+1 234 567 8900',
    gender: gender as any,
    sexuality: sexuality as any,
    dob: '1998-05-15',
    photos: [
      `https://image.pollinations.ai/prompt/${encodePrompt(basePrompt)}?seed=${id}&width=800&height=1200&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodePrompt(landscapePrompt)}?seed=${id}land&width=800&height=1200&nologo=true`
    ],
    interests: ['React', 'TypeScript', 'Tailwind', 'AI'],
    hobbies: ['Coding', 'Chess'],
    habits: { drink: 'occasionally', smoke: 'no' },
    pets: ['Cat'],
    age,
    topProject: userProjects[0],
    lastProject: userProjects[1],
    recentProjects: userProjects
  };
};

const MOCK_DISCOVERY_FEED: UserProfile[] = [
  generateMockUser('u101', 'Sophia Martinez', 'Female', 'Straight', 24),
  generateMockUser('u102', 'Liam Henderson', 'Male', 'Straight', 29),
  generateMockUser('u103', 'Riley Jaxon', 'Non-binary', 'Bisexual', 22),
  generateMockUser('u104', 'Isabella Vane', 'Female', 'Straight', 27),
  generateMockUser('u105', 'Marcus Chen', 'Male', 'Gay', 26),
];

// --- SUCCESS POPUP MODAL ---
const SuccessPopup = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl animate-scaleIn text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

// --- PREMIUM MODAL COMPONENT ---
const PremiumModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleIn">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12 relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20 mb-6 rotate-3">
              <Zap size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Upgrade to Premium</h2>
            <p className="text-slate-600">Unlock the full power of DevDate and meet your perfect co-founder.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="group bg-slate-50 border border-slate-200 p-6 rounded-3xl hover:border-blue-500 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Monthly</span>
                <span className="bg-slate-200 px-2 py-1 rounded text-[10px] text-slate-600 font-bold">Standard</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$10</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <button className="w-full mt-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-all">
                Select Plan
              </button>
            </div>

            <div className="relative group bg-blue-50/50 border-2 border-blue-600 p-6 rounded-3xl hover:bg-blue-600/5 transition-all cursor-pointer shadow-lg shadow-blue-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Best Value
              </div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Yearly</span>
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">Save 25%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$90</span>
                <span className="text-slate-500 font-medium">/yr</span>
              </div>
              <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                Get Started
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Premium Perks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {[
                "See who liked your profile",
                "Unlimited collaboration swipes",
                "Advanced tech-stack search",
                "Verified 'Pro' profile badge",
                "Priority chat support",
                "Ad-free coding experience"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-400 text-[10px] mt-10">
            Secure payments via Stripe. Cancel anytime. Terms of service apply.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- PROJECTS CARD COMPONENT ---
const ProjectsCard = ({ user, onRequestEdidate }: { user: UserProfile; onRequestEdidate: () => void }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl h-[600px] flex flex-col border border-slate-200">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Terminal className="text-blue-600" size={28} />
          <span>Project Portfolio</span>
        </h3>
        <p className="text-slate-500 text-sm mt-1">Verified coding contributions by {user.fullName.split(' ')[0]}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {user.recentProjects.map((project) => (
          <div key={project.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                {project.name}
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span className="flex items-center gap-1"><Star size={12} fill="currentColor" className="text-amber-500" /> {project.stars}</span>
                <span className="flex items-center gap-1"><GitBranch size={12} /> {project.forks}</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <span key={tech} className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
        
        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
           <Github size={24} className="mb-2" />
           <span className="text-xs font-medium">Syncing more from GitHub...</span>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3">
        <button 
          onClick={onRequestEdidate}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 group"
        >
          <Coffee size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Request a edidate</span>
        </button>
        <button className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-center">
          View Full Contribution Graph
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState<ViewState>('login');
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [signupStep, setSignupStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isEdidateSuccessOpen, setIsEdidateSuccessOpen] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    sexuality: 'Straight',
    photos: [],
    interests: [],
    hobbies: [],
    habits: { drink: 'no', smoke: 'no' },
    pets: [],
  });

  const [discoveryFeed, setDiscoveryFeed] = useState<UserProfile[]>(MOCK_DISCOVERY_FEED);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState('');

  // Fallback current user for profile visualization if not yet signed up
  useEffect(() => {
    if (!currentUser && view === 'app') {
      setCurrentUser(generateMockUser('me', 'Alex Developer', 'Non-binary', 'Bisexual', 26));
    }
  }, [view, currentUser]);

  // Simulation handlers
  const handleLogin = () => setView('app');
  const handleSignupStart = () => { setView('signup'); setSignupStep(1); };
  
  const nextStep = () => setSignupStep(prev => prev + 1);
  const prevStep = () => setSignupStep(prev => Math.max(1, prev - 1));

  const completeSignup = () => {
    const finalUser = {
      ...formData,
      id: 'me',
      age: 26,
      dob: formData.dob || '1998-05-15',
      topProject: { id: 'my-top', name: 'DevDate Backend', description: 'Architecting the core services for DevDate.', techStack: ['Node.js', 'PostgreSQL'] },
      lastProject: { id: 'my-last', name: 'DevDate UI', description: 'Crafting pixel-perfect React interfaces.', techStack: ['React', 'Tailwind'] },
      recentProjects: [
        { id: 'my-rp1', name: 'DevDate', description: 'This very app!', techStack: ['React', 'TS'], stars: 120, forks: 45 }
      ]
    } as UserProfile;
    setCurrentUser(finalUser);
    setView('app');
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest) 
        ? prev.interests.filter(i => i !== interest) 
        : [...(prev.interests || []), interest]
    }));
  };

  const toggleHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies?.includes(hobby) 
        ? prev.hobbies.filter(h => h !== hobby) 
        : [...(prev.hobbies || []), hobby]
    }));
  };

  const togglePet = (pet: string) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets?.includes(pet) 
        ? prev.pets.filter(p => p !== pet) 
        : [...(prev.pets || []), pet]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...(formData.photos || [])];
        newPhotos[index] = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photos: newPhotos.slice(0, 2)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (userId: string) => {
    const likedUser = discoveryFeed.find(u => u.id === userId);
    if (likedUser) {
      setDiscoveryFeed(prev => prev.filter(u => u.id !== userId));
      if (Math.random() > 0.5) {
        setMatches(prev => [...prev, likedUser]);
      }
    }
  };

  const handlePass = (userId: string) => {
    setDiscoveryFeed(prev => prev.filter(u => u.id !== userId));
  };

  const sendMessage = () => {
    if (!activeChat || !newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: newMessage,
      timestamp: Date.now()
    };
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), msg]
    }));
    setNewMessage('');
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: activeChat.id,
        text: `Hey! Your last project "${activeChat.lastProject.name}" sounds super interesting. Would love to collaborate!`,
        timestamp: Date.now()
      };
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), response]
      }));
    }, 1500);
  };

  // --- VIEWS ---

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white rotate-12">
              <Terminal size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-center mb-8">Find your perfect coding partner.</p>
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Email or Phone Number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
            <button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Log In
            </button>
          </div>

          <div className="my-8 flex items-center">
            <div className="flex-1 h-[1px] bg-slate-100" />
            <span className="px-4 text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-slate-100" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button className="flex items-center justify-center py-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </button>
            <button className="flex items-center justify-center py-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              <Linkedin className="text-[#0077b5]" size={20} fill="currentColor" />
            </button>
            <button className="flex items-center justify-center py-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm text-slate-900">
              <Terminal size={20} />
            </button>
          </div>

          <p className="text-center text-slate-500 mt-8">
            Don't have an account? 
            <button onClick={handleSignupStart} className="text-blue-600 font-semibold ml-1">Sign Up</button>
          </p>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    const totalSteps = 9;
    const progress = (signupStep / totalSteps) * 100;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto mb-12">
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 uppercase tracking-widest font-bold">
            <span>Step {signupStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
          
          {signupStep === 1 && (
            <div className="w-full space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Personal Information</h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" 
                />
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" 
                  />
                  <button className="px-6 bg-slate-100 text-blue-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors">Verify</button>
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" 
                  />
                  <button className="px-6 bg-slate-100 text-blue-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors">Verify</button>
                </div>
              </div>
            </div>
          )}

          {signupStep === 2 && (
            <div className="w-full space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-bold text-slate-900 text-center">Gender & Sexuality</h2>
              <div className="space-y-8">
                <div>
                  <label className="text-slate-500 mb-4 block text-center font-medium">I am a...</label>
                  <div className="flex flex-wrap justify-center gap-3">
                    {GENDER_OPTIONS.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFormData({...formData, gender: opt as any})}
                        className={`px-6 py-2 rounded-full border-2 transition-all font-medium ${
                          formData.gender === opt ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-500 bg-white hover:border-blue-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 mb-4 block text-center font-medium">My sexuality is...</label>
                  <div className="flex flex-wrap justify-center gap-3">
                    {SEXUALITY_OPTIONS.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFormData({...formData, sexuality: opt as any})}
                        className={`px-6 py-2 rounded-full border-2 transition-all font-medium ${
                          formData.sexuality === opt ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-500 bg-white hover:border-blue-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {signupStep === 3 && (
            <div className="w-full space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-slate-900 text-center">Upload Photos</h2>
              <p className="text-slate-500 text-center mb-6">Upload 2 photos. We use AI to verify your face matches.</p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {[0, 1].map(idx => (
                  <label key={idx} className="aspect-[3/4] rounded-2xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all relative overflow-hidden group shadow-sm">
                    {formData.photos?.[idx] ? (
                      <img src={formData.photos[idx]} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="text-slate-400 group-hover:text-blue-600 mb-2" size={32} />
                        <span className="text-xs text-slate-400 font-medium">Add Photo</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, idx)} />
                  </label>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center space-x-3 mt-8 shadow-sm">
                <Check className="text-blue-600" size={24} />
                <span className="text-sm text-blue-800 font-medium">AI facial consistency check enabled. Please ensure you are clearly visible.</span>
              </div>
            </div>
          )}

          {signupStep === 4 && (
             <div className="w-full space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-slate-900 text-center">Identity Verification</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-slate-500 text-sm font-medium">Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                  />
                </div>
                <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm">
                  <Upload size={48} className="text-slate-300" />
                  <p className="text-center">
                    <span className="text-slate-900 font-bold">Upload ID Document</span><br/>
                    <span className="text-slate-500 text-sm">Upload any masked government ID for AI verification</span>
                  </p>
                  <button className="bg-blue-600 px-8 py-2 rounded-full text-white font-bold hover:bg-blue-500 transition-all shadow-md">Select File</button>
                </div>
              </div>
             </div>
          )}

          {signupStep === 5 && (
            <div className="w-full space-y-6 animate-fadeIn h-[60vh] overflow-auto custom-scrollbar pr-4">
              <div className="flex justify-between items-center sticky top-0 bg-slate-50 z-10 py-4">
                <h2 className="text-3xl font-bold text-slate-900">General Interests</h2>
                <button onClick={nextStep} className="text-slate-500 hover:text-slate-900 font-medium">Skip</button>
              </div>
              {INTEREST_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-3 pb-6 border-b border-slate-200 last:border-0">
                  <h3 className="text-blue-600 font-bold flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>{cat.title}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map(item => (
                      <button 
                        key={item}
                        onClick={() => toggleInterest(item)}
                        className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                          formData.interests?.includes(item) 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {signupStep === 6 && (
            <div className="w-full space-y-6 animate-fadeIn h-[60vh] overflow-auto custom-scrollbar pr-4">
              <div className="flex justify-between items-center sticky top-0 bg-slate-50 z-10 py-4">
                <h2 className="text-3xl font-bold text-slate-900">Hobbies</h2>
                <button onClick={nextStep} className="text-slate-500 hover:text-slate-900 font-medium">Skip</button>
              </div>
              {HOBBY_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-3 pb-6 border-b border-slate-200 last:border-0">
                   <h3 className="text-emerald-600 font-bold flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                    <span>{cat.title}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map(item => (
                      <button 
                        key={item}
                        onClick={() => toggleHobby(item)}
                        className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                          formData.hobbies?.includes(item) 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {signupStep === 7 && (
            <div className="w-full space-y-12 animate-fadeIn">
              <h2 className="text-3xl font-bold text-slate-900 text-center">Lifestyle Habits</h2>
              <div className="space-y-12">
                <div className="space-y-4">
                  <p className="text-slate-500 text-center text-lg font-medium">Do you drink?</p>
                  <div className="flex justify-center space-x-4">
                    {['yes', 'no', 'occasionally'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFormData({...formData, habits: {...formData.habits!, drink: opt as any}})}
                        className={`px-8 py-3 rounded-2xl border-2 transition-all capitalize font-bold shadow-sm ${
                          formData.habits?.drink === opt ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200 shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-500 text-center text-lg font-medium">Do you smoke?</p>
                  <div className="flex justify-center space-x-4">
                    {['yes', 'no', 'occasionally'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFormData({...formData, habits: {...formData.habits!, smoke: opt as any}})}
                        className={`px-8 py-3 rounded-2xl border-2 transition-all capitalize font-bold shadow-sm ${
                          formData.habits?.smoke === opt ? 'bg-red-500 border-red-500 text-white shadow-red-200 shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {signupStep === 8 && (
            <div className="w-full space-y-6 animate-fadeIn h-[50vh] overflow-auto custom-scrollbar pr-4">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Do you have pets?</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {PET_OPTIONS.map(pet => (
                  <button 
                    key={pet}
                    onClick={() => togglePet(pet)}
                    className={`px-6 py-2 rounded-full border-2 transition-all font-medium bg-white ${
                      formData.pets?.includes(pet) ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'border-slate-200 text-slate-500 hover:border-amber-300'
                    }`}
                  >
                    {pet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {signupStep === 9 && (
             <div className="w-full space-y-8 animate-fadeIn text-center">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-sm">
                <Check size={48} />
              </div>
              <h2 className="text-4xl font-bold text-slate-900">Setup Complete!</h2>
              <p className="text-slate-600 max-w-md mx-auto font-medium">You're all set to find your coding soulmate. Ready to start collaborating?</p>
              <button 
                onClick={completeSignup}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-200"
              >
                Launch DevDate
              </button>
             </div>
          )}

          {signupStep < 9 && (
            <div className="w-full mt-12 flex justify-between items-center max-w-2xl">
              <button 
                onClick={prevStep}
                disabled={signupStep === 1}
                className="px-8 py-3 text-slate-400 font-bold hover:text-slate-900 disabled:opacity-0 transition-all"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 transition-all group shadow-md"
              >
                <span>Continue</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      onLogout={() => setView('login')}
    >
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <SuccessPopup 
        isOpen={isEdidateSuccessOpen} 
        onClose={() => setIsEdidateSuccessOpen(false)} 
        message="Your request for an Edit Date (edidate) has been sent!!" 
      />
      
      <div className="p-8 h-full bg-slate-50/30">
        {activeSection === 'home' && (
          <div className="max-w-6xl mx-auto h-full flex flex-col items-center justify-start space-y-8">
            <header className="w-full flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                 <Search size={24} className="text-blue-600" />
                 <span>Discovery Feed</span>
               </h2>
               <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-500 shadow-sm">
                 Filters: <span className="text-blue-600 font-bold">Recommended</span>
               </div>
            </header>

            {discoveryFeed.length > 0 ? (
               <div className="w-full flex items-center justify-center gap-8 perspective-1000 animate-fadeIn">
                 <div className="transition-all duration-500 transform scale-100 opacity-100">
                    <ProfileCard 
                      user={discoveryFeed[0]} 
                      onLike={handleLike} 
                      onPass={handlePass} 
                    />
                 </div>
                 <div className="transition-all duration-500 transform scale-100 opacity-100">
                    <ProjectsCard 
                      user={discoveryFeed[0]} 
                      onRequestEdidate={() => setIsEdidateSuccessOpen(true)}
                    />
                 </div>
               </div>
            ) : (
              <div className="text-center space-y-4 mt-20">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No more people nearby</h3>
                <p className="text-slate-500">Try expanding your discovery settings or changing filters.</p>
                <button className="text-blue-600 font-bold hover:underline" onClick={() => setDiscoveryFeed(MOCK_DISCOVERY_FEED)}>Refresh Feed</button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'likes' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Likes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {MOCK_DISCOVERY_FEED.slice(0, 3).map(user => (
                <div key={user.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer shadow-lg border border-slate-100">
                  <img src={user.photos[0]} className="w-full h-full object-cover blur-md group-hover:blur-none transition-all" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                     <button onClick={() => setIsPremiumModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                       <Zap size={14} fill="currentColor" />
                       Reveal Profile
                     </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-bold drop-shadow-md">{user.fullName.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'chats' && (
          <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden flex shadow-2xl">
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
              <div className="p-6 border-b border-slate-100 bg-white/80">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="text-blue-600" size={24} />
                  <span>Matches</span>
                </h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                  <Ghost size={32} />
                </div>
                <div className="text-center">
                  <p className="text-slate-900 font-bold">No current chats</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Your match list is currently empty. Head over to the discovery feed to find your next coding partner!</p>
                </div>
                <button 
                  onClick={() => setActiveSection('home')}
                  className="mt-2 text-blue-600 text-xs font-bold uppercase tracking-widest hover:text-blue-700 transition-colors"
                >
                  Find Matches
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-white relative">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 z-10 p-12 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-4 rotate-3 shadow-inner">
                  <Terminal size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Ready to Build Something?</h3>
                <p className="max-w-md mx-auto text-slate-500">Select a coding partner from your matches to start collaborating on your next big project.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
           <div className="max-w-4xl mx-auto space-y-8">
             <div className="flex justify-between items-center">
               <h2 className="text-3xl font-bold text-slate-900">Project Entries</h2>
               <button className="flex items-center space-x-2 bg-blue-600 px-6 py-2 rounded-xl text-white font-bold hover:bg-blue-700 shadow-md">
                 <Plus size={20} />
                 <span>Add Project</span>
               </button>
             </div>

             <div className="grid gap-6">
                <section className="space-y-4">
                  <h3 className="text-blue-600 font-bold uppercase tracking-widest text-xs">Top Project</h3>
                  <div className="bg-white border-2 border-blue-100 p-8 rounded-3xl relative group shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 mb-2">SocialGraph Core</h4>
                        <p className="text-slate-600 max-w-2xl mb-6">A distributed graph database engine built for sub-millisecond query performance on social networks with over 1B nodes.</p>
                        <div className="flex flex-wrap gap-2">
                          {['Rust', 'Go', 'gRPC', 'RocksDB'].map(t => (
                            <span key={t} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Github size={20}/></button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Other Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">MicroService Helper {i}</h4>
                        <p className="text-slate-600 text-sm mb-4">Generic utility for managing containerized deployments.</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-medium">Last edited 2d ago</span>
                          <div className="flex space-x-2">
                             <button className="text-slate-400 hover:text-slate-900 transition-colors"><Github size={16}/></button>
                             <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
             </div>
           </div>
        )}

        {activeSection === 'profile' && currentUser && (
          <div className="max-w-5xl mx-auto h-full space-y-8 pb-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">My Profile</h2>
                <p className="text-slate-500 mt-1">Manage your digital identity and coding persona.</p>
              </div>
              <button className="flex items-center gap-2 bg-white text-slate-600 px-6 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                <Settings size={18} />
                <span>Account Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card Rectangle */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl sticky top-8">
                  <div className="relative aspect-square">
                    <img 
                      src={currentUser.photos[0] || 'https://picsum.photos/600/600'} 
                      className="w-full h-full object-cover" 
                      alt="Profile"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 border border-white/20 hover:bg-white transition-all shadow-md">
                      <Edit3 size={18} />
                    </button>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">{currentUser.fullName}</h3>
                      <p className="text-blue-100 font-medium flex items-center gap-1 drop-shadow-sm">
                        <MapPin size={14} />
                        <span>San Francisco, CA</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Elevator Pitch</p>
                      <p className="text-slate-700 text-sm leading-relaxed italic">
                        "Building resilient distributed systems and looking for a partner in crime (and code)."
                      </p>
                    </div>
                    <button className="w-full bg-blue-600 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Boxes Grid */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Info Box: Basic Stats */}
                  <DetailBox 
                    icon={<UserIcon size={20} />} 
                    label="Identity" 
                    value={`${currentUser.gender} • ${currentUser.sexuality}`} 
                  />
                  
                  {/* Info Box: DOB */}
                  <DetailBox 
                    icon={<Calendar size={20} />} 
                    label="Birthday" 
                    value={new Date(currentUser.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
                  />

                  {/* Info Box: Interests */}
                  <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl group relative hover:border-blue-400/50 shadow-sm transition-all">
                    <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Heart size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Interests</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests.map(item => (
                        <span key={item} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Info Box: Hobbies */}
                  <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl group relative hover:border-emerald-400/50 shadow-sm transition-all">
                    <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Terminal size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hobbies</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.hobbies.map(item => (
                        <span key={item} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Info Box: Lifestyle */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl group relative hover:border-amber-400/50 shadow-sm transition-all">
                    <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <Beer size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Habits</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 flex items-center gap-2 font-medium"><Beer size={14} /> Drinks</span>
                        <span className="text-slate-900 capitalize font-bold">{currentUser.habits.drink}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 flex items-center gap-2 font-medium"><Cigarette size={14} /> Smokes</span>
                        <span className="text-slate-900 capitalize font-bold">{currentUser.habits.smoke}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Box: Pets */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl group relative hover:border-purple-400/50 shadow-sm transition-all">
                    <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Dog size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pets</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.pets.map(pet => (
                        <span key={pet} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100">
                          {pet}
                        </span>
                      ))}
                      {currentUser.pets.length === 0 && <span className="text-slate-400 text-sm">No pets listed</span>}
                    </div>
                  </div>

                </div>

                {/* Gallery Preview Box */}
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] space-y-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold text-slate-900">Photos Gallery</h4>
                    <button className="text-blue-600 text-sm font-bold hover:underline">Manage Photos</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentUser.photos.map((photo, i) => (
                      <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer relative shadow-sm">
                        <img src={photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all" />
                      </div>
                    ))}
                    <label className="aspect-[3/4] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                      <Plus className="text-slate-400" size={24} />
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// --- HELPER COMPONENT: DETAIL BOX ---
const DetailBox = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-3xl group relative hover:border-blue-400/50 shadow-sm transition-all">
    <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
      <Edit3 size={16} />
    </button>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</h4>
    </div>
    <p className="text-lg font-bold text-slate-900">{value}</p>
  </div>
);
