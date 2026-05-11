import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { Profile, BigButton, ProfileSettings } from './types';
import { loadProfiles, saveProfiles, generateId } from './storage';

// ─── State ───────────────────────────────────────────────────────────────────

interface ProfilesState {
  profiles: Profile[];
  loading: boolean;
}

type ProfilesAction =
  | { type: 'LOADED'; profiles: Profile[] }
  | { type: 'ADD_PROFILE'; profile: Profile }
  | { type: 'UPDATE_PROFILE'; profile: Profile }
  | { type: 'DELETE_PROFILE'; profileId: string }
  | { type: 'ADD_BUTTON'; profileId: string; button: BigButton }
  | { type: 'UPDATE_BUTTON'; profileId: string; button: BigButton }
  | { type: 'DELETE_BUTTON'; profileId: string; buttonId: string }
  | { type: 'REORDER_BUTTONS'; profileId: string; buttons: BigButton[] }
  | { type: 'TOGGLE_FAVORITE'; profileId: string; buttonId: string };

function reducer(state: ProfilesState, action: ProfilesAction): ProfilesState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, profiles: action.profiles, loading: false };

    case 'ADD_PROFILE':
      return { ...state, profiles: [...state.profiles, action.profile] };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === action.profile.id ? action.profile : p
        ),
      };

    case 'DELETE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.filter(p => p.id !== action.profileId),
      };

    case 'ADD_BUTTON':
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === action.profileId
            ? { ...p, buttons: [...p.buttons, action.button], updatedAt: Date.now() }
            : p
        ),
      };

    case 'UPDATE_BUTTON':
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === action.profileId
            ? {
                ...p,
                buttons: p.buttons.map(b =>
                  b.id === action.button.id ? action.button : b
                ),
                updatedAt: Date.now(),
              }
            : p
        ),
      };

    case 'DELETE_BUTTON':
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === action.profileId
            ? {
                ...p,
                buttons: p.buttons.filter(b => b.id !== action.buttonId),
                updatedAt: Date.now(),
              }
            : p
        ),
      };

    case 'REORDER_BUTTONS':
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === action.profileId
            ? { ...p, buttons: action.buttons, updatedAt: Date.now() }
            : p
        ),
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === action.profileId
            ? {
                ...p,
                buttons: p.buttons.map(b =>
                  b.id === action.buttonId ? { ...b, isFavorite: !b.isFavorite } : b
                ),
                updatedAt: Date.now(),
              }
            : p
        ),
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ProfilesContextValue {
  profiles: Profile[];
  loading: boolean;
  addProfile: (name: string, emoji: string, color: string, settings: ProfileSettings) => Profile;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (profileId: string) => void;
  getProfile: (profileId: string) => Profile | undefined;
  addButton: (profileId: string, button: Omit<BigButton, 'id' | 'profileId'>) => BigButton;
  updateButton: (profileId: string, button: BigButton) => void;
  deleteButton: (profileId: string, buttonId: string) => void;
  reorderButtons: (profileId: string, buttons: BigButton[]) => void;
  toggleFavorite: (profileId: string, buttonId: string) => void;
}

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { profiles: [], loading: true });

  // Load on mount
  useEffect(() => {
    loadProfiles().then(profiles => {
      dispatch({ type: 'LOADED', profiles });
    });
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!state.loading) {
      saveProfiles(state.profiles);
    }
  }, [state.profiles, state.loading]);

  const addProfile = useCallback(
    (name: string, emoji: string, color: string, settings: ProfileSettings): Profile => {
      const profile: Profile = {
        id: generateId(),
        name,
        emoji,
        color,
        buttons: [],
        settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_PROFILE', profile });
      return profile;
    },
    []
  );

  const updateProfile = useCallback((profile: Profile) => {
    dispatch({ type: 'UPDATE_PROFILE', profile: { ...profile, updatedAt: Date.now() } });
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    dispatch({ type: 'DELETE_PROFILE', profileId });
  }, []);

  const getProfile = useCallback(
    (profileId: string) => state.profiles.find(p => p.id === profileId),
    [state.profiles]
  );

  const addButton = useCallback(
    (profileId: string, buttonData: Omit<BigButton, 'id' | 'profileId'>): BigButton => {
      const button: BigButton = { ...buttonData, id: generateId(), profileId };
      dispatch({ type: 'ADD_BUTTON', profileId, button });
      return button;
    },
    []
  );

  const updateButton = useCallback((profileId: string, button: BigButton) => {
    dispatch({ type: 'UPDATE_BUTTON', profileId, button });
  }, []);

  const deleteButton = useCallback((profileId: string, buttonId: string) => {
    dispatch({ type: 'DELETE_BUTTON', profileId, buttonId });
  }, []);

  const reorderButtons = useCallback((profileId: string, buttons: BigButton[]) => {
    dispatch({ type: 'REORDER_BUTTONS', profileId, buttons });
  }, []);

  const toggleFavorite = useCallback((profileId: string, buttonId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', profileId, buttonId });
  }, []);

  return (
    <ProfilesContext.Provider
      value={{
        profiles: state.profiles,
        loading: state.loading,
        addProfile,
        updateProfile,
        deleteProfile,
        getProfile,
        addButton,
        updateButton,
        deleteButton,
        reorderButtons,
        toggleFavorite,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfiles(): ProfilesContextValue {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error('useProfiles must be used within ProfilesProvider');
  return ctx;
}
