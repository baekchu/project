import { db } from "@/config/firebase";
import {
    doc, getDoc, updateDoc, collection, setDoc
} from 'firebase/firestore';

// 미션에 대한 모듈

/**
 * A) 미션 수행 상태 불러오기       getMission
 * B) 미션 클리어 업데이트          missionUpdate
 * C) 미션 클리어 횟수 업데이트     updateMissionLog
 */
export interface FMission {
    index: number,
    mission: string,
    progress: number,
    threshold: number,
    router: string,
}

export const daily = [
    "로그인하기",
    "작품 10개 감상하기",
    "다른 사람의 프로필 감상하기"
]

export const weekly = [
    "작품에 영감 반응 10개 남기기",
    "댓글 5개 작성하기",
    "작품 또는 게시글 등록하기",
    "게시글 50개 열람하기",
    "작품 또는 게시글 3회 공유하기",
]

/******************************************************************************/
/**         F U C N T I O N S            **************************************/


/**         C R E A T E              *********************************************/
/**
 * 미션 컬렉션에 daily, weekly 문서를 만드는 초기화 함수
 * @param uid 유저
 */
export const initMission = async (uid: string) => {
    try {
        const dailyDoc = doc(db, "UserData", uid, "Mission", "daily");
        const dailyData = await getDoc(dailyDoc);

        if (!dailyData.exists()) {
            await setDoc(dailyDoc, {
                '0': 0,
                '1': 0,
                '2': 0
            })
        }

        const weeklyDoc = doc(db, "UserData", uid, "Mission", "weekly");
        const weeklyData = await getDoc(weeklyDoc);

        if (!weeklyData.exists()) {
            await setDoc(weeklyDoc, {
                '0': 0,
                '1': 0,
                '2': 0,
                '3': 0,
                '4': 0
            })
        }

    } catch (e) {
        console.error(e);
    }
};

/**         R E A D              *********************************************/
/**
 * 미션 수행 상태 불러오기
 * @param uid 
 *  */
export const getMission = async (uid: string) => {
    try {
        const colRef = collection(db, "UserData", uid, "Mission");

        const dailyDoc = await getDoc(doc(colRef, 'daily'));
        const weeklyDoc = await getDoc(doc(colRef, 'weekly'));

        const dailyData = dailyDoc.data();
        const weeklyData = weeklyDoc.data();

        const dailyMissions: FMission[] = [];
        (['0', '1', '2']).map((index) => {
            const p = dailyData ? dailyData[index] : 0;
            dailyMissions.push({
                index: Number(index),
                mission: daily[Number(index)],
                progress: p,
                threshold: [1, 10, 3][Number(index)],
                router: ["/", "/", "/"][Number(index)]
            })
        });

        const weeklyMissions: FMission[] = [];
        (['0', '1', '2', '3', '4']).map((index) => {
            const p = weeklyData ? weeklyData[index] : 0;
            weeklyMissions.push({
                index: Number(index),
                mission: weekly[Number(index)],
                progress: p,
                threshold: [10, 5, 1, 50, 3][Number(index)],
                router: ["/", "/", "/", "/bulletin", "/"][Number(index)]
            })
        });

        return ({
            daily: dailyMissions,
            weekly: weeklyMissions,
        });

    } catch (error) {
        console.error(error);
        return ({
            daily: [],
            weekly: []
        })
    }
};


/**         U P D A T E              *********************************************/
/**
 * 미션 클리어 업데이트
 * @param uid 
 * @param type daily / weekly
 * @param index number (0부터 시작)
 */
export const missionUpdate = async (uid: string, type: "daily" | "weekly", index: number, isComplete = false) => {
    try {
        const docRef = doc(db, "UserData", uid, "Mission", type);
        if (isComplete) {
            const dataToUpdate: Record<string, number> = {};
            dataToUpdate[index.toString()] = -1;
            await updateDoc(docRef, dataToUpdate);
        } else {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const d = docSnap.data();
                const dataToUpdate: Record<string, number> = {};
                dataToUpdate[index.toString()] = d[index] + 1;
                await updateDoc(docRef, dataToUpdate);
            }
        }
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * daily: 0(로그인), 1(작품 감삼), 2(프로필) 
 * / weekly: 0(영감), 1(댓글), 2(작품 등록), 3(게시글 열람), 4(공유)
 * @param uid 
 * @param type "daily" | "weekly"
 * @param idx 
 * @returns 
 */
export const updateMissionProgress = async (
    uid: string,
    type: "daily" | "weekly",
    idx: number,
    isCancle: boolean = false,
) => { 
    try {
        const docRef = doc(db, "UserData", uid, "Mission", type);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const pastNum = docSnap.data()[String(idx)] || 0;
            if (pastNum >= 0) {
                if (!isCancle) {
                    const newNum = pastNum + 1;
                    const updateData = { [String(idx)]: newNum };
                    await updateDoc(docRef, updateData);
                    return true;
                } else {
                    if (pastNum !== 0) {
                        const newNum = pastNum - 1;
                        const updateData = { [String(idx)]: newNum };
                        await updateDoc(docRef, updateData);
                        return true;
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
    return false;
};

/**         D E L E T E              *********************************************/

