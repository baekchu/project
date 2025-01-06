const designCategories = [
    { value: 'cartoon', label: '애니메이션/만화' },
    { value: 'illustration', label: '일러스트' },
    { value: 'architecture', label: '건축 디자인' },
    { value: 'uxui', label: 'UX/UI' },
    { value: 'graphic-design', label: '그래픽 디자인' },
    { value: 'web-design', label: '웹 디자인' },
    { value: 'product-design', label: '제품 디자인' },
    { value: 'fashion-design', label: '패션 디자인' },
    { value: 'interior-design', label: '인테리어 디자인' },
    { value: 'motion-graphics', label: '모션 그래픽' },
    { value: 'industrial-design', label: '산업 디자인' },
    { value: 'textile-design', label: '직물 디자인' },
    { value: 'jewelry-design', label: '보석 디자인' },
    { value: 'game-design', label: '게임 디자인' },
    { value: 'package-design', label: '패키지 디자인' },
    { value: 'typography', label: '타이포그래피' },
    { value: 'environmental-design', label: '환경 디자인' },
    { value: 'advertising-design', label: '광고 디자인' },
    { value: 'branding', label: '브랜딩' },
    { value: 'film-production', label: '영화 제작' },
    { value: 'virtual-reality', label: '가상 현실' },
    { value: 'print-design', label: '인쇄물 디자인' },
    { value: 'digital-art', label: '디지털 아트' },
    { value: 'exhibition-design', label: '전시 디자인' },
    { value: 'interactive-design', label: '상호 작용 디자인' },
    { value: 'music-album-art', label: '음악 앨범 아트' },
    { value: 'book-cover-design', label: '도서 표지 디자인' },
    { value: 'poster-design', label: '포스터 디자인' },
    { value: 'brand-identity', label: '브랜드 아이덴티티' },
    // 원하는 디자인 카테고리를 추가하세요.
  ];
  
  
  const useCategories = () => {
    const getAllDesignCategories = () => designCategories;
  
    const getCategoryByValue = (value: string) => {
      return designCategories.find((item) => item.value === value);
    };
  
    return {
      getAllDesignCategories,
      getCategoryByValue
    };
  };
  
  export default useCategories;
  