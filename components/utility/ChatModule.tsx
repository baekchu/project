import { db,  storage } from '@/config/firebase';
import {
    Timestamp, addDoc, collection, doc, getDoc, getDocs, where,
    query, orderBy, onSnapshot, limit, updateDoc, setDoc, deleteDoc, arrayRemove,

} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**         I N T E R F A C E       ******/
export interface FMessage {
    content: string,
    sender: string,
    time: Timestamp,
    file?: string,
}


/******************************************************************************/
/**         F U C N T I O N S            **************************************/

/** 함수 목록 ***********
 * //   Create   //
 * A) 새로운 채팅방을 생성하고 참여자의 chatRooms에 해당 채팅방 ID 추가
 *      createNewChatroom (uid: string, otherUid: string, newMessage: FMessage)
 * 
 * 
 * //   Read    //
 * A) 내가 속한 채팅방 중 상대방 uid로 채팅이 존재하는지 확인
 *      checkChatroomExists (uid: string, otherUid: string) => string
 * 
 * B) 채팅방 데이터 실시간으로 가져오기
 *      getRealTimeChat (roomId: string, callback: (data: FMessage[]) => void)
 * 
 * C) 해당 채팅방의 마지막 대화 시간 불러오기
 *      getLastChat (roomID: string, callback: (lastMessage: FMessage) => void)
 * 
 * D) 해당 채팅방의 읽지 않은 채팅 개수 불러오기
 *      countNotReadChats (uid: string, roomID: string, callback: (count: number) => void)
 * 
 * E) 내가 속한 채팅방 목록 가져오기
 *      getChatRoomIDs (uid: string)    => string[]
 * 
 * F) 채팅방 참여자들의 uid 모두 가져오기
 *      getRoomParticipants (roomID: string)    => string[]
 * 
 * 
 * //   Update  //
 * A) 새 채팅 등록
 *      updateNewChat (uid: string, roomID: string, content: string, file?: File)
 * 
 * 
 * //   Delete  //
 * A) 채팅방 나가기
 *      leaveRoom (uid: string, roomID: string)
 * 
 * 
 * //   ETC     //
 * A) 타임스탬프를 문자열로 변환
 *      timestampToStr (time: Timestamp) => string
 * 
 * B) 기존에 상대방과의 일반 채팅방이 존재하는지 확인
 *      checkPrivChatExist (uid: string, otherUid: string) => string
 */




//          Create         *******************************/
/**
 * A) 첫 메세지 발생 시 새로운 채팅방을 생성하고 참여자의 chatRooms에 해당 채팅방 ID 추가
 * @param uid 
 * @param otherUid 
 * @param newMessage 
 */
export const createNewChatroom = async (uid: string, otherUid: string, content: string, file?: File) => {
    try {
        // 메세지 등록 관련
        const baseColRef = collection(db, "Messages");
        const docRef = await addDoc(baseColRef, {participants : [uid, otherUid]});
        const colRef = collection(docRef, "Message");

        const tempLastTime = Timestamp.fromDate(new Date("2023-01-01T00:00:00"));
        const tempJoinTime = Timestamp.now();
        const timeData = {
            lastChatTime: tempLastTime,
            joinTime: tempJoinTime,
        };

        let fileUrl: string|undefined = undefined;
        if (file) {
            const t = Date.now();
            const fileName = `${uid}_${t}`;
    
            const storageRef = ref(storage, `Messages/${fileName}`);
            const metadata = {
              contentType: file.type,
            };
          
            try {
              await uploadBytes(storageRef, file, metadata);
              fileUrl = await getDownloadURL(storageRef);
            } catch (error) {
              console.error('파일 업로드 오류:', error);
            }
        }
        const newMes: FMessage = {
            content: content,
            sender: uid,
            time: Timestamp.now(),
        };
        if (fileUrl) { newMes.file = fileUrl; }

        await addDoc(colRef, newMes);
        const newRoomID = docRef.id;

        // 유저 데이터 업데이트 관련
        const myDocRef = doc(db, "UserData", uid, "ChatRooms", newRoomID);
        await setDoc(myDocRef, timeData, {merge:true});

        const otherDocRef = doc(db, "UserData", otherUid, "ChatRooms", newRoomID);
        await setDoc(otherDocRef, timeData, {merge:true});
        

        return newRoomID;
    } catch (error) {
        console.error(error);
    }
    return "";
};


//          Read           *******************************/
/**
 * A) 내가 속한 채팅방 중 상대방 uid로 채팅이 존재하는지 확인
 * @param uid 내 uid
 * @param otherUid 상대방의 uid
 * @returns 기존 채팅방이 있다면 채팅방의 id를, 없다면 빈 문자열을 반환
 */
