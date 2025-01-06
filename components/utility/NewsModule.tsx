import { db } from "@/config/firebase";
import {
    Timestamp, collection, doc, getDoc, query, where,
    getDocs, setDoc, orderBy, updateDoc
} from 'firebase/firestore';
import { fullFormatting } from "./TimeModule";



export interface FNews {
    type: "urgent" | "notice" | "inspection" | "event" | "change",
    title: string,
    desc: string,
    time: Timestamp,

    views: number,
};

export interface FQNA {
    title: string,
    answer: string,
    time: Timestamp,
}

/**             R E A D             *******************************************/
export const getNewsIDs = async () => {
    try {
        const colRef = collection(db, "Notification");
        const q = query(colRef, orderBy("time", "desc"));

        const querySnapshot = await getDocs(q);
        const newsIDs = querySnapshot.docs.map(doc => doc.id);
        return newsIDs;
    } catch (error) {
        return [];
    }
};

export const getNewsData = async (docID: string) => {
    try {
        const docRef = doc(db, "Notification", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const d = docSnap.data() as FNews;
            return d;
        }
    } catch (error) {
        console.error(error);
    }
};

export const checkIsNew = (timestamp: Timestamp): boolean => {
    const currentTime = new Date().getTime();
    const timestampTime = timestamp.toMillis();
  
    const timeDifference = currentTime - timestampTime;
  
    const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
    return timeDifference <= fiveDaysInMillis;
};

export const getQNAIDs = async () => {
    try {
        const colRef = collection(db, "QNA");
        const q = query(colRef, orderBy("time", "desc"));

        const querySnapshot = await getDocs(q);
        const QNAIDs = querySnapshot.docs.map(doc => doc.id);
        return QNAIDs;
    } catch (error) {
        return [];
    }
};

export const getQNAData = async (docID: string) => {
    try {
        const docRef = doc(db, "QNA", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const d = docSnap.data() as FQNA;
            return d;
        }
    } catch (error) {
        
    }
}


/**             U P D A T E             *******************************************/
export const increaseView = async (docID: string) => {
    try {
        const docRef = doc(db, "Notification", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const d = docSnap.data() as FNews;
            await updateDoc(docRef, {views: d.views + 1});
        }
    } catch (error) {
        console.error(error);
    }
};




/**             E T C             *******************************************/
export const formattingTime = (time: Timestamp) => {
    const date = fullFormatting(time);

    const year = date.getFullYear().toString().slice(2); // 년도에서 뒤의 두 자리만 가져오기
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월을 두 자리로 표시, 0부터 시작하므로 +1
    const day = date.getDate().toString().padStart(2, '0'); // 일을 두 자리로 표시
    const hours = date.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = (hours % 12).toString().padStart(2, '0') || '12'; // 12시간 형식으로 변경
  
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 분을 두 자리로 표시
  
    return `${year}/${month}/${day} ${ampm} ${formattedHours}:${minutes}`;
  };



