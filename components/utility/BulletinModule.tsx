import { searchClient } from "@/config/algolia";
import { db } from "@/config/firebase";
import {
    doc, getDoc, updateDoc, collection, addDoc, Timestamp, getDocs,
    query, where, deleteDoc, orderBy,
    limit, arrayRemove, arrayUnion,
} from 'firebase/firestore';
import toast from "react-hot-toast";
import { fullFormatting } from "./TimeModule";
import { setNewAlarm } from "./AlarmModule";
import { updateMissionProgress } from "./MissionModule";

// 게시판 글 관리에 대한 모듈


/******************************************************************************/
/**         I N T E R F A C E S            ************************************/
export interface FPost {   // [[ 게시글에 대한 인터페이스 정의 ]]
    title: string,          // 글 제목
    desc: string,           // 글 내용
    category: string,       // 메인 카테고리
    tags: string[],         // 관련 태그

    time: Timestamp,        // 글 작성 시간
    uid: string,            // 작성자 uid
    views: number,          // 조회수
    reports: string[],      // 신고를 누른 사람들의 uid

    inspirations: string[], // 영감을 누른 사람들의 uid
    inspNum: number,        // 영감 개수
    objectID?: string,
}

export interface FComment { // [[ 댓글에 대한 인터페이스 정의 ]]
    uid: string,            // 댓글 작성자 uid
    content: string,        // 댓글 내용
    time: Timestamp,        // 댓글 작성 시간
    inspirations: string[], // 영감을 누른 사람들의 uid

    reports: string[],      // 신고를 누른 사람들의 uid
}


/******************************************************************************/
/**         F U C N T I O N S            **************************************/

/** 함수 목록 ***********
 * //   Create   //
 * A) 게시글 등록하기
 *      createPost(uid: string, title: string, desc: string, category: string, tags: string[])
 * B) 댓글 또는 대댓글 등록
 *      leaveComment(uid: string, content: string, docID: string, commentID?: string)
 * 
 * 
 * //   Read    //
 * A) 게시글 검색해서 문서 ID 배열 불러오기
 *      getPostIDs(docID: string)   => string[]
 * B) 글 정보 가져오기
 *      getPostData(docID: string)  => FPost
 * C) 댓글 또는 대댓글 배열 최신순으로 불러오기
 *      getCommentIDs(docID: string, commentID?: string)    => string[]
 * D) 댓글 또는 대댓글 데이터 가져오기
 *      getCommentData(docID: string, commentID: string, cocommentID?: string)  => FComment
 * E) 인기 댓글을 가져옴
 *      getPopularCom(docID: string)    => string[]
 * F) 전체 댓글의 개수를 가져옴
 *      getCommentCounts(docID: string)
 * 
 * 
 * //   Update  //
 * A) 댓글 영감 상태 반전시키기
 *      switchPostInspirationState( uid: string, docID: string )
 * B) 게시글 신고하기
 *      doReport(uid: string, docID: string, commentID?: string, cocommentID?: string)
 * C) 댓글 영감 반전시키기
 *      switchCommentInspirationState(uid: string, docID: string, commentID: string, cocommentID?: string)
 * D) 해당 게시글의 조회수 1 증가
 *      viewPost(docID: string)
 * E) 게시글을 스크랩 목록에 추가
 *      scrapPost (uid: string, postID: string)
 * 
 * 
 * //   Delete  //
 * A) 댓글 삭제 동작
 *      deleteMyComment(uid: string, docID: string, time: Timestamp, commentID?: string)
 * B) 글 삭제 동작
 *      deletePost(uid: string, docID: string)
 * 
 * 
 * //   ETC     //
 * A) 타임스탬프를 댓글에 맞는 문자열로 변환
 *      singleFormatTimestamp(time: Timestamp) => string
 * B) 타임스탬프를 게시글에 맞는 형식으로 변환
 *      fullFormatTimestamp(time: Timestamp) => string
 */


