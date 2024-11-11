import React from 'react';

interface Props {
	ariaLabel: string;
	disabled: boolean | undefined;
	onChange: (e: any) => void;
	value?: string;
	maxLength?: number;
	minLength?: number;
	colWidth?: string;
}

const BasicTextInput: React.FC<Props> = ({ariaLabel, disabled, onChange, value, maxLength, minLength, colWidth}) => {
	return (
		<div className={colWidth === undefined ? 'col-sm-10' : colWidth}>
			<input
				type='text'
				className='form-control form-control-sm'
				aria-label={ariaLabel}
				disabled={disabled}
				onChange={onChange}
				value={value || ''}
				maxLength={maxLength}
				minLength={minLength}
			/>
		</div>
	);
};

export default BasicTextInput;
