'use client';


import Select from 'react-select'

import useCategories from '../hooks/useCaregorys';
import { color } from 'framer-motion';

export type CategorySelectValue = {
  flag: string;
  label: string;
  latlng: number[],
  region: string;
  value: string
}

interface CategorySelectProps {
  value?: CategorySelectValue;
  onChange: (value: CategorySelectValue) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange
}) => {
  const { getAllDesignCategories } = useCategories();

  return ( 
    <div>
      <Select
        placeholder="드롭다운"
        options={getAllDesignCategories()}
        value={value}
        onChange={(value) => onChange(value as CategorySelectValue)}
        
        formatOptionLabel={(option: any) => (
          <div className="
          flex flex-row items-center gap-3">
            <div>{option.flag}</div>
            <div>
              {option.label}
              <span className="text-neutral-500 ml-1">
                {option.region}
              </span>
            </div>
          </div>
        )}
        classNames={{
          control: () => 'p-3 border-3 ',
          input: () => 'text-lg',
          option: () => 'text-lg ',
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 7,
          colors: {
            ...theme.colors,
            primary: '#B25FF3',
            primary25: '#EADDF3',
          }
        })}
      />
    </div>
   );
}
 
export default CategorySelect;