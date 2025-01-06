import { useState } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BsEye, BsEyeSlash } from "react-icons/bs";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  register,
  required,
  errors,
}) => {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 이 함수는 입력값이 유효하면 true, 그렇지 않으면 false를 반환합니다.
  const isInputValid = !errors[id];

  return (
    <div className="w-full relative">
      <input
        id={id}
        disabled={disabled}
        {...register(id, { required })}
        placeholder=" "
        type={isPassword && !showPassword ? "password" : "text"}
        style={{ backgroundColor: "#E4E4E4" }}
        className={`
    peer
    w-full
    p-4
    pt-6
    font-light
    bg-white
    border-2
    rounded-md
    outline-none
    transition
    disabled:opacity-70
    disabled:cursor-not-allowed
    pl-4
    ${isInputValid ? "border-neutral-300" : "border-rose-500"}
    ${isInputValid ? "focus:border-[#B25FF3]" : "focus:border-rose-500"}
  `}
      />

      {isPassword && (
        <div
          className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-[20px]"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <BsEye /> : <BsEyeSlash />}
        </div>
      )}

      <label
        className={`
          absolute
          text-md
          duration-150
          transform
          -translate-y-3
          top-5
          z-10
          origin-[0]
          left-4
          peer-placeholder-shown:scale-100
          peer-placeholder-shown:translate-y-0
          peer-focus:scale-75
          peer-focus:-translate-y-4
          ${isInputValid ? "text-black" : "text-rose-500"}
          ${isInputValid ? "peer-focus:text-[#B25FF3]" : ""}
        `}
      >
        {label}
        {required && <span className="text-rose-500 text-xs absolute">*</span>}
      </label>
    </div>
  );
};

export default Input;
