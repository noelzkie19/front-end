import React from 'react';

interface Props {
	title: string;
}

const ViewLabel: React.FC<Props> = ({title}) => {
	return <label className='col-form-label col-sm'>{title}</label>;
};

export default ViewLabel;