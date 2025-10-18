export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#818cf8] to-[#fb7185] bg-clip-text text-transparent">
          Voice Capture
        </h1>
        
        <div className="bg-[#1e293b] rounded-lg shadow-xl border border-slate-700/50 p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <button className="w-16 h-16 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] transition-all duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <p className="text-[#cbd5e1] text-lg">
              Click to start recording
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
