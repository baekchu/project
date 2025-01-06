import React, { memo } from "react";
import { FPost } from "../utility/BulletinModule";

interface FPostHoverBox {
    postData: FPost,
    userData: any,
}
const PostHoverBox: React.FC<FPostHoverBox> = ({ postData }) => {
    return (
        <div className="absolute rounded-lg bg-white flex flex-col p-2 w-full max-w-[400px] h-fit 
        justify-between shadow pointer-events-none border border-neutral-200 left-2 top-1 z-[10]">
            <div className="flex flex-row items-center justify-between mb-1 px-2 gap-2">
                <div className="font-bold flex-1 truncate">
                    {postData.title}
                </div>
            </div>

            <div className="w-full border-b-2 border-neutral-200 py-0.5"/>

            <div className="flex flex-row w-full max-h-36 p-1 text-sm overflow-hidden text-wrap text-ellipsis">
                {postData.desc?.replace(/<[^>]*>/g, '')}
            </div>

            <div className="w-full flex flex-row gap-2 truncate items-center text-sm mt-2">
                <div className="bg-[#B25FF3] text-white rounded-full px-2">#{postData.category}</div>
                {postData.tags?.map((tag, index) => {
                    return (<div className="bg-neutral-600 text-white rounded-full px-2" key={index}>#{tag}</div>)
                    
                })}
            </div>
        </div>
    );
};

export default memo(PostHoverBox);