//          Create           ***************************/
/**
 * A) 게시글 등록하기
 * @param uid       작성자 uid
 * @param title     글 제목
 * @param desc      글 내용
 * @param category  카테고리
 * @param tags      태그 배열
 */
export const uploadBulletin = async (newData: FPost) => {
    try {
        // 글 등록
        const collRef = collection(db, "Bulletin");
        const resDocRef = await addDoc(collRef, newData);

        const innerColRef = collection(resDocRef, "Scores");
        await addDoc(innerColRef, {
            currentScore: 0,
            cycleScores: {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
            }
        });

        await updateDoc(resDocRef, {
            objectID: resDocRef.id,
            algorithmScore: 0,
        });

        const logDocRef = doc(db, "UserData", newData.uid, "BulletinLog", "log");
        await updateDoc(logDocRef, { mine: arrayUnion(resDocRef.id) });

        await updateMissionProgress(newData.uid, "weekly", 2);

        return true;
    } catch (error) {
        return false;
    }
};

/**
 * B) 댓글 또는 대댓글 등록
 * @param uid 사용자 uid
 * @param content 댓글 내용
 * @param docID 문서 ID
 * @param commentID 댓글 ID
 */
export const leaveComment = async (
    uid: string, content: string, docID: string, commentID?: string
) => {
    try {
        // 새로운 대댓글 데이터
        const newComment: FComment = {
            uid: uid,
            content: content,
            time: Timestamp.now(),
            inspirations: [],
            reports: []
        }

        // 댓글 등록
        const collRef = (commentID)
            ? collection(db, "Bulletin", docID, "Comments", commentID ?? "", "Cocomments")
            : collection(db, "Bulletin", docID, "Comments");
        await addDoc(collRef, newComment);

    } catch (error) {
        console.error(error);
    }
};


//          Read           *****************************/

/**
 * A) 게시글 검색해서 문서 ID 배열 불러오기
 * @param area 카테고리 범위. "all", "popular"
 * @param order 정렬 순서. "time", "inspirations", "views"
 * @param lengthLimit 입력 시 배열 개수가 제한됨
 * @param isDesc 기본 내림차순 정렬, false시 오름차순 
 * @returns 글 ID가 저장된 배열
 */
export const getPostIDs = async (
    area: string, order: string, lengthLimit?: number, isDesc: boolean = true
) => {
    try {
        const collRef = collection(db, "Bulletin");
        let baseQ = query(collRef);
        if (area === "popular") {
            // 인기 탭 선택시 inspirations이 10 이상인 게시글만 보여줌
            baseQ = query(baseQ, where("inspirations", ">=", 10));
        };

        let orderField = "time";
        if (order === "inspirations" || order === "views") {
            orderField = order;
        }

        const direction = isDesc ? "desc" : "asc";

        const sortedQ = (lengthLimit)
            ? query(baseQ, orderBy(orderField, direction), limit(lengthLimit))
            : query(baseQ, orderBy(orderField, direction));
        const postDocs = await getDocs(sortedQ);

        const docsList: string[] = [];
        postDocs.forEach((doc) => {
            docsList.push(doc.id);
        });

        return (docsList);
    } catch (error) {
        console.error(error);
    }
    return [];
};

export const getAllPost = async () => {
    try {
        const colRef = collection(db, "Bulletin");
        const docSnaps = await getDocs(colRef);
        const ids = docSnaps.docs.map((doc) => doc.id);
        return ids;
    } catch (error) {
        return [];
    }
};

/**
 * B) 글 정보 가져오기
 * @param docID 글 ID
 * @returns FPost 형태 데이터 리턴
 */
export const getPostData = async (docID: string) => {
    try {
        const docRef = doc(db, "Bulletin", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as FPost;
        }
    } catch (error) {
        console.error(error);
    }
};


/**
 * C) 댓글 또는 대댓글 배열 최신순으로 불러오기
 * @param docID 글 ID
 * @param commentID 대댓글일 경우 댓글 ID 입력
 * @returns 
 */
