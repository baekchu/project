import react, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    FUserData, FUserTier, checkFollowing, getUserData, getUserTierData, toggleFollow
} from "@/components/utility/UserDataModule";
import { auth } from "@/config/firebase";
import Image from "next/image";

const profileUrl = "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/profile-circle-icon-2048x2048-cqe5466q.png?alt=media&token=7e79c955-af0b-406f-976d-6ab08da3c1c2";

const userData = (otherID: string) => {
    const [userData, setUserData] = useState<FUserData>();
    const [userTier, setUserTier] = useState<FUserTier>();
    const fetchUserData = async () => {
        const ud = await getUserData(otherID);
        setUserData(ud);
        const ut = await getUserTierData(ud.exp);
        setUserTier(ut);
    };
    useEffect(() => {
        fetchUserData();
    }, [otherID]);

    const data = () => {
        return (userData);
    };

    const tier = () => {
        return (userTier);
    };

    const refresh = () => {
        fetchUserData();
    };

    const [isHov, setIsHov] = useState<boolean>(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handleMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHov(true);
        }, 1000);
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);
    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHov(false);
    }, []);

    const router = useRouter();
    const moveToUserPage = () => {
        router.push(`/userPage?uid=${userData?.uid}`);
    };

    const avatar = (type: "default" | "nickname" = "default") => {
        return (
            <div className={`relative flex flex-row items-center p-1 cursor-pointer gap-1 ${type === "default" ? "w-[32px]" : "max-w-[120px]"}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <Image width={24} height={24} src={userData?.profImg ?? profileUrl} alt={userData?.nickname ?? ""}
                    className="w-6 h-6 rounded-full object-cover "
                    onClick={moveToUserPage} />
                {type === "nickname" && (
                    <>
                        <div className="text-sm font-bold truncate" onClick={moveToUserPage}>{userData?.nickname}</div>
                        <>{userTier?.sign}</>
                    </>
                )}

                {isHov && (
                    <div className="absolute bg-white text-black -left-1 -top-1 w-[240px] h-fit rounded shadow p-2 flex flex-col gap-2 z-[2]">
                        <div className="w-full flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center flex-1 truncate gap-1">
                                <Image width={24} height={24} src={userData?.profImg ?? ""} alt={userData?.nickname ?? ""}
                                    className="w-6 h-6 rounded-full object-cover " onClick={moveToUserPage} />
                                <div className="text-sm font-bold truncate" onClick={moveToUserPage}>{userData?.nickname}</div>
                                <>{userTier?.sign}</>
                            </div>
                            <div className="text-xs font-bold px-1 rounded border-2 border-blue-300">
                                {`LV.${userTier?.level}`}
                            </div>
                        </div>
                        <div className="w-full max-h-[100px] overflow-hidden text-sm">
                            {userData?.desc}
                        </div>
                        <div className="w-full flex flex-row items-center gap-2 truncate text-white text-xs">
                            {userData?.category && (
                                <div className="px-1 rounded-full bg-[#B25FF3]">#{userData?.category}</div>
                            )}
                            {userData?.tags !== undefined && userData?.tags.map((tag, index) => {
                                return (
                                    <div key={index} className="px-1 rounded-full bg-neutral-500">#{tag}</div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const followBtn = () => {
        const [isFol, setIsFol] = useState<boolean>(false);
        useEffect(() => {
            const fetchFol = async () => {
                if (auth.currentUser?.uid && otherID) {
                    const f = await checkFollowing(auth.currentUser?.uid, otherID);
                    setIsFol(f);
                }
            };
            fetchFol();
        }, []);

        if (auth.currentUser?.uid && auth.currentUser?.uid !== otherID) {
            return (
                <button className={`px-3 py-0.5 shadow text-xs rounded font-bold
                ${isFol ? "text-white bg-[#B25FF3] hover:bg-[#63308B]" : "text-[#B25FF3] bg-white hover:bg-neutral-200"}`}
                    onClick={async () => {
                        const res = await toggleFollow(auth.currentUser?.uid ?? "", otherID);
                        if (res !== undefined) setIsFol(res);
                    }}>
                    {isFol ? "팔로잉" : "팔로우"}
                </button>
            );
        }
    };

    const useFollow = () => {
        const [isFollowing, setIsFollowing] = useState<boolean>(false);

        useEffect(() => {
            const fetchFollowingStatus = async () => {
                if (auth.currentUser?.uid && otherID) {
                    const following = await checkFollowing(auth.currentUser?.uid, otherID);
                    setIsFollowing(following);
                }
            };

            fetchFollowingStatus();
        }, [otherID, auth.currentUser?.uid]);

        const handleFollowToggle = async () => {
            if (auth.currentUser?.uid && auth.currentUser?.uid !== otherID) {
                const result = await toggleFollow(auth.currentUser?.uid, otherID);
                if (result !== undefined) {
                    setIsFollowing(result);
                }
            }
        };

        return { isFollowing, handleFollowToggle };
    };


    return { data, avatar, followBtn, tier, useFollow, refresh };
};

export { userData };