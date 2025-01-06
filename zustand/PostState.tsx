import { FPost } from '@/components/utility/BulletinModule';
import { create } from 'zustand';

type PostState = {
    isBoardOpen: boolean;
    setBoardOpen: (open: boolean) => void;

    postType: "default" | "popular",
    selectedPostData: FPost | undefined | any;

    postList: any[];
    setPostList: (newPostList: any[]) => void;

    popPostList: any[];
    setPopPostList: (newPostList: any[]) => void;

    postIndex: number | undefined;
    setPostIndex: (newIndex: number | undefined, type: "default" | "popular") => void;

    cardType: "post" | "news",
    setCardType: (type: "post" | "news") => void;
};

const usePostState = create<PostState>((set) => ({
    isBoardOpen: false,
    setBoardOpen: (open: boolean) => {
        set(() => ({ isBoardOpen: open }))
    },

    postType: "default",
    selectedPostData: undefined,

    postList: [],
    setPostList: (newPostList: any[]) => {
        set((state) => ({
            ...state,
            postList: newPostList,
            postIndex: undefined,
        }));
    },

    popPostList: [],
    setPopPostList: (newPopPostList: any[]) => {
        set((state) => ({
            ...state,
            popPostList: newPopPostList,
            postIndex: undefined,
        }));
    },

    postIndex: undefined,
    setPostIndex: (newIndex: number | undefined, type: "default" | "popular") => {
        set((state) => {
            const tempList = (type === "default") ? state.postList : state.popPostList;
            if (newIndex !== undefined && newIndex >= 0 && newIndex < tempList.length) {
                return {
                    ...state,
                    postType: type,
                    isBoardOpen: true,
                    postIndex: newIndex,
                    selectedPostData: tempList[newIndex]
                };
            } else {
                return {
                    ...state,
                    postType: type,
                    isBoardOpen: false,
                    postIndex: undefined,
                    selectedPostData: undefined
                };
            }
        });
    },

    cardType: "post",
    setCardType: (type: "post" | "news") => {
        set(() => ({ cardType: type }))
    },
}));

export default usePostState;