import {create} from 'zustand'

const DEFAULT_MENU = "Đồ hoạ";

interface MenuState {
    menu: string
    setMenu: (menu: string) => void
    clearMenu: () => void
}

export const useMenuStore = create<MenuState>((set) => ({
    menu: DEFAULT_MENU,
    setMenu: (menu) => set({ menu }),
    clearMenu:() => set ({ menu: DEFAULT_MENU }),
}))
