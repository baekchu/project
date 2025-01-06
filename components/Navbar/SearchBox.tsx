"use client";

import React, { useState, useRef } from "react";

import { BiSearchAlt2 } from "react-icons/bi";
import { MdClose } from "react-icons/md";


const SearchBox = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isSearchVisible, setSearchVisible] = useState(false);
  //검색 클릭시 검색창 닫는거
  const handleCloseButtonClick = () => {
    setSearchVisible(false);
  };

  const handleSearchButtonClick = () => {
    // Toggle the search visibility and focus the input field
    setSearchVisible(!isSearchVisible);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  return (
    <div className="relative">
      {/* position: fixed를 추가하여 오른쪽 상단 고정 */}
      <div className="flex justify-end  flex-row items-center">
        <button
          className="flex searhBox shadow-sm hover:shadow-sm transition cursor-pointer gap-2"
          onClick={handleSearchButtonClick}
        >
          <BiSearchAlt2
            className="fas fa-search
            hover:text-[#8839c5] "
          />
          <input type="text" placeholder="검색" className="app-color-black" />
        </button>
        <div className={`search-container${isSearchVisible ? "" : " hide"}`}>
          <BiSearchAlt2 className="flex link-search" />
          <div className="search-bar">
            <form action="">
              <input
                ref={inputRef}
                type="text"
                placeholder="검색어를 입력하세요.."
              />
            </form>
          </div>
          <MdClose
            className="flex link-close"
            onClick={handleCloseButtonClick}
          />

          <div className="quick-links">
            <h2>인기 검색어</h2>
            <ul>
              <li>
                <a href="#">Visiting an Apple Store FAQ</a>
              </li>
              <li>
                <a href="#">Shop Apple Store Online</a>
              </li>
              <li>
                <a href="#">Accessories</a>
              </li>
              <li>
                <a href="#">AirPods</a>
              </li>
              <li>
                <a href="#">AirTag</a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`overlay${isSearchVisible ? " show" : ""}`}
          onClick={handleCloseButtonClick}
        />
      </div>
    </div>
  );
};

export default SearchBox;
