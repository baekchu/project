import { useEffect, useState } from "react";
import { FPost } from "../utility/BulletinModule";
import { makePostDataList } from "../utility/LogModule";
import usePostState from "@/zustand/PostState";
import ShortPostCard from "../Common(Kim)/BulletinCard/ShortPostCard";
import { auth } from "@/config/firebase";

const InnerPost = ({ docIDs }: { docIDs: string[] }) => {
    const [postDatas, setPostDatas] = useState<FPost[]>([]);
    const { setPostList } = usePostState();

    useEffect(() => {
        const fetchD = async () => {
            const d = await makePostDataList(docIDs, auth.currentUser?.uid);
            const temp = d.reverse();
            setPostDatas(temp);
            setPostList(temp);
        };
        fetchD();
    }, [docIDs]);

    // 출력 개수 및 더보기 관리
    const [showNum, setShowNum] = useState<number>(0);
    useEffect(() => {
        if (postDatas.length > 0) {
            setShowNum(Math.min(postDatas.length, 12));
        }
    }, [postDatas]);
    const showMore = () => {
        setShowNum(Math.min(showNum + 12, postDatas.length));
    };

    return (
        <div className="w-full flex flex-col">
            {postDatas.length > 0 ? <>
                {postDatas.map((postData, index) => {
                    if (index < showNum) {
                        return (
                            <>
                                <ShortPostCard postData={postData} indexNum={index} key={index} />
                                {index > 0 && index % 12 === 0 && <div className="w-full my-1" />}
                            </>
                        )
                    }
                })}

                {showNum < postDatas.length && (
                    <button className="px-3 py-0.5 my-4 rounded hover:bg-neutral-200 text-sm font-bold text-[#B25FF3]"
                        onClick={showMore}>
                        더보기
                    </button>
                )}
            </> : <div className="w-full text-center text-sm py-12 text-neutral-500">
                표시할 게시글이 없습니다
            </div>}
        </div>
    );
};

export default InnerPost;