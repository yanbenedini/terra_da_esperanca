"use client";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 h-16 bg-primary flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px] text-secondary-container">home_heart</span>
        </div>
        <span className="text-base font-semibold text-white">{title}</span>
      </div>
      <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
        <span className="material-symbols-outlined text-white/70">notifications</span>
      </button>
    </header>
  );
}
