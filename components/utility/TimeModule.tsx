

export const fullFormatting = (time: any) => {
    const num = (time?._seconds) ? new Date(time._seconds * 1000) 
    : (time?.seconds) ? new Date(time.seconds * 1000 + time.nanoseconds / 1000000)
    : new Date(Number(time));
    return num;
};