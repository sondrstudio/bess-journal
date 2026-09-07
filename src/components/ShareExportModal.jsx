import React, { useState, useRef, useEffect } from 'react';
import { toJpeg, toBlob } from 'html-to-image';
import confetti from 'canvas-confetti';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Heart, 
  Palette, 
  Image as ImageIcon, 
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const CARD_THEMES = [
  // These render into a downloaded image, so every value is fixed rather than
  // a theme token: the card must look the same whichever mode the site is in.
  {
    id: 'blush',
    name: 'Blush Paper',
    bg: 'bg-[#FDF7F9]',
    border: 'border-[#C2185B]/30',
    headerBg: 'bg-[#C2185B]/10',
    headerText: 'text-[#C2185B]',
    titleColor: 'text-[#45182C]',
    textColor: 'text-[#45182C]/90',
    btnTextColor: 'text-[#45182C]',
    vineColor: '#45182C',
    footerBg: 'bg-[#F0DEE6]/50',
    hexBg: '#FDF7F9',
  },
  {
    id: 'rose',
    name: 'Rose Petal',
    bg: 'bg-[#FFF0F5]',
    border: 'border-[#E11D48]/30',
    headerBg: 'bg-[#E11D48]/10',
    headerText: 'text-[#E11D48]',
    titleColor: 'text-[#881337]',
    textColor: 'text-[#881337]/90',
    btnTextColor: 'text-[#881337]',
    vineColor: '#881337',
    footerBg: 'bg-[#FFE4EF]/50',
    hexBg: '#FFF0F5',
  },
  {
    id: 'midnight',
    name: 'Midnight Rose',
    bg: 'bg-[#1A0E14]',
    border: 'border-[#E0A3BC]/40',
    headerBg: 'bg-[#E0A3BC]/15',
    headerText: 'text-[#E0A3BC]',
    titleColor: 'text-[#FBEAF1]',
    textColor: 'text-[#FBEAF1]/90',
    btnTextColor: 'text-[#FBEAF1]',
    vineColor: '#E0A3BC',
    footerBg: 'bg-[#2A1620]',
    hexBg: '#1A0E14',
  },
  {
    id: 'peony',
    name: 'Peony',
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#DB2777]/30',
    headerBg: 'bg-[#DB2777]/10',
    headerText: 'text-[#DB2777]',
    titleColor: 'text-[#7A1F3D]',
    textColor: 'text-[#7A1F3D]/90',
    btnTextColor: 'text-[#7A1F3D]',
    vineColor: '#7A1F3D',
    footerBg: 'bg-[#F7D9E6]/60',
    hexBg: '#FCE7F3',
  },
];

