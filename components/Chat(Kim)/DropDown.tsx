import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MdMoreVert } from "react-icons/md";

interface DropDownProps {
    //report: () => void,
    leave: () => void,
}

export default function DropDown({ leave }: DropDownProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                id="demo-positioned-button"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%', // 버튼을 둥글게 만들어줍니다. 반지름을 50%로 설정합니다.
                    padding: 0, // 내부 여백을 없애줍니다.
                    minWidth: 0, // 최소 너비를 없애줍니다.
                    color: 'black',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)', // 호버 시 배경색을 진하게 설정합니다.
                    },
                }}
            >
                <MdMoreVert />
            </Button>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {/**
                <MenuItem sx={{fontSize:'14px'}} onClick={() => {
                    handleClose();
                    report();
                }}>신고하기</MenuItem>
                 */}
                <MenuItem sx={{fontSize:'14px'}} onClick={() => {
                    handleClose();
                    leave();
                }}>채팅 그만두기</MenuItem>
            </Menu>
        </div>
    );
}