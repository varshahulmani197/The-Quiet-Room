/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { HomeScreen } from './components/HomeScreen';
import { WritingRoom } from './components/WritingRoom';
import { MemoryRoomModal } from './components/MemoryRoomModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { Moment, AppSettings } from './types';
import {
  getStoredMoments,
  deleteMoment,
  saveMoment,
  getStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import { moodAudioController } from './utils/audio/moodAudioController';

type AppView = 'landing' | 'home' | 'writing';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [moments, setMoments] = useState<Moment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());

  // Active moment for writing or memory room
  const [activeWritingMoment, setActiveWritingMoment] = useState<Moment | null>(null);
  const [inspectingMoment, setInspectingMoment] = useState<Moment | null>(null);

  // Modals & confirmation
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [exportingMoment, setExportingMoment] = useState<Moment | null>(null);
  const [momentToDelete, setMomentToDelete] = useState<Moment | null>(null);

  // Load moments on mount
  useEffect(() => {
    const loaded = getStoredMoments();
    setMoments(loaded);
  }, []);

  const refreshMoments = () => {
    setMoments(getStoredMoments());
  };

  // Navigation handlers
  const handleEnterRoom = () => {
    setCurrentView('home');
  };

  const handleStartNewWriting = () => {
    setActiveWritingMoment(null);
    setCurrentView('writing');
  };

  const handleOpenDemo = () => {
    // Open the seed moment "The Letter I Never Sent" directly in memory room or writing room
    const demo = moments.find((m) => m.title.includes('Letter')) || moments[0];
    if (demo) {
      setInspectingMoment(demo);
    } else {
      handleStartNewWriting();
    }
  };

  const handleOpenMoment = (moment: Moment) => {
    setInspectingMoment(moment);
  };

  const handleContinueWritingFromMemory = (moment: Moment) => {
    setInspectingMoment(null);
    setActiveWritingMoment(moment);
    setCurrentView('writing');
  };

  const handleDeleteRequest = (moment: Moment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMomentToDelete(moment);
  };

  const handleConfirmDelete = () => {
    if (momentToDelete) {
      deleteMoment(momentToDelete.id);
      refreshMoments();
      if (inspectingMoment?.id === momentToDelete.id) {
        moodAudioController.stop(0.5);
        setInspectingMoment(null);
      }
      setMomentToDelete(null);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleMomentSaved = (moment: Moment) => {
    saveMoment(moment);
    refreshMoments();
  };

  return (
    <div className={`min-h-screen bg-[#0a0c10] text-[#e2e4e9] font-sans-modern ${settings.highContrast ? 'contrast-125' : ''}`}>
      {currentView === 'landing' && (
        <LandingPage
          onEnter={handleEnterRoom}
          onExplore={handleEnterRoom}
          onQuickDemo={handleOpenDemo}
        />
      )}

      {currentView === 'home' && (
        <HomeScreen
          moments={moments}
          onNewWriting={handleStartNewWriting}
          onOpenMoment={handleOpenMoment}
          onDeleteMoment={handleDeleteRequest}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      )}

      {currentView === 'writing' && (
        <WritingRoom
          initialMoment={activeWritingMoment}
          settings={settings}
          onExit={() => {
            refreshMoments();
            setCurrentView('home');
          }}
          onMomentSaved={handleMomentSaved}
        />
      )}

      {/* Cinematic Memory Room experience modal */}
      {inspectingMoment && (
        <MemoryRoomModal
          moment={inspectingMoment}
          onClose={() => {
            moodAudioController.stop(1.5);
            setInspectingMoment(null);
          }}
          onContinueWriting={handleContinueWritingFromMemory}
          onExport={(m) => setExportingMoment(m)}
          onDelete={handleDeleteRequest}
        />
      )}

      {/* Global Sanctuary Settings modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onMomentsCleared={refreshMoments}
      />

      {/* Export modal for preserved moments */}
      <ExportModal
        isOpen={Boolean(exportingMoment)}
        onClose={() => setExportingMoment(null)}
        moment={exportingMoment}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {momentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl bg-[#12151e] border border-white/10 p-6 shadow-2xl text-stone-200"
            >
              <div className="flex items-center gap-3 mb-3 text-rose-400">
                <div className="p-2 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </div>
                <h3 className="font-serif-cormorant text-2xl text-stone-100 font-normal">Release this Moment?</h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed mb-6 font-light">
                "{momentToDelete.title || 'Untitled Moment'}" will be permanently removed from your sanctuary.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setMomentToDelete(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  Keep Moment
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-950/40 cursor-pointer"
                >
                  Delete Moment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
