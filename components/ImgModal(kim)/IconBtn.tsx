import React from "react";

interface IconBtnProps {
    type: "default" | "colored";
    enable?: boolean,
    disabled?: boolean,
    onClick?: () => void;
    icon: React.ElementType;
}

const IconBtn: React.FC<IconBtnProps> = ({ type, enable = false, disabled = false, onClick, icon: Icon }) => {
    const colorStyle = (type === "default")
        ? "bg-neutral-200 hover:bg-neutral-400"
        : (enable) ? `${disabled ? "bg-neutral-500" : "bg-[#B25FF3] hover:bg-[#63308B]"} text-white`
        : "bg-white hover:bg-neutral-200 border border-[#B25FF3] text-[#B25FF3]";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-14 h-14 flex items-center justify-center text-3xl rounded ${colorStyle}`}
        >
            <Icon />
        </button>
    );
};

export default IconBtn;