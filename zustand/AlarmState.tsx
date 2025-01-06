import { create } from 'zustand';

/** 사용 방법
 * A) isOpenAlarm 은 알람창의 Open 상태를 나타냄. openAlarm() 을 통해 토글
 * B) callAlarm은 알람창의 새로고침을 요청 상태를 나타냄. updateAlarm() 을 통해 요청
 */

type AlarmState = {
    isOpenAlarm: boolean;
    openAlarm: () => void;

    callAlarm: boolean;
    updateAlarm: () => void;

    isMissionOpen: boolean;
    setIsMissionOpen: (isOpen: boolean) => void;
};

const useAlarmState = create<AlarmState>((set) => ({
    isOpenAlarm: false,
    openAlarm: () => set((state) => ({ isOpenAlarm: !state.isOpenAlarm })),

    callAlarm: false,
    updateAlarm: () => set((state) => ({ callAlarm: !state.callAlarm })),

    isMissionOpen: false,
    setIsMissionOpen: (isOpen: boolean) => set(() => ({ isMissionOpen: isOpen })),
}));

export default useAlarmState;