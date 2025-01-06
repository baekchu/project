import { db } from "@/config/firebase";
import {
    Timestamp, doc, getDoc, getDocs, collection, addDoc,
    deleteDoc, query, orderBy, updateDoc, where, limit, onSnapshot, arrayRemove, arrayUnion, setDoc
} from "firebase/firestore";
import { fullFormatting } from "./TimeModule";
import toast from "react-hot-toast";
import { FImgData, getImgData } from "./ImgDataModule";
import { FPost, getPostData } from "./BulletinModule";

export interface FLog {
    mine: string[],
    inspired: string[],
    saved: string[],
    history: string[],
}


export const updateUserLog = async (
    uid: string,
    logType: "Artwork" | "Bulletin",
    type: "mine" | "inspired" | "saved" | "history",
    addDocID: string,
    isAdd: boolean = true
) => {
    try {
        const docRef = doc(db, "UserData", uid, `${logType}Log`, "log");
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                mine: [],
                inspired: [],
                saved: [],
                history: [],
            });
        }

        if (type === "history") {
            let hist: string[] = [];
            if (docSnap.exists()) {
                hist = docSnap.data()["history"] || [];
            }

            if (isAdd) {
                const updatedHist = hist.filter((id) => id !== addDocID);
                updatedHist.push(addDocID);

                if (updatedHist.length > 100) {
                    updatedHist.shift();
                }

                // 업데이트 성공 시 true 반환
                await updateDoc(docRef, {
                    [type]: updatedHist,
                });

                return true;
            } else {
                const updatedHist = hist.filter((id) => id !== addDocID);
                await updateDoc(docRef, {
                    [type]: updatedHist,
                });
                return false;
            }
        } else {
            const updateField = {
                [type]: isAdd ? arrayUnion(addDocID) : arrayRemove(addDocID),
            };

            await updateDoc(docRef, updateField);
            return isAdd;
        }
    } catch (error) {
        console.error(error);
    }
};

export const getUserLog = async (uid: string) => {
    try {
        const artDocRef = doc(db, "UserData", uid, "ArtworkLog", "log");
        const bullDocRef = doc(db, "UserData", uid, "BulletinLog", "log");

        const artSnap = await getDoc(artDocRef);
        const bullSnap = await getDoc(bullDocRef);

        const artData = artSnap.data() as FLog;
        const bullData = bullSnap.data() as FLog;

        return {
            artworkLog: artData,
            bulletinLog: bullData
        };
    } catch (error) {
        return {
            artworkLog: { mine: [], inspired: [], saved: [], history: [] } as FLog,
            bulletinLog: { mine: [], inspired: [], saved: [], history: [] } as FLog
        }
    }
};

export const getSelectedUserLog = async (
    uid: string,
    logType: "Artwork" | "Bulletin",
    type: number,
) => {
    try {
        const docRef = (logType === "Artwork") 
        ? doc(db, "UserData", uid, "ArtworkLog", "log")
        : doc(db, "UserData", uid, "BulletinLog", "log");

        const docSnap = await getDoc(docRef);
        const n = (type > 3) ? 0 : (type < 0) ? 0 : type;
        const innerType = ["mine", "inspired", "saved", "history"][n];

        let docData: string[] = [];
        if (docSnap.exists()) {
            docData = docSnap.data()[innerType] || [];
        }

        return docData;
    } catch (error) {
        return [];
    }
};


export const makeImgDataList = async (docIDs: string[], uid?: string) => {
    try {
        const emptyIds: string[] = [];
        const promises: Promise<FImgData | undefined>[] = docIDs.map(async (docID) => {
            const d = await getImgData(docID);
            if (d === undefined) emptyIds.push(docID);
            return d;
        });

        const data: (FImgData | undefined)[] = await Promise.all(promises);

        if (uid !== undefined) {
            await Promise.all(emptyIds.map((id) => deleteIdFromLog(uid, "img", id)));
        }

        return data.filter((item) => item !== undefined) as FImgData[];
    } catch (error) {
        console.error(error);
        return [];
    }
};


export const makePostDataList = async (docIDs: string[], uid?: string) => {
    try {
        const emptyIds: string[] = [];
        const promises: Promise<FPost | undefined>[] = docIDs.map(async (docID) => {
            const d = await getPostData(docID);

            if (d === undefined) emptyIds.push(docID);
            return d;
        });

        const data: (FPost | undefined)[] = await Promise.all(promises);

        if (uid !== undefined) {
            await Promise.all(emptyIds.map((id) => deleteIdFromLog(uid, "post", id)));
        }

        return data.filter((item) => item !== undefined) as FPost[];
    } catch (error) {
        console.error(error);
        return [];
    }
};


export const deleteIdFromLog = async (uid: string, type:"img"|"post", docID: string) => {
    try {
        const docRef = doc(db, "UserData", uid, type=="img"?"ArtworkLog":"BulletinLog", "log");
        await updateDoc(docRef, {
            mine: arrayRemove(docID),
            inspired: arrayRemove(docID),
            saved: arrayRemove(docID),
            history: arrayRemove(docID),
        })
    } catch (error) {
        
    }
};