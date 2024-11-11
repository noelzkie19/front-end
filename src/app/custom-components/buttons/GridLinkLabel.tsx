import React from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';

interface Props {
	access: boolean;
	title: string;
	onClick: () => void;
	disabled?: boolean;
	labelClassName?: any;
}

const GridLinkLabel: React.FC<Props> = ({access, title, onClick, disabled, labelClassName}) => {
	return (
		<>
			{access === true ? (
				<ButtonGroup>
					<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
						<label className={'btn-link cursor-pointer'} onClick={onClick}>
							{title}
						</label>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);
};

export default GridLinkLabel;
