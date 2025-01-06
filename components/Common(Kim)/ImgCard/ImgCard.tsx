import React, { useEffect, useState, memo } from "react";
import {
    FImgData, checkIsLike, checkSaved,
    getImgData, getNewPrice, toggleInspiration
} from "@/components/utility/ImgDataModule";
import { FUserData, getUserData } from "@/components/utility/UserDataModule";

import { BsImages } from "react-icons/bs";
import { Timestamp } from '@/libs/firebase';
import {
    MdAccessTimeFilled, MdBookmarkBorder, MdOutlineBookmark,
    MdLightbulbOutline, MdLightbulb
} from "react-icons/md";
import { auth } from "@/config/firebase";
import { updateMissionProgress } from "@/components/utility/MissionModule";
import { setNewAlarm } from "@/components/utility/AlarmModule";
import { updateUserLog } from "@/components/utility/LogModule";
import toast from "react-hot-toast";

/**
 * 이미지 카드에 대한 기본 모듈
 * @param 
 * @returns 
 */

const ImgCard = ({ type = "default", docID, imgIndex }:
    {
        type: "default" | "fixed" | "withPrice",
        docID: string,
        imgIndex?: number
    }
) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isEnded, setIsEnded] = useState<boolean>(false);

    // 카드 데이터
    const [cardData, setCardData] = useState<FImgData>();
    const [author, setAuthor] = useState<FUserData>();
    useEffect(() => {
        if (type === "withPrice") setIsHovered(true);

        const fetchCardData = async () => {
            const temp = await getImgData(docID);
            if (temp !== undefined) {
                setCardData(temp);
                const ud = await getUserData(temp.uid);
                setAuthor(ud);
            }
        };
        fetchCardData();
    }, []);

    // 클릭 동작 함수
    const handleClick = async () => {
        /*
            상위에서 호출되는 페이지 스크립트에서 작성하는 것으로 수정
        */
    };


    // 시간 계산 함수
    const calculateRemainingTime = (due: Timestamp) => {
        const now = new Date().getTime() / 1000;
        const dueTime = due.seconds;
        const timeDiff = dueTime - now;

        const daysRemaining = Math.floor(timeDiff / (60 * 60 * 24));

        if (daysRemaining > 1) {
            return { time: `${daysRemaining}일`, color: "default" };
        }

        const hoursRemaining = Math.floor(timeDiff / (60 * 60));
        if (hoursRemaining > 1) {
            return { time: `${hoursRemaining}시간`, color: "default" };
        }

        // 남은 분 계산 (시간 이하)
        const minutesRemaining = Math.floor(timeDiff / 60);
        const secondsRemaining = Math.floor(timeDiff % 60);

        if (minutesRemaining >= 5) {
            // 5분 이상 남은 경우
            return ({ time: `${String(minutesRemaining).padStart(2, '0')}:${String(secondsRemaining).padStart(2, '0')}`, color: "default" });
        } else if (minutesRemaining > 0) {
            // 1분부터 4분까지 남은 경우
            return ({ time: '곧 마감', color: "urgent" });
        } else {
            // 마감 시간이 지난 경우
            return ({ time: '마감', color: "end" });
        }
    };
    const CountdownTimer = ({ due }: { due: Timestamp }) => {
        const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(due));

        useEffect(() => {
            const intervalId = setInterval(() => {
                const updatedRemainingTime = calculateRemainingTime(due);
                setRemainingTime(updatedRemainingTime);

                if (updatedRemainingTime.time === '마감' && !isEnded) {
                    setIsEnded(true);
                }
            }, 1000);

            return () => clearInterval(intervalId);
        }, [due, isEnded]);

        return (
            <div className={`absolute top-1 left-1 rounded px-1 py-0.5 text-sm opacity-70 flex flex-row items-center gap-1 text-white
           ${remainingTime.color === "urgent" ? "bg-red-700" : "bg-black"}`}>
                <MdAccessTimeFilled />
                <div className="font-bold">
                    {remainingTime.time}
                </div>
            </div>
        );
    };

    // 액션 버튼
    interface ActionBtnProps {
        icon: React.ReactNode;
        onIcon: React.ReactNode;
        isActive: boolean;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    }
    const ActionBtn: React.FC<ActionBtnProps> = ({ icon, onIcon, isActive, onClick }) => {
        return (
            <button
                className={`w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-neutral-200
                  text-lg ${isActive ? "text-[#B25FF3]" : "text-black"}`}
                onClick={onClick}
            >
                {isActive ? onIcon : icon}
            </button>
        );
    };

    // 북마크 및 영감
    const [bookMarked, setBookMarked] = useState<boolean>(false);
    const [inspirated, setInspirated] = useState<boolean>(false);

    useEffect(() => {
        const fetchInit = async () => {
            if (docID && auth.currentUser?.uid) {
                const insp = await checkIsLike(auth.currentUser?.uid, docID);
                if (insp !== undefined) setInspirated(insp);
                const booked = await checkSaved(auth.currentUser?.uid, docID);
                if (booked !== undefined) setBookMarked(booked);
            };
        }
        fetchInit();
    }, [docID, auth.currentUser?.uid]);

    // 북마킹
    const bookmarking = async () => {
        if (auth.currentUser?.uid && docID) {
            const b = await updateUserLog(auth.currentUser?.uid, "Artwork", "saved", docID, !bookMarked);
            if (b !== undefined) {
                setBookMarked(b);
                toast.success(`${b ? "작품을 저장했습니다" : "저장을 취소했습니다"}`);
            };
        }
    };
    // 영감
    const inspirating = async () => {
        if (auth.currentUser?.uid && docID) {
            const i = await toggleInspiration(docID, auth.currentUser?.uid);
            if (i !== undefined) {
                setInspirated(i);
                await updateMissionProgress(auth.currentUser?.uid, "weekly", 0, i);
                if (i && cardData?.uid) setNewAlarm(auth.currentUser?.uid, cardData.uid, "inspirate", `/?id=${docID}`);
                updateUserLog(auth.currentUser?.uid, "Artwork", "inspired", docID, i);
                toast.success(`${i ? "작품에 영감을 남겼습니다" : "영감을 취소했습니다"}`);
            }
        }
    };


    // 가격
    const [price, setPrice] = useState<number>(0);
    useEffect(() => {
        if (cardData?.type === "auction" && type === "withPrice") {
            const unsubscribe = getNewPrice(docID, (newPrice) => {
                setPrice(newPrice);
            })
            return () => {
                unsubscribe();
            };
        }
    }, [cardData, type]);


    return (
        <>
            {cardData && (
                <div className="m-2 relative rounded shadow cursor-pointer"
                    onMouseEnter={() => { if (type !== "withPrice") setIsHovered(true); }}
                    onMouseLeave={() => { if (type !== "withPrice") setIsHovered(false); }}
                    onClick={handleClick}>
                    <img src={cardData.images[0]} alt={cardData.title}
                        className={`w-full object-cover rounded-lg
            ${type === "fixed" ? "h-[280px]" : "h-auto"}`} />

                    {isEnded ? <>
                        {/** 마감되었을 경우 */}
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <div className="absolute w-full h-full bg-black opacity-50 rounded-lg" />
                            <div className="absolute text-white font-bold">마감되었습니다</div>
                        </div>
                    </> : <>
                        {/** 마감되지 않았을 경우 */}
                        {type === "withPrice" && cardData.due !== undefined && (
                            <CountdownTimer due={cardData.due} />
                        )}

                        <div className="absolute right-2 top-2 flex flex-row items-center gap-2">
                            <div className={`absolute right-0 top-0 flex flex-row items-center gap-2 transition-opacity duration-200
                            ${isHovered ? "opacity-100" : "opacity-0"} `}>

                                {cardData.uid !== auth.currentUser?.uid && (
                                    <ActionBtn
                                        icon={<MdBookmarkBorder />} onIcon={<MdOutlineBookmark />}
                                        isActive={bookMarked} onClick={(e) => {
                                            e.stopPropagation();
                                            bookmarking();
                                        }} />
                                )}
                                <ActionBtn
                                    icon={<MdLightbulbOutline />} onIcon={<MdLightbulb />}
                                    isActive={inspirated} onClick={(e) => {
                                        e.stopPropagation();
                                        inspirating();
                                    }} />
                            </div>
                            {cardData.images.length > 1 && (
                                <div className={`flex flex-row items-center gap-1 rounded shadow text-sm p-0.5 bg-neutral-600 text-white transition-opacity duration-200
                        ${isHovered ? "opacity-0" : "opacity-50"} pointer-events-none`}>
                                    <div className=""><BsImages /></div>
                                    <div className="font-bold">{cardData.images.length}</div>
                                </div>
                            )}
                        </div>

                        <div className={`absolute inset-x-0 bottom-0 px-3 py-2 transition-opacity duration-200
                    bg-gradient-to-b from-[rgba(250,250,250,0.00)] to-[rgba(0,0,0,0.9)] rounded-b-lg
                    ${isHovered ? "opacity-100" : "opacity-0"}`}>
                            <div className={`w-full flex flex-row items-center text-white 
                        ${type === "withPrice" && "justify-between"}`}>
                                <div className="flex flex-row gap-1 items-center">
                                    <img className="w-6 h-6 rounded-full" src={author?.profImg} alt={author?.nickname} />
                                    <div className="text-sm font-bold">{author?.nickname}</div>
                                </div>
                                {type === "withPrice" && (
                                    <div className="font-bold text-lg">
                                        {`${price.toLocaleString()}원`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>}
                </div>
            )}
        </>
    );
};

export default memo(ImgCard);
