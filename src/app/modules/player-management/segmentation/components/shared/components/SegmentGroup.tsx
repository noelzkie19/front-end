import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {BorderedPlusButton, BorderedTrashButton} from '.';
import {RootState} from '../../../../../../../setup';
import {SegmentConditionType, SegmentStateActionTypes} from '../../../../../../constants/Constants';
import {USER_CLAIMS} from '../../../../../user-management/components/constants/UserClaims';
import {SegmentState} from '../../../models';
import {SegmentConditionModel} from '../../../models/SegmentConditionModel';
import SegmentCondition from './SegmentCondition';

type SegmentGroupProps = {
	condition: SegmentConditionModel;
	remove: (id: string) => void;
	addToConditionList: (condition: SegmentConditionModel) => void;
	update: (condition: SegmentConditionModel) => void;
	isReadOnly: boolean;
	segmentState: SegmentState;
	dispatch: (e: any) => void;
	setSegmentConditionInFilePlayersId: any;
};

const SegmentGroup: React.FC<SegmentGroupProps> = (props: SegmentGroupProps) => {
	const [conditionLogic, setConditionLogic] = useState('');
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	useEffect(() => {
		const defaultSelectedCondition = props.segmentState.segmentConditions.find((i) => i.parentKey === props.condition.key);
		if (defaultSelectedCondition) {
			setConditionLogic(defaultSelectedCondition.segmentConditionLogicOperator);
		}
	}, []);

	useEffect(() => {
		const updatedConditions = props.segmentState.segmentConditions.map((item) => {
			if (item.parentKey !== props.condition.key) {
				return item;
			}
			return {...item, segmentConditionLogicOperator: conditionLogic};
		});
		props.dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...updatedConditions], invoker: 'Segment Group > ConditionLogic'});
	}, [conditionLogic]);

	const handleAddCondition = () => {
		const newCondition: SegmentConditionModel = {
			segmentConditionId: 0,
			segmentConditionType: SegmentConditionType.Condition,
			segmentConditionLogicOperator: conditionLogic,
			segmentConditionFieldId: 0,
			fieldValue: '',
			relationalOperatorId: 0,
			relationalOperatorValue: '',
			segmentConditionValue: '',
			segmentConditionValue2: '',
			key: Guid.create().toString(),
			parentKey: props.condition.key,
		};
		props.addToConditionList(newCondition);
	};

	const handleAddGroup = () => {
		const newGroup: SegmentConditionModel = {
			segmentConditionId: 0,
			segmentConditionType: SegmentConditionType.Group,
			segmentConditionLogicOperator: conditionLogic,
			segmentConditionFieldId: undefined,
			fieldValue: '',
			relationalOperatorId: undefined,
			relationalOperatorValue: '',
			segmentConditionValue: '',
			segmentConditionValue2: '',
			key: Guid.create().toString(),
			parentKey: props.condition.key,
		};
		props.addToConditionList(newGroup);
	};

	const removeGroup = () => {
		props.remove(props.condition.key);
	};

	return (
		<>
			<div className='row g-3'>
				<div className='col-sm-2'></div>
				<div className='col-sm-2 align-self-center'>
					<span className='align-middle required'>Group Logic</span>
				</div>
				<div className='col-sm-2'>
					<select
						className='form-select form-select-sm'
						value={conditionLogic}
						onChange={(e: any) => setConditionLogic(e.target.value)}
						disabled={props.isReadOnly}
					>
						<option value=''>Choose...</option>
						<option value='AND'>AND</option>
						<option value='OR'>OR</option>
					</select>
				</div>

				{/* New button implementation */}
				<div className='col'>
					<BorderedPlusButton
						access={userAccess?.includes(USER_CLAIMS.SegmentationWrite)}
						label={'Condition'}
						disabled={props.isReadOnly}
						onClick={() => handleAddCondition()}
						color={'#009EF7'}
						marginRight={'3'}
					/>

					<BorderedPlusButton
						access={userAccess?.includes(USER_CLAIMS.SegmentationWrite)}
						label={'Group'}
						onClick={() => handleAddGroup()}
						disabled={props.isReadOnly}
						color={'#009EF7'}
						marginRight={'3'}
					/>
					<BorderedTrashButton
						access={userAccess?.includes(USER_CLAIMS.SegmentationWrite)}
						label={'Group'}
						onClick={() => removeGroup()}
						disabled={props.isReadOnly}
						color={'#F1416C'}
					/>
				</div>
			</div>
			<div className='row g-3'>
				{props.segmentState &&
					props.segmentState.segmentConditions
						.filter((i) => i.parentKey === props.condition.key)
						.map((item) =>
							item.segmentConditionType === SegmentConditionType.Condition ? (
								<SegmentCondition
									key={item.key}
									isReadOnly={props.isReadOnly}
									indent={true}
									condition={item}
									remove={props.remove}
									update={props.update}
									isSet={false}
									segmentState={props.segmentState}
									dispatch={props.dispatch}
									setSegmentConditionInFilePlayersId={props.setSegmentConditionInFilePlayersId}
								/>
							) : (
								<SegmentGroup
									key={item.key}
									condition={item}
									addToConditionList={props.addToConditionList}
									remove={props.remove}
									update={props.update}
									isReadOnly={props.isReadOnly}
									segmentState={props.segmentState}
									dispatch={props.dispatch}
									setSegmentConditionInFilePlayersId={props.setSegmentConditionInFilePlayersId}
								/>
							)
						)}
			</div>
		</>
	);
};

export default SegmentGroup;
