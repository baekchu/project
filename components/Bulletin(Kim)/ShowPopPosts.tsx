import { FPost } from "../utility/BulletinModule";
import ExpandPostCard from "../Common(Kim)/BulletinCard/ExpandPostCard";
import { memo } from "react";

interface ShowPopProps {
    isTwoCol: boolean,
    popPostList: FPost[]
}

const ShowPopPosts: React.FC<ShowPopProps> = ({ isTwoCol, popPostList }) => {
    return (
        <div className={`w-full grid gap-2 ${isTwoCol ? "grid-cols-2" : "grid-cols-1"}`}>
            {popPostList.map((post, index) => (
                <ExpandPostCard
                    postData={post}
                    indexNum={index}
                    isColored={isTwoCol ? (index % 2 === Math.floor(index / 2) % 2) : index % 2 === 0}
                    key={index}
                />
            ))}
        </div>
    );
};

export default memo(ShowPopPosts);