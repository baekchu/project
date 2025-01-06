import React, { useEffect, useState } from 'react';
import { 
    FQNA, checkIsNew, formattingTime, getQNAData 
} from '../../utility/NewsModule';
import { Timestamp } from 'firebase/firestore';
import usePostState from '@/zustand/PostState';

const QNACard = ({ docID, postIndex }: { docID: string, postIndex: number }) => {
    const { setPostIndex, setCardType } = usePostState();
    const [QNAData, setQNAData] = useState<FQNA>({
        title: "데이터를 불러오는 중...",
        time: Timestamp.now(),
        answer: ""
    });
    useEffect(() => {
        const fetchData = async () => {
            const d = await getQNAData(docID);
            if (d) setQNAData(d);
        };
        fetchData();
    }, [docID]);


    return (
        <>
            {QNAData && (
                <div className="w-full px-2 h-10 flex flex-row items-center gap-4 hover:bg-neutral-200 border-y border-neutral-200">
                    <div className="flex-1 flex flex-row items-center gap-1 truncate"
                    onClick={() => {
                        setPostIndex(postIndex, "default");
                        setCardType("news")
                    }}>
                        <div>{QNAData.title}</div>
                        {checkIsNew(QNAData.time) && <div className="text-sm text-[#B25FF3]">new</div>}
                    </div>
                    <div className="text-xs text-neutral-500">
                        {formattingTime(QNAData.time)}
                    </div>
                </div>
            )}
        </>
    );
};

export default QNACard;