import { db } from "@/config/firebase";
import {
    doc, getDoc, updateDoc, collection, addDoc, Timestamp, getDocs,
    query, where, deleteDoc, orderBy, limit, setDoc, arrayUnion,
} from 'firebase/firestore';
import { FPost, FComment } from "./BulletinModule";
import { FImgData } from "./ImgDataModule";
import { searchClient } from "@/config/algolia";
import { FUserData } from "./UserDataModule";



const client = searchClient;

// 이미지 검색
export const searchImgs = async (text: string) => {
  try {
    const index = client.initIndex("Artworks");
    const { hits } = await index.search(text, {
      hitsPerPage: 60,
    });

    const imgData: FImgData[] = hits.map((hit: any) => hit as FImgData);
    return imgData;
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
};

// 작가 검색
export const searchAuthors = async (text: string) => {
  try {
    const index = client.initIndex("UserData");
    const { hits } = await index.search(text, {
      hitsPerPage: 20,
    });

    const userData: FUserData[] = hits.map((hit: any) => hit as FUserData);
    return userData;
  } catch (error) {
    console.error(error);
  }
};

// 작가의 작품 최대 4개 가져오기
export const getAuthorImgs = async (uid: string) => {
  try {
    const colRef = collection(db, "Artworks");
    const q = query(colRef, where("uid", "==", uid), limit(4));
    const docSnaps = await getDocs(q);
    
    const docData: FImgData[] = docSnaps.docs.map((doc) => doc.data() as FImgData);
    
    return docData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 연관 검색어
export const getRelatedSearches = async (text: string) => {
  try {
    const index = client.initIndex("Artworks");

    // category에 대한 facet 얻기
    /*
    const categoryFacetHits = await index.searchForFacetValues('category', text);
    const relatedCategorySearches = categoryFacetHits.facetHits.map((facetHit) => facetHit.value);
    */
    // title에 대한 facet 얻기
    const titleFacetHits = await index.searchForFacetValues('title', text);
    const relatedTitleSearches = titleFacetHits.facetHits.map((facetHit) => facetHit.value);

    // 결과를 합치거나 필요에 따라 가공
    const relatedSearches = [...relatedTitleSearches];

    return relatedSearches;
  } catch (error) {
    return [];
  }
};

// 인기 검색어
export interface FKeyword {
  keyword: string,
  count: number,
}
export const getPopularKeywords = async () => {
  try {
    const colRef = collection(db, "PopularKeyword");
    const q = query(colRef, orderBy("count", "desc"), limit(5));
    const docSnaps = await getDocs(q);
    const pops: FKeyword[] = docSnaps.docs.map((doc) => doc.data() as FKeyword).filter((keyword) => keyword.count > 0);
    return pops;
  } catch (error) {
    console.error(error);
  }
};

export const addKeywordCount = async (keyword: string) => {
  try {
    const docRef = doc(db, "PopularKeyword", keyword);
    const docSnap = await getDoc(docRef);
    const time: Timestamp[] = docSnap.exists() ? docSnap.data()["callTime"] : [];

    await setDoc(docRef, {
      keyword: keyword,
      callTime: [...time, Timestamp.now()],
      count: time.length + 1,
    });
  } catch (error) {
    console.error(error);
  }
};