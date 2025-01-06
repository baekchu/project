import React, { useState } from "react";
import Masonry from "react-masonry-css";
import Post from "@/components/Post/Post";


//삭제해도 좋은 파일
const breakPointsObj = {
  default: 4, // 초기 열의 수를 4로 설정
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ feeds, isSuggestions }: { feeds: any[], isSuggestions: boolean }) => {
  const [windows, setWindows] = useState([
    { id: 1, searchText: "" }, // 기본 창 하나
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>, windowId: number) => {
    const updatedWindows = windows.map((win) =>
      win.id === windowId ? { ...win, searchText: e.target.value } : win
    );
    setWindows(updatedWindows);
  };

  const handleAddWindow = () => {
    if (windows.length < 4) { // 최대 4개의 창까지 허용
      const newWindowId = windows.length + 1;
      setWindows([...windows, { id: newWindowId, searchText: "" }]);
    }
  };

  // 계산된 열 수를 기반으로 창의 크기를 조절
  const getColumnCount = () => {
    if (windows.length === 1) return 6;
    else if (windows.length === 2) return 3;
    else if (windows.length === 3) return 2;
    else return 1;
  };

  return (
    <div className="flex">
      {windows.map((window) => (
        <div key={window.id} className={`flex-1 border border-[#B25FF3] rounded-lg p-4 mx-2 mb-4`} style={{ flexBasis: `${100 / getColumnCount()}%` }}>
          <div className="flex">
            <input
              type="text"
              placeholder="검색"
              value={window.searchText}
              onChange={(e) => handleSearchChange(e, window.id)}
              className="border border-gray-300 rounded-lg p-2 mr-2"
            />
            <button
              onClick={handleAddWindow}
              className="bg-[#B25FF3] text-white p-2 rounded-lg"
            >
              +
            </button>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '5000px' }}>
            <Masonry
              className="flex"
              breakpointCols={!isSuggestions ? getColumnCount() : 2}
            >
              {feeds
                .filter((post) => !window.searchText || post.title.includes(window.searchText))
                .map((post, id) => (
                  <Post key={post.id} id={post.id} post={post} />
                ))}
            </Masonry>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MasonryLayout;
