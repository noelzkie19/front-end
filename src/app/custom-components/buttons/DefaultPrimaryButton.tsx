import React from 'react';

interface Props {
	access: boolean | undefined;
	title: string;
	onClick: () => void;
	isDisable?: boolean;
}

const DefaultPrimaryButton: React.FC<Props> = ({access, title, onClick, isDisable = false}) => {
	return (
		<>
			{access === true ? (
				<button type='button' className='btn btn-primary btn-sm me-2' disabled={isDisable} onClick={onClick}>
					{title}
				</button>
			) : null}
		</>
	);
};

export default DefaultPrimaryButton;
