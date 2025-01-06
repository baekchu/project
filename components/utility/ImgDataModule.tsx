import { db, storage } from "@/config/firebase";
import {
    Timestamp, doc, getDoc, getDocs, collection, addDoc,
    deleteDoc, query, orderBy, updateDoc, where, limit, onSnapshot, arrayRemove, arrayUnion
} from "firebase/firestore";
import { fullFormatting } from "./TimeModule";
import toast from "react-hot-toast";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateMissionProgress } from "./MissionModule";

// 탐색 이미지 속성값
export interface FImgData {
    type: "default" | "sell" | "auction",
    images: string[],
    time: Timestamp,
    uid: string,

    title: string,
    desc: string,
    category: string
    tags: string[],

    insp: string[],
    views: number,
    reports: string[],
    isCommentAble: boolean,

    objectID: string,
    due?: Timestamp,
    price?: number,
}

// 댓글
export interface Comment {
    commentId: string,  // 댓글 문서 ID
    uid: string;        // 작성자 uid
    comment: string;    // 댓글 내용
    insp: string[]; // 좋아요 수
    timestamp: Timestamp;    // 댓글 등록 시간
}

export interface FPrice {
    bid: number,
    uid: string,
    time: Timestamp,
}

/**     CREATE           *****************
 * A) 댓글 작성하기     addComment
*/

/**     READ           *****************
 * A) 이미지 정보 가져오기                  getImgData
 * B) 해당 유저가 좋아요를 눌렀는지 확인     checkIsLike
 * C) 최신순으로 댓글 ID 불러오기           getComments
 * D) 댓글 좋아요 상태 불러오기             checkIsCommentLike
 * E) 해당 이미지가 유저에게 저장되어 있는지 확인   checkSaved
*/

/**     Update           *****************
 * A) 이미지 또는 댓글에 해당 유저의 좋아요 상태 반전       toggleInspiration
 * B) 조회수 추가                                       updateView
 * C) 작품 또는 댓글 신고하기                           reportContent
 * D) 이미지 저장 토글하기                      toggleImgSaved
*/

/**     Delete           *****************
 * A) 댓글 삭제     deleteComment
*/

/**     ETC           *****************
 * A) 타임스탬프를 날짜와 시간 형태로 변환      timestampToFullDate
 * B) 타임스탬프를 일자 형태로 변환             timestampToDate
 * C) 타임스탬프를 날짜와 시간으로 변경         timestampToDateTime
*/




/**     CREATE           ******************************************************/
/**
 * A) 댓글 작성하기
 * @param uid 
 * @param type 
 * @param docID 
 * @param comment 
 */
export const addComment = async (uid: string, docID: string, comment: string) => {
    try {
        const commentsCollectionRef = collection(db, "Artworks", docID, 'Comments');

        const newComment = {
            uid: uid,
            comment: comment,
            insp: [],
            timestamp: Timestamp.now(),
        };

        // 댓글 추가
        const docRef = await addDoc(commentsCollectionRef, newComment);
        await updateDoc(docRef, { commentId: docRef.id });

        return true;
    } catch (error) {
        return false;
    }
};

/**
 * 이미지 urls를 받아 해당 경로에 있는 파일들을 스토리지에서 제거함
 * @param imgUrls 제거할 파일들의 경로
 * @returns 성공 시 true, 실패 시 false
 */
export const deleteStoredImgs = async (imgUrls: string[]) => {
    try {
        const deletionPromises = imgUrls.map(async (url) => {
            // 이미지 URL을 사용하여 스토리지에서 파일을 삭제
            const imgRef = ref(storage, url);
            await deleteObject(imgRef);
        });

        // 모든 이미지 삭제 작업을 병렬로 실행하고 완료되길 기다림
        await Promise.all(deletionPromises);
        // 성공 시 true
        return true;
    } catch (error) {
        // 에러가 발생한 경우
        return false;
    }
};

/**
 * 아트워크 데이터 추가 
 * @param newArtwork 
 * @returns 성공 시 true, 실패 시 false 반환
 */
export const uploadArtwork = async (newArtwork: FImgData) => {
    try {
        const colRef = collection(db, "Artworks");
        const resDocRef = await addDoc(colRef, newArtwork);

        const innerColRef = collection(resDocRef, "Scores");
        await addDoc(innerColRef, {
            currentScore: 0,
            cycleScores: {
                0:0,
                1:0,
                2:0,
                3:0,
                4:0,
            }
        });

        await updateDoc(resDocRef, {
            objectID: resDocRef.id,
            algorithmScore: 0,
        })

        const logDocRef = doc(db, "UserData", newArtwork.uid, "ArtworkLog", "log");
        await updateDoc(logDocRef, { mine: arrayUnion(resDocRef.id) });

        await updateMissionProgress(newArtwork.uid, "weekly", 2);   // 작품 또는 게시글 등록 미션 클리어

        return true;
    } catch (error) {
        return false;
    }
};




