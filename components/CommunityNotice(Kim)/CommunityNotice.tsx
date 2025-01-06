import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectFade, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface NoticeProps {
    imgList: {url: string, color?: string}[];
}

const CommunityNotice: React.FC<NoticeProps> = ({ imgList }) => {
    return (
        <div className={`w-screen h-64`}>
            <Swiper
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                //effect={'fade'}
                pagination={{
                    clickable: true,
                }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: true,
                }}
                navigation={true}
                modules={[
                    Pagination, Navigation, Autoplay,
                    //EffectFade
                ]}
                onSwiper={(swiper) => {
                    //console.log(swiper)
                }}
            >
                {imgList.map((image, index) => {
                    return (
                        <SwiperSlide key={index}>
                            <div className={`flex items-center justify-center w-full h-64 overflow-hidden
                            ${image.color && `bg-[${image.color}]`}`}>
                                <img src={image.url} alt={""} className="object-contain" />
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default CommunityNotice;
