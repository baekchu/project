import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import {
    FUserData, FUserTier, checkFollowing,
    getUserData, getUserTierData, toggleFollow
} from "../utility/UserDataModule";
import AuthorImgCard from "./AuthorImgCard";
import { auth } from "@/config/firebase";

interface FAuthCard {
    uid: string,
};

const AuthorCard: React.FC<FAuthCard> = ({ uid }) => {
    const router = useRouter();
    const [userData, setUserData] = useState<FUserData>({} as FUserData);
    const [userTier, setUserTier] = useState<FUserTier>();
    const [isFol, setIsFol] = useState<boolean>(false);

    const checkFol = async () => {
        if (!auth.currentUser?.uid) return;
        const res = await checkFollowing(auth.currentUser?.uid, uid);
        setIsFol(res);
    };

    const toggleFol = async () => {
        if (!auth.currentUser?.uid) return;
        await toggleFollow(auth.currentUser?.uid, uid);
        checkFol();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const d = await getUserData(uid);
            setUserData(d);
            checkFol();
            const t = await getUserTierData(d.exp);
            setUserTier(t);
        };
        fetchUserData();
    }, [uid]);



    const moveToUserpage = () => {
        router.push(`/userPage?uid=${uid}`);
    };

    const moveToImg = () => { };



    return (
        <div className="flex flex-col gap-1 rounded p-2 bg-white shadow border border-neutral-200 cursor-pointer hover:bg-neutral-200"
            onClick={moveToUserpage} >
            <div onClick={(e) => { e.stopPropagation() }}>
                <AuthorImgCard uid={uid} />
            </div>

            {/** 닉네임 및 팔로우버튼 */}
            <div className="flex flex-row items-center justify-between w-full h-9">
                {/** 닉네임 */}
                <div className="flex flex-row items-center gap-1">
                    <img src={userData.profImg} alt="" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
                    <div className="text-sm font-bold hover:underline cursor-pointer">
                        {userData.nickname}
                    </div>
                    {userTier?.sign}
                </div>
                {/** 팔로우 */}
                {uid !== auth.currentUser?.uid && (
                    <button className={`flex items-center justify-center px-3 py-0.5 font-bold text-sm rounded
                ${isFol ? "text-white bg-[#B25FF3] hover:bg-[#63308B]"
                            : "text-[#B25FF3] border border-[#B25FF3] bg-white hover:bg-neutral-200"}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFol();
                        }}>
                        {isFol ? "팔로잉" : "팔로우"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default memo(AuthorCard);