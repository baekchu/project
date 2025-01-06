import { db } from "@/config/firebase";
import {
  Timestamp,
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { fullFormatting } from "./TimeModule";

export interface FPortfoilo {
  // [[ 게시글에 대한 인터페이스 정의 ]]

  desc: string; // 글 내용

  time: Timestamp; // 글 작성 시간
  uid: string; // 작성자 uid
  views: number; // 조회수

  inspirations: string[]; // 영감을 누른 사람들의 uid
  inspNum: number; // 영감 개수

  objectID: string;
}

export const uploadPortfoilo = async (newData: FPortfoilo) => {
  try {
    // 글 등록
    //const collRef = collection(db, "Portfoilo");
    const docRef = doc(db, "Portfoilo", newData.uid);
    await setDoc(docRef, newData);

    await updateDoc(docRef, {
      objectID: newData.uid,
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 데이터를 수정하는 함수
 */
export const modificatePortfoiloData = async (
  docID: string,
  newParticalData: {
    desc: string;
    time: Timestamp;
  }
) => {
  try {
    const docRef = doc(db, "Portfoilo", docID);
    await updateDoc(docRef, newParticalData);
    return true;
  } catch (error) {
    return false;
  }
};

export const getPortfoilo = async (docID: string) => {
  try {
    const docRef = doc(db, "Portfoilo", docID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as FPortfoilo;
  } catch (error) {
    console.error(error);
  }
  return {} as FPortfoilo;
};

/**
 * B) 포토폴리오 삭제
 * @param docID
 * @returns
 */
export const deletePortfoilo = async ( docID: string) => {
  try {
    const docRef = doc(db, "Portfoilo", docID);

    await deleteDoc(docRef);

    return true;
  } catch (error) {
    return false;
  }
};

export const fullFormatTimestamp = (time: Timestamp) => {
  try {
    const date = fullFormatting(time);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const period = date.getHours() >= 12 ? "오후" : "오전";
    const formattedHours =
      date.getHours() > 12
        ? (date.getHours() - 12).toString().padStart(2, "0")
        : hours;

    return `${year}/${month}/${day} ${period} ${formattedHours}:${minutes}`;
  } catch (error) {
    console.error(error);
    return "";
  }
};