import { FImgData } from '@/components/utility/ImgDataModule';
import { create } from 'zustand';

type ImgUploadState = {
    isImgUploadOpen: boolean;
    setIsImgUploadOpen: (isOpen: boolean, changeData?: FImgData | null) => void;

    changingDocData: FImgData | null;
};

const useImgUploadState = create<ImgUploadState>((set) => ({
    isImgUploadOpen: false,
    setIsImgUploadOpen: (isOpen: boolean, changeData?: FImgData | null) => set((state) => ({
        isImgUploadOpen: isOpen,
        changingDocData: isOpen ? changeData : null,
    })),

    changingDocData: null,
}));

export default useImgUploadState;