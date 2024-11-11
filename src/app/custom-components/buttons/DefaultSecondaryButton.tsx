import React from 'react';

interface Props {
	access?: boolean;
	title: string;
	onClick: () => void;
	isDisable?: boolean;
	customStyle?: any;
}

const DefaultSecondaryButton: React.FC<Props> = ({access, title, onClick, isDisable = false, customStyle = 'btn btn-secondary btn-sm me-2'}) => {
	return (
		<>
			{access === true ? (
				<button type='button' className={customStyle} disabled={isDisable} onClick={onClick}>
					{title}
				</button>
			) : null}
		</>
	);
};

export default DefaultSecondaryButton;
