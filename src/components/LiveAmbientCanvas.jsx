import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunset, Sunrise } from 'lucide-react';

export function LiveAmbientCanvas({ children }) {
  const [themeMode, setThemeMode] = useState('auto'); // 'auto', 'dawn', 'day', 'sunset', 'night'
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getEffectiveTheme = () => {
    if (themeMode !== 'auto') return themeMode;
    if (currentHour >= 5 && currentHour < 8) return 'dawn';
    if (currentHour >= 8 && currentHour < 17) return 'day';
    if (currentHour >= 17 && currentHour < 20) return 'sunset';
    return 'night';
  };

  const activeTheme = getEffectiveTheme();

  const themeStyles = {
    dawn: 'bg-[#FAF0E6] text-[#4A2E2B]',
    day: 'bg-[#F5F3EE] text-[#3D2817]',
    sunset: 'bg-[#FDF6ED] text-[#3D2817]',
    night: 'bg-[#181412] text-[#E8E4DD]',
  };

  const themeIcons = {
    dawn: <Sunrise className="w-4 h-4 text-[#E5989B]" />,
    day: <Sun className="w-4 h-4 text-[#D4AF37]" />,
    sunset: <Sunset className="w-4 h-4 text-[#B7410E]" />,
    night: <Moon className="w-4 h-4 text-[#FFD700]" />,
  };

  const cycleTheme = () => {
    const modes = ['auto', 'dawn', 'day', 'sunset', 'night'];
    const nextIdx = (modes.indexOf(themeMode) + 1) % modes.length;
    setThemeMode(modes[nextIdx]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${themeStyles[activeTheme] || themeStyles.day}`}>
      {/* Time-of-Day Ambient Toggle Badge */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={cycleTheme}
          className="px-3.5 py-2 rounded-full bg-[#FAF8F5]/80 dark:bg-[#2A221E]/80 border border-[#B7410E]/20 backdrop-blur-md shadow-lg font-serif text-xs flex items-center gap-2 hover:scale-105 transition-all text-[#3D2817] dark:text-[#E8E4DD]"
          title="Click to change atmosphere mood"
        >
          {themeIcons[activeTheme]}
          <span className="capitalize">{themeMode === 'auto' ? `${activeTheme} (auto)` : activeTheme}</span>
        </button>
      </div>

      {children}
    </div>
  );
}
