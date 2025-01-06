import { useEffect, useState } from 'react';
import {
    FNews, checkIsNew, formattingTime, getNewsData
} from './../../utility/NewsModule';
import { Timestamp } from 'firebase/firestore';
import usePostState from '@/zustand/PostState';
import { fullFormatTimestamp } from '@/components/utility/BulletinModule';

const NewsCard = ({ docID, postIndex }: { docID: string, postIndex: number }) => {
    const { setPostIndex, setCardType } = usePostState();

    const [newsData, setNewsData] = useState<FNews>({
        type: "notice",
        title: "데이터를 불러오는 중...",
        desc: "",
        time: Timestamp.now(),
        views: 0,
    });
    useEffect(() => {
        const fetchData = async () => {
            const d = await getNewsData(docID);
            if (d) setNewsData(d);
        };
        fetchData();
    }, [docID]);




    return (
        <>
            {newsData && (
                <div className="w-full px-2 h-10 flex flex-row items-center gap-4 hover:bg-neutral-200 border-y border-neutral-200"
                    onClick={() => {
                        setPostIndex(postIndex, "default");
                        setCardType("news")
                    }}>
                    <div className={`rounded-full flex items-center justify-center
                    border border-neutral-300 px-2 py-0.5 text-sm bg-white font-bold
                    ${newsData.type === "urgent" && "text-red-500"}`}>
                        {newsData.type === "urgent" ? "긴급" :
                            newsData.type === "change" ? "변경" :
                                newsData.type === "event" ? "이벤트" :
                                    newsData.type === "inspection" ? "점검" :
                                        "공지"}
                    </div>
                    <div className="flex-1 flex flex-row items-center gap-1 truncate">
                        <div>{newsData.title}</div>
                        {checkIsNew(newsData.time) && <div className="text-sm text-[#B25FF3]">new</div>}
                    </div>
                    <div className="text-xs text-neutral-500">
                        {fullFormatTimestamp(newsData.time)}
                    </div>
                </div>
            )}
        </>
    );
};

export default NewsCard;