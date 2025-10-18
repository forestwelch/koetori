const features = [
  { icon: "🎙️", label: "High Quality" },
  { icon: "⚡", label: "Fast Processing" },
  { icon: "🔒", label: "Secure" },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="relative group/feature">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1]/20 to-[#f43f5e]/20 rounded-xl blur opacity-0 group-hover/feature:opacity-100 transition duration-300" />
          <div className="relative bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/20 p-4 text-center">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <p className="text-[#94a3b8] text-xs font-light">{feature.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
