"use client";

import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  iconColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  iconColor,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        ${outline ? "bg-white" : "bg-[#B25FF3]"}
        ${outline ? "border-[#B25FF3]" : "border-[#B25FF3]"}
        ${outline ? "text-[#B25FF3]" : "text-white"}
        ${small ? "text-sm" : "text-md"}
        ${small ? "py-1" : "py-3"}
        ${small ? "font-light" : "font-semibold"}
        ${small ? "border-[1px]" : "border-2"}
        ${small && Icon ? "" : "border-[1px]"} 
      `}
    >
      {Icon && (
        <Icon
          size={18}
          className="absolute left-7 top-3.5"
          color={iconColor}
        />
      )}
      <span className={Icon ? "text-[#525252] text-sm" : ""}>
        {label}
      </span>
    </button>
  );
};

export default Button;