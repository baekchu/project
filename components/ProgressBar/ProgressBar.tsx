import { Timestamp } from 'firebase/firestore';
import React from 'react';

interface ProgressBarProps {
    startDate: Timestamp,
    endDate: Timestamp | null,
    color: string,
    submitDate: Timestamp | null,
}

const ProgressBar: React.FC<ProgressBarProps> = ({ startDate, endDate, color, submitDate }) => {
    const sta = startDate.toMillis();
    const end = (endDate) ? endDate.toMillis() : null;
    const tod = Timestamp.fromDate(new Date()).toMillis();
    const sub = (submitDate) ? submitDate.toMillis() : null;

    const Bar = () => {
        if (!end) { // 종료일이 없을 경우
            if (sub) {   // 종료일 X, 등록일 O
                const mx = tod - sta;
                const pr = sub - sta;
    
                return (
                        <div
                            style={{
                                width: `${(pr/mx)*100}%`,
                                backgroundColor: color,
                                height: '6px',
                                borderRadius: '10px',
                                position: 'absolute',
                            }}
                        />
                );
            } else {    // 종료일 X, 등록일 X
                return(
                    <div
                        style={{
                            width: `${50}%`,
                            backgroundColor: color,
                            height: '6px',
                            borderRadius: '10px',
                            position: 'absolute',
                        }}
                    />
                )
            }
        } else {    // 종료일이 있는 경우
            const startToEnd = end - sta;
            const startToToday = tod - sta;

            if (sub) {  // 종료일 O, 등록일 O
                const startToSubmit = sub - sta;
                
                if (startToEnd > startToSubmit) {   // 마감 이전에 등록
                    return (<>
                        <div
                            style={{
                                width: `${(startToToday/startToEnd)*100}%`,
                                backgroundColor: lightenColor(color),
                                height: '6px',
                                borderRadius: '10px',
                                position: 'absolute',
                            }} />
                        <div
                            style={{
                                width: `${(startToSubmit/startToEnd)*100}%`,
                                backgroundColor: `${color}`,
                                height: '6px',
                                borderRadius: '10px',
                                position: 'absolute',
                            }} />
                    </>);
                } else {    // 마감 이후에 등록
                    return (<>
                        <div
                            style={{
                                width: `${(startToEnd/startToSubmit)*100}%`,
                                backgroundColor: color,
                                height: '6px',
                                borderRadius: '10px 0 0 10px',
                            }} />
                        <div
                            style={{
                                width: `${(startToToday/startToEnd)*100}%`,
                                backgroundColor: darkenColor(color),
                                height: '6px',
                                borderRadius: '0 10px 10px 0',
                            }} />
                    </>);
                }

            } else {    // 종료일 O, 등록일 X
                return (<>
                    <div
                        style={{
                            width: `${(startToToday/startToEnd)*100}%`,
                            backgroundColor: `${color}`,
                            height: '6px',
                            borderRadius: '10px',
                        }} />
                </>);
            }
        }
    };

    function lightenColor(colorCode: string): string {
        const r = parseInt(colorCode.substring(1, 3), 16);
        const g = parseInt(colorCode.substring(3, 5), 16);
        const b = parseInt(colorCode.substring(5, 7), 16);

        // 각 색상 채널에 50% 밝기를 더해줌
        const newR = Math.min(r + Math.floor((255 - r) * 0.5), 255);
        const newG = Math.min(g + Math.floor((255 - g) * 0.5), 255);
        const newB = Math.min(b + Math.floor((255 - b) * 0.5), 255);

        // 새로운 RGB 값을 16진수로 변환하여 6자리 색상 코드로 반환
        const newColorCode = ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
        return `#${newColorCode}`;
    };

    function darkenColor(colorCode: string): string {
        const r = parseInt(colorCode.substring(1, 3), 16);
        const g = parseInt(colorCode.substring(3, 5), 16);
        const b = parseInt(colorCode.substring(5, 7), 16);
    
        // 각 색상 채널에 50% 어둡기를 더해줌
        const newR = Math.floor(r * 0.5);
        const newG = Math.floor(g * 0.5);
        const newB = Math.floor(b * 0.5);
    
        // 새로운 RGB 값을 16진수로 변환하여 6자리 색상 코드로 반환
        const newColorCode = ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
        return `#${newColorCode}`;
    };

    return (
        <div style={{
            display: 'flex',
            height: '10px',
            alignItems: 'center',
            backgroundColor: '#d9d9d9',
            padding: '0 5px',
            borderRadius: '10px',
            position: 'relative'
        }}>
        <Bar />
        </div>
    );
};

export default ProgressBar;
