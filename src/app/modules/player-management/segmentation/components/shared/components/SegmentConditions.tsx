import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {BorderedPlusButton} from '.';
import {RootState} from '../../../../../../../setup';
import {SegmentConditionType, SegmentPageAction, SegmentStateActionTypes} from '../../../../../../constants/Constants';
import {FormGroupContainer} from '../../../../../../custom-components';
import searchTree from '../../../../../../custom-functions/searchTree';
import {IAuthState} from '../../../../../auth';
import {USER_CLAIMS} from '../../../../../user-management/components/constants/UserClaims';
import {
	InFileSegmentPlayerModel,
	SegmentConditionModel,
	SegmentConditionSaveRequestModel,
	SegmentState,
	SegmentToStaticRequestModel,
} from '../../../models';
import {ISegmentationState} from '../../../redux/SegmentationRedux';
import {getSegmentConditionsBySegmentId, toStaticSegment} from '../../../redux/SegmentationService';
import {useSegmentLookups} from '../hooks';
import SegmentCondition from './SegmentCondition';
import SegmentGroup from './SegmentGroup';

type SegmentConditionProps = {
	segmentState: SegmentState;
	setSegmentConditionInFilePlayersIdList?: any;
	dispatch: (e: any) => void;
	setSegmentConditions?: (e: any) => void;
};

