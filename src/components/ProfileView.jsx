import React from 'react';

const ProfileView = ({ onBack }) => {
    const user = {
        name: "Rishit Ranjan",
        email: "rishit@example.com",
        plan: "EmotiTunes Premium",
        joined: "March 2026",
        stats: [
            { label: "Playlists", value: "12" },
            { label: "Followers", value: "128" },
            { label: "Following", value: "64" }
        ]
    };

    return (
        <div className="flex-1 overflow-y-auto w-full h-full bg-[#121212] rounded-md relative animate-in fade-in zoom-in duration-500">
            {/* Header Background */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#535353] to-[#121212] z-0"></div>
            
            <div className="relative z-10 p-8">
                {/* Top Nav (simplified back button) */}
                <button 
                    onClick={onBack}
                    className="mb-8 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>

                <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-12">
                    {/* Profile Picture */}
                    <div className="w-48 h-48 rounded-full bg-[#282828] shadow-2xl overflow-hidden border-4 border-[#121212] flex-shrink-0 flex items-center justify-center">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="text-center md:text-left">
                        <p className="uppercase text-xs font-bold tracking-widest text-white mb-2">Profile</p>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter">{user.name}</h1>
                        <div className="flex items-center space-x-2 text-sm font-semibold">
                            <span>{user.plan}</span>
                            <span className="text-[#a7a7a7]">•</span>
                            <span className="text-white">{user.stats[0].value} Playlists</span>
                            <span className="text-[#a7a7a7]">•</span>
                            <span className="text-white">{user.stats[1].value} Followers</span>
                            <span className="text-[#a7a7a7]">•</span>
                            <span className="text-white">{user.stats[2].value} Following</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition-colors cursor-default">
                        <h3 className="text-xl font-bold mb-4">Account Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[#a7a7a7] uppercase font-bold tracking-widest mb-1">Email</p>
                                <p className="text-white">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#a7a7a7] uppercase font-bold tracking-widest mb-1">Subscription</p>
                                <p className="text-white">{user.plan}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#a7a7a7] uppercase font-bold tracking-widest mb-1">Member Since</p>
                                <p className="text-white">{user.joined}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition-colors cursor-default flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Top Artists this month</h3>
                            <p className="text-sm text-[#a7a7a7] mb-6">Only visible to you</p>
                            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                                {[
                                    { name: "The Weeknd", id: "wk" },
                                    { name: "Dua Lipa", id: "dl" },
                                    { name: "Drake", id: "dr" },
                                    { name: "Taylor Swift", id: "ts" }
                                ].map((artist, i) => (
                                    <div key={artist.id} className="flex-shrink-0 group cursor-pointer text-center">
                                        <div className="w-24 h-24 rounded-full bg-[#333] border border-[#444] mb-3 overflow-hidden shadow-xl transition-transform group-hover:scale-105">
                                            <img 
                                                src={`https://picsum.photos/seed/${artist.id}/150/150`} 
                                                alt={artist.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-white truncate max-w-[96px]">{artist.name}</p>
                                        <p className="text-xs text-[#a7a7a7]">Artist</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="mt-8 self-start border border-[#a7a7a7] hover:border-white text-white px-6 py-2 rounded-full font-bold text-xs tracking-widest transition-all hover:scale-105">
                            EDIT PROFILE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
