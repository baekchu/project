"use client"
import { useEffect, useState } from "react";
import {
    daily, weekly, FMission, getMission, missionUpdate
} from "../utility/MissionModule";
import { auth } from "@/config/firebase";
import { addUserExp } from "../utility/ExpModule";
import { useRouter } from "next/navigation";

import { MdOutlineClose } from "react-icons/md";
import useAlarmState from "@/zustand/AlarmState";

const MissionModal = () => {
    const router = useRouter();
    const [missionData, setMissionData] = useState<{ daily: FMission[], weekly: FMission[] }>({ daily: [], weekly: [] });
    const { isMissionOpen, setIsMissionOpen } = useAlarmState();

    // 유저의 미션 패칭
    const fetchMission = async () => {
        if (!auth.currentUser?.uid) return;
        const d = await getMission(auth.currentUser?.uid);
        setMissionData(d);
    };

    useEffect(() => {
        if (isMissionOpen) {
            fetchMission();
        }
    }, [isMissionOpen]);

    const completeTheMission = async (type: "daily" | "weekly", index: number) => {
        if (!auth.currentUser?.uid) return;
        const res = await missionUpdate(auth.currentUser?.uid, type, index, true);
        const point: number = (type === "daily") ? 5 : 25;
        await addUserExp(auth.currentUser?.uid, point);
        if (res) fetchMission();
    };

    // 모달 관리
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
            setIsMissionOpen(false);
        }
    };

    return (
        <>
            {isMissionOpen && (
                <div className="fixed top-0 left-0 w-full h-full z-50
        flex justify-center items-center bg-black bg-opacity-20 p-4"
                    onClick={handleOverlayClick}>

                    <button className="absolute top-6 right-6 w-14 h-14 flex items-center justify-center text-3xl
                     text-neutral-700 bg-neutral-200 hover:bg-neutral-400 rounded shadow" onClick={() => { setIsMissionOpen(false); }}>
                        <MdOutlineClose />
                    </button>

                    <div className="flex flex-col p-6 bg-white gap-4 mx-auto w-full 
                    max-w-[1300px] max-h-full overflow-y-auto shadow rounded">

                        {/** 일일 미션 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-end gap-1 flex-wrap">
                                <div className="flex flex-row items-end gap-1">
                                    <div className="font-bold text-lg">
                                        일일 미션
                                    </div>
                                    <div className="text-sm">
                                        ({missionData.daily.filter(item => item.progress === -1).length}/3)
                                    </div>
                                </div>
                                <div className="text-neutral-500 ml-2 text-sm">
                                    일일 미션은 매일 0시를 기준으로 초기화됩니다.
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                {daily.map((day, index) => {
                                    const isComp: boolean = missionData.daily[index]?.progress === -1;
                                    const isSuccess: boolean = missionData.daily[index]?.progress >= missionData.daily[index]?.threshold;

                                    return (
                                        <div className="flex flex-row items-stretch justify-between gap-1" key={index}>
                                            <div className="flex-1 rounded w-full min-h-[48px] h-fit bg-neutral-100 shadow-inner flex flex-row items-center justify-between px-4 py-1">
                                                <div className="">{day}</div>
                                                <div className="text-sm text-neutral-500">
                                                    {!isComp && missionData.daily[index] &&
                                                        `${Math.min(missionData.daily[index]?.progress, missionData.daily[index]?.threshold)}/${missionData.daily[index]?.threshold}`}
                                                </div>
                                            </div>
                                            {isComp ? <button className="bg-[#EADDF3] rounded w-20 cursor-default" disabled={true}>+5pt</button>
                                                : isSuccess ? <button className="bg-[#B25FF3] hover:bg-[#63308B] text-white rounded w-20"
                                                    onClick={() => { completeTheMission("daily", index) }}>완료</button>
                                                    : <button className="bg-neutral-200 hover:bg-neutral-300 rounded w-20"
                                                        onClick={() => {
                                                            router.push(missionData.daily[index]?.router);
                                                            setIsMissionOpen(false);
                                                        }}>이동</button>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/** 구분선 */}
                        <div className="w-full border-b border-neutral-400 pb-2" />

                        {/** 주간 미션 */}
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-end gap-1 flex-wrap">
                                <div className="flex flex-row items-end gap-1">
                                    <div className="font-bold text-lg">
                                        주간 미션
                                    </div>
                                    <div className="text-sm">
                                        ({missionData.weekly.filter(item => item.progress === -1).length}/5)
                                    </div>
                                </div>
                                <div className="text-neutral-500 ml-2 text-sm">
                                    주간 미션은 월요일 0시를 기준으로 초기화됩니다.
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                {weekly.map((week, index) => {
                                    const isComp: boolean = missionData.weekly[index]?.progress === -1;
                                    const isSuccess: boolean = missionData.weekly[index]?.progress >= missionData.weekly[index]?.threshold;

                                    return (
                                        <div className="flex flex-row items-stretch justify-between gap-1" key={index}>
                                            <div className="flex-1 rounded w-full min-h-[48px] h-fit bg-neutral-100 shadow-inner flex flex-row items-center justify-between px-4 py-1">
                                                <div>{week}</div>
                                                <div className="text-sm text-neutral-500">
                                                    {!isComp && missionData.weekly[index] &&
                                                        `${Math.min(missionData.weekly[index]?.progress, missionData.weekly[index]?.threshold)}/${missionData.weekly[index]?.threshold}`}
                                                </div>
                                            </div>
                                            {isComp ? <button className="bg-[#CCDAF4] rounded w-20 cursor-default">+25pt</button>
                                                : isSuccess ? <button className="bg-[#4A88FF] hover:bg-[#4664D7] text-white rounded w-20"
                                                    onClick={() => { completeTheMission("weekly", index) }}>완료</button>
                                                    : <button className="bg-neutral-200 hover:bg-neutral-300 rounded w-20"
                                                        onClick={() => {
                                                            router.push(missionData.weekly[index]?.router);
                                                            setIsMissionOpen(false);
                                                        }}>이동</button>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default MissionModal;