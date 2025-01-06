import { FPortfoilo } from '@/components/utility/PortfoiloModule';
import { create } from 'zustand';

type PortfolioUploadState = {
    isPortfolioUploadOpen: boolean;
    setIsPortfolioUploadOpen: (isOpen: boolean, changeData?: FPortfoilo | null) => void;
    changingDocData: FPortfoilo | null; // null이 가능한 union 타입으로 변경

    isPostUploadOpen: boolean,
    setIsPostUploadOpen: (isOpen: boolean) => void;
};


const usePortfolioUploadState = create<PortfolioUploadState>((set) => ({
    isPortfolioUploadOpen: false,
    changingDocData: null,
    setIsPortfolioUploadOpen: (isOpen: boolean, changeData?: FPortfoilo | null) => set((state) => ({
        isPortfolioUploadOpen: isOpen,
        changingDocData: changeData !== undefined ? changeData : null,
        isPostUploadOpen: false,
    })),

    isPostUploadOpen: false,
    setIsPostUploadOpen: (isOpen: boolean) => set((state) => ({
        isPostUploadOpen: isOpen,
        isPortfolioUploadOpen: false,
        changingDocData: null,
    })),
}));

export default usePortfolioUploadState;