import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";
import { FUserData, getUserData } from "../utility/UserDataModule";
import ProfileBox from "./ProfileBox";
import { updateMissionProgress } from "../utility/MissionModule";
import { getSelectedUserLog } from "../utility/LogModule";
import InnerArtwork from "./InnerArtwork";
import InnerPost from "./InnerPost";
import useLoginModal from "@/components/hooks/useLoginModal";

import { IconType } from "react-icons";
import {
  MdOutlineCollectionsBookmark,
  MdOutlinePalette,
  MdOutlineLibraryBooks,
  MdClose,
  MdOutlineAccountBox,
  MdOutlineLightbulb,
  MdBookmarkBorder,
  MdOutlineHistory,
  MdArrowUpward,
} from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import PortfolioCard from "../Common(Kim)/PortfolioCard/PortfolioCard";
import { FPortfoilo, getPortfoilo } from "../utility/PortfoiloModule";

const MyPage = () => {
  const [pageUser, setPageUser] = useState<string>("");
  const [userData, setUserData] = useState<FUserData>();
  const loginModal = useLoginModal();
  const [postData, setPostData] = useState<FPortfoilo | undefined>();

  useEffect(() => {
    if (auth.currentUser?.uid) {
      setPageUser(auth.currentUser?.uid);
    } else {
      setPageUser("");
    }
  }, [auth.currentUser?.uid]);

  // 링크에 매게변수 등록하기
  const setValTOUrl = (uid: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("uid", uid);

    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  // 링크에서 매게변수 가져오기
  const getValFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPageUid = urlParams.get("uid");
    if (urlPageUid) {
      setPageUser(urlPageUid);
    } else if (auth.currentUser?.uid) {
      setValTOUrl(auth.currentUser?.uid);
      setPageUser(auth.currentUser?.uid);
    } else {
      ("유저가 존재하지 않습니다.");
    }
  };

  useEffect(() => {
    getValFromURL();
  }, []);

  const fetchUserData = async () => {
    const d = await getUserData(pageUser);
    setUserData(d);

    if (auth.currentUser?.uid && auth.currentUser?.uid !== pageUser) {
      // 다른 사람의 프로필이라면
      await updateMissionProgress(auth.currentUser?.uid, "daily", 2);
    }
  };
  useEffect(() => {
    if (pageUser) {
      fetchUserData();
    }
  }, [pageUser]);

  // 네비게이션 버튼과 동작
  const [isNavExpand, setIsNavExpand] = useState<boolean>(false);
  const [tabNum, setTabNum] = useState<{ tab: number; inner: number }>({
    tab: 0,
    inner: 0,
  });

  // 좌측 네비게이션 제어
  const [displayIDs, setDisplayIDs] = useState<string[]>([]);
  useEffect(() => {
    // tab - 0: 라이브러리, 1: 작품, 2: 게시글
    // inner - 0: 내 작품, 1: 영감, 2: 스크랩, 3: 방문 기록
    const fetchID = async () => {
      if (userData?.uid) {
        if (tabNum.tab === 0) {
            const data = await getPortfoilo(userData.uid); // Fetch portfolio data
            setPostData(data); // Set postData state
        } else {
          if (tabNum.tab === 1) {
            const temp = await getSelectedUserLog(
              userData.uid,
              "Artwork",
              tabNum.inner
            );
            setDisplayIDs(temp);
          } else {
            // tabNum === 2
            const temp = await getSelectedUserLog(
              userData.uid,
              "Bulletin",
              tabNum.inner
            );
            setDisplayIDs(temp);
          }
        }
      }
    };
    fetchID();
  }, [tabNum, userData?.uid ]);

  interface NavBtnProps {
    Icon: IconType;
    title: string;
    onClick: () => void;
    index: number;
  }
  const NavBtn: React.FC<NavBtnProps> = ({ Icon, title, onClick, index }) => {
    return (
      <button
        className={`flex flex-row items-center justify-center text-lg w-full h-8 rounded gap-1 hover:bg-neutral-200 ${
          tabNum.tab === index ? "text-[#B25FF3]" : ""
        }`}
        onClick={onClick}
      >
        <div className={`flex-initial p-2`}>
          <Icon />
        </div>
        {isNavExpand && (
          <div className="flex-1 w-fit text-left font-bold text-sm">
            {title}
          </div>
        )}
      </button>
    );
  };

  const innerNavBtn = (isArt: boolean, index: number) => {
    const isMine: boolean = auth.currentUser?.uid === pageUser;
    const itemList = isArt
      ? ["내 작품", "영감 받은 작품", "스크랩한 작품", "방문 기록"]
      : ["내가 쓴 글", "영감 받은 글", "스크랩한 글", "방문 기록"];
    const getTab = (n: number) => ({ tab: index, inner: n });

    return (
      <>
        {isMine && (
          <div
            className={`flex flex-col ${
              isNavExpand ? "w-32" : "w-8"
            } h-fit justify-center gap-1 bg-neutral-200 rounded p-1 -mt-3`}
          >
            {/* 버튼들 */}
            {itemList.map((item, i) => (
              <button
                key={i}
                className={`flex flex-row h-6 items-center gap-2 text-xs hover:bg-neutral-300 rounded ${
                  tabNum.tab === index && tabNum.inner === i
                    ? "text-[#B25FF3]"
                    : ""
                }`}
                onClick={() => {
                  setTabNum(getTab(i));
                }}
              >
                <div
                  className={`${isNavExpand ? "p-0.5" : "mx-auto"} text-base`}
                >
                  {/* 각 아이콘 */}
                  {i === 0 && <MdOutlineAccountBox />}
                  {i === 1 && <MdOutlineLightbulb />}
                  {i === 2 && <MdBookmarkBorder />}
                  {i === 3 && <MdOutlineHistory />}
                </div>
                {isNavExpand && <div>{item}</div>}
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  const [isVisible, setIsVisible] = useState(false);
  window.onscroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  return (
    <div className="flex flex-col transition-all">
      {isVisible && (
        <button
          className="w-14 h-14 rounded shadow bg-white hover:bg-neutral-100 flex items-center justify-center text-lg fixed bottom-4 right-4 z-10"
          onClick={() => {
            // 페이지 최상단으로 이동
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <MdArrowUpward />
        </button>
      )}

      {/** 상단 프로필 영역 */}
      <div className="w-full h-64 relative overflow-auto bg-purple-100">
        {/** 배경 이미지 */}
        {userData?.backImg && (
          <img
            src={userData?.backImg}
            alt={""}
            className="w-full h-full object-cover"
          />
        )}

        {pageUser ? (
          <ProfileBox uid={pageUser} setPageUser={setPageUser} />
        ) : (
          <div
            className="absolute bottom-0 md:bottom-2 left-0 p-2 md:max-w-[700px] min-h-[150px] w-full flex items-center justify-center
                        md:rounded-lg md:ml-8 lg:ml-16 xl:ml-24 text-[#B25FF3] text-sm font-bold cursor-pointer opacity-80 bg-white hover:bg-neutral-100 transition-all"
            onClick={() => {
              loginModal.onOpen();
            }}
          >
            {auth.currentUser?.uid
              ? "유저가 존재하지 않습니다"
              : "로그인이 필요합니다."}
          </div>
        )}
      </div>

      {/** 내용 */}
      <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="flex flex-row py-4 gap-2">
          {/** 좌측 네비게이션 */}
          <div
            className={`flex flex-col items-center p-2 gap-4 rounded shadow ${
              isNavExpand ? "w-40" : "w-12"
            }`}
          >
            <NavBtn
              Icon={GiHamburgerMenu}
              title="목록"
              onClick={() => {
                setIsNavExpand(!isNavExpand);
              }}
              index={-1}
            />

            {/** 상단 구분선 */}
            <div className="border-b border-neutral-400 mx-2 w-full" />

            {/** 포트폴리오 */}
            <NavBtn
              Icon={MdOutlineCollectionsBookmark}
              title="포트폴리오"
              onClick={() => {
                setTabNum({ tab: 0, inner: 0 });
              }}
              index={0}
            />

            {/** 작품 활동 */}
            <NavBtn
              Icon={MdOutlinePalette}
              title="작품 활동"
              onClick={() => {
                setTabNum({ tab: 1, inner: 0 });
              }}
              index={1}
            />
            {innerNavBtn(true, 1)}

            {/** 게시글 활동 */}
            <NavBtn
              Icon={MdOutlineLibraryBooks}
              title="게시글 활동"
              onClick={() => {
                setTabNum({ tab: 2, inner: 0 });
              }}
              index={2}
            />
            {innerNavBtn(false, 2)}
          </div>

          {/** 우측 메인박스 */}
          <div className="flex-1 bg-neutral-100 rounded shadow p-1">
            {tabNum.tab === 0 &&
              postData && ( // Render PortfolioCard only if tabNum.tab is 0 and postData exists
                <PortfolioCard postData={postData} pageUser={pageUser} />
              )}
            {tabNum.tab === 1 && <InnerArtwork docIDs={displayIDs} />}
            {tabNum.tab === 2 && <InnerPost docIDs={displayIDs} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;