import { userData } from "../Common(Kim)/UserData/userData";
import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";

import {
    MdPersonAddAlt1, MdPersonRemove, MdOutlineMailOutline,
    MdOutlineMoreHoriz, MdEdit, MdOutlineSettings, MdClose,
    MdPerson,
} from "react-icons/md";
import EditProfile from "./EditProfile";
import useMessageState from "@/zustand/MessageState";
import { FUserData, getArtworksCnt, getUserData, toggleFollow } from "../utility/UserDataModule";
import Image from "next/image";

const ProfileBox = ({ uid, setPageUser }: {
    uid: string,
    setPageUser: React.Dispatch<React.SetStateAction<string>>
}) => {
    const pageUser = userData(uid);

    const [isMe, setIsMe] = useState<boolean>(false);
    useEffect(() => {
        if (pageUser.data() && auth.currentUser?.uid && pageUser.data()?.uid === auth.currentUser?.uid) {
            setIsMe(true);
        } else {
            setIsMe(false);
        }
    }, [auth.currentUser?.uid, pageUser]);

    const { setNewGetter } = useMessageState();

    // 편집 모달
    const [editModal, setEditModal] = useState<boolean>(false);

    // 팔로우 상태 관리
    const { isFollowing, handleFollowToggle } = pageUser.useFollow();

    const ActionBtn = ({ icon, onIcon = icon, onClick, isActive = false }:
        {
            icon: React.ReactNode;
            onClick: React.MouseEventHandler<HTMLButtonElement>;
            onIcon?: React.ReactNode;
            isActive?: boolean;
        }) => {
        return (
            <button
                className={`w-6 h-6 flex items-center justify-center rounded
                  text-lg ${isActive ? "text-white bg-[#B25FF3] hover:bg-[#63308B]"
                        : "text-[#B25FF3] bg-white hover:bg-neutral-200"}`}
                onClick={onClick}
            >
                {isActive ? onIcon : icon}
            </button>
        );
    };

    // 작품 수 (나중에 수정 바람)
    const [artworkCnt, setArtworkCnt] = useState<number>(0);
    useEffect(() => {
        const fetchNum = async () => {
            if (uid) {
                const cnt = await getArtworksCnt(uid);
                setArtworkCnt(cnt);
            };
        };
        fetchNum();
    }, [uid]);

    const [folModal, setFolModal] = useState<boolean>(false);
    useEffect(() => {
        if (!folModal) {
            pageUser.refresh();
        }
    }, [folModal]);
    const FollowingModal = () => {
        const [isFolLoading, setIsFolLoading] = useState<boolean>(true);
        const [fols, setFols] = useState<FUserData[]>([]);
        useEffect(() => {
            if (folModal) {
                setIsFolLoading(true);
                const rawFols: string[] = pageUser.data()?.following || [];

                Promise.all(rawFols.map(async (uid) => {
                    const d = await getUserData(uid);
                    return d;
                })).then((userDataArray: FUserData[]) => {
                    setFols(userDataArray);
                    setIsFolLoading(false);
                }).catch((error) => {
                    setIsFolLoading(false);
                });
            }
        }, [folModal, pageUser]);

        return (
            <>
                {folModal &&
                    <div className="fixed w-full max-w-[400px] h-fit max-h-[550px] rounded bg-white p-4 shadow
                    top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
                        <div className="w-full flex flex-row items-center justify-between">
                            <div className="font-bold">
                                팔로우
                            </div>
                            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-200"
                                onClick={() => { setFolModal(false) }}>
                                <MdClose />
                            </button>
                        </div>
                        <div className="w-full border-b border-neutral-400" />
                        <div className="w-full flex-1 flex flex-col gap-1 overflow-y-auto">
                            {isFolLoading ? <>
                                <div className="animation-pulse w-full h-32 flex rounded items-center justify-center text-sm bg-neutral-100">
                                    불러오는 중...
                                </div>
                            </> : <>
                                {fols.length > 0 ? <>
                                    {fols.map((fol) => {
                                        return (
                                            <div className="w-full h-10 p-1 flex flex-row items-center justify-between gap-4"
                                                key={fol.uid}>
                                                {/** 프로필 사진 */}
                                                <Image src={fol.profImg} alt={fol.nickname} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                                {/** 닉네임 */}
                                                <div className="text-sm font-bold flex-1 truncate">
                                                    {fol.nickname}
                                                </div>
                                                {/** 페이지 이동 & 팔로우 취소 버튼 */}
                                                <div className="flex flex-row items-center gap-2">
                                                    <button className="rounded shadow flex items-center justify-center w-7 h-7 hover:bg-neutral-200 text-[#B25FF3] text-lg"
                                                        onClick={() => {
                                                            setPageUser(fol.uid);
                                                            setFolModal(false);
                                                        }}>
                                                        <MdPerson />
                                                    </button>
                                                    <button className="rounded shadow flex items-center justify-center w-7 h-7 hover:bg-neutral-200 text-red-500 text-lg"
                                                        onClick={async () => {
                                                            if (auth.currentUser?.uid && confirm(`${fol.nickname}님의 팔로우를 취소하겠습니까?`)) {
                                                                const res = await toggleFollow(auth.currentUser?.uid, fol.uid);
                                                                if (res !== undefined && !res) {
                                                                    setFols(prevFols => prevFols.filter(item => item.uid !== fol.uid));
                                                                }
                                                            }
                                                        }}>
                                                        <MdPersonRemove />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </> : <>
                                    <div className="w-full h-full flex items-center justify-center text-sm text-neutral-500">
                                        아직 팔로우하는 사람이 없어요..
                                    </div>
                                </>}
                            </>}
                        </div>
                    </div>
                }
            </>
        );
    };

    const [followerModal, setFollowerModal] = useState<boolean>(false);
    useEffect(() => {
        if (!followerModal) {
            pageUser.refresh();
        }
    }, [followerModal]);
    const FollowerModal = () => {
        const [isFolLoading, setIsFolLoading] = useState<boolean>(true);
        const [followers, setFollowers] = useState<FUserData[]>([]);
        useEffect(() => {
            if (followerModal) {
                setIsFolLoading(true);
                const rawFols: string[] = pageUser.data()?.follower || [];

                Promise.all(rawFols.map(async (uid) => {
                    const d = await getUserData(uid);
                    return d;
                })).then((userDataArray: FUserData[]) => {
                    setFollowers(userDataArray);
                    setIsFolLoading(false);
                }).catch((error) => {
                    setIsFolLoading(false);
                });
            }
        }, [followerModal, pageUser]);

        return (
            <>
                {followerModal &&
                    <div className="fixed w-full max-w-[400px] h-fit min-h-32 max-h-[550px] rounded bg-white p-4 shadow
                    top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
                        <div className="w-full flex flex-row items-center justify-between">
                            <div className="font-bold">
                                팔로워
                            </div>
                            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-200"
                                onClick={() => { setFollowerModal(false) }}>
                                <MdClose />
                            </button>
                        </div>
                        <div className="w-full border-b border-neutral-400" />
                        <div className="w-full flex-1 flex flex-col gap-1 overflow-y-auto">
                            {isFolLoading ? <>
                                <div className="animation-pulse w-full h-32 flex rounded items-center justify-center text-sm bg-neutral-100">
                                    불러오는 중...
                                </div>
                            </> : <>
                                {followers.length > 0 ? <>
                                    {followers.map((fol) => {
                                        return (
                                            <div className="w-full h-10 p-1 flex flex-row items-center justify-between gap-4"
                                                key={fol.uid}>
                                                <Image src={fol.profImg} alt={fol.nickname} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                                <div className="text-sm font-bold flex-1 truncate">
                                                    {fol.nickname}
                                                </div>
                                                <div className="flex flex-row items-center gap-2">
                                                    <button className="rounded shadow flex items-center justify-center w-7 h-7 hover:bg-neutral-200 text-[#B25FF3] text-lg"
                                                        onClick={() => {
                                                            setPageUser(fol.uid);
                                                            setFollowerModal(false);
                                                        }}>
                                                        <MdPerson />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </> : <>
                                    <div className="w-full h-32 flex items-center justify-center text-sm text-neutral-500">
                                        아직 팔로워가 없어요..
                                    </div>
                                </>}
                            </>}
                        </div>
                    </div>
                }
            </>
        );
    };

    // 스케치 포인트 관리
    const [point, setPoint] = useState<number>(123456);


    return (
        <>
            {/** 프로필 수정 창 */}
            {editModal && (<EditProfile setModalClose={setEditModal} />)}
            {isMe && <>
                <FollowingModal />
                <FollowerModal />
            </>}

            <div className="absolute bottom-0 md:bottom-2 left-0 p-2 md:max-w-[700px] min-h-[150px] items-stretch w-full flex flex-row gap-2
         md:rounded-lg md:ml-8 lg:ml-16 xl:ml-24"
                style={{ backgroundColor: "rgba(255,255,255,80%)" }}>
                <Image width={128} height={128} className="w-32 h-32 rounded-full object-cover"
                    src={pageUser.data()?.profImg ?? ""}
                    alt={pageUser.data()?.nickname ?? ""} />

                <div className="flex-1 flex flex-col gap-1 px-2">
                    <div className="flex flex-col">
                        <div className="flex flex-row gap-2 items-center truncate">
                            <div className="text-2xl font-bold">
                                {pageUser.data()?.nickname}
                            </div>
                            <div>
                                {pageUser.tier()?.sign}
                            </div>
                            <div className="border-2 border-blue-500 rounded px-2 font-bold text-sm">
                                LV.{pageUser.tier()?.level}
                            </div>
                        </div>
                        <div className="text-neutral-500 text-[11px]">
                            @{uid}
                        </div>
                    </div>
                    <div className="flex flex-row gap-4 text-sm truncate">
                        <div className="flex flex-row gap-2">
                            <div className="font-bold">작품 수</div>
                            <div className="">{artworkCnt}개</div>
                        </div>
                        <div className={`flex flex-row gap-2 ${isMe && "hover:underline cursor-pointer"}`}
                            onClick={() => {
                                if (isMe) {
                                    if (folModal) setFolModal(false);
                                    setFollowerModal(true);
                                };
                            }}>
                            <div className="font-bold">
                                팔로워
                            </div>
                            <div className="">
                                {pageUser.data()?.follower?.length ?? 0}명
                            </div>
                        </div>
                        <div className={`flex flex-row gap-2 ${isMe && "hover:underline cursor-pointer"}`}
                            onClick={() => {
                                if (isMe) {
                                    if (followerModal) setFollowerModal(false);
                                    setFolModal(true);
                                }
                            }}>
                            <div className="font-bold">
                                팔로우
                            </div>
                            <div className="">
                                {pageUser.data()?.following?.length ?? 0}명
                            </div>
                        </div>
                    </div>

                    <div className="w-full border-b border-neutral-200" />

                    <div className="w-full flex-1 text-xs overflow-auto flex flex-col gap-2">
                        <div>
                            {pageUser.data()?.desc}
                        </div>

                        <div className="flex flex-row items-center gap-1 truncate">
                            <div className="rounded-full px-2 text-white bg-[#B25FF3] text-xs">
                                #{pageUser.data()?.category}
                            </div>
                            {pageUser.data()?.tags !== undefined && pageUser.data()?.tags.map((tag, index) => {
                                return (
                                    <div className="rounded-full px-2 text-white bg-neutral-500 text-xs" key={index}>
                                        #{tag}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                    {/** 상단 버튼 */}
                    <div className="flex flex-row gap-1">
                        {isMe ? <>
                            <ActionBtn icon={<MdEdit />}
                                onClick={() => { setEditModal(true) }} />
                            <ActionBtn icon={<MdOutlineSettings />}
                                onClick={() => { console.log("셋팅") }} />
                            {/** 
                            <ActionBtn icon={<MdOutlineMoreHoriz />}
                                onClick={() => { console.log("더보기 탭") }} />
                                */}
                        </> : <>
                            {auth.currentUser?.uid && <>
                                <button className="font-bold text-xs text-[#B25FF3] px-3 py-0.5 rounded bg-white hover:bg-neutral-200"
                                    onClick={() => {
                                        if (auth.currentUser?.uid) {
                                            setPageUser(auth.currentUser?.uid);
                                        };
                                    }}>
                                    내 프로필로
                                </button>
                                <ActionBtn icon={<MdPersonAddAlt1 />} onIcon={<MdPersonRemove />}
                                    onClick={handleFollowToggle}
                                    isActive={isFollowing} />
                                <ActionBtn icon={<MdOutlineMailOutline />}
                                    onClick={() => { setNewGetter(uid) }} />
                                {/** 
                            <ActionBtn icon={<MdOutlineMoreHoriz />}
                                onClick={() => { console.log("더보기 탭") }} />
                                */}
                            </>}
                        </>}
                    </div>


                    {/** 스케치 포인트 
                {isMe && (
                    <div className="w-[150px] shadow rounded-lg">
                        <div className="flex flex-col items-center justify-center w-full
                        bg-[#B25FF3] rounded-lg text-white p-1">
                            <div className="text-xs -my-0.5">스케치 포인트</div>
                            <div className="text-lg font-bold -my-0.5">{point.toLocaleString()}p</div>
                        </div>
                        <div className="w-full px-2 py-0.5 flex flex-row items-center justify-between bg-white text-[#B25FF3] rounded-b-lg">
                            <button className="flex flex-col items-center justify-center w-8 h-8 rounded bg-white hover:bg-neutral-200"
                            onClick={()=>{}}>
                                <div className="text-xl"><MdAddCard /></div>
                            </button>
                            <button className="flex flex-col items-center justify-center w-8 h-8 rounded bg-white hover:bg-neutral-200"
                            onClick={()=>{}}>
                                <div className="text-xl"><MdCurrencyExchange /></div>
                            </button>
                            <button className="flex flex-col items-center justify-center w-8 h-8 rounded bg-white hover:bg-neutral-200"
                            onClick={()=>{}}>
                                <div className="text-xl"><MdHistory /></div>
                            </button>
                            <button className="flex flex-col items-center justify-center w-8 h-8 rounded bg-white hover:bg-neutral-200"
                            onClick={()=>{}}>
                                <div className="text-xl"><MdHelpOutline /></div>
                            </button>
                        </div>
                    </div>
                )}
                */}
                </div>

                <div className="">

                </div>
            </div>

        </>
    );
};

export default ProfileBox;