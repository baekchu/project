"use client";

import { FcGoogle } from "react-icons/fc";
import { GrFacebook, GrApple } from "react-icons/gr";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { signIn } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { registerValidation } from "@/utils/validation";
import useLoginModal from "../hooks/useLoginModal";
import useRegisterModal from "../hooks/useRegisterModal";

import Modal from "./Modal";
import Input from "../inputs/Input";
import BasicHeading from "../Hadings/BasicHeading";
import Button from "../button/Button";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterFormFields } from "@/types/register";

enum STEPS {
  EMAIL = 0,
  PASSWORD = 1,
}
const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.EMAIL);


  const registerValidation1 = () =>
    yupResolver(
      yup.object().shape<Partial<Record<keyof RegisterFormFields, any>>>({
        email: yup
          .string()
          .required("이메일은 필수 입력 사항입니다.")
          .email("유효한 이메일 형식이어야 합니다."),
      })
    );

  const registerValidation2 = () =>
    yupResolver(
      yup.object().shape<Partial<Record<keyof RegisterFormFields, any>>>({
        email: yup
          .string()
          .required("이메일은 필수 입력 사항입니다.")
          .email("유효한 이메일 형식이어야 합니다."),
        password: yup
          .string()
          .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            "비밀번호는 특수문자, 숫자, 대소문자를 모두 포함해야 합니다."
          )
          .notRequired(),
        confirmpassword: yup
          .string()
          .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
          .notRequired(),
      })
    );

  const {
    register,
    handleSubmit,
    formState,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmpassword: "",
    },
    resolver: (step === STEPS.EMAIL) ? registerValidation1() : registerValidation2(),
  });

  //다음으로 넘어가기
  const onNext = () => {
    setStep((value) => value + 1);
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PASSWORD) {
      return "회원가입";
    }
    return "계속";
  }, [step]);

  //뒤로 가기
  const onBack = () => {
    setStep((value) => value - 1);
  };
  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.EMAIL) {
      return undefined;
    }

    return "이전";
  }, [step]);
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PASSWORD) {
      return onNext();
    }

    setIsLoading(true);

    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        console.log(userCredential);
        toast.success("회원가입이 완료되었습니다."); // 회원가입 성공 시 토스트 메시지
        registerModal.onClose();
        loginModal.onOpen();
      })
      .catch((error) => {
        let errorMessage = "";

        if (error.code === "auth/weak-password") {
          errorMessage = "비밀번호가 너무 약합니다.";
        } else if (error.code === "auth/email-already-in-use") {
          errorMessage = "이미 사용 중인 이메일 주소입니다.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "올바르지 않은 이메일 형식입니다.";
        } else {
          errorMessage = "알 수 없는 에러가 발생했습니다.\n" + error;
        }

        toast.error(errorMessage); // 실패 시 에러 메시지 토스트
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  let bodyContent = (
    <div className="flex flex-col gap-5">
      <BasicHeading title="회원가입" subtitle="이메일 또는 연계로그인" />
      <Input
        key={"email"}
        id="email"
        label="이메일"
        disabled={isLoading}
        register={register}
        errors={formState.errors}
        required
      />
    </div>
  );

  if (step === STEPS.PASSWORD) {
    bodyContent = (
      <div className="flex flex-col gap-8 ">
        <BasicHeading title="2단계" subtitle="패스워드를 입력하세요" />
        <Input
          key={"password"}
          id="password"
          label="비밀번호"
          type="password"
          disabled={isLoading}
          register={register}
          errors={formState.errors}
          required={step===STEPS.PASSWORD}
        />

        <Input
          key={"confirmpassword"}
          id="confirmpassword"
          label="비밀번호 확인"
          type="password"
          disabled={isLoading}
          register={register}
          errors={formState.errors}
          required={step===STEPS.PASSWORD}
        />
      </div>
    );
  }
  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <div className="flex items-center my-1">
        <hr className="flex-grow border-b-[1px] border-[#e8dbf2]" />
        <div className="mx-4 text-[#B25FF3] text-xs">또는</div>
        <hr className="flex-grow border-b-[1px] border-[#e8dbf2]" />
      </div>
      <Button
        outline
        label="네이버로 로그인하기"
        icon={SiNaver}
        iconColor="#1abb0e"
        onClick={() => signIn("kakaotalk")}
      />
      <Button
        outline
        label="카카오톡으로 로그인하기"
        icon={RiKakaoTalkFill}
        iconColor="#f9f930"
        onClick={() => signIn("kakaotalk")}
      />
      <Button
        outline
        label="구글로 로그인하기"
        icon={FcGoogle}
        onClick={() => signIn("google")}
      />
      <Button
        outline
        label="페이스북으로 로그인하기"
        icon={GrFacebook}
        iconColor="#1877F2"
        onClick={() => signIn("facebook")}
      />
      <Button
        outline
        label="애플로 로그인하기"
        icon={GrApple}
        iconColor="black"
        onClick={() => signIn("apple")}
      />
      <div
        className="
          text-neutral-500 
          text-center 
          mt-2 
          font-normal  
        "
      >
        <p>
          이미 계정이 있으십니까?
          <span
            onClick={onToggle}
            className="
              text-[#525252]
              cursor-pointer 
              ml-3
              font-semibold 
            "
          >
            로그인
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      actionLabel={actionLabel}
      onClose={() => {
        reset();
        setStep(0);
        registerModal.onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.EMAIL ? undefined : onBack}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;