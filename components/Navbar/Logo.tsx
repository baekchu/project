'use client';

import Image from "next/image";
import { cn } from "@/utils/utils";
import Link from "next/link";

const Logo = () => {

  return ( 
    <Link aria-label="site logo" href="/" className={cn("lg:flex")}>
    <Image
      className="cursor-pointer" 
      src="/logo.svg" 
      height={80} 
      width={80} 
      alt="Logo" 
    />
    </Link>
   );
}
 
export default Logo;