export const getCommentIDs = async (docID: string, commentID?: string,) => {
    try {
        const collRef = (commentID) ?
            collection(db, "Bulletin", docID, "Comments", commentID ?? "", "Cocomments")
            : collection(db, "Bulletin", docID, "Comments");
        const q = query(collRef, orderBy("time", "asc"));
        const docs = await getDocs(q);

        const commentIds: string[] = [];
        docs.forEach((doc) => {
            commentIds.push(doc.id);
        });
        return commentIds;

    } catch (error) {
        console.error(error);
    }
    return [];
};


/**
 * D) 댓글 또는 대댓글 데이터 가져오기
 * @param docID 
 * @param commentID 
 * @param cocommentID 
 */
export const getCommentData = async (
    docID: string, commentID: string, cocommentID?: string
) => {
    try {
        const docRef = (!cocommentID)
            ? doc(db, "Bulletin", docID, "Comments", commentID)
            : doc(db, "Bulletin", docID, "Comments", commentID, "Cocomments", cocommentID ?? "");
        const docSnap = await getDoc(docRef);
        const docData = docSnap.data() as FComment;
        return docData;
    } catch (error) {
        console.error(error);
    }
    return {} as FComment;
};


/**
 * E) 인기 댓글을 가져옴
 * @param docID 글 문서 ID
 * @returns 문서 아이디 string[]
 */
export const getPopularCom = async (docID: string): Promise<string[]> => {
    try {
        // 모든 Comments 컬렉션과 그 하위의 Cocomments 컬렉션의 문서를 조사해 inspirations 필드의 길이가 가장 긴 순서대로 상위 N개를 가져옴
        // 가져올 문서 아이디 배열의 길이 = (전체 댓글의 개수) / 15, 최대 5개의 댓글을 가져옴

        // Comment 및 Cocomment의 정보를 저장할 배열
        interface FCommentArr {
            id: string;
            inspirationsLength: number;
        }

        // 최소 좋아요 개수
        const minLike = 3;

        // Comment 정보를 저장하는 배열
        const commentArr: FCommentArr[] = [];

        // Comments 컬렉션의 댓글들을 가져와서 배열에 추가
        const commentRef = collection(db, "Bulletin", docID, "Comments");
        const comSnap = await getDocs(commentRef);

        // Promises 배열을 생성하여 각 댓글의 정보를 비동기적으로 가져오도록 함
        const comPromises = comSnap.docs.map(async (comDoc) => {
            const comID = comDoc.id;
            const inspirationsLength = (comDoc.data()["inspirations"] || []).length;

            if (inspirationsLength >= minLike) {
                commentArr.push({ id: comID, inspirationsLength: inspirationsLength });
            }

            // Cocomments 컬렉션의 댓글들을 가져와서 배열에 추가
            const cocommentRef = collection(db, "Bulletin", docID, "Comments", comID, "Cocomments");
            const cocomSnap = await getDocs(cocommentRef);

            // Promises 배열을 생성하여 각 cocomment의 정보를 비동기적으로 가져오도록 함
            const cocoPromises = cocomSnap.docs.map(async (cocoDoc) => {
                const cocomID = cocoDoc.id;
                const cocoInspirationsLength = (cocoDoc.data()["inspirations"] || []).length;

                if (cocoInspirationsLength >= minLike) {
                    commentArr.push({ id: cocomID, inspirationsLength: cocoInspirationsLength });
                }
            });

            await Promise.all(cocoPromises);
        });

        await Promise.all(comPromises);
        // commentArr을 inspirationsLength 순서로 내림차순 정렬
        const sortedCommentArr = commentArr.sort((a, b) => b.inspirationsLength - a.inspirationsLength);

        const len = commentArr.length;
        const getLen = Math.min(len, 5);
        const topDocIds = sortedCommentArr.slice(0, getLen).map((comment) => comment.id);

        return topDocIds;
    } catch (error) {
        console.error(error);
        return [];
    }
};


