import { create } from 'zustand';

type InitState = {
    isInitModalOpen: boolean;
    setInitModalOpen: (isOpen: boolean) => void;

    searchWord: string;
    setSearchWord: (newText: string) => void;
};

const useInitState = create<InitState>((set) => ({
    isInitModalOpen: false,
    setInitModalOpen: (isOpen: boolean) => set((state) =>
        (state.isInitModalOpen !== isOpen ? { ...state, isInitModalOpen: isOpen } : state)),

    searchWord: "",
    setSearchWord: (newText: string) => set(() => ({
        searchWord: newText
    })),
}));

export default useInitState;