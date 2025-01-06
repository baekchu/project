import { useState } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  disabled,
  register,
  placeholder,
  required,
  errors,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string | null>("");
  const [tagError, setTagError] = useState<boolean>(false);
  const [tagErrorMessage, setTagErrorMessage] = useState<string>("");
  /**tags에 새로운 tag를 등록하는 함수
   * 공백을 제거해 저장하고, 비어있거나 중복, 10개를 초과할 시 저장되지 않으며
   * 에러 메세지를 3초동안 출력한다 */
  const addTag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tag == null) return;
    const trimmedTag = tag.trim();
    if (tags.includes(trimmedTag)) {
      setTagError(true); // 태그 중복일 경우 태그 오류 상태를 설정
      setTagErrorMessage(`${trimmedTag}은(는) 이미 등록된 태그입니다!`);
    } else if (tags.length >= 5) {
      setTagError(true); // 태그가 5개 이상일 경우 태그 오류 상태를 설정
      setTagErrorMessage("태그는 5개까지 등록할 수 있습니다!");
    } else if (trimmedTag === "") {
      setTagError(true); // 빈 태그일 경우 태그 오류 상태를 설정
      setTagErrorMessage("태그를 입력해주세요!");
    } else {
      setTags([...tags, trimmedTag]);
      setTag("");
      setTagError(false); // 정상적으로 태그가 추가될 때 태그 오류 상태를 해제
      setTagErrorMessage(""); // 정상적으로 태그가 추가될 때 태그 에러 메세지를 초기화
    }
    if (tags.length === 0) {
      // 태그가 없을 때 폼 제출을 막음
      return;
    }
  };

  /** 저장된 태그를 제거 */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /** 태그 입력 관리 */
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value);
  };

  return (
    <div className="w-full">
      <form className="flex items-center w-full" onSubmit={addTag}>
        <label
          className={`
            md:text-lg
            xs:text-base
            text-sm
            font-medium 
            w-1/5
            pl-2
            pr-2
            text-center 
            ${errors[id] ? "text-rose-500" : "text-black"}
            ${errors[id] ? "peer-focus:text-[#B25FF3]" : ""}
          `}
        >
          {label}
          {required && (
            <span className="text-rose-500 text-xs absolute">*</span>
          )}
        </label>
        <input
          id="tag"
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={tag || ""}
          {...register(id, { required })}
          style={{ backgroundColor: "#E4E4E4" }}
          className={`
            w-auto
            md:w-[350px] 
            md:p-4
            p-2.5
            font-light
            bg-white
            border-2
            rounded-md
            outline-none
            transition
            ${errors[id] ? "border-rose-500" : "border-neutral-200"}
            ${errors[id] ? "focus:border-rose-500" : "focus:border-[#B25FF3]"}
          `}
          onChange={handleTagInput}
        />
        <div className="pl-2 md:pl-5 text-center md:text-lg xs:text-base text-sm ">
          {tagError ? (
            <div className="bg-red-600 text-xs text-white rounded-md px-2 py-1">
              {tagErrorMessage}
            </div>
          ) : (
            `${tags.length}/5`
          )}
        </div>
      </form>
      <div className="w-[100%] mt-4 ml-2 flex flex-row gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-white text-[#B25FF3] border-[1px] border-[#B25FF3] px-2 py-1 rounded-md cursor-pointer whitespace-nowrap overflow-hidden hover:bg-stone-200 hover:line-through"
            onClick={() => removeTag(tag)}
          >
            #{tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Input;
