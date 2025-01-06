import { RiNotification2Line } from "react-icons/ri";
import useLoginModal from "../hooks/useLoginModal";
import { auth } from "@/config/firebase";
import useAlarmState from "@/zustand/AlarmState";
import { useEffect, useState } from "react";
import { checkNewAlarm } from "../utility/AlarmModule";

const AlarmButton = ({ className }: {
    className: string,
}) => {
    const { openAlarm } = useAlarmState();
    const loginModal = useLoginModal();
    const [newExist, setNewExist] = useState<boolean>(false);
    useEffect(() => {
        if (auth.currentUser?.uid) {
            const unsubscribe = checkNewAlarm(auth.currentUser?.uid, (res) => {
                setNewExist(res);
            });
            return () => {
                unsubscribe();
            };
        }
    }, [auth.currentUser?.uid]);

    return (
        <div className="relative">
            <button
                className={`${className}`}
                onClick={() => {
                    if (auth.currentUser?.uid) {
                        openAlarm();
                    } else {
                        loginModal.onOpen();
                    }
                }}>
                <RiNotification2Line />
            </button>
            {newExist && (
                <>
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-100" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-100 animate-ping" />
                </>
            )}
        </div>
    );
};

export default AlarmButton;