export const checkChatroomExists = async (uid: string, otherUid: string): Promise<string> => {
    try {
        const docRef = doc(db, "UserData", uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return "";

        const docData = docSnap.data();
        const rooms: string[] = docData.chatRooms;
        for (const roomID of rooms) {
            const roomRef = doc(db, "Messages", roomID);
            const roomSnap = await getDoc(roomRef);
            if (!roomSnap.exists()) continue;

            const d = roomSnap.data();
            if (d && d.participants && d.participants.includes(otherUid)) {
                return d.id;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return "";
};


/**
 * B) 채팅방 데이터 실시간으로 가져오기
 * @param roomId 채팅방 ID
 * @param callback 실시간 
 * @returns 
 */
export const getRealTimeChat = (roomID: string, joinTime: Timestamp, callback: (data: FMessage[]) => void) => {
    // 문서의 time 필드값이 joinTime 보다 이후의 메세지들만 가져오기
    const messageRef = collection(db, 'Messages', roomID, 'Message');
    const q = query(messageRef, orderBy('time'), where('time', '>=', joinTime));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatedData: FMessage[] = [];
        querySnapshot.forEach((doc) => {
            updatedData.push(doc.data() as FMessage);
        });
        callback(updatedData);
    });

    return unsubscribe;
};



/**
 * C) 해당 채팅방의 마지막 대화 불러오기
 * @param roomID 채팅방 ID
 * @returns 마지막 대화 시간의 Timestamp 형태. 또는 null
 */
export const getLastChat = (roomID: string, callback: (lastMessage: FMessage) => void) => {
    const colRef = collection(db, "Messages", roomID, "Message");
    const sortedQuery = query(colRef, orderBy("time", "desc"), limit(1));

    const unsubscribe = onSnapshot(sortedQuery, (snapshot) => {
        if (!snapshot.empty) {
            const lastMessage = snapshot.docs[0].data() as FMessage;
            callback(lastMessage);
        } else {
            callback({} as FMessage);
        }
    });

    return () => unsubscribe();
};



/**
 * D) 해당 채팅방의 읽지 않은 채팅 개수 불러오기
 * @param uid 나의 uid
 * @param roomID 채팅방 id
 * @returns 읽지 않은 채팅 개수
 */
export const countNotReadChats = (uid: string, roomID: string, callback: (count: number) => void) => {
    try {
        const docRef = doc(db, "UserData", uid, "ChatRooms", roomID);
        const colRef = collection(db, "Messages", roomID, "Message");

        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const docSnap = getDoc(docRef);

            docSnap.then((doc) => {
                if (doc.exists()) {
                    const lastTime = doc.data()?.lastChatTime;

                    let notReadCount = 0;
                    snapshot.forEach((singleDoc) => {
                        const data = singleDoc.data() as FMessage;
                        if (data.time > lastTime) {
                            notReadCount++;
                        }
                    });

                    callback(notReadCount);
                } else {
                    callback(0);
                }
            });
        });

        return () => unsubscribe();
    } catch (error) {
        console.error(error);
        return () => {};
    }
};


/**
 * E) 내가 속한 채팅방 목록을 마지막 접속 시간 순서로 가져오기
 * @param uid 내 uid
 * @returns roomID[]
 */
export const getChatRoomIDs = async (uid: string) => {
    try {
        const colRef = collection(db, "UserData", uid, "ChatRooms");
        const allDocs = await getDocs(colRef);

        const roomIDsWithTimes: { roomID: string, lastTime: Timestamp }[] = [];

        const promises = allDocs.docs.map(async (doc) => {
            return new Promise<void>((resolve) => {
                const roomID = doc.id;
                const unsubscribe = getLastChat(roomID, (lastMessage) => {
                    const lastTime = lastMessage?.time ?? Timestamp.now();
                    roomIDsWithTimes.push({ roomID, lastTime });
                    unsubscribe();
                    resolve();
                });
            });
        });

        await Promise.all(promises);

        // lastTime을 기준으로 내림차순 정렬
        roomIDsWithTimes.sort((a, b) => b.lastTime.toMillis() - a.lastTime.toMillis());

        // ID 배열만 반환
        const sortedRoomIDs = roomIDsWithTimes.map((room) => room.roomID);
        return sortedRoomIDs;
    } catch (error) {
        console.error(error);
        return [];
    }
};



/**
 * F) 채팅방의 모든 참가자 uid 가져오기
 * @param roomID 채팅방 ID
 * @returns string[]
 */
export const getRoomParticipants = async (roomID: string):Promise<string[]> => {
    try {
        const docRef = doc(db, "Messages", roomID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const participants = docSnap.data()?.participants as string[];
            return participants;
        }
    } catch (error) {
        console.error(error);
    }
    return [];
};