/**
 * F) 전체 댓글의 개수를 가져옴
 * @param docID 
 * @returns 댓글과 대댓글 수
 */
export const getCommentCounts = async (docID: string): Promise<number> => {
    try {
        // Comments 컬렉션과 그 하위의 Cocomments 컬렉션의 문서 개수를 반환
        let commentCount = 0;

        // Comments 컬렉션의 문서 개수를 가져와 더함
        const commentsRef = collection(db, "Bulletin", docID, "Comments");
        const commentsSnap = await getDocs(commentsRef);
        commentCount += commentsSnap.size;

        // Comments 컬렉션의 각 문서에 대해 Cocomments 컬렉션의 문서 개수를 가져와 더함
        for (const commentDoc of commentsSnap.docs) {
            const cocommentsRef = collection(db, "Bulletin", docID, "Comments", commentDoc.id, "Cocomments");
            const cocommentsSnap = await getDocs(cocommentsRef);
            commentCount += cocommentsSnap.size;
        }

        return commentCount;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

/**
 * 해당 유저가 문서를 스크랩했는지 확인
 * @param uid 
 * @param postID 
 * @returns 
 */
export const checkScrap = async (uid: string, postID: string) => {
    try {
        const docRef = doc(db, "UserData", uid, "BulletinLog", "log");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const scraps: string[] = docSnap.data()["saved"] || [];
            return scraps.includes(postID);
        }
    } catch (error) {

    }
    return false;
};

export const checkIsInsp = async (uid: string, postID: string) => {
    try {
        const docRef = doc(db, "Bulletin", postID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const insp: string[] = docSnap.data()["inspirations"] || [];
            return (insp.includes(uid));
        }
    } catch (error) {

    }
};

export const getPostViews = async (docID: string) => {
    try {
        const docRef = doc(db, "Bulletin", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const views: number = docSnap.data()["views"] || 0;
            return views;
        }
    } catch (error) {

    }
    return 0;
};

export const getPostInsp = async (docID: string) => {
    try {
        const docRef = doc(db, "Bulletin", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const insp: string[] = docSnap.data()["inspirations"] || [];
            return insp;
        }
    } catch (error) {

    }
    return [];
};


//          Update           ***************************/
/**
 * A) 게시글 영감 상태 반전시키기
 * @param uid 내 uid
 * @param docID 문서 id
 * @param commentID 댓글 id 
 * @param cocommentID 대댓글 id(대댓글일 경우)
 */
export const switchPostInspirationState = async (uid: string, docID: string) => {
    try {
        const docRef = doc(db, "Bulletin", docID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const insps: string[] = docSnap.data()["inspirations"] || [];
            if (insps.includes(uid)) {
                await updateDoc(docRef, {
                    inspirations: arrayRemove(uid),
                    inspNum: insps.length - 1 < 0 ? 0 : insps.length - 1,
                });
                return false;
            } else {
                await updateDoc(docRef, {
                    inspirations: arrayUnion(uid),
                    inspNum: insps.length + 1,
                });
                return true;
            }
        };
    } catch (error) {
        console.error(error);
    }
};


/**
 * B) 게시글 신고하기
 * @param uid 
 * @param docID 
 * @param commentID 
 * @param cocommentID 
 */
export const doReport = async (uid: string, docID: string, commentID?: string, cocommentID?: string) => {
    try {
        const docRef = (commentID && cocommentID)
            ? doc(db, "Bulletin", docID, "Comments", commentID, "Cocomments", cocommentID)
            : (commentID) ? doc(db, "Bulletin", docID, "Comments", commentID)
                : doc(db, "Bulletin", docID);

        const docSnap = await getDoc(docRef);
        const docData = docSnap.data() as FPost;

        if (docData) {
            const reportedUsers: string[] = docData.reports || [];
            if (!reportedUsers.includes(uid)) {
                reportedUsers.push(uid);

                await updateDoc(docRef, {
                    reports: reportedUsers,
                });
                toast.success("댓글을 신고했습니다.");

                // 신고 수가 10개 이상이라면 게시글 삭제
                if (reportedUsers.length >= 10) {
                    const docUid = docData.uid;
                    await deletePost(docUid, docID);
                }

                return true;
            } else {
                toast.error("이미 신고한 게시글입니다.");
                return false;
            }
        }
    } catch (error) {
        console.error(error);
    }
};


/**
 * C) 댓글 영감 반전시키기
 * @param uid 
 * @param docID 
 * @param commentID 
 * @param cocommentID (선택)
 */
export const switchCommentInspirationState = async (
    uid: string, docID: string, commentID: string, cocommentID?: string
) => {
    try {
        const docRef = (!cocommentID)
            ? doc(db, "Bulletin", docID, "Comments", commentID)
            : doc(db, "Bulletin", docID, "Comments", commentID, "Cocomments", cocommentID ?? "");

        const docSnap = await getDoc(docRef);
        const docData = docSnap.data() as FComment;

        const isInspiratted: boolean = docData.inspirations.includes(uid);
        const newInspirationList = isInspiratted
            ? docData.inspirations.filter((inspiration) => inspiration !== uid)
            : docData.inspirations.concat(uid);

        await updateDoc(docRef, {
            inspirations: newInspirationList,
        });
    } catch (error) {
        console.error(error);
    }
};


/**
 * D) 해당 게시글의 조회수 1 증가
 * @param docID 게시글 ID
 */
export const viewPost = async (docID: string) => {
    try {
        const docRef = doc(db, "Bulletin", docID);
        const docSnap = await getDoc(docRef);
        const docData = docSnap.data() as FPost;

        const newViews: number = docData.views + 1;
        await updateDoc(docRef, { views: newViews });
    } catch (error) {
        console.error(error);
    }
};


//          Delete           ***************************/

/**
 * A) 댓글 삭제 동작
 * @param uid 삭제할 댓글의 작성자 uid
 * @param docID 댓글을 쓴 문서의 ID
 * @param time 댓글을 올렸던 시간
 * @param commentID 대댓글을 작성한 댓글의 ID. 대댓글일 경우에만 필요
 */
export const deleteMyComment = async (
    uid: string, docID: string, time: Timestamp, commentID?: string,
) => {
    try {
        const collRef = (!commentID)
            ? collection(db, "Bulletin", docID, "Comments")
            : collection(db, "Bulletin", docID, "Comments", commentID ?? "", "Cocomments");
        const queryRef = query(collRef, where("uid", "==", uid), where("time", "==", time));
        const querySnapshot = await getDocs(queryRef);

        querySnapshot.forEach(async (commentDoc) => {
            const commentDocRef = doc(collRef, commentDoc.id);
            await deleteDoc(commentDocRef);
        });
    } catch (error) {
        console.error(error);
    }
};

/**
 * B) 글 삭제 동작
 * @param uid 유저의 uid
 * @param docID 게시글 ID
 */
export const deletePost = async (uid: string, docID: string) => {
    try {
        const docRef = doc(db, "Bulletin", docID);
        const docSnap = await getDoc(docRef);
        const docData = docSnap.data() as FPost;

        // 삭제 권한 확인
        if (docData && docData.uid !== uid) {
            toast.error("게시물을 삭제할 수 있는 권한이 없습니다.");
            return;
        }

        // Comments 컬렉션 삭제
        const commentsRef = collection(docRef, "Comments");
        const commentsSnap = await getDocs(commentsRef);

        const deleteCommentsPromises: Promise<void>[] = [];
        const deleteCocommentsPromises: Promise<void>[] = [];
        commentsSnap.forEach(async (commentDoc) => {
            deleteCommentsPromises.push(deleteDoc(commentDoc.ref));
            const cocommentsRef = collection(commentDoc.ref, "Cocomments");
            const cocommentsSnap = await getDocs(cocommentsRef);
            cocommentsSnap.forEach((cocommentDoc) => {
                deleteCocommentsPromises.push(deleteDoc(cocommentDoc.ref));
            });
        });

        // 먼저 Cocomments 컬렉션 삭제
        await Promise.all(deleteCocommentsPromises);

        // Comments 컬렉션 삭제
        await Promise.all(deleteCommentsPromises);

        // 게시물 삭제
        await deleteDoc(docRef);

        const logDocRef = doc(db, "UserData", uid, "BulletinLog", "log");
        await updateDoc(logDocRef, { mine: arrayUnion(docID) });

        toast.success("게시글이 삭제되었습니다!");
    } catch (error) {
        console.error(error);
    }
};


//          ETC           ***************************/
/**
 * A) 타임스탬프를 댓글 시간을 표시하는 형식으로 변환 (ex. 3분 전)
 * @param time 타임스탬프 형식의 시간
 * @returns 댓글 출력 형식에 맞춰진 문자열 반환
 */
export const singleFormatTimestamp = (time: Timestamp) => {
    const currentTimestamp = new Date().getTime();
    const targetTimestamp = time.toMillis(); // 타임스탬프를 밀리초로 변환

    const timeDifference = currentTimestamp - targetTimestamp;

    const minutes = Math.floor(timeDifference / (1000 * 60));
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

    if (timeDifference < 60 * 1000) {
        return '1분 미만';
    } else if (timeDifference < 60 * 60 * 1000) {
        return `${minutes}분 전`;
    } else if (timeDifference < 24 * 60 * 60 * 1000) {
        return `${hours}시간 전`;
    } else if (timeDifference < 30 * 24 * 60 * 60 * 1000) {
        return `${days}일 전`;
    } else if (timeDifference < 365 * 24 * 60 * 60 * 1000) {
        return `${months}개월 전`;
    } else {
        return `${years}년 전`;
    }
};

/**
 * B) 타임스탬프를 게시글에 맞는 형식으로 변환 (ex. 2023/11/10 오후 10:11)
 * @param time 타임스탬프
 * @returns string
 */
export const fullFormatTimestamp = (time: Timestamp | Date) => {
    try {
        const date = fullFormatting(time);

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const period = (date.getHours() >= 12) ? '오후' : '오전';
        const formattedHours = (date.getHours() > 12) ? (date.getHours() - 12).toString().padStart(2, '0') : hours;

        return `${year}/${month}/${day} ${period} ${formattedHours}:${minutes}`;
    } catch (error) {
        console.error(error);
        return "";
    }
};



export const getFollowingPosts = async (uid: string) => {
    try {
        const client = searchClient;

        const myDocRef = doc(db, "UserData", uid);
        const myDocSnap = await getDoc(myDocRef);

        if (myDocSnap.exists()) {
            const following: string[] = myDocSnap.data()["following"] || [];
            const index = client.initIndex("Bulletin");

            const searchResults = await index.search('', {
                filters: `uid:${following.join(' OR uid:')}`,
            });

            const folPosts: FPost[] = searchResults.hits.map(hit => hit as FPost);

            return folPosts;
        }
    } catch (error) {
        console.error(error);
    }

    return [];
};


/**
 * 특정 카테고리별로 게시글 데이터를 가져오기
 * @param category 
 * @param text 
 * @returns 
 */
export const getPosts = async (category: string, text?: string) => {
    try {
        const client = searchClient;
        const index = client.initIndex("Bulletin");

        const filters = (category !== "전체") ? `category:"${category}"` : undefined;

        const { hits } = await index.search(text || '', {
            filters: filters,
        });

        const posts: FPost[] = hits.map(hit => hit as FPost);

        return posts;
    } catch (error) {
        console.error(error);
        return [];
    }
};


export const getPopularPosts = async () => {
    try {
        const colRef = collection(db, "Bulletin");
        const q = query(colRef, orderBy('algorithmScore', 'desc'), limit(6));
        const docSnaps = await getDocs(q);
        const data: FPost[] = docSnaps.docs.map((d) => d.data() as FPost);

        return data;
    } catch (error) {
        return [];
    }
};