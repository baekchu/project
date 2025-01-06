"use client";

import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { registerValidation } from "@/utils/validation";

import { toast } from "react-hot-toast";
import useRegisterModal from "../hooks/useRegisterModal";
import useLoginModal from "../hooks/useLoginModal";
import useResetPassword from "../hooks/useResetPasswordModal";

import Modal from "./Modal";
import Input from "../inputs/Input";
//import Heading from "../Heading";
import {
  signInWithEmailAndPassword, browserLocalPersistence, browserSessionPersistence
} from "firebase/auth";
import { auth } from "@/config/firebase";

const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const ResetPasswordModal = useResetPassword();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // 추가: 입력 필드 초기화 함수
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: registerValidation(),
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    if (rememberMe) {
      // 명시적으로 로그아웃 하기 전까지 로그인 유지
      await auth.setPersistence(browserLocalPersistence);
    } else {
      // 현재 세션에서만 로그인 유지
      await auth.setPersistence(browserSessionPersistence);
    }
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        toast.success(`로그인되었습니다.`);

        loginModal.onClose();
      })
      .catch((error) => {
        if (
          error.code === "auth/invalid-email" ||
          error.code === "auth/user-not-found"
        ) {
          toast.error("올바르지 않은 이메일입니다.");
        } else if (error.code === "auth/wrong-password") {
          toast.error("비밀번호가 틀렸습니다.");
        } else {
          toast.error("로그인에 실패하였습니다.");
        }
        setIsLoading(false);
      });
  };
  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const onResetToggle = useCallback(() => {
    loginModal.onClose();
    ResetPasswordModal.onOpen();
  }, [loginModal, ResetPasswordModal]);

  const bodyContent = (
    <div className="flex flex-col gap-8">
      <Input
        id="email"
        label="이메일"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="비밀번호"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <div className="flex items-center justify-between">
        <label className="flex gap-2 px-[3px]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => {
              if (!rememberMe) {
                toast("공용 컴퓨터에서 자동 로그인 사용 시 개인정보 유출의 위험이 있습니다.\n\n반드시 안전한 환경에서 사용해주세요.");
              }
              setRememberMe(!rememberMe);
            }}
          />
          자동 로그인
        </label>
        <span
          className="text-black cursor-pointer 
          hover:underline
          ml-3"
          onClick={onResetToggle}
        >
          비밀번호 찾기
        </span>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-10 mt-20">
      <div
        className="
    text-neutral-500 text-center mt-2 font-normal "
      >
        <p>
          Graffiti(을)를 처음 이용하시나요?
          <span
            onClick={onToggle}
            className="
            text-[#525252]
            cursor-pointer 
            ml-3
            font-semibold 
            "
          >
            회원가입
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      actionLabel="로그인"
      onClose={() => {
        // 모달이 닫힐 때 입력 필드 초기화
        reset();
        loginModal.onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;