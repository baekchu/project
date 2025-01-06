import { db } from "@/config/firebase";
import {
    doc, getDoc, updateDoc, collection, query, where, getDocs,
    orderBy, limit
} from 'firebase/firestore';


//  점수 부여에 대한 함수들 정의

/**
 * 
 */

/**
 * A) 작품의 추천 점수를 추가/취소하는 함수
 * @param docID 작품 id
 * @param type 행동 타입. 점수에 영향
 * @param isCancle 취소 시에만 true
 */
export const addArtworkScore = async (
    docID: string,
    type: "view" | "inspiration" | "share" | "comment",
    isCancle: boolean = false
) => {
    try {
        const addScore = (type === "view") ? 2
            : (type === "inspiration") ? 7
                : (type === "share") ? 5
                    : 10;

        const docRef = doc(db, "Artworks", docID, "Scores", "scores");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const pastScore: number = docSnap.data().currentScore || 0;
            const newScore: number = pastScore + addScore * (isCancle ? (-1) : 1);
            await updateDoc(docRef, {
                currentScore: newScore < 0 ? 0 : newScore,
            });
        }
    } catch (error) {
        console.error(error);
    }
};


export const addBulletinScore = async (
    bulletinID: string,
    type: "view" | "inspiration" | "share" | "comment",
    isCancle: boolean = false,
) => {
    try {
        const addScore = (type === "view") ? 2
            : (type === "inspiration") ? 10
                : (type === "share") ? 5
                    : 7;
        const docRef = doc(db, "Bulletin", bulletinID, "Scores", "scores");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const pastScore: number = docSnap.data()["currentScore"] || 0;
            const newScore: number = pastScore + addScore * (isCancle ? (-1) : 1);
            await updateDoc(docRef, {
                currentScore: newScore < 0 ? 0 : newScore,
            });
        }

    } catch (error) {
        console.error(error);
    }
};