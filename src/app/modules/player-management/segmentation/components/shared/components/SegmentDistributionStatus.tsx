import { faDotCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Toast } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FormGroupContainer } from '../../../../../../custom-components';
import useSegmentConstant from '../../../useSegmentConstant';

interface Props {
	isActive?: any;
	showIcon?: any;
	hasPlayers?: any;
	isReactivated?: any;
}

const iconStyle = {
	color: 'green',
	cursor: 'pointer',
};

const SegmentDistributionStatus: React.FC<Props> = ({isActive, showIcon, hasPlayers, isReactivated}) => {
	const {actionName, segmentId} = useParams();
	//  State
	const [activePopOverShow, setActivePopOverShow] = useState<boolean>(false);
	const [statusLoaded, setStatusLoaded] = useState<any>(false);

	//	Hooks
	const {PageAction} = useSegmentConstant();

	useEffect(() => {
		if (!statusLoaded && actionName === PageAction.VIEW) {
			// getSegmentDistributionByFilter();
		}
	}, []);

	const onClickActiveIcon = () => {
		setActivePopOverShow(true);
	};

	return (
		<div style={{position: 'absolute'}} >
		<FormGroupContainer>
		<label className='col-form-label'>Segment Status</label>
			
			<label className='col-form-label' style={isActive ? {color: 'green'} : {color: 'red'}}>
				{  isActive !== undefined && <> <FontAwesomeIcon icon={faDotCircle} style={{marginRight: "5px"}} /> {(isActive ? 'Active' : ' Inactive')} </> }	
			{actionName === PageAction.VIEW && (isActive || isReactivated) && showIcon && (
				<>
					<span className='h4' style={{marginLeft: "10px"}}>
						<FontAwesomeIcon
							role='button'
							icon={faInfoCircle}
							style={isActive ? {color: 'green', cursor: 'pointer'} : {color: 'red', cursor: 'pointer'}}
							onMouseEnter={onClickActiveIcon}
							onClick={onClickActiveIcon}
							size="1x"
						/>
					</span>

					<Toast
						show={activePopOverShow}
						onClose={() => {
							setActivePopOverShow(false);
						}}
						onMouseOut={() => {
							setActivePopOverShow(false);
						}}
						style={{marginTop: "5px", color: "#3a3a3a", minWidth: "10rem", textAlign: "center"}}
					>
						{isActive && <Toast.Body>This segment is already active and cannot be edited.</Toast.Body>}
						{!isActive && isReactivated && <Toast.Body>This segment was previously activated and cannot be edited.</Toast.Body>}
					</Toast>
				</>
			)}
			</label>
			</FormGroupContainer>
		</div>
	);
};

export default SegmentDistributionStatus;
