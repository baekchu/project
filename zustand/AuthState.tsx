"use client"
import { create } from 'zustand';
import { 
    FUserData, checkUserDataExist, getUserData 
} from '@/components/utility/UserDataModule';
import { auth } from '@/config/firebase';

// **** [[  F U N C T I O N  ]] ***********************************************
// 1) 로그인 성공 시 계정의 uid를 auth.currentUser.uid로부터 받아옴
// 2) uid를 이용하여 서버에 저장된 정보 불러와 zustand의 user에 저장
// 3) isLoggined : 로그인 상태, user : 로그인 유저 정보
// 4) login(유저 uid), logout(void), refresh(유저 uid)  => 로그인 상태, 정보 관리

interface AuthStore {
    isLoggedIn: boolean;
    user: FUserData | null;
    login: () => void;
    logout: () => void;
    refresh: (userID: string) => void;
}

const initialAuthState = {
    isLoggedIn: false,
    user: null,
};

// 해당 uid의 유저 데이터가 존재하면 데이터를 가져오고, 없다면 null을 리턴하는 함수
const fetchUserData = async (uid: string) => {
    const userData = await getUserData(uid);
    if (userData?.uid) {
        return userData;
    };
    return null;
};


// ----------------- <<< 호출에 대한 동작 부분 >>> ----------------------------------------
const authState = create<AuthStore>((set) => ({
    ...initialAuthState,
    // A) 로그인 인증에 성공하면 UID를 이용하여 서버에 저장된 계정 정보를 불러옴 **************
    login: async () => {

    },

    // B) 로그아웃 시 로그인 상태를 false로 만들고 현재 user 정보와 로컬스토리지를 초기화 *****
    logout: () => {
        /**
        set(initialAuthState);
        localStorage.removeItem('authState');
        // Refresh the site after logout
        window.location.reload();
        */
       auth.signOut();
    },

    // C) 계정 정보 새로 불러오기
    refresh: async (userID) => {
        const userData = await fetchUserData(userID);
        if (userData) {
            set({ isLoggedIn: true, user: userData });
        } else {
            // 유저 정보가 null로 저장
            set({ isLoggedIn: true, user: null });
        }
    },
}));


let savedState;

// 서버 환경에서 실행 중인지 확인
if (typeof window !== 'undefined') {
  savedState = localStorage.getItem('authState');
}

if (savedState) {
  authState.setState(JSON.parse(savedState));
}

authState.subscribe((state) => {
    localStorage.setItem('authState', JSON.stringify(state));
});


export default authState;