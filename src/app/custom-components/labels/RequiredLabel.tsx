import React from 'react';

interface Props {
	title: string;
}

const RequiredLabel: React.FC<Props> = ({title}) => {
	return <label className='col-form-label col-sm required'>{title}</label>;
};

export default RequiredLabel;