/**
 * 이미지 파일이 담긴 배열을 받아 storage에 업로드 후
 *  해당 경로들에 대한 배열을 리턴받기.
 * @param imgFiles 업로드할 이미지 파일들
 * @param uid 업로더 uid
 * @returns url이 담긴 배열, 실패 시 null
 */
export const uploadImageFiles = async (imgFiles: File[], uid: string) => {
    try {
        // 스토리지 경로는 'Artworks/{uid_(현재 date를 숫자열로 만든 값)}/(원본 제목)' 으로 설정
        const imgUrls: string[] = [];
        const currentDate = Date.now().toString();

        const storageRef = ref(storage, `Artworks/${uid}_${currentDate}`);
        for (let i = 0; i < imgFiles.length; i++) {
            const imgFile = imgFiles[i];
            const fileName = imgFile.name;
            const imgRef = ref(storageRef, fileName);
            await uploadBytes(imgRef, imgFile);

            // 업로드된 이미지의 다운로드 URL 가져오기
            const downloadUrl = await getDownloadURL(imgRef);
            imgUrls.push(downloadUrl);
        }

        return imgUrls;
    } catch (error) {
        return null;
    }
};

/**
 * 이미지 데이터를 수정하는 함수
 * @param docID 
 * @param newParticalData 
 * @returns 
 */
export const modificateImgData = async (docID: string, newParticalData: {
    title: string,
    desc: string,
    tags: string[],
    category: string,
    isCommentAble: boolean,
}) => {
    try {
        const docRef = doc(db, "Artworks", docID);
        await updateDoc(docRef, newParticalData);
        return true;
    } catch (error) {
        return false;
    }
};



/**     READ           ******************************************************/
/**
 * A) 이미지 정보 가져오기
 * @param docID 
 * @returns 
 */
export const getImgData = async (docID: string) => {
    try {
        const docRef = doc(db, "Artworks", docID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as FImgData;
            return data;
        } else {
            throw new Error("문서를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error(error);
    }
};

/**
 * B) 해당 유저가 좋아요를 눌렀는지 확인
 * @param docID 
 * @param uid 
 * @returns 
 */
export const checkIsLike = async (uid: string, docID: string) => {
    try {
        const docRef = doc(db, "Artworks", docID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const likeList: string[] = docSnap.data()["insp"] || [];
            return likeList.includes(uid);
        }
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * C) 최신순으로 댓글 데이터 불러오기
 * @param docID 
 * @returns 
 */
export const getComments = async (docID: string): Promise<Comment[]> => {
    try {
        const collRef = collection(db, "Artworks", docID, 'Comments');
        let q = query(collRef, orderBy("timestamp", "desc"));

        const querySnapshot = await getDocs(q);
        const comments: Comment[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Comment;
            comments.push(data);
        });

        return comments;
    } catch (error) {
        console.error('댓글 불러오기 실패:', error);
        return [];
    }
};

/**
 * D) 댓글 좋아요 상태 불러오기
 * @param uid 본인 작품에는 좋아요 X
 * @param docID 
 * @param commentID 
 * @param time 해당 댓글의 등록 시간
 * @returns 
 */
export const checkIsCommentLike = async (uid: string, docID: string, commentID: string) => {
    try {
        const docRef = doc(db, "Artworks", docID, 'Comments', commentID);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()) {
            const docData = docSnap.data() as { insp: string[] } || [];

            if(docData.insp.includes(uid)) {
                return true;
            }
        }
        return false;

    } catch (error) {
        console.error('댓글 좋아요 확인 오류:', error);
        return false;
    }
};

/**
 * E) 해당 이미지가 유저에게 저장되어 있는지 확인
 * @param uid 
 * @param docID 
 * @returns 
 */
export const checkSaved = async (uid: string, docID: string) => {
    try {
        const docRef = doc(db, "UserData", uid, "ArtworkLog", "log");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const savedImgs: string[] = docSnap.data()["saved"] || [];
            if (savedImgs.includes(docID)) {
                return true;
            } else {
                return false;
            }
        }
    } catch (error) {
        console.error(error);
        return false;
    }
};


/**     Update           ******************************************************/
/**
 * A) 이미지 또는 댓글에 해당 유저의 좋아요 상태 반전
 * @param docID 
 * @param uid 
 * @returns 좋아요 시 true, 취소 시 false, 실패 시 null 반환
 */
