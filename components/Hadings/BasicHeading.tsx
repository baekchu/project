'use client';

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const Heading: React.FC<HeadingProps> = ({ 
  title, 
  subtitle,
  center
}) => {
  return ( 
    <div className={center ? 'text-center' : 'text-start'}>
      <div className="md:text-lg text-sm xs:text-base font-semibold text-neutral-600">
        {title}
      </div>
      <div className="md:text-2xl text-md xs:text-lg font-semibold text-neutral-400 mt-5 ">
        {subtitle}
      </div>
    </div>
   );
}
 
export default Heading;