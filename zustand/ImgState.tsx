import { FImgData } from '@/components/utility/ImgDataModule';
import { create } from 'zustand';

type ImgState = {
    isImgModalOpen: boolean;
    setImgModalOpen: (isOpen: boolean) => void;

    imgData: FImgData | null;

    imgType: "default" | "following",

    imgIndex: number | undefined;
    setImgIndex: (num: number | undefined, type: "default" |"following") => void;

    imgArray: FImgData[];
    setImgArray: (imgs: FImgData[]) => void;

    followingImgArray: FImgData[];
    setFollowingImgArray: (imgs: FImgData[]) => void;
};

const useImgState = create<ImgState>((set) => ({
    isImgModalOpen: false,
    setImgModalOpen: (isOpen: boolean) => set({ isImgModalOpen: isOpen }),

    imgData: null,

    imgType: "default",

    imgIndex: undefined,
    setImgIndex: (num: number | undefined, type: "default" | "following" = "default") => {
        set((state) => {
            const imgArr: FImgData[] = (type === "default") ? state.imgArray : state.followingImgArray;
            const newIndex = num !== undefined ? Math.min(Math.max(num, 0), imgArr.length - 1) : undefined;
            const newImgData = (newIndex !== undefined) ? imgArr[newIndex] : null;
            return { 
                imgType: type,
                imgIndex: newIndex,
                imgData: newImgData,
            };
        });
    },

    imgArray: [],
    setImgArray: (imgs: FImgData[]) => set({imgArray: imgs}),

    followingImgArray: [],
    setFollowingImgArray: (imgs: FImgData[]) => set({followingImgArray: imgs}),
}));

export default useImgState;