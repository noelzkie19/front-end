import React, {useState, useEffect, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';

interface AccordionProps {
	idx: number; //accordion index
	toggle: boolean;
	title: string;
	id: number; // identifier
	counter: number | null;
	toggleClick: (index: number, status: boolean, identifier: number) => void;
	children: any;
}

const DynamicAccordion = ({toggle = false, title = '', counter = null, idx, toggleClick, children, id}: AccordionProps) => {
	const [collapse, setCollapse] = useState<boolean>(false);
	const contentRef: any = useRef(null);

	useEffect(() => {
		setCollapse(toggle);
		return () => {};
	}, [toggle]);
	const accordionTextStyle = {
		height: `${collapse ? contentRef && contentRef?.current?.scrollHeight + 'px' : '0px'}`,
		// height: `${collapse ? 'fit-content' : '0px'}`, // Make it work w/0 using fit-content this is just a hot fix when subaccordion is used
		paddingTop: '0.5rem',
		transition: 'all 0.5s ease',
	};

	return (
		<div className='w-100'>
			<div className='p-4 border border-secondary rounded border-2 mb-4'>
				<div className='d-flex flex-column'>
					<div
						className='fw-bold d-flex justify-content-between text-primary"'
						onClick={() => {
							toggleClick(idx, collapse, id);
						}}
						onKeyPress={() => {
							toggleClick(idx, collapse, id);
						}}
					>
						<div className='d-flex align-items-center'>
							<div style={{marginRight: '0.5rem'}}>{title}</div>
							{counter && <span className='badge badge-primary  rounded-circle '>{counter}</span>}
						</div>
						<FontAwesomeIcon
							color='#000'
							icon={collapse ? faMinusSquare : faPlusSquare}
							onClick={() => {
								toggleClick(idx, collapse, id);
							}}
							cursor='pointer'
						/>
					</div>
					<div className='overflow-hidden'>
						<div className='d-flex' ref={contentRef} style={accordionTextStyle}>
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DynamicAccordion;
