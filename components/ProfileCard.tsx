
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Briefcase, Heart, X, Code2 } from 'lucide-react';

interface ProfileCardProps {
  user: UserProfile;
  onLike: (userId: string) => void;
  onPass: (userId: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onLike, onPass }) => {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [activePhoto, setActivePhoto] = useState(0);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhoto((prev) => (prev + 1) % user.photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhoto((prev) => (prev - 1 + user.photos.length) % user.photos.length);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative group h-[600px] flex flex-col border border-slate-100">
      {/* Photo Section */}
      <div className="relative h-2/3">
        <img 
          src={user.photos[activePhoto]} 
          alt={user.fullName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
        
        {/* Photo Navigation Overlay */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full cursor-west-resize" onClick={prevPhoto} />
          <div className="w-1/2 h-full cursor-east-resize" onClick={nextPhoto} />
        </div>

        {/* Indicators */}
        <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1 px-4">
          {user.photos.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all ${idx === activePhoto ? 'bg-white' : 'bg-white/30'}`} 
            />
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h2 className="text-3xl font-bold text-white drop-shadow-md mb-1">{user.fullName}, {user.age}</h2>
          <div className="flex items-center text-blue-50 text-sm space-x-2 drop-shadow-sm font-medium">
            <span className="bg-blue-600/80 px-2 py-0.5 rounded-lg">{user.gender}</span>
            <span className="text-white/70">•</span>
            <span>{user.sexuality}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 relative bg-white">
        {currentPage === 1 ? (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 4).map(interest => (
                  <span key={interest} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold border border-slate-100">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Hobby</p>
                <p className="text-sm text-slate-900 font-bold">{user.hobbies[0] || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pet</p>
                <p className="text-sm text-slate-900 font-bold">{user.pets[0] || 'None'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
             <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                  <Briefcase size={12} className="mr-1" /> Top Project
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-blue-600">{user.topProject.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{user.topProject.description}</p>
                </div>
             </div>
             <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                  <Code2 size={12} className="mr-1" /> Last Worked On
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-emerald-600">{user.lastProject.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{user.lastProject.description}</p>
                </div>
             </div>
          </div>
        )}

        {/* Page Switcher */}
        <button 
          onClick={() => setCurrentPage(currentPage === 1 ? 2 : 1)}
          className="absolute top-2 right-2 p-2 text-slate-300 hover:text-blue-600 transition-colors"
        >
          {currentPage === 1 ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 pb-6 bg-white">
        <button 
          onClick={() => onPass(user.id)}
          className="w-14 h-14 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg hover:bg-red-50 transition-all border border-slate-100"
        >
          <X size={28} />
        </button>
        <button 
          onClick={() => onLike(user.id)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-500 transition-all shadow-blue-200"
        >
          <Heart size={28} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
