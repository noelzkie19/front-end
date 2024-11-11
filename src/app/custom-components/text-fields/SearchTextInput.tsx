import React from 'react';

interface Props {
	ariaLabel: string;
	fieldSize?: string;
	disabled?: boolean;
}

const SearchTextInput: React.FC<Props> = ({ariaLabel, disabled, fieldSize, ...props}) => {
	return (
		<div className={'col-sm-' + (fieldSize != undefined ? fieldSize : '12')}>
			<input type='text' className='form-control form-control-sm' aria-label={ariaLabel} disabled={disabled} {...props} />
		</div>
	);
};

export default SearchTextInput;