export function ShareExportModal({ isOpen, onClose, entry }) {
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  
  const exportCardRef = useRef(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#C2185B', '#E0A3BC', '#FFB3CE', '#FDF7F9']
    });
  };

  const generateJpgDataUrl = async () => {
    if (!exportCardRef.current) return null;
    
    // Ensure web fonts are loaded and rendered properly
    if (document.fonts) {
      await document.fonts.ready;
    }

    const dataUrl = await toJpeg(exportCardRef.current, {
      quality: 0.98,
      pixelRatio: 4,
      backgroundColor: selectedTheme.hexBg,
      cacheBust: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      }
    });

    return dataUrl;
  };

  const handleDownloadJpg = async () => {
    if (!exportCardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const dataUrl = await generateJpgDataUrl();
      if (!dataUrl) throw new Error("Failed to render note image");

      const link = document.createElement('a');
      const filename = `bess-note-day-${entry?.id || 'entry'}.jpg`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      triggerConfetti();
      triggerToast("✨ JPG note downloaded successfully!");
    } catch (err) {
      console.error("Export error:", err);
      triggerToast("❌ Couldn't generate image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!exportCardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const blob = await toBlob(exportCardRef.current, {
        quality: 0.98,
        pixelRatio: 4,
        backgroundColor: selectedTheme.hexBg,
        cacheBust: true,
      });

      if (!blob) throw new Error("Blob creation failed");

      const filename = `bess-note-day-${entry?.id || 'entry'}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: entry?.title || 'Daily Thought',
          text: `A daily thought for Bess: "${entry?.thought?.slice(0, 100)}..."`,
        });
        triggerConfetti();
        triggerToast("💖 Shared successfully!");
      } else if (navigator.share) {
        await navigator.share({
          title: entry?.title || 'Daily Thought',
          text: `"${entry?.thought}" — Daily Thought for Bess`,
          url: window.location.href,
        });
        triggerToast("🔗 Link shared!");
      } else {
        await handleDownloadJpg();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Share error:", err);
        triggerToast("Downloaded JPG note directly to your device.");
        await handleDownloadJpg();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!exportCardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const blob = await toBlob(exportCardRef.current, {
        quality: 0.98,
        pixelRatio: 4,
        backgroundColor: selectedTheme.hexBg,
        cacheBust: true,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopied(true);
        triggerConfetti();
        triggerToast("📋 Image copied to clipboard! You can paste it into any app.");
        setTimeout(() => setIsCopied(false), 3000);
      } else {
        // Fallback: copy text
        await navigator.clipboard.writeText(`"${entry?.thought}" — ${entry?.title}`);
        setIsCopied(true);
        triggerToast("📋 Note text copied to clipboard!");
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch (err) {
      console.error("Copy image error:", err);
      // Text fallback
      try {
        await navigator.clipboard.writeText(`"${entry?.thought}" — ${entry?.title}`);
        triggerToast("📋 Text copied to clipboard!");
      } catch (e) {
        triggerToast("❌ Unable to copy to clipboard");
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="w-full max-w-2xl mx-auto my-6 animate-fade-blur-in relative z-20">
      {/* INLINE ARTBOOK EXPORT STUDIO TRAY (No overlay, embedded directly on page) */}
      <div className="relative bg-surface/95 p-5 sm:p-7 rounded-[2.5rem] border-2 border-[#9E4A6B]/25 shadow-xl overflow-hidden backdrop-blur-sm">
        
        {/* Header Bar (Fixed at top) */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-3.5 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-2xl text-ink font-bold leading-tight">
                Export Note Card
              </h2>
              <span className="font-serif text-[11px] italic text-ink/60">
                Create a high-resolution 4:5 image note
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-ink/5 hover:bg-accent/10 text-ink/70 hover:text-accent transition-colors border border-ink/10"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-2.5 mb-3 rounded-xl bg-accent text-background font-serif text-xs font-medium flex items-center justify-center gap-2 animate-fade-blur-in shadow-md shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SCROLLABLE MAIN CONTENT BODY */}
        <div data-lenis-prevent className="overflow-y-auto flex-1 min-h-0 space-y-4 px-1 py-1 my-1">
          {/* Theme Selector */}
          <div className="space-y-2 px-0.5">
            <label className="font-serif text-[11px] font-bold uppercase tracking-wider text-ink/60 flex items-center gap-1.5 px-0.5">
              <Palette className="w-3 h-3 text-accent" />
              Choose Export Style Theme:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-2 rounded-full border text-[11px] font-serif font-bold whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
                    selectedTheme.id === theme.id
                      ? `${theme.bg} ${theme.border} ring-2 ring-accent ${theme.btnTextColor} shadow-md scale-102`
                      : 'bg-surface/90 border-ink/20 text-ink hover:border-accent/50'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-ink/15 inline-block shrink-0 shadow-inner"
                    style={{ backgroundColor: theme.hexBg }}
                  />
                  <span className="whitespace-nowrap">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW CANVAS CONTAINER (Warm paper mount padding) */}
          <div className="my-1">
            <div data-lenis-prevent className="overflow-y-auto max-h-[46vh] rounded-3xl border border-[#9E4A6B]/15 shadow-inner bg-[#F7E4EC]/40 p-6 sm:p-8 flex items-center justify-center">
              
              {/* THE EXPORTABLE CARD */}
              <div
                ref={exportCardRef}
                className={`aspect-[4/5] min-h-[380px] w-full max-w-sm sm:max-w-[360px] my-2 ${selectedTheme.bg} ${selectedTheme.border} border-2 rounded-[1.6rem] p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-colors duration-300`}
              >
                {/* BACKGROUND ARTISTIC ELEMENTS (Butterflies, Petals & Vine) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                  {/* Left Botanical Vine Tendril */}
                  <div className="absolute left-[-5px] top-6 bottom-6 w-10 opacity-[0.22]">
                    <svg viewBox="0 0 40 300" className="w-full h-full text-current" style={{ color: selectedTheme.vineColor }}>
                      <path d="M 20 10 Q 30 80 14 150 T 22 290" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M 20 40 C 35 30, 38 50, 20 56 Z" fill="currentColor" fillOpacity="0.4" />
                      <path d="M 16 110 C 0 100, -4 120, 16 126 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M 18 190 C 34 180, 38 200, 18 206 Z" fill="currentColor" fillOpacity="0.4" />
                      <path d="M 20 250 C 5 240, 2 260, 20 266 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                  </div>

                  {/* Top-Right Ink Butterfly */}
                  <div 
                    className="absolute top-4 right-4 opacity-25"
                    style={{ transform: 'rotate(15deg) scale(0.85)', color: selectedTheme.vineColor }}
                  >
                    <svg width="44" height="44" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M50 20 L50 85" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M50 30 C30 0 0 30 15 50 C0 70 20 100 50 70 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M50 30 C70 0 100 30 85 50 C100 70 80 100 50 70 Z" fill="currentColor" fillOpacity="0.3" />
                    </svg>
                  </div>

                  {/* Bottom-Left Ink Butterfly */}
                  <div 
                    className="absolute bottom-10 left-6 opacity-20"
                    style={{ transform: 'rotate(-20deg) scale(0.7)', color: selectedTheme.vineColor }}
                  >
                    <svg width="44" height="44" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M50 20 L50 85" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M50 30 C30 0 0 30 15 50 C0 70 20 100 50 70 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M50 30 C70 0 100 30 85 50 C100 70 80 100 50 70 Z" fill="currentColor" fillOpacity="0.3" />
                    </svg>
                  </div>

                  {/* Floating Rose Petal 1 (Top-Left) */}
                  <div className="absolute top-[22%] left-[12%] opacity-20 rotate-[-25deg]" style={{ color: selectedTheme.vineColor }}>
                    <svg width="20" height="24" viewBox="0 0 30 35">
                      <path d="M15 0 C28 10 30 25 15 35 C0 25 2 10 15 0 Z" fill="currentColor" fillOpacity="0.4" />
                    </svg>
                  </div>

                  {/* Floating Rose Petal 2 (Middle-Right) */}
                  <div className="absolute top-[48%] right-[8%] opacity-25 rotate-[40deg]" style={{ color: selectedTheme.vineColor }}>
                    <svg width="22" height="26" viewBox="0 0 30 35">
                      <path d="M15 0 C28 10 30 25 15 35 C0 25 2 10 15 0 Z" fill="currentColor" fillOpacity="0.45" />
                    </svg>
                  </div>

                  {/* Floating Rose Petal 3 (Bottom-Right) */}
                  <div className="absolute bottom-[16%] right-[14%] opacity-20 rotate-[-45deg]" style={{ color: selectedTheme.vineColor }}>
                    <svg width="18" height="22" viewBox="0 0 30 35">
                      <path d="M15 0 C28 10 30 25 15 35 C0 25 2 10 15 0 Z" fill="currentColor" fillOpacity="0.4" />
                    </svg>
                  </div>
                </div>

                {/* Card Header Tag & Date (Top) */}
                <div className="flex items-center justify-between border-b border-ink/10 pb-3 shrink-0">
                  <span className={`font-serif text-[11px] uppercase tracking-wider ${selectedTheme.textColor} opacity-60 font-medium`}>
                    {entry.themeTag || `Day 0${entry.id || 1}`}
                  </span>
                  <span className={`font-serif text-[11px] italic ${selectedTheme.textColor} opacity-60`}>
                    Day 0{entry.id || 1}
                  </span>
                </div>

                {/* Card Body (Middle - Centered Content) */}
                <div className="flex-1 flex flex-col justify-center my-auto space-y-3 py-2 px-2 overflow-visible">
                  {/* Note Title */}
                  <div className="space-y-0.5 px-1">
                    <h3 className={`font-serif text-xl sm:text-2xl font-bold leading-tight ${selectedTheme.titleColor}`}>
                      {entry.title || 'A Daily Note'}
                    </h3>
                  </div>

                  {/* Note Poem (if exists) */}
                  {entry.poem && Array.isArray(entry.poem) && (
                    <div className={`p-3 rounded-lg ${selectedTheme.footerBg} font-serif italic text-xs leading-relaxed space-y-0.5 ${selectedTheme.textColor}`}>
                      {entry.poem.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  )}

                  {/* Note Handwritten Body Text (Dynamic font sizing to prevent truncation) */}
                  <div className="px-1">
                    <p className={`font-handwritten ${
                      (entry?.thought || '').length > 150
                        ? 'text-base sm:text-lg leading-snug'
                        : (entry?.thought || '').length > 90
                        ? 'text-lg sm:text-xl leading-relaxed'
                        : 'text-xl sm:text-2xl leading-relaxed'
                    } whitespace-pre-wrap ${selectedTheme.textColor}`}>
                      "{entry.thought}"
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ACTION BUTTON (Fixed at bottom of modal) */}
        <div className="pt-3 mt-1 border-t border-ink/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={handleDownloadJpg}
            disabled={isExporting}
            className="p-3.5 rounded-full bg-ink text-background hover:bg-accent hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 group"
            title="Download JPG note"
            aria-label="Download JPG note"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
