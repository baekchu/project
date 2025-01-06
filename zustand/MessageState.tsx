import { create } from 'zustand';

type MessageState = {
    chatRoomID: string;
    setChatRoomID: (newRoom: string) => void;

    isChatOpen: boolean;
    ToggleChatOpen: () => void;


    newGetter: string;
    setNewGetter: (otherUid: string) => void;    // 유저에게 메세지 버튼을 누르면 이걸로 상대방 uid 설정
};

const useMessageState = create<MessageState>((set) => ({
    chatRoomID: "",
    setChatRoomID: (newRoom) => set(() => ({
        chatRoomID: newRoom,
    })),

    isChatOpen: false,
    ToggleChatOpen: () => set((state) => ({
        isChatOpen: !state.isChatOpen,
    })),

    
    newGetter: "",
    setNewGetter: (otherUid) => set(() => ({
        newGetter: otherUid,
    })),
}));

export default useMessageState;