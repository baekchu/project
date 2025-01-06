import { FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  type: string;
  disabled?: boolean;
  register: UseFormRegister<FieldValues>;
}

const Input: React.FC<InputProps> = ({
  id,
  disabled,
  type = "checkbox",
  register,
}) => {
  return (
    <div className="flex items-center pl-4">
      <input
        id={id}
        type={type}
        disabled={disabled}
        {...register("accept")}
        className={"block border text-lg rounded w-5 h-5 focus:ring-0 focus:outline-none focus:ring-offset-0 disabled:text-gray-200 disabled:cursor-not-allowed"}
      />
    </div>
  );
};

export default Input;
