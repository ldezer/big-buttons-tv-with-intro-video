import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppSettings } from './types';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './storage';

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  isCaregiverUnlocked: boolean;
  unlockCaregiver: (pin: string) => boolean;
  lockCaregiver: () => void;
  settingsLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isCaregiverUnlocked, setIsCaregiverUnlocked] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s);
      setSettingsLoading(false);
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const unlockCaregiver = useCallback(
    (pin: string): boolean => {
      if (!settings.caregiverPin || settings.caregiverPin === pin) {
        setIsCaregiverUnlocked(true);
        return true;
      }
      return false;
    },
    [settings.caregiverPin]
  );

  const lockCaregiver = useCallback(() => {
    setIsCaregiverUnlocked(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        isCaregiverUnlocked,
        unlockCaregiver,
        lockCaregiver,
        settingsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