export const toggleInspiration = async (docID: string, uid: string, commentID?: string) => {
    try {
        const docRef = (commentID)
            ? doc(db, "Artworks", docID, "Comments", commentID)
            : doc(db, "Artworks", docID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data() as { insp: string[] } || { insp: [] };
            const newList: string[] = docData.insp.includes(uid)
                ? docData.insp.filter((userId) => userId !== uid)
                : [...docData.insp, uid];

            await updateDoc(docRef, {
                insp: newList
            });

            return newList.includes(uid) ? true : false;
        }
        return undefined;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

/**
 * B) 조회수 추가
 * @param docID 
 * @returns 성공 시 true
 */
export const updateView = async (docID: string) => {
    try {
        const docRef = doc(db, "Artworks", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data()["views"] || 0;
            updateDoc(docRef, {views: data + 1});
            return true;
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * C) 작품 또는 댓글 신고하기
 * @param uid 
 * @param docID 
 * @param commentID 
 */
export const reportContent = async (uid: string, docID: string, commentID?: string) => {
    try {
        const docRef = (!commentID) ? doc(db, "Artworks", docID) : doc(db, "Artworks", docID, "Comments", commentID);
        const docSnap = await getDoc(docRef);
        const reports: string[] = docSnap.data()?.reports || [];
        if (!reports.includes(uid)) {
            await updateDoc(docRef, {reports: arrayUnion(uid)});
            toast.success(`해당 ${commentID?"댓글":"작품"}을 신고했습니다`);
        } else {
            toast.error(`이미 신고한 ${commentID?"댓글":"작품"}입니다`);
        }
    } catch (error) {
        console.error(error);
    }
};


/**
 * algorithmScore 필드값이 큰 순서부터 내림차순으로 count(기본 100) 만큼 문서의 id 배열을 가져오기
 * @param count 가져올 문서의 개수. 기본 100
 * @returns id 배열 (string[])
 */
export const getRecommendImgIDs = async (count: number = 100): Promise<FImgData[]> => {
    try {
        const colRef = collection(db, "Artworks");
        const q = query(colRef, orderBy("algorithmScore", "desc"), limit(count));
        const docsSnap = await getDocs(q);

        const promises: Promise<FImgData | undefined>[] = docsSnap.docs.map(async (doc) => {
            return await getImgData(doc.id);
        });

        // Promise 배열을 기다렸을 때 반환되는 FImgData 배열
        const res = (await Promise.all(promises)).filter((data): data is FImgData => data !== undefined);
        return res;
    } catch (error) {
        console.error("Error fetching recommended IDs:", error);
        return [];
    }
};



/**     Delete           ******************************************************/
/**
 * A) 댓글 삭제
 * @param uid 
 * @param docID 
 * @param commentID 
 * @returns 성공 시 true, 실패 시 false
 */
export const deleteComment = async (uid: string, docID: string, commentID: string) => {
    try {
        const docRef = doc(db, "Artworks", docID, "Comments", commentID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Comment;
            if (data.uid === uid) {
                await deleteDoc(docRef);
                return true;
            };
        }
        return false
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * B) 아트워크 삭제
 * @param docID 
 * @returns 
 */
export const deleteArtwork = async (uid: string, docID: string, imgUrls: string[]) => {
    try {
        const docRef = doc(db, "Artworks", docID);

        const res = await deleteStoredImgs(imgUrls);
        if (!res) return false;

        await deleteDoc(docRef);

        const logDocRef = doc(db, "UserData", uid, "ArtworkLog", "log");
        await updateDoc(logDocRef, { mine: arrayRemove(docID) });

        return true;
    } catch (error) {
        return false;
    }
};


/**     ETC           ******************************************************/
/**
 * A) 타임스탬프를 날짜와 시간 형태로 변환
 * @param time 
 * @returns "YYYY.MM.DD 오전/오후 HH:MM" 또는 "N일 전", "어제", "오늘"의 형태
 */
export const timestampToFullDate = (time: Timestamp) => {
    const now = new Date();
    const dateTime = new Date(time.seconds * 1000);
    const YY = dateTime.getFullYear()
    const MM = dateTime.getMonth();
    const DD = dateTime.getDate();
    let dateStr: string = "";

    const makeDoubleDigit = (num: number) => {
        const temp = num % 100;
        const isOneDigit = temp < 10;
        return (isOneDigit) ? "0" + String(temp) : String(temp);
    }

    if (now.getFullYear() === YY) {
        if (now.getMonth() === MM) {
            const today = now.setHours(0, 0, 0, 0);
            const day = time.toDate();
            const d = day.setHours(0, 0, 0, 0);
            const diff = (today - d) / (24 * 60 * 60 * 1000);

            if (diff === 0) dateStr = "오늘";
            else if (diff === 1) dateStr = "어제";
            else if (diff <= 7) dateStr = `${diff}일 전`;
            else dateStr = `${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;

        } else {
            dateStr = `${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;
        }

    } else {
        dateStr = `${makeDoubleDigit(YY)}.${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;
    }

    let hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    let ampm = "오전";
    if (hours >= 12) {
        ampm = "오후";
        if (hours > 12) {
            hours -= 12;
        }
    }
    const hh = hours < 10 ? '0' + hours : hours;
    const mm = minutes < 10 ? '0' + minutes : minutes;

    return `${dateStr} ${ampm} ${hh}:${mm}`;
};

/**
 * B) 타임스탬프를 일자 형태로 변환
 * @param time 
 * @returns "오늘", "어제", "N일 전"
 */
export const timestampToDate = (time: Timestamp) => {
    // 알고리아랑 파이어베이스에서 가져오는 이미지의 time의 형식이 달라서 처리하는 방식을 이렇게 설정함
    const now = new Date();
    const dateTime = fullFormatting(time);
    const YY = dateTime.getFullYear() ?? 0;
    const MM = dateTime.getMonth() ?? 0;
    const DD = dateTime.getDate() ?? 0;

    const diffInMilliseconds = Math.abs(now.getTime() - dateTime.getTime());
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

    const makeDoubleDigit = (num: number) => {
        const temp = num % 100;
        const isOneDigit = temp < 10;
        return isOneDigit ? '0' + String(temp) : String(temp);
    };

    if (diffInMilliseconds < 60000) {
        return '1분 미만';
    } else if (diffInMilliseconds < 3600000) {
        return `${diffInMinutes}분 전`;
    } else if (diffInMilliseconds < 86400000) {
        return `${diffInHours}시간 전`;
    } else if (now.getFullYear() === YY && now.getMonth() === MM) {
        const today = now.setHours(0, 0, 0, 0);
        const day = (Number(time) / 1000000000000 > 1) ? new Date(Number(time)) : new Date(time.seconds * 1000);
        const d = day.setHours(0, 0, 0, 0);
        const diff = (today - d) / (24 * 60 * 60 * 1000);

        if (diff === 0) return '오늘';
        else if (diff === 1) return '어제';
        else if (diff <= 7) return `${diff}일 전`;
    }

    return `${makeDoubleDigit(YY)}.${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;
};

/**
 * C) 타임스탬프를 날짜와 시간으로 변경
 * @param time 
 * @returns "MM/DD HH-MM"
 */
export const timestampToDateTime = (time: Timestamp) => {
    const dateTime = fullFormatting(time);
    const MM = dateTime.getMonth();
    const DD = dateTime.getDate();

    const makeDoubleDigit = (num: number) => {
        const temp = num % 100;
        const isOneDigit = temp < 10;
        return (isOneDigit) ? "0" + String(temp) : String(temp);
    }

    const dateStr = `${makeDoubleDigit(MM)}.${makeDoubleDigit(DD)}`;

    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const hh = hours < 10 ? '0' + hours : hours;
    const mm = minutes < 10 ? '0' + minutes : minutes;

    return `${dateStr} ${hh}:${mm}`;
};


export const numToDate = (num: number): string => {
    const now = new Date();
    const date = new Date(num);
    
    const YY = date.getFullYear();
    const MM = date.getMonth();
    const DD = date.getDate();
    let dateStr: string = "";

    const makeDoubleDigit = (num: number) => {
        const temp = num % 100;
        const isOneDigit = temp < 10;
        return (isOneDigit) ? "0" + String(temp) : String(temp);
    }

    if (now.getFullYear() === YY) {
        if (now.getMonth() === MM) {
            const today = now.setHours(0, 0, 0, 0);
            const day = date.setHours(0, 0, 0, 0);
            const diff = (today - day) / (24 * 60 * 60 * 1000);

            if (diff === 0) dateStr = "오늘";
            else if (diff === 1) dateStr = "어제";
            else if (diff <= 7) dateStr = `${diff}일 전`;
            else dateStr = `${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;

        } else {
            dateStr = `${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;
        }

    } else {
        dateStr = `${makeDoubleDigit(YY)}.${makeDoubleDigit(MM + 1)}.${makeDoubleDigit(DD)}`;
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();

    let ampm = "오전";
    if (hours >= 12) {
        ampm = "오후";
        if (hours > 12) {
            hours -= 12;
        }
    }
    const hh = hours < 10 ? '0' + hours : hours;
    const mm = minutes < 10 ? '0' + minutes : minutes;

    return `${dateStr} ${ampm} ${hh}:${mm}`;
};



export const getNewPrice = (docID: string, callback: (price: number) => void) => {
   const bidRef = collection(db, "Artworks", docID, "Price");
    const q = query(bidRef, orderBy('bid', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as FPrice;
          callback(data.bid);
        } else {
          callback(0);
        }
      });

    return unsubscribe;
};
