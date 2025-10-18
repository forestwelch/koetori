export default function Home() {
  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light mb-3 bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
            Koetori
          </h1>
          <p className="text-[#94a3b8] text-sm font-light">Voice Capture & Transcription</p>
        </div>
        
        {/* Main card with glass morphism */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#f43f5e] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
          
          {/* Glass card */}
          <div className="relative bg-[#14151f]/80 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-12">
            <div className="flex flex-col items-center text-center gap-6">
              {/* Recording button with glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#6366f1] rounded-full blur-xl opacity-50 animate-pulse" />
                <button className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#6366f1]/50 hover:shadow-xl hover:shadow-[#6366f1]/70 hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-[#e2e8f0] text-lg font-light">
                  Ready to Record
                </p>
                <p className="text-[#64748b] text-sm font-light">
                  Click the microphone to start capturing audio
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: "🎙️", label: "High Quality" },
            { icon: "⚡", label: "Fast Processing" },
            { icon: "🔒", label: "Secure" }
          ].map((feature, index) => (
            <div key={index} className="relative group/feature">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1]/20 to-[#f43f5e]/20 rounded-xl blur opacity-0 group-hover/feature:opacity-100 transition duration-300" />
              <div className="relative bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/20 p-4 text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-[#94a3b8] text-xs font-light">{feature.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
