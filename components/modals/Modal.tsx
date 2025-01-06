"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";

import Button from "../button/Button";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  actionLabel: string;
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  body,
  actionLabel,
  footer,
  disabled,
  secondaryAction,
  secondaryActionLabel,
}) => {
  const [showModal, setShowModal] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShowModal(isOpen);

    // 모달이 열릴 때 body 요소에 스크롤 비활성화 스타일을 추가
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);


  useEffect(() => {
    // Add an event listener to handle clicks outside the modal
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
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

    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose, disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }

    onSubmit();
  }, [onSubmit, disabled]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) {
      return;
    }

    secondaryAction();
  }, [secondaryAction, disabled]);

  // Define a function to handle form submission
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission
    onSubmit(); // Call the onSubmit function provided as a prop
  };

  if (!isOpen) {
    return null;
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
          backdrop-blur-[0.5rem]
        "
      >
        <div
          ref={modalRef}
          className="
        relative 
        w-full
        md:w-[580px]
        my-6
        mx-auto 
        lg:h-auto
        md:h-auto
        h-full
         
        "
        >
          {/*content*/}
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
              lg:h-auto
              md:h-auto
              border-0 
              rounded-lg 
              shadow-lg 
              relative 
              flex 
              flex-col 
              w-full 
              bg-white  
              outline-none 
              focus:outline-none

            "
            >
              {/*header*/}
              <div
                className="
                flex 
                items-center 
                p-3.5
                rounded-t
                justify-center
                relative
                border-b-[1px]
                border-[#dddbf2]
                "
              >
                <button
                  className="
                    p-1
                    border-0 
                    hover:opacity-70
                    transition
                    absolute
                    right-2
                    top-2
                    rounded-lg
                    bg-[#EADDF3]
                    cursor-pointer
                    text-primary-purple
                  "
                  onClick={handleClose}
                >
                  <IoMdClose size={30} />
                </button>
                <div className="text-lg font-semibold flex items-center">
                  <img src="/logo.svg" className="w-[5rem]" />
                </div>
              </div>
              {/*body*/}
              <div className="max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleFormSubmit}>
                  {" "}
                  {/* Add form element and onSubmit handler */}
                  <div className="relative p-6 ">{body}</div>
                  {/*footer*/}
                  <div className="flex flex-col gap-2 p-6">
                    <div
                      className="
                    flex 
                    flex-row 
                    items-center 
                    gap-4 
                    w-full
                  "
                    >
                      {secondaryAction && secondaryActionLabel && (
                        <Button
                          disabled={disabled}
                          label={secondaryActionLabel}
                          onClick={handleSecondaryAction}
                          outline
                        />
                      )}
                      <Button
                        disabled={disabled}
                        label={actionLabel}
                        onClick={handleSubmit}
                      />
                    </div>
                    {footer}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;