//          Update         *******************************/
/**
 * A) 새 채팅 등록
 * @param uid 내 uid
 * @param roomID 채팅방 ID
 * @param content 채팅 내용
 * @param file (선택) 첨부 파일
 */
export const updateNewChat = async (uid: string, roomID: string, content: string, file?: File) => {
    try {
        const colRef = collection(db, "Messages", roomID, "Message");
        let fileUrl: string|undefined = undefined;
        const t = Timestamp.now()
        if (file) {
            const fileName = `${uid}_${t}`;
    
            const storageRef = ref(storage, `Messages/${fileName}`);
            const metadata = {
              contentType: file.type,
            };
          
            try {
              await uploadBytes(storageRef, file, metadata);
              fileUrl = await getDownloadURL(storageRef);
            } catch (error) {
              console.error('파일 업로드 오류:', error);
            }
        }

        const newMes: FMessage = {
            content: content,
            sender: uid,
            time: t,
        };

        if (fileUrl) {
            newMes.file = fileUrl;
        }

        await addDoc(colRef, newMes);
    } catch (error) {
        console.error(error);
    }
};


/**
 * B) 채팅창 마지막 접속 시간을 업데이트
 * @param uid 현재 사용자 uid
 * @param roomID 접속중인 채팅방 ID
 */
export const updateLastTime = async (uid: string, roomID: string) => {
    try {
        if (roomID === "new") return;
        const docRef = doc(db, "UserData", uid, "ChatRooms", roomID);
        await updateDoc(docRef, {lastChatTime: Timestamp.now()});
    } catch (error) {
        console.error(error);
    }
};



//          Delete         *******************************/
/**
 * A) 채팅방 나가기
 * @param uid 
 * @param roomID 
 * @returns 
 */
export const leaveRoom = async (uid: string, roomID: string) => {
    try {
        if (!confirm("채팅방을 나가시겠습니까? 데이터는 복구되지 않습니다.")) return;

        const docRef = doc(db, "Messages", roomID);
        await updateDoc(docRef, { participants: arrayRemove(uid) });

        const myDocRef = doc(db, "UserData", uid, "ChatRooms", roomID);
        await deleteDoc(myDocRef);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const participants: string[] = docSnap.data().participants || [];
            if (participants.length <= 0) {
                const colRef = collection(docRef, "Message");

                // 모든 문서를 순회하며 삭제. 만약 문서에 file 필드가 있다면 해당 경로의 파일을 스토리지에서 삭제
                const messageQuerySnapshot = await getDocs(colRef);
                const deletePromises = messageQuerySnapshot.docs.map(async (doc) => {
                    const messageData = doc.data() as FMessage;
                    if (messageData.file) {
                        const t = messageData.time;
                        const fileName = `${uid}_${t}`;
                        const storageRef = ref(storage, `Messages/${fileName}`);
                        await deleteObject(storageRef);
                    }
                    return deleteDoc(doc.ref);
                });
                await Promise.all(deletePromises);
            }
        }

        return true;
    } catch (error) {
        console.error(error);
    }
    return false;
};


//          ETC            *******************************/    
/**
 * A) 타임스탬프를 문자열로 변환
 * @param time 타임스탬프
 * @returns 
 */
export const timestampToStr = (time: Timestamp) => {
    // Timestamp를 string 타입으로 바꿈
    // 문자열은 "(날짜) (오전 또는 오후) (12h 형식의 hh:mm)"로 표시할 것

    const now = new Date();
    const dateTime = time.toDate();
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
            dateStr = `${makeDoubleDigit(MM + 1)}/${makeDoubleDigit(DD)}`;
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
 * B) 기존에 상대방과의 일반 채팅방이 존재하는지 확인
 * @param uid 내 uid
 * @param otherUid 상대방 uid
 * @returns 기존 채팅방이 있다면 그 방의 id를, 없다면 "" 반환
 */
export const checkPrivChatExist = async (uid: string, otherUid: string) => {
    try {
        const colRef = collection(db, "Messages");
        const allDocs = await getDocs(colRef);

        for (const aDoc of allDocs.docs) {
            const data: string[] = aDoc.data().participants;
            if (data.length === 2 && data.includes(uid) && data.includes(otherUid)) {
                return aDoc.id;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return "";
};



export const getJoinTime = async (uid: string, roomID: string) => {
    try {
        const docRef = doc(db, "UserData", uid, "ChatRooms", roomID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const docData: Timestamp = docSnap.data().joinTime;
            return docData;
        }
    } catch (error) {
        console.error(error);
    }
    return Timestamp.now();
};