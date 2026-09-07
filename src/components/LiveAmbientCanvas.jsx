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
    dawn: 'bg-[#FDEEF2] text-[#5C2340]',
    day: 'bg-background text-ink',
    // Fixed light text: the chip's own background is fixed dark, so a token
    // here would go dark-on-dark once the site is in dark mode.
    sunset: 'bg-[#FCE4EC] text-[#5C2340]',
    night: 'bg-[#1A0E14] text-[#FBEAF1]',
  };

  const themeIcons = {
    dawn: <Sunrise className="w-4 h-4 text-[#E0A3BC]" />,
    day: <Sun className="w-4 h-4 text-[#E0A3BC]" />,
    sunset: <Sunset className="w-4 h-4 text-accent" />,
    night: <Moon className="w-4 h-4 text-[#FFB3CE]" />,
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
          className="px-3.5 py-2 rounded-full bg-surface/80 border border-accent/20 backdrop-blur-md shadow-lg font-serif text-xs flex items-center gap-2 hover:scale-105 transition-all text-ink"
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
