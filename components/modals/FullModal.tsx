"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";

import BasicButton from "../button/BasicButton";

interface ModalProps {
  isOpen?: boolean; // 모달이 열려 있는지 여부
  onClose: () => void; // 모달을 닫는 함수
  onSubmit: () => void; // 양식 제출 또는 확인을 처리하는 함수
  title?: string; // 모달 제목
  body?: React.ReactElement; // 모달 내용 (React 엘리먼트)
  footer?: React.ReactElement; // 모달 바닥글 (React 엘리먼트)
  actionLabel: string; // 주요 동작 버튼 레이블
  disabled?: boolean; // 모달 비활성화 상태
  secondaryAction?: () => void; // 보조 동작 함수
  secondaryActionLabel?: string; // 보조 동작 버튼 레이블
}

const Modal: React.FC<ModalProps> = ({
  isOpen, // 모달 열림 여부
  onClose, // 모달 닫기 함수
  onSubmit, // 모달에서 제출 또는 확인을 처리하는 함수
  title, // 모달 제목
  body, // 모달 내용 (React 엘리먼트)
  actionLabel, // 주요 동작 버튼 레이블
  footer, // 모달 바닥글 (React 엘리먼트)
  disabled, // 모달 비활성화 상태
  secondaryAction,
  secondaryActionLabel,
}) => {
  const [showModal, setShowModal] = useState(isOpen); // 모달 표시 여부 상태
  const modalRef = useRef<HTMLDivElement | null>(null); // 모달 엘리먼트의 ref

  useEffect(() => {
    setShowModal(isOpen);

    // 모달이 열릴 때 body 요소에 스크롤 비활성화 스타일을 추가
    if (isOpen) {
      document.body.style.overflow = "hidden"; // 스크롤 비활성화
    } else {
      document.body.style.overflow = "auto"; // 스크롤 활성화
    }
  }, [isOpen]);

  useEffect(() => {
    // 모달 외부 클릭을 처리하는 이벤트 리스너 추가
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose(); // 모달 닫기 함수 호출
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }

    const confirmClose = window.confirm("변경사항이 저장되지 않습니다."); // 사용자에게 확인 메시지 표시

    if (confirmClose) {
      setShowModal(false);
      setTimeout(() => {
        onClose(); // 모달 닫기 함수 호출
      }, 300);
    }
  }, [onClose, disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }

    onSubmit(); // 모달에서 제출 또는 확인을 처리하는 함수 호출
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [onSubmit, disabled]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) {
      return;
    }

    secondaryAction();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [secondaryAction, disabled]);

  if (!isOpen) {
    return null; // 모달이 열려 있지 않을 경우 아무것도 렌더링하지 않음
  }
  return (
    <>
      <div
        className="
          justify-center
          items-center
          flex 
          overflow-x-hidden 
          overflow-y-auto 
          fixed 
          inset-0 
          z-50 
          outline-none 
          focus:outline-none
          bg-neutral-800/70
          backdrop-blur-[0.15rem]
        "
      >
        <button
          className="
                    p-1
                    border-
                    hover:opacity-70
                    transition
                    absolute
                    right-2
                    top-2
                    rounded-lg
                    bg-[#787878]
                    cursor-pointer
                    text-primary-purple
                  "
          onClick={handleClose}
        >
          <IoMdClose size={40} />
        </button>
        <div
          ref={modalRef}
          className="
          relative 
          w-[1440px]
          h-[100%]
          lg:h-auto
        "
        >
          {/* 모달 내용 */}
          <div
            className={`
            translate
            duration-300
            h-full
            ${showModal ? "translate-y-0" : "translate-y-full"}
            ${showModal ? "opacity-100" : "opacity-0"}
          `}
          >
            <div
              className="
              translate
              h-full
              border-0 
              rounded-lg
              shadow-lg 
              relative 
              flex 
              flex-col 
              w-full 
              bg-[#ffffff]    
              outline-none 
              focus:outline-none
            "
            >
              {/* 모달 헤더 */}
              <div
                className="
                flex 
                items-center 
                p-2
                rounded-t
                justify-center
                relative
                
                "
              ></div>
              {/* 모달 내용 */}
              <div className="max-h-[80vh] overflow-y-auto ">
                {" "}
                {/* 양식 엘리먼트와 onSubmit 핸들러 추가 */}
                <div className="relative p-6 ">{body}</div>
                {/* 모달 바닥글 */}
                <div className="flex flex-col p-6">{footer}</div>
                <div className="flex flex-col p-6 ">
                  <div className="flex flex-row justify-end">
                    <div style={{ marginLeft: "auto" }}>
                      {secondaryAction && secondaryActionLabel && (
                        <BasicButton
                          disabled={disabled}
                          label={secondaryActionLabel}
                          onClick={handleSecondaryAction}
                          outline
                        />
                      )}

                      <BasicButton
                        disabled={disabled}
                        label={actionLabel}
                        onClick={handleSubmit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
