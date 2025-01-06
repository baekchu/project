import { db,  storage } from '@/config/firebase';
import {
    Timestamp, addDoc, collection, doc, getDoc, getDocs, where,
    query, orderBy, onSnapshot, limit, updateDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FImgData } from './ImgDataModule';
import { searchClient } from '@/config/algolia';

const client = searchClient;

/**             R E A D                 *************************************************************/
export const getFollowingImgs = async (following: string[]) => {
    try {
        const colRef = collection(db, "Artworks");

        const arr: FImgData[] = [];
        for (const follow of following) {
            const tempQ = query(colRef, where('uid', '==', follow), limit(15), orderBy("time", "desc"));
            const querySnapshot = await getDocs(tempQ);

            for (const doc of querySnapshot.docs) {
                const data = doc.data() as FImgData;
                arr.push(data);
            }
        }
        return arr;
        /*
        //const q = query(colRef, where("uid", "in", following), orderBy("time", "desc"), limit(12));
        const docSnap = await getDocs(q);

        const followingArts: FImgData[] = docSnap.docs.map((art) => art.data() as FImgData);

        return followingArts;*/
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getUserArtworks = async (userID: string) => {
    try {
        const colRef = collection(db, "Artworks");
        const q = query(colRef, where("uid", "==", userID), orderBy("time", "desc"), limit(7));
        const querySnapshot = await getDocs(q);

        const arr: FImgData[] = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data() as FImgData;
            arr.push(data);
        }
        return arr;
    } catch (error) {
        return [];
    }
};


export const getRelativeImgs = async (
    docID: string,
    category: string,
    tags: string[],
): Promise<FImgData[]> => {
    try {
        const index = client.initIndex("Artworks");

        // Algolia에서 이미지 검색
        const { hits: searchHits } = await index.search('', {
            filters: `NOT objectID:${docID} AND category:${category} OR tags:${tags.join(' OR tags:')}`,
            hitsPerPage: 7,
        });

        // 검색 결과를 FImgData 배열로 반환
        const relativeImgs: FImgData[] = searchHits.map((hit: any) => hit as FImgData);

        return relativeImgs;
    } catch (error) {
        console.error(error);
        return [];
    }
};