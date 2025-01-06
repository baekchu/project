import { searchClient, updateClient } from "@/config/algolia";
import { auth, db, storage } from "@/config/firebase";
import {
    collection, doc, setDoc, getDoc, updateDoc,
    arrayUnion, arrayRemove, query, getDocs, orderBy, where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import toast from "react-hot-toast";


/**
 * //          Create         *******************************
 * A) 사용자의 초기 데이터 저장
 *      await setInitUserData(uid: string, data: newUser)
 * 
 * 
 * //          Read         *******************************
 * A) 유저정보 다운로드
 *      await getUserData(uid: string, labels: string[])
 * 
 * B) 팔로잉 상태 확인하기
 *      await checkFollowing(uid:string, otherID: string)
 *          => boolean
 * 
 * C) 카테고리별 추천 유저 불러오기
 *      await getRecommendUsers
 *          => uid[]
 * 
 * 
 * //          Update         *******************************
 * A) 프로필 파일 업로드
 *      await uploadProfImg(imageFile: File)
 * 
 * B) 팔로우 또는 취소하기
 *      await changeFollow(uid:string, otherID: string)
 * 
 * C) 추천 점수 증가
 *      await addReccomendScore(uid: string)
 * 
 * 
 * //          Delete         *******************************
 * A) 최신 이미지를 제외하고 삭제
 *      await deleteOldestImages()
 * 
 * B) 최신 이미지만 삭제
 *      await deleteLatestImage()
 * 
 *
 */

const signs = [ // 티어 아이콘
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Fdiamond.svg?alt=media&token=8d986dba-4e7c-4750-a2be-998a31d0d105",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Fruby.svg?alt=media&token=d21f1f59-fff1-46fb-b8b7-3e560af9384f",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Femerald.svg?alt=media&token=0df9990c-2711-4382-ad8a-640b12cda587",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Fsapphirus.svg?alt=media&token=dbb8f3ea-b87f-4887-bb65-1e78765f33f2",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Famethyst.svg?alt=media&token=375b60e1-2f69-49ca-a5db-18aa8b2e5b88",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Fobsidian.svg?alt=media&token=3632387c-4303-4127-9b74-924a8f4df008",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Ftopaz.svg?alt=media&token=9300e252-55e3-42eb-9920-edb7b73d4f69",
    "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/Signs%2Fopal.svg?alt=media&token=a354d37b-bfd5-4e60-878e-bd726e0687a1"
];

export interface FUserData{
    uid: string,
    nickname: string,
    profImg: string,
    backImg: string,

    desc: string,
    category: string,
    tags: string[],
    exp: number,

    following: string[],
    follower: string[],
}

export interface FUserTier {
    level: number,
    sign: JSX.Element
}


//          Create         *******************************/



//          Read         *******************************/
// A) 계정 정보 불러오기
export const getUserData = async (uid: string) => {
    try {
        const docRef = doc(db, 'UserData', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data() as FUserData;
            const newData: FUserData = {
                uid: userData.uid,
                nickname: userData.nickname,
                profImg: userData.profImg,
                backImg: userData.backImg,

                desc: userData.desc || "자기소개 공간",
                category: userData.category || "카테고리",
                tags: userData.tags || ["태그1", "태그2"],
                exp: userData.exp,

                following: userData.following || [],
                follower: userData.follower || [],
            }
            return newData;
        }
    } catch (error) {

    };
    return {} as FUserData;
}

// B) 팔로잉 상태 확인하기
export const checkFollowing = async (uid: string, otherID: string) => {

    try {
        if (uid === otherID) return false;
        const userDocRef = doc(db, 'UserData', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const following = userDocSnap.data()?.following;

            if (following && following.includes(otherID)) {
                // 다른 사용자의 ID가 following 필드에 포함되어 있으면 true 반환
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("팔로잉 상태 확인 중 오류 발생:", error);
        return false;
    }
};


/**
 * D) 유저의 티어 정보를 가져오기
 * @param exp 경험치(number)
 * @returns { level: 유저의 레벨(number), sign: 티어 아이콘(JSX) }
 */
export const getUserTierData = async (exp: number) => {
    try {
        const colRef = collection(db, "UserData");
        const allUsers = await getDocs(colRef);
        const all: number = allUsers.size;
        const higherThenMe = query(colRef, where("exp", ">", exp));
        const higherUsers = await getDocs(higherThenMe);
        const higher: number = higherUsers.size;
        
        const per = higher * 100 / all;
        
        let sign = signs[7];
        if (per < 5) { sign = signs[0] }
        else if (per < 10) { sign = signs[1] }
        else if (per < 20) { sign = signs[2] }
        else if (per < 30) { sign = signs[3] }
        else if (per < 45) { sign = signs[4] }
        else if (per < 60) { sign = signs[5] }
        else if (per < 80) { sign = signs[6] }

        let e = exp;
        let level = 1;
        let forLevelUp = 100;
        while(e >= forLevelUp) {
            level += 1;
            e -= forLevelUp;
            forLevelUp *= 1.02;
        }

        const theSign = <img className="w-3 h-3" src={sign} alt={`${level}레벨`} />
        const tierData: FUserTier = {
            level: level,
            sign: theSign
        };
        return tierData; 
    } catch (error) {
        return {} as FUserTier;
    }
};



//          Update         *******************************/
// A) 스토리지에 프로필 이미지를 업로드하고 성공시 링크 반환
export const uploadProfImg = async (uid: string, imageFile: File, type: "profile" | "background") => {
    try {
        const root = (type === "profile") ? "ProfImgs" : "BackImgs";
        const fileName = Date.now().toString();
        const storageRef = ref(storage, `${root}/${uid}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        return ""
    }
};

/**
 * 팔로우 상태 토글하기. 결과가 불리언으로 반환. 실패 시 undefined
 * @param uid 
 * @param otherID 
 * @returns 
 */
export const toggleFollow = async (uid: string, otherID: string) => {
    try {
        if (uid === otherID) return;
        const currentUserDocRef = doc(db, 'UserData', uid);
        const otherUserDocRef = doc(db, 'UserData', otherID);

        const isFollowing = await checkFollowing(uid, otherID);

        if (isFollowing) {
            // 팔로우 취소 : 나의 following, 상대방의 follower 제거
            await updateDoc(currentUserDocRef, {
                following: arrayRemove(otherID)
            });
            await updateDoc(otherUserDocRef, {
                follower: arrayRemove(uid)
            });
            return false;
        } else {
            // 팔로우 등록 : 나의 following, 상대방의 follower 추가
            await updateDoc(currentUserDocRef, {
                following: arrayUnion(otherID)
            });
            await updateDoc(otherUserDocRef, {
                follower: arrayUnion(uid)
            });
            return true;
        };

    } catch (error) {
        console.error("팔로잉 상태 변경 오류:", error);
        return undefined;
    }
};


export const reportUser = async (uid: string, other: string) => {
    try {
        const docRef = doc(db, "UserData", other);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const reportUserList: string[] = docSnap.data()["reports"] || [];
            if (reportUserList.includes(uid)) {
                toast.error("이미 신고한 유저입니다");
            } else {
                await updateDoc(docRef, {
                    reports: arrayUnion(uid),
                });
                toast.error("유저를 신고했습니다");
                return true;
            };
        }
    } catch (error) {

    };
};



//          Delete         *******************************/
// A) 가장 최신 등록 파일만 제거. 업로드 취소 시 실행
export const deleteLatestImage = async (uid: string, type: "profile" | "background") => {
    try {
        const root = (type === "profile") ? "ProfImgs" : "BackImgs";
        const userStorageRef = ref(storage, `${root}/${uid}`);

        // 경로의 모든 파일 가져오기
        const items = await listAll(userStorageRef);
        let latestNumber = Number.MIN_SAFE_INTEGER;
        let latestNumberFilePath = '';
        items.items.forEach((item) => {
            const fileName = item.name;
            const fileNumber = parseInt(fileName, 10);
            if (!isNaN(fileNumber) && fileNumber > latestNumber) {
                latestNumber = fileNumber;
                latestNumberFilePath = item.fullPath;
            }
        });

        if (latestNumberFilePath) {
            // 가장 최신 파일 삭제
            await deleteObject(ref(storage, latestNumberFilePath));
            return true;
        } else {
            console.warn('No files found in storage folder.');
            return false;
        }
    } catch (error) {
        console.error('Error deleting latest file:', error);
        return false;
    }
};


// B) 가장 최신 등록 프로필 이미지를 제거하고 나머지 삭제. 업로드 성공 시 실행
export const deleteOldestImages = async (uid: string, type: "profile" | "background") => {
    try {
        const root = (type === "profile") ? "ProfImgs" : "BackImgs";
        const userStorageRef = ref(storage, `${root}/${uid}`);

        // 경로의 모든 파일 가져오기
        const items = await listAll(userStorageRef);
        let largestNumber = Number.MIN_SAFE_INTEGER;
        let largestNumberFilePath = '';
        items.items.forEach((item) => {
            const fileName = item.name;
            const fileNumber = parseInt(fileName, 10);
            if (!isNaN(fileNumber) && fileNumber > largestNumber) {
                largestNumber = fileNumber;
                largestNumberFilePath = item.fullPath;
            }
        });

        if (largestNumberFilePath) {
            // 가장 큰 숫자의 파일을 제외한 모든 파일 삭제
            items.items.forEach(async (item) => {
                if (item.fullPath !== largestNumberFilePath) {
                    await deleteObject(item);
                    console.log('File deleted successfully:', item.fullPath);
                }
            });
        } else {
            console.warn('No files found in storage folder.');
        }
    } catch (error) {
        console.error('Error deleting files:', error);
        throw error;
    }
};



/**
 * 유저 데이터 수정하기
 * @param uid 
 * @param nickName 
 * @param desc 
 * @param category 
 * @param tags 
 * @param profImg 
 * @param backImg 
 * @returns 성공시 true, 실패시 false
 */
export const updateUserData = async (
    uid: string, nickName: string, desc: string, category: string, tags:string[], profImg?: File, backImg?: File,
) => {
    try {
        const docRef = doc(db, "UserData", uid);

        const newData: Partial<FUserData> = {
            nickname: nickName,
            desc: desc,
            category: category,
            tags: tags,
        };

        let imgRoot = "";
        let backRoot = "";

        if (profImg) {
            imgRoot = await uploadProfImg(uid, profImg, "profile");
            newData['profImg'] = imgRoot;
        }
        if (backImg) {
            backRoot = await uploadProfImg(uid, backImg, "background");
            newData['backImg'] = backRoot; 
        }

        const res = await updateDoc(docRef, newData);
        // 업데이트 성공 시 기존 이미지 삭제
        if (res !== undefined && res !== null) {
            if (imgRoot) await deleteOldestImages(uid, "profile");
            if (backRoot) await deleteOldestImages(uid, "background");
        }
        
        const index = updateClient.initIndex("UserData");
        const algoliaData = {
            objectID: uid,
            ...newData,
        };

        const algoliaResponse = await index.partialUpdateObject(algoliaData);
        console.log('Algolia response:', algoliaResponse);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};


/**
 * 
 * @param newNick 사용하고싶은 닉네임
 * @returns 새로운 닉네임이 사용가능하다면 true 반환
 */
export const checkNickUseable = async(newNick: string) => {
    try {
        const colRef = collection(db, "UserData");
        const q = query(colRef, where('nickname', '==', newNick));
        const querySnapshot = await getDocs(q);

        return querySnapshot.size === 0;
    } catch (error) {
        console.error(error);
        return false;
    }
};


/**
 * 유저 데이터 등록 상태 확인
 * @param uid 
 * @returns 
 */
export const checkUserDataExist = async (uid: string) => {
    try {
        const docRef = doc(db, "UserData", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as FUserData;
            if (data.nickname && data.category && data.tags.length > 0) {
                return true;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return false;
};


/**
 * 유저의 작품 수 가져오기
 * @param uid 
 * @returns 
 */
export const getArtworksCnt = async (uid: string) => {
    try {
        const docRef = doc(db, "UserData", uid, "ArtworkLog", "log");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data: string[] = docSnap.data()["mine"] || [];
            return data.length;
        }
        return 0;
    } catch (error) {
        
    }
    return 0;
};

/**
 * 유저가 팔로우하는 다른 유저 목록 가져오기
 * @param uid 
 * @returns 
 */
export const myFollowing = async (uid: string) => {
    try {
        const docRef = doc(db, "UserData", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const fols: string[] = docSnap.data()["following"] || [];
            return fols;
        }
    } catch (error) {

    }
    return [];
};