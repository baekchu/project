'use client';

import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
}

const Avatar: React.FC<AvatarProps> = ({ src , ...otherProps }) => {
  return ( 
    <Image 
      className="rounded-full" 
      height="30" 
      width="30" 
      alt="Avatar" {...otherProps}
      src={src || '/placeholder.jpg'}
    />
   );
}
 
export default Avatar;