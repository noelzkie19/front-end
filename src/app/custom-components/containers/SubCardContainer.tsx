import React from 'react';

const MainContainer: React.FC = (props) => {
	return <div className='card card-custom gutter-b'>{props.children}</div>;
};

export default MainContainer;
