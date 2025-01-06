import React from "react";
import { IconType } from "react-icons";

interface IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: IconType; // 아이콘을 받을 속성 추가
  image?: string; // 이미지 URL을 받을 속성 추가
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  disabled,
  icon: Icon,
  image,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-full // 변경된 부분
        hover:opacity-80
        transition
        w-10 h-10 // 원형 버튼 크기
        bg-[#B25FF3]
      `}
    >
      {Icon && (
        <Icon
          size={24}
          className="text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" // 아이콘 중앙 정렬
        />
      )}
      {image && (
        <img
          src={image}
          alt="Button Image"
          className="w-full h-full rounded-full"
        />
      )}
    </button>
  );
};

export default IconButton;
