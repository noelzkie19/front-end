import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { setHeaderScrollable } from '../../../../app/utils/helper';

const HeaderScroll = () => {
    const location = useLocation();
    
    useEffect(() => {
        setHeaderScrollable();
    }, [location]);
    return (<></>)
}

export default HeaderScroll