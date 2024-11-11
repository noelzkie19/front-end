import React, {useEffect, useState} from 'react';
import {OverlayTrigger, Toast} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import {RootState} from '../../../../../../../setup';
import {ElementStyle, PROMPT_MESSAGES, SegmentPageAction, SegmentSourceTypes} from '../../../../../../constants/Constants';
import {ButtonsContainer, MlabButton} from '../../../../../../custom-components';
import {IAuthState} from '../../../../../auth';
import {USER_CLAIMS} from '../../../../../user-management/components/constants/UserClaims';
import {SegmentConditionModel, SegmentFilterFieldResponseModel} from '../../../models';
import {ISegmentationState} from '../../../redux/SegmentationRedux';
import useSegmentConstant from '../../../useSegmentConstant';

type TestSegmentProps = {
	loading: boolean;
	queryForm: string;
	segmentConditions?: SegmentConditionModel[];
	testSegment: () => void;
	tableauEventQueueId?: string;
	queryFormTableauCurrent?: string;
	queryFormTableauPersisted?: string;
	segmentInputType?: any;
};

const TestSegment: React.FC<TestSegmentProps> = ({
	loading,
	queryForm,
	segmentConditions,
	testSegment,
	tableauEventQueueId,
	queryFormTableauCurrent,
	queryFormTableauPersisted,
	segmentInputType,
}: TestSegmentProps) => {
	// Hooks
	const {actionName, segmentId} = useParams();
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;
	const {SegmentInputTypes} = useSegmentConstant();
	// States
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [allowTest, setAllowTest] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [activePopOverShow, setActivePopOverShow] = useState<boolean>(false);

	// Effects
	useEffect(() => {
		const fieldIdList = segmentConditions?.map((i) => i.segmentConditionFieldId);
		const tableauFields = segmentLookups?.fieldList.filter(
			(i: SegmentFilterFieldResponseModel) => fieldIdList?.includes(i.id) && i.segmentConditionSourceId === SegmentSourceTypes.Tableau
		);

		const tableauSyncCheck = tableauEventQueueId ? true : false;
		let tableauFieldsCheck = tableauFields && tableauFields.length > 0 ? false : true;
		tableauFieldsCheck = segmentInputType && segmentInputType.value === SegmentInputTypes.CustomQuery ? false : tableauFieldsCheck;
		const tableauQueryCheck = queryFormTableauCurrent === queryFormTableauPersisted;

		if (actionName === SegmentPageAction.VIEW) {
			setAllowTest(tableauFieldsCheck ? tableauFieldsCheck : tableauSyncCheck);
		} else if (actionName === SegmentPageAction.EDIT) {
			setAllowTest(tableauFieldsCheck ? tableauFieldsCheck : tableauSyncCheck && tableauQueryCheck);
		} else {
			setAllowTest(tableauFieldsCheck);
		}
	}, [segmentConditions, segmentInputType]);

	

	const onClickActiveIcon = () => {
		setActivePopOverShow(true);
	};
	const TestSegmentTooltip = () => (
		<Toast
			show={activePopOverShow && !allowTest}
			style={{position: 'absolute', left: '170px', minWidth: '500px'}}
			onClose={() => {
				setActivePopOverShow(false);
			}}
			onMouseOut={() => {
				setActivePopOverShow(false);
			}}
		>
			<Toast.Body>{PROMPT_MESSAGES.TestSegmentPendingTooltip}</Toast.Body>
		</Toast>
	);

	const tooltipContainer = (
		<div
			style={{
				position: 'absolute',
				backgroundColor: 'hsla(0,0%,100%,.85)',
				border: '1px solid rgba(0,0,0,.1)',
				padding: '2px 10px',
				color: 'black',
				borderRadius: 3,
				width: '500px',
				inlineSize: '500px',
				wordBreak: 'break-word',
				margin: '5px',
				boxShadow: '-1px 1px 19px -10px rgba(0,0,0,0.76)',
			}}
		>
			{PROMPT_MESSAGES.TestSegmentPendingTooltip}
		</div>
	);
	return (
		<ButtonsContainer>
			<span onMouseEnter={onClickActiveIcon} onMouseLeave={() => setActivePopOverShow(false)}>
				<MlabButton
					access={access?.includes(USER_CLAIMS.SegmentationRead)}
					size={'sm'}
					label={'Test Segment'}
					style={allowTest ? ElementStyle.success : ElementStyle.danger}
					type={'button'}
					weight={'solid'}
					loading={loading}
					disabled={loading || readOnly || !allowTest}
					loadingTitle={' Please wait...'}
					onClick={() => (allowTest ? testSegment() : {})}
				/>
			</span>
			<TestSegmentTooltip />
		</ButtonsContainer>
	);
};

export default TestSegment;
