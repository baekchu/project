import React from 'react';

interface ProgressBarProps {
    x1: number;
    x2: number;
    x3: number;
    x4: number;
}

const CompletionBar: React.FC<ProgressBarProps> = ({ x1, x2, x3, x4 }) => {
    const total = x1 + x2 + x3 + x4;
    const percentageX1 = (x1 / total) * 100;
    const percentageX2 = (x2 / total) * 100;
    const percentageX3 = (x3 / total) * 100;
    const percentageX4 = (x4 / total) * 100;

    return (
        <div style={{
            display: 'flex',
            height: '10px',
            alignItems: 'center',
            backgroundColor: '#d9d9d9',
            margin: '0 5px',
            padding: '0 10px',
            borderRadius: '10px',
        }}>
            <div
                style={{
                    width: `${percentageX1}%`,
                    backgroundColor: '#37D877',
                    height: '6px',
                }}
            />
            <div
                style={{
                    width: `${percentageX2}%`,
                    backgroundColor: '#FFF500',
                    height: '6px',
                }}
            />
            <div
                style={{
                    width: `${percentageX3}%`,
                    backgroundColor: '#FF9900',
                    height: '6px',
                }}
            />
            <div
                style={{
                    width: `${percentageX4}%`,
                    backgroundColor: '#FF0000',
                    height: '6px',
                }}
            />
        </div>
    );
};

export default CompletionBar;