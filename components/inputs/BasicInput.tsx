import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BiWon } from "react-icons/bi";

interface InputProps {
  id: string;
  type: string;
  placeholder: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  disabled,
  type,
  register,
  formatPrice,
  placeholder,
  required,
  errors,
}) => {
  return (
    <div className="w-full relative">
        <div className="relative">
          {formatPrice && (
            <BiWon
              size={20}
              className="
            text-neutral-400
            absolute
            md:top-5 left-2
            top-3.5 
          "
            />
          )}
          <input
            id={id}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            {...register(id, { required })}
            className={`
            w-full
            p-4
            font-light
            bg-white
            border-2
            rounded-md
            outline-none
            transition
            ${formatPrice ? "md:pl-9 pl-7" : "pl-4"}
            ${errors[id] ? "border-rose-500" : "border-neutral-200"}
            ${errors[id] ? "focus:border-rose-500" : "focus:border-[#B25FF3]"}
          `}
            step="1000"
          />
        </div>
      </div>

  );
};

export default Input;
