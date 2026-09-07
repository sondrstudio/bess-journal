import React, { useState, useEffect, useRef } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { Edit3, X, Download, Save, Plus, Lock, Check, RotateCcw, Cloud, Loader2, Heart, Trash2 } from 'lucide-react';

export function AuthorEditorModal() {
  const { entries, saveEntries, resetToJSON, setSelectedDayId: setTimelineSelectedDayId, isSyncing } = useTimeline();
  const [isOpen, setIsOpen] = useState(false);
  const editorScrollRef = useRef(null);

  // Lock body scroll when editor modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      // Lenis scrolls the root element, so locking the body alone left the
      // page free to move behind the panel. Lock both.
      const originalRootOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalRootOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  const [selectedDayId, setSelectedDayId] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentThought, setCurrentThought] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [currentUnlockDate, setCurrentUnlockDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDeleteCurrentReaction = async () => {
    const updated = entries.map((e) => {
      if (e.id === Number(selectedDayId)) {
        return { ...e, herReaction: '', reactionDate: null };
      }
      return e;
    });

    try {
      await saveEntries(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Keyboard shortcut listener (Cmd+Shift+E or Ctrl+Shift+E)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update form fields when selectedDayId or entries change
  useEffect(() => {
    const active = entries.find((e) => e.id === Number(selectedDayId)) || entries[0];
    if (active) {
      setCurrentTitle(active.title || '');
      setCurrentThought(active.thought || '');
      setCurrentTag(active.themeTag || 'Thought');
      // Format unlock date string for datetime-local input (YYYY-MM-DDTHH:mm)
      if (active.unlockDate) {
        try {
          const d = new Date(active.unlockDate);
          const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setCurrentUnlockDate(iso);
        } catch (e) {
          setCurrentUnlockDate('');
        }
      } else {
        setCurrentUnlockDate('');
      }
    }
  }, [selectedDayId, entries]);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === '1234' || passcode === 'love' || passcode.trim() !== '') {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleSaveEntry = async () => {
    setIsSaving(true);
    
    // Parse unlock date to ISO string
    let formattedUnlockDate = undefined;
    if (currentUnlockDate) {
      formattedUnlockDate = new Date(currentUnlockDate).toISOString();
    }

    const updated = entries.map((e) => {
      if (e.id === Number(selectedDayId)) {
        return {
          ...e,
          title: currentTitle,
          thought: currentThought,
          themeTag: currentTag,
          unlockDate: formattedUnlockDate || e.unlockDate || new Date().toISOString(),
        };
      }
      return e;
    });

    try {
      await saveEntries(updated);
      setTimelineSelectedDayId(Number(selectedDayId));
      setSaveSuccess(true);
    } catch (err) {
      alert("Error saving to cloud: " + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleAddNewDay = async () => {
    const newId = entries.length + 1;
    const newEntry = {
      id: newId,
      unlockDate: new Date().toISOString(),
      title: `Day ${newId} Title`,
      thought: `Write your message for Day ${newId} here...`,
      themeTag: 'Special Moment',
    };

    const updated = [...entries, newEntry];
    setSelectedDayId(newId);
    setTimelineSelectedDayId(newId);
    
    setIsSaving(true);
    try {
      await saveEntries(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dailyEntries.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-5 right-5 z-[9990] p-3 rounded-full bg-surface/80 backdrop-blur-md border border-ink/15 text-ink hover:text-accent hover:scale-110 transition-all shadow-md group"
        title="Author Editor Portal (Cmd+Shift+E)"
      >
        <Edit3 className="w-4 h-4" />
        <span className="sr-only">Open Author Journal Editor</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-ink/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-blur-in overflow-hidden select-none overscroll-contain"
      onClick={() => setIsOpen(false)}
      onWheel={(e) => {
        if (editorScrollRef.current) {
          editorScrollRef.current.scrollTop += e.deltaY;
        }
      }}
    >
      {/* data-lenis-prevent: Lenis drives scrolling on documentElement, so
          locking body overflow never stopped it and the page kept moving
          under the open panel. This tells Lenis to leave events raised
          inside alone, letting the panel scroll natively. */}
      <div
        ref={editorScrollRef}
        tabIndex={0}
        data-lenis-prevent
        className="relative bg-surface max-w-2xl w-full p-6 sm:p-8 md:p-12 rounded-[2.5rem] border border-ink/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar my-auto select-auto focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Modal Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-3 rounded-full bg-ink/5 hover:bg-accent/10 text-ink hover:text-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* AUTHENTICATION SCREEN */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasscodeSubmit} className="space-y-6 text-center py-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-ink">Author Secret Portal</h2>
              <p className="font-handwritten text-2xl text-ink/70">
                Enter your secret passcode to edit & publish daily notes live.
              </p>
            </div>
            <div className="max-w-xs mx-auto space-y-3">
              <input
                type="password"
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-surface border border-ink/20 text-center font-mono text-lg focus:outline-none focus:border-accent placeholder:text-ink/60"
                autoFocus
              />
              {passError && <p className="text-xs text-rose-600 font-serif">Incorrect passcode. Try '1234' or 'love'.</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-ink text-background font-serif hover:bg-accent transition-colors shadow-lg"
              >
                Unlock Author Editor
              </button>
            </div>
          </form>
        ) : (
          /* EDITOR SCREEN */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" /> Cloud Database Connected
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-ink">Edit Daily Notes</h2>
              </div>
              <button
                onClick={handleAddNewDay}
                disabled={isSaving}
                className="px-4 py-2 rounded-full bg-accent/10 hover:bg-accent/20 text-accent font-serif text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Day
              </button>
            </div>

            {/* Select Day Dropdown */}
            <div className="space-y-2">
              <label className="font-serif text-xs font-bold uppercase tracking-wider text-ink/60">
                Select Day Entry to Edit:
              </label>
              <select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-surface border border-ink/20 font-serif text-lg text-ink focus:outline-none focus:border-accent"
              >
                {entries.map((e) => (
                  <option key={e.id} value={e.id}>
                    Day {e.id} — {e.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <label className="font-serif text-xs font-bold uppercase tracking-wider text-ink/60">
                Entry Title:
              </label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-surface border border-ink/20 font-serif text-xl text-ink focus:outline-none focus:border-accent"
              />
            </div>

            {/* Thought / Note Text Field */}
            <div className="space-y-2">
              <label className="font-serif text-xs font-bold uppercase tracking-wider text-ink/60">
                Letter Text:
              </label>
              <textarea
                value={currentThought}
                onChange={(e) => setCurrentThought(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-2xl bg-surface border border-ink/20 font-handwritten text-2xl text-ink/90 leading-relaxed focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Theme Tag & Unlock Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-serif text-xs font-bold uppercase tracking-wider text-ink/60">
                  Theme Tag:
                </label>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface border border-ink/20 font-serif text-sm text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="font-serif text-xs font-bold uppercase tracking-wider text-ink/60">
                  Unlock Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={currentUnlockDate}
                  onChange={(e) => setCurrentUnlockDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface border border-ink/20 font-mono text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Received Whisper from Her */}
            {(() => {
              const active = entries.find((e) => e.id === Number(selectedDayId));
              if (active && active.herReaction) {
                return (
                  <div className="p-4 rounded-2xl bg-[#FFF5F9] border border-[#FF9EC0] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-handwritten text-lg text-rose-600 font-bold flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-current text-rose-500" /> Her reaction for this day:
                      </span>
                      <button
                        onClick={handleDeleteCurrentReaction}
                        className="text-xs font-serif text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                        title="Delete whisper from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Whisper
                      </button>
                    </div>
                    <p className="font-handwritten text-xl text-[#45182C]/90 italic pt-1">
                      "{active.herReaction}"
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Actions: Save, Download JSON, Reset to JSON */}
            <div className="pt-4 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJSON}
                  className="px-4 py-2.5 rounded-full bg-ink/10 hover:bg-ink/20 text-ink font-serif text-xs font-bold flex items-center gap-2 transition-colors"
                  title="Download updated dailyEntries.json to place in src/data/"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>

                <button
                  onClick={resetToJSON}
                  className="px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-serif text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Clear local browser storage and reload directly from src/data/dailyEntries.json"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to JSON File
                </button>
              </div>

              <button
                onClick={handleSaveEntry}
                disabled={isSaving}
                className="px-7 py-3 rounded-full bg-accent text-background font-serif text-sm font-bold flex items-center gap-2 hover:bg-ink transition-colors shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Syncing to Cloud...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-rose-400" />
                    Saved Live to Cloud!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Publish Live ☁️
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
