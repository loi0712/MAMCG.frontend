import {create} from 'zustand'

interface FolderState {
    folder: Folder | null
    isLoading: boolean
    setFolder: (folder: Folder) => void
    clearFolder: () => void
    setLoading: (loading: boolean) => void
}

interface Folder {
    id: number;
    name: string;
}

export const useFolderStore = create<FolderState>((set) => ({
    folder: null,
    isLoading: false,
    setFolder: (folder) => set({ folder }),
    clearFolder:() => set ({ folder: null }),
    setLoading: (loading) => set({ isLoading: loading}),
}))