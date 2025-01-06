import { db } from "@/config/firebase";
import {
    doc, getDoc, updateDoc, collection, query, where, getDocs,
    orderBy, limit
} from 'firebase/firestore';
import toast from "react-hot-toast";

// 경험치와 칭호에 대한 모듈

/**
 * a) 경험치 호출 타입
 * b) 칭호 배열
 * 
 * A) 레벨 불러오기
 * B) 유저 경험치 추가
 * 
 */


/**
 * 경험치 추가
 * @param uid 유저
 * @param exp 추가할 경험치 양
 */
export const addUserExp = async (uid: string, exp: number) => {
    try {
        const docRef = doc(db, "UserData", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const pastExp: number = docSnap.data().exp || 0;
            await updateDoc(docRef, {
                exp: pastExp + exp,
            });
            toast.success(`${exp} 경험치를 획득했습니다!`);
        }
    } catch (error) {
        console.error(error);
    }
};