const SegmentConditions: React.FC<SegmentConditionProps> = ({
	segmentState,
	setSegmentConditionInFilePlayersIdList,
	dispatch,
	setSegmentConditions,
}: SegmentConditionProps) => {
	// States
	const {actionName, segmentId} = useParams();
	const {loadSegmentLookUps} = useSegmentLookups();
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;
	const [conditionList, setConditionList] = useState<Array<SegmentConditionModel>>([]);
	const [conditionLogic, setConditionLogic] = useState('AND');
	const [readOnly, setReadOnly] = useState(false);
	const [segmentConditionInFilePlayersId, setSegmentConditionInFilePlayersId] = useState<Array<InFileSegmentPlayerModel>>([]);

	//Effects
	useEffect(() => {
		loadSegmentLookUps();
	}, []);

	useEffect(() => {
		setReadOnly(actionName === SegmentPageAction.CONVERT_TO_STATIC || actionName === SegmentPageAction.VIEW);

		if ((actionName === SegmentPageAction.EDIT || actionName === SegmentPageAction.VIEW || actionName === SegmentPageAction.CLONE) && segmentId > 0) {
			getSegmentConditions(segmentId);
		}

		if (actionName === SegmentPageAction.CONVERT_TO_STATIC) {
			getToStaticSegment(segmentId);
		}
	}, [segmentId, actionName]);

	useEffect(() => {
		setSegmentConditionInFilePlayersIdList(segmentConditionInFilePlayersId);
	}, [segmentConditionInFilePlayersId]);

	useEffect(() => {
		const updatedConditions = segmentState.segmentConditions.map((item: any) => {
			if (item.parentKey === '' || item.parentKey === null) {
				return {...item, segmentConditionLogicOperator: conditionLogic};
			}
			return item;
		});

		dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...updatedConditions], invoker: 'ConditionLogic'});
		setConditionList([...updatedConditions]);
	}, [conditionLogic]);

	useEffect(() => {
		if (segmentState.segmentConditions) {
			const conditionsAsPayload = segmentState.segmentConditions.map((i: any) => {
				const item: SegmentConditionSaveRequestModel = {
					segmentConditionId: 0,
					segmentId: segmentId,
					segmentName: segmentState.segmentName,
					segmentConditionType: i.segmentConditionType.toString(),
					segmentConditionLogicOperator: i.segmentConditionLogicOperator,
					segmentConditionFieldId: i.segmentConditionFieldId,
					relationalOperatorId: i.relationalOperatorId,
					segmentConditionValue: i.segmentConditionValue,
					segmentConditionValue2: i.segmentConditionValue2,
					key: i.key,
					parentKey: i.parentKey?.trim() === '' ? undefined : i.parentKey,
					createdBy: userId ? parseInt(userId) : 0,
					updatedBy: userId ? parseInt(userId) : 0,
				};
				return item;
			});

			setSegmentConditions && setSegmentConditions(conditionsAsPayload);
		}
	}, [segmentState.segmentConditions]);

	// Methods
	const addCondition = () => {
		const newCondition: SegmentConditionModel = {
			segmentConditionId: 0,
			segmentConditionType: SegmentConditionType.Condition,
			segmentConditionLogicOperator: conditionLogic,
			segmentConditionFieldId: 0,
			segmentConditionSourceId: 0,
			fieldValue: '',
			relationalOperatorId: undefined,
			relationalOperatorValue: '',
			segmentConditionValue: '',
			segmentConditionValue2: '',
			key: Guid.create().toString(),
			parentKey: '',
		};

		if (conditionList.find((x) => x.relationalOperatorId === 20)) {
			swal('Failed', 'Upload condition cannot be combined with other conditions.', 'error');
		} else {
			dispatch({
				type: SegmentStateActionTypes.SegmentConditions,
				payload: [...segmentState.segmentConditions, newCondition],
				invoker: 'Add Condition',
			});
			setConditionList([...conditionList, newCondition]);
		}
	};

	const updateCondition = (condition: SegmentConditionModel) => {
		const updatedConditions = segmentState.segmentConditions.map((item) => {
			if (item.key !== condition.key) {
				return item;
			}
			return {...condition};
		});
		dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...updatedConditions], invoker: 'SegmentConditions > updateCondition'});
		setConditionList([...updatedConditions]);
	};

	const removeCondition = (key: string) => {
		const keyList: Array<string> = [key];
		let newKeyList = keyList.concat(searchTree(key, segmentState.segmentConditions));
		const newList = segmentState.segmentConditions.filter((i) => !newKeyList.includes(i.key));
		dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...newList], invoker: 'RemoveCondition'});
		setConditionList([...newList]);
	};

	const addGroup = () => {
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
			parentKey: '',
		};

		if (conditionList.find((x) => x.relationalOperatorId === 20)) {
			swal('Failed', 'Upload condition cannot be combined with other conditions.', 'error');
		} else {
			dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...segmentState.segmentConditions, newGroup], invoker: 'AddGroup'});
			setConditionList([...conditionList, newGroup]);
		}
	};

	const addToConditionList = (condition: SegmentConditionModel) => {
		if (conditionList.find((x) => x.relationalOperatorId === 20)) {
			swal('Failed', 'Upload condition cannot be combined with other conditions.', 'error');
		} else {
			dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...segmentState.segmentConditions, condition]});
			setConditionList([...conditionList, condition]);
		}
	};

	const handleConditionLogic = (event: any) => {
		setConditionLogic(event.target.value);
	};

	const getSegmentConditions = (segmentId: number) => {
		getSegmentConditionsBySegmentId(segmentId).then((response) => {
			const resultData = Object.assign(new Array<SegmentConditionSaveRequestModel>(), response.data);

			const segmentConditions = resultData.map((item: SegmentConditionSaveRequestModel) => {
				const fieldObj = segmentLookups?.fieldList.find((i) => i.id === item.segmentConditionFieldId);
				const opObj = segmentLookups?.operatorList.find((i) => i.id === item.relationalOperatorId);

				const condition: SegmentConditionModel = {
					segmentConditionId: item.segmentConditionId,
					segmentConditionType: item.segmentConditionType as SegmentConditionType,
					segmentConditionLogicOperator: item.segmentConditionLogicOperator,
					segmentConditionFieldId: item.segmentConditionFieldId,
					segmentConditionSourceId: fieldObj?.segmentConditionSourceId,
					fieldValue: fieldObj ? fieldObj.value : '',
					relationalOperatorId: item.relationalOperatorId,
					relationalOperatorValue: opObj ? opObj.value : '',
					segmentConditionValue:
						actionName === SegmentPageAction.CONVERT_TO_STATIC
							? item.segmentConditionValue.substring(0, item.segmentConditionValue.length > 500 ? 500 : item.segmentConditionValue.length)
							: item.segmentConditionValue,

					segmentConditionValue2: item.segmentConditionValue2,
					key: item.key,
					parentKey: item.parentKey,
					fieldLocked: item.fieldLocked,
					operatorLocked: item.operatorLocked,
				};
				return condition;
			});

			const rootConditionLogic = segmentConditions.find((i) => i.parentKey === null || i.parentKey === undefined);
			if (rootConditionLogic) {
				setConditionLogic(rootConditionLogic.segmentConditionLogicOperator);
			}

			setConditionList([...segmentConditions]);
			dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...segmentConditions], invoker: 'GetSegmentCOnditionSet'});
		})
		.catch(() => {
			swal('Failed', 'Problem in Getting Segment Conditions by Id', 'error');
		});
	};

	const getToStaticSegment = async (segmentId: number) => {
		const request: SegmentToStaticRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId !== null && userId !== undefined ? userId.toString() : '',
			segmentId: segmentId,
		};

		await toStaticSegment(request)
			.then((returnData) => {
				const data = Object.assign(returnData.data);
				console.log('segment', data);
				const playerCount = data?.players != undefined && data.players.length > 0 ? data.playerIdList.split(',').length : 0;
				const playersDisp = data?.players.map((i: any) => i.mlabPlayerId).join(',') + (playerCount > 10 ? `...(${playerCount} items)` : '');
				const playerIdsDisplay = data?.players?.length > 0 ? playersDisp : '';
				
				addConditionToStatic(data, playerIdsDisplay);

				if (data?.players?.length === 0) {
					swal('Convert To Static', 'No Record Found', 'info');
				}
			})
			.catch(() => {
				swal('Failed', 'Problem in Convert Segment to Static', 'error');
			});
	};

	const addConditionToStatic = (data: any, playerIdsDisplay: any) => {
		const newCondition: SegmentConditionModel = {
			segmentConditionId: 0,
			segmentConditionType: SegmentConditionType.Condition,
			segmentConditionLogicOperator: conditionLogic,
			segmentConditionFieldId: 100, //1 for Mlab Player Id
			fieldValue: 'p.MLabPlayerId',
			relationalOperatorId: 3, // 3 for IN operator
			relationalOperatorValue: 'IN',
			segmentConditionValue: data.playerIdList && data.playerIdList.length > 0 ? playerIdsDisplay : '',
			segmentConditionValue2: '',
			key: Guid.create().toString(),
			parentKey: '',
		};

		dispatch({
			type: SegmentStateActionTypes.SegmentInitialState,
			payload: {
				segmentId: 0,
				segmentName: '',
				segmentDescription: '',
				isActive: true,
				isStatic: true,
				staticParentId: segmentId,
				staticPlayerIds: data.playerIdList,
				queryForm: '',
				segmentConditions: [newCondition],
			},
		});

		setConditionList([newCondition]);

		if (data && data.players.length === 0) {
			swal('Convert To Static', 'No Record Found', 'info');
		}
	};

	return (
		<>
			<FormGroupContainer>
				<h4 className='font-size-lg text-dark font-weight-bold my-3'>Conditions</h4>
				<div className='row g-3'>
					<div className='col-sm-2 align-self-center'>
						<span className='align-middle required'>Condition Logic</span>
					</div>
					<div className='col-sm-2'>
						<select className='form-select form-select-sm' value={conditionLogic} onChange={handleConditionLogic} disabled={readOnly}>
							<option value=''>Choose...</option>
							<option value='AND'>AND</option>
							<option value='OR'>OR</option>
						</select>
					</div>
					<div className='col'>
						<BorderedPlusButton
							access={access?.includes(USER_CLAIMS.SegmentationWrite)}
							label={'Condition'}
							disabled={readOnly}
							onClick={() => addCondition()}
							color={'#009EF7'}
							marginRight={'3'}
						/>
						<BorderedPlusButton
							access={access?.includes(USER_CLAIMS.SegmentationWrite)}
							label={'Group'}
							onClick={() => addGroup()}
							disabled={readOnly}
							color={'#009EF7'}
						/>
					</div>
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
				{segmentState &&
					segmentState.segmentConditions
						.filter((i) => i.parentKey === '' || i.parentKey === null)
						.map((item) =>
							item.segmentConditionType === SegmentConditionType.Condition ? (
								<SegmentCondition
									key={item.key}
									isReadOnly={readOnly}
									indent={false}
									condition={item}
									remove={removeCondition}
									update={updateCondition}
									isSet={false}
									segmentState={segmentState}
									dispatch={dispatch}
									setSegmentConditionInFilePlayersId={setSegmentConditionInFilePlayersId}
								/>
							) : (
								<SegmentGroup
									key={item.key}
									condition={item}
									addToConditionList={addToConditionList}
									remove={removeCondition}
									update={updateCondition}
									isReadOnly={readOnly}
									segmentState={segmentState}
									dispatch={dispatch}
									setSegmentConditionInFilePlayersId={setSegmentConditionInFilePlayersId}
								/>
							)
						)}
			</FormGroupContainer>
		</>
	);
};

export default SegmentConditions;
