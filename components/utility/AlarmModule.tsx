import { db } from "@/config/firebase";
import {
    setDoc, getDoc, doc, collection, addDoc,
    Timestamp, query, orderBy, getDocs, deleteDoc, where, onSnapshot
} from "firebase/firestore";


export type Ttype = "follow" | "inspirate" | "comment";
export interface FAlarm {
    sender: string,
    type: Ttype,
    ref: string,
    time: Timestamp,
};

/**         C R E A T E              **********************************/
/**
 * 새 알람 등록
 * @param sender 보내는 사람 uid
 * @param getter 받는 사람 uid
 * @param type 알람 타입
 * @param ref docType: 이벤트 발생 문서 타입
 * @returns 성공 시 true, 실패 시 false 반환
 */
export const setNewAlarm = async (
    sender: string,
    getter: string,
    type: Ttype,
    ref: string,
) => {
    try {
        if (sender === getter) return false;
        const newAlarmData: FAlarm = {
            sender: sender,
            type: type,
            ref: ref,
            time: Timestamp.now()
        };

        const colRef = collection(db, "UserData", getter, "Alarm");
        await addDoc(colRef, newAlarmData);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};


/**         R E A D                  **********************************/
/**
 * 유저가 받은 알람의 id를 가져옴
 * @param uid 
 * @returns 
 */
export const getAlarmIDs = async (uid: string) => {
    try {
        const colRef = collection(db, 'UserData', uid, 'Alarm');
        const q = query(colRef, orderBy('time', 'desc'));

        const querySnapshot = await getDocs(q);

        const docIDs: string[] = [];
        querySnapshot.forEach((doc) => {
            docIDs.push(doc.id);
        });

        return docIDs;
    } catch (error) {
        console.error(error);
        return [];
    }
};

/**
 * 단일 알람 정보 가져오기
 * @param uid 
 * @param docID 
 * @returns 
 */
export const readAlarmData = async (uid: string, docID: string) => {
    try {
        const docRef = doc(db, "UserData", uid, "Alarm", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const d = docSnap.data() as FAlarm;
            return d;
        }
    } catch (error) {
        console.error(error);
    }
};

/**
 * 새로운 알람 존재 확인하기
 * @param uid 
 * @param callback 
 * @returns 
 */
export const checkNewAlarm = (uid: string, callback: (isNewExist: boolean) => void) => {
    const colRef = collection(db, "UserData", uid, "Alarm");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const isNewExist: boolean = snapshot.docs.length > 0;
        callback(isNewExist);
    });
    return unsubscribe;
};

/**         U P D A T E              **********************************/


/**         D E L E T E              **********************************/
/**
 * 유저의 알람 모두 삭제하기
 * @param uid 
 */
export const deleteAllAlarm = async ( uid: string ) => {
    try {
        const collRef = collection(db, "UserData", uid, "Alarm");
        const querySnapshot = await getDocs(collRef);

        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const deleteSingleAlarm = async (uid: string, sender: string, time: Timestamp) => {
    try {
        const colRef = collection(db, "UserData", uid, "Alarm");
        const q = query(colRef, where("time", "==", time), where("sender", "==", sender));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        return true;
    } catch (error) {
        return false;
    }
};


/**         E T C                    **********************************/
/**
 * 타임스탬프를 문자열로 변환
 * @param time timestamp
 * @returns 호출 시간 기준 1분 이내의 시간은 "방금", 59분 까지는 "N분 전", 24시간 전까지는 "N시간 전", 1달 전까지는 "N일 전", 1년 전까지는 "N일 전", 그 이상은 "N년 전"으로 표시
 */
export const alarmTimeToStr = (time: Timestamp) => {
    // 현재 시간 및 날짜
    const now = new Date();

    const timestampMillis = time.toMillis();
    const nowMillis = now.getTime();
    const timeDiff = nowMillis - timestampMillis;

    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(timeDiff / 3600000);
    const days = Math.floor(timeDiff / 86400000);
    const months = Math.floor(timeDiff / 2592000000);
    const years = Math.floor(timeDiff / 31536000000);

    if (minutes < 1) {
        return "방금";
    } else if (minutes < 60) {
        return `${minutes}분 전`;
    } else if (hours < 24) {
        return `${hours}시간 전`;
    } else if (days < 30) {
        return `${days}일 전`;
    } else if (months < 12) {
        return `${months}달 전`;
    } else {
        return `${years}년 전`;
    }
};












