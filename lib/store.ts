// ─── Global draft state (Zustand) ────────────────────────────────────────────

import { create } from "zustand";
import type {
  DraftState,
  AnnouncementPayload,
  DraftRevealState,
} from "@/types/draft";

interface DraftStore {
  draft: DraftState | null;
  announcement: AnnouncementPayload | null;
  activeTab: "board" | "available" | "team";
  revealState: DraftRevealState;
  pendingPickNumber: number | null;
  pickQueue: AnnouncementPayload[];
  pendingPick: AnnouncementPayload | null;

  enqueuePick: (payload: AnnouncementPayload) => void;
  shiftQueue: () => void;
  clearQueue: () => void;

  setPendingPickNumber: (n: number | null) => void;
  setRevealState: (state: DraftRevealState) => void;
  setDraft: (draft: DraftState) => void;
  setAnnouncement: (payload: AnnouncementPayload | null) => void;
  setActiveTab: (tab: DraftStore["activeTab"]) => void;
  dismissAnnouncement: () => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draft: null,
  announcement: null,
  activeTab: "board",
  revealState: "WAITING_FOR_PICK",
  pendingPick: null,
  pendingPickNumber: null,
  pickQueue: [],
  enqueuePick: (payload) =>
    set((state) => ({
      pickQueue: [...state.pickQueue, payload].sort(
        (a, b) => a.pick.overallPick - b.pick.overallPick,
      ),
    })),
  shiftQueue: () =>
    set((state) => {
      const [, ...rest] = state.pickQueue;
      return {
        pickQueue: rest,
        pendingPick: rest[0] ?? null,
      };
    }),
  clearQueue: () => set({ pickQueue: [], pendingPick: null }),

  setPendingPickNumber: (pendingPickNumber) => set({ pendingPickNumber }),
  setRevealState: (revealState) => set({ revealState }),
  setDraft: (draft) => set({ draft }),
  setAnnouncement: (announcement) => set({ announcement }),
  setActiveTab: (activeTab) => set({ activeTab }),
  dismissAnnouncement: () => set({ announcement: null }),
}));
