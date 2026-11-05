export function Waveform({ className = "" }: { className?: string }) {
  const bars = [18, 34, 52, 40, 68, 46, 72, 38, 58, 44, 66, 30, 48, 62, 36, 54, 42, 70, 32, 50];

  return (
    <div className={`flex h-full items-end justify-center gap-1.5 sm:gap-2 ${className}`} aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className="wave-bar w-1.5 rounded-full bg-[linear-gradient(180deg,var(--accent),var(--accent-2))] sm:w-2"
          style={{
            height: `${h}%`,
            animationDelay: `${(i % 8) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
