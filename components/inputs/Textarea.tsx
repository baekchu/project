
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  disabled,
  register,
  placeholder,
  required,
  errors,
}) => {


  return (
    <div className="w-full relative">
      <textarea
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        {...register(id, { required })}
        className={`
            w-full
            p-4
            h-[120px]
            font-light
            bg-white
            border-2
            rounded-md
            outline-none
            transition
            ${errors[id] ? "border-rose-500" : "border-neutral-200"}
            ${errors[id] ? "focus:border-rose-500" : "focus:border-[#B25FF3]"}
          `}
      />
      
    </div>
  );
};

export default Input;
