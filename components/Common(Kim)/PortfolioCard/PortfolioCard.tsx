import {
  FPortfoilo,
  deletePortfoilo,
  fullFormatTimestamp,
} from "@/components/utility/PortfoiloModule";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import usePortfolioUploadState from "@/zustand/PortfolioUploadState";
import { auth } from "@/config/firebase";
import toast from "react-hot-toast";
import { IoTrashSharp } from "react-icons/io5";

const PortfolioCard = ({
  postData,
  pageUser,
}: {
  postData: FPortfoilo;
  pageUser: string;
}) => {
  const { setIsPortfolioUploadOpen } = usePortfolioUploadState();

  const handleButtonClick = () => {
    if (auth.currentUser?.uid === postData?.uid) {
      setIsPortfolioUploadOpen(true, postData);
    }
  };

  const uploadNewPortfolio = () => {
    setIsPortfolioUploadOpen(true);
  };

  const [isMine, setIsMine] = useState<boolean>(false);
  useEffect(() => {
    setIsMine(auth.currentUser?.uid === pageUser);
  }, [pageUser, auth.currentUser]);

  const handleDelete = async () => {
    if (!postData) return;

    if (
      confirm("작품을 삭제하겠습니까? 이 작업은 되돌릴 수 없습니다.") &&
      postData.objectID
    ) {
      try {
        const res = await deletePortfoilo(
          auth.currentUser?.uid ?? "",
        );
        if (res) {
          toast.success("작품을 삭제했습니다.");
        } else {
          console.error(Error);
          toast.error("작품 삭제에 실패했습니다");
        }
      } catch (error) {
        console.error("Error deleting portfolio:", onmessage);
        toast.error("작품 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-[100%] relative "
      onClick={handleButtonClick}
    >
      <div className="w-[100%] max-w-[70rem] grid my-4 min-h-fit">
        <div className="flex flex-col h-full space-y-4">
          <ScrollArea
            className="h-[calc(70vh_-_48px)] rounded-sm shadow-sm p-3 bg-white"
            type="always"
          >
            {postData?.desc ? (
              <div
                className="w-full max-w-[70rem]"
                dangerouslySetInnerHTML={{ __html: postData.desc }}
              />
            ) : (
              <div className="w-full flex items-center justify-center h-40">
                {/** postData가 존재하지 않을 때 본인이라면 업로드 버튼을, 타인이라면 비었다는 메세지를 보여주기 */}
                {isMine ? (
                  <button
                    className="text-white bg-[#B25FF3] rounded p-4 text-sm font-bold"
                    onClick={uploadNewPortfolio}
                  >
                    포트폴리오 업로드하기
                  </button>
                ) : (
                  <div className="m-auto p-4 flex flex-col items-center justify-center text-sm text-neutral-500 h-full">
                    이 유저는 포트폴리오를 업로드하지 않았어요.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="absolute flex items-center top-0 right-0 m-4 text-xs text-gray-500">
            {postData?.time && fullFormatTimestamp(postData.time)}

            <button
              className={`ml-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-200 text-red-500`}
              onClick={handleDelete}
            >
              <IoTrashSharp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;