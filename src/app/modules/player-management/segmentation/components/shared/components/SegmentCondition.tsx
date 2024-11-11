import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {BorderedTrashButton, SegmentPlayerUpload} from '.';
import {RootState} from '../../../../../../../setup';
import {
	RelationalOperatorIds,
	SegmentConditionDataTypesEnum,
	SegmentConditionOperatorsEnum,
	SegmentConditionType,
	SegmentConditionTypes,
	SegmentConditionValueTypes,
	SegmentFieldEnum,
	SegmentLookupDrilldownFieldsEnum,
	SegmentLookupFieldsEnum,
	SegmentStateActionTypes,
	SegmentTypes,
} from '../../../../../../constants/Constants';
import {DefaultDatePicker} from '../../../../../../custom-components';
import {LookupModel} from '../../../../../../shared-models/LookupModel';
import {useCaseCommOptions} from '../../../../../case-communication/components/shared/hooks';
import {USER_CLAIMS} from '../../../../../user-management/components/constants/UserClaims';
import {
	InFileSegmentPlayerModel,
	SegmentConditionSetResponseModel,
	SegmentFilterFieldResponseModel,
	SegmentFilterOperatorResponseModel,
	SegmentState,
} from '../../../models';
import {SegmentConditionModel} from '../../../models/SegmentConditionModel';
import {ISegmentationState} from '../../../redux/SegmentationRedux';
import {
	getCampaignGoalNamesByCampaignId,
	getMessageResponseByMultipleId,
	getMessageStatusByCaseTypeId,
	getSegmentConditionSetByParentId,
	getVariancesBySegmentId,
} from '../../../redux/SegmentationService';
import {useSegmentLookups} from '../hooks';

type SegmentConditionProps = {
	indent: boolean;
	condition: SegmentConditionModel;
	remove: (id: string) => void;
	update: (condition: SegmentConditionModel) => void;
	isSet: boolean;
	isReadOnly: boolean;
	segmentState: SegmentState;
	setSegmentConditionInFilePlayersId: any;
	dispatch: (e: any) => void;
};

const SegmentCondition: React.FC<SegmentConditionProps> = (props: SegmentConditionProps) => {
	// call hooks at the top level, before conditional rendering
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;
	const {getSegmentLookup} = useSegmentLookups();
	const {getCaseTypeOptionList, caseTypeOptionsList} = useCaseCommOptions();

	// declare local variables
	const specialDateOperators = [9, 10, 14, 15];
	const booleanFieldOptions = [
		{label: 'YES', value: '1'},
		{label: 'NO', value: '0'},
	];

	const IsVipLevelUpgradedOptions = [
		{label: 'Upgraded', value: '1'},
		{label: 'Downgraded', value: '0'},
	];

	const initialFieldValue = segmentLookups?.fieldList.find((i) => i.id === props.condition.segmentConditionFieldId);
	const actualOperatorValue = segmentLookups?.operatorList.find((i) => i.id === props.condition.relationalOperatorId);
	const initialLookUpValue = initialFieldValue  ? getSegmentLookup(initialFieldValue.lookupSource) .filter((i) => props.condition.segmentConditionValue.split(',').includes(i.value.toString())) : [];
	  
	const initialDateValue = () => {
		const { relationalOperatorId, segmentConditionValue } = props.condition;
		return relationalOperatorId !== undefined &&
			relationalOperatorId > 0 &&
			relationalOperatorId !== 9 &&
			relationalOperatorId !== 10 &&
			!specialDateOperators.includes(relationalOperatorId) &&
			segmentConditionValue !== ''
			? new Date(segmentConditionValue)
			: undefined;
	};

	// States
	const [actualFieldValue, setActualFieldValue] = useState<SegmentFilterFieldResponseModel | undefined>(initialFieldValue);
	const [operatorsSorted, setOperatorsSorted] = useState<Array<SegmentFilterOperatorResponseModel>>([]);
	const [condition, setCondition] = useState<SegmentConditionModel>(props && props.condition);
	const [fieldValue, setFieldValue] = useState(props.condition.segmentConditionFieldId);
	const [operatorValue, setOperatorValue] = useState(actualOperatorValue ? actualOperatorValue.value : '');
	const [value1, setValue1] = useState(props.condition.segmentConditionValue);
	const [value2, setValue2] = useState(props.condition.segmentConditionValue2);
	const [lookupValue, setLookupValue] = useState(initialLookUpValue);
	const [dateValue, setDateValue] = useState(initialDateValue);

	const [varianceList, setVarianceList] = useState<Array<LookupModel>>([]);
	const [campaignGoalList, setCampaignGoalList] = useState<Array<LookupModel>>([]);
	const [uploadInFilePlayersId, setUploadInFilePlayersId] = useState<Array<InFileSegmentPlayerModel>>([]);
	const [uploadInFileBrandId, setUploadInFileBrandId] = useState<string>('');
	const [messageStatusList, setMessageStatusList] = useState<Array<LookupModel>>([]);
	const [messageResponseList, setMessageResponseList] = useState<Array<LookupModel>>([]);

	// Effects
	useEffect(() => {
		props.update(condition);
	}, [condition]);

	useEffect(() => {
		if (uploadInFilePlayersId.length > 0) {
			props.setSegmentConditionInFilePlayersId(uploadInFilePlayersId);
			const strInFilePlayersId = '( ' + uploadInFilePlayersId.map((i) => `'${i.playerId}'`).join(',') + ') AND p.BrandId = '+ uploadInFileBrandId +'';

			if (actualOperatorValue?.label === SegmentConditionOperatorsEnum.InFile) {
				setCondition({...condition, segmentConditionValue: strInFilePlayersId});
			}
		}
	}, [uploadInFilePlayersId]);

	useEffect(() => {
		if (fieldValue) {
			const fieldInfo = segmentLookups?.fieldList.find((i) => i.id === fieldValue);
			setActualFieldValue(fieldInfo);
			if (fieldInfo && fieldInfo.segmentConditionTypeId === SegmentConditionTypes.Single) {
				let filteredOperatorList = segmentLookups?.operatorList ?? [];
				if (
					props.segmentState.segmentTypeId?.toString() === SegmentTypes.Normal ||
					(props.segmentState.segmentTypeId?.toString() === SegmentTypes.Distribution && props.segmentState.segmentConditions.length > 1)
				) {
					filteredOperatorList = filteredOperatorList.filter((i) => i.label !== SegmentConditionOperatorsEnum.InFile);
				}

				setOperatorsSorted(
					filteredOperatorList.filter((i) =>
						fieldInfo?.relationalOperatorIds
							.split(',')
							.map((y) => y.trim())
							.includes(i.id.toString())
					)
				);
			}
		}
	}, [fieldValue]);

	useEffect(() => {
		switch (actualFieldValue?.id) {
			case SegmentLookupDrilldownFieldsEnum.Variance:
				{
					const parentSegment = triggerSegmentConditionUpdate(SegmentLookupDrilldownFieldsEnum.Segment);
					if (parentSegment) {
						getVarianceList(Number(parentSegment.segmentConditionValue));
					}
				}
				break;
			case SegmentLookupDrilldownFieldsEnum.CampaignGoal:
				{
					const parentSegment = triggerSegmentConditionUpdate(SegmentLookupDrilldownFieldsEnum.Campaign);
					if (parentSegment) {
						getCampaignGoalList(Number(parentSegment.segmentConditionValue));
					}
				}
				break;
			case SegmentLookupDrilldownFieldsEnum.CaseType:
				{
					const parentSegment = triggerSegmentConditionUpdate(SegmentLookupDrilldownFieldsEnum.CaseType);
					if (parentSegment) {
						getCaseTypeOptionList();
						setMessageStatusList([]);
						setMessageResponseList([]);
					}
				}
				break;
			case SegmentLookupDrilldownFieldsEnum.MessageStatus:
				{
					const parentSegment = triggerSegmentConditionUpdate(SegmentLookupDrilldownFieldsEnum.CaseType);
					if (parentSegment) {
						getMessageStatusList(parentSegment?.segmentConditionValue);
						setMessageResponseList([]);
					}
				}
				break;
			case SegmentLookupDrilldownFieldsEnum.MessageResponse:
				{
					const parentSegment = triggerSegmentConditionUpdate(SegmentLookupDrilldownFieldsEnum.MessageStatus);
					if (parentSegment) {
						getMessageResponseList(parentSegment?.segmentConditionValue);
					}
				}
				break;
			default:
				break;
		}
	}, [props.segmentState.segmentConditions]);

	// Methods
	const triggerSegmentConditionUpdate = (_segmentInfoId: number) => {
		const segmentInfo = segmentLookups?.fieldList.find((i) => i.id === _segmentInfoId);
		const parentSegment = props.segmentState.segmentConditions.find(
			(i) => i.parentKey === condition.parentKey && i.segmentConditionFieldId === segmentInfo?.id
		);

		return parentSegment;
	};

	const handleFieldId = (val: any) => {
		const fieldInfo = segmentLookups?.fieldList.find((i) => i.id === val.id);

		// Validate if condition is mixed with Tableau in a group or vice-versa.
		if (condition.parentKey) {
			const conditionGroup = props.segmentState.segmentConditions.find(
				(i) => i.parentKey === condition.parentKey && i.key !== condition.key && i.segmentConditionType !== SegmentConditionType.Group
			);
			if (conditionGroup && conditionGroup.segmentConditionSourceId !== fieldInfo?.segmentConditionSourceId) {
				swal('Failed', 'MLAB and Tableau Condition cannot be combined in a same group', 'error');
				return;
			}
		}

		// Remove existing condition set
		if (val.id !== fieldValue) {
			if (fieldInfo?.segmentConditionTypeId === SegmentConditionTypes.Set) {
				getConditionSet(val.id);
			} else {
				const oldConditions = props.segmentState.segmentConditions.filter((i) => i.parentKey !== condition.key);
				props.dispatch({
					type: SegmentStateActionTypes.SegmentConditions,
					payload: [...oldConditions],
					invoker: 'Segment Condition > Remove child conditions',
				});
			}
		}

		//Set Condition Values
		setCondition({
			...condition,
			segmentConditionFieldId: val.id,
			fieldValue: val.id,
			segmentConditionSourceId: fieldInfo?.segmentConditionSourceId,
			relationalOperatorId: undefined,
			relationalOperatorValue: '',
			segmentConditionValue: '',
			segmentConditionValue2: '',
		});
		setFieldValue(val.id);
		setOperatorValue('');
		clearValues();
	};

	const getConditionSet = async (parentId: number) => {
		await getSegmentConditionSetByParentId(parentId).then((response) => {
			if (response.status === 200) {
				const fieldInfo = segmentLookups?.fieldList.find((i) => i.id === parentId);
				const oldConditions = props.segmentState.segmentConditions.filter((i) => i.key !== condition.key && i.parentKey !== condition.key);
				const resultData = Object.assign(new Array<SegmentConditionSetResponseModel>(), response.data);
				if (resultData.length > 0) {
					const newConditions = resultData.map((item) => {
						const fieldInfo = segmentLookups?.fieldList.find((i) => i.id === item.segmentConditionFieldId);
						const operatorInfo = segmentLookups?.operatorList.find((i) => i.id === item.relationalOperatorId);
						const newCondition: SegmentConditionModel = {
							segmentConditionId: 0,
							segmentConditionType: SegmentConditionType.Condition,
							segmentConditionLogicOperator: item.conditionalOperator,
							segmentConditionFieldId: item.segmentConditionFieldId,
							segmentConditionSourceId: fieldInfo?.segmentConditionSourceId,
							fieldValue: item.segmentConditionFieldId.toString(),
							relationalOperatorId: item.relationalOperatorId,
							relationalOperatorValue: operatorInfo?.value || '',
							segmentConditionValue: operatorInfo?.isTemplate ? operatorInfo.value : '',
							segmentConditionValue2: '',
							fieldLocked: item.locked,
							operatorLocked: item.operatorLocked,
							removable: item.removable,
							key: Guid.create().toString(),
							parentKey: condition.key,
						};
						return newCondition;
					});

					newConditions.push({
						...condition,
						segmentConditionFieldId: parentId,
						fieldValue: parentId.toString(),
						segmentConditionSourceId: fieldInfo?.segmentConditionSourceId,
						relationalOperatorId: undefined,
						relationalOperatorValue: '',
						segmentConditionValue: '',
						segmentConditionValue2: '',
					});

					props.dispatch({
						type: SegmentStateActionTypes.SegmentConditions,
						payload: [...oldConditions, ...newConditions],
						invoker: 'Segment Condition > GetConditionSet',
					});
				}
			}
		});
	};

	const handleOperatorId = (val: any) => {
		setOperatorValue(val.value);
		clearValues();
		let autoValue = '';
		const operatorInfo = segmentLookups?.operatorList.find((i) => i.id === val.id);
		if (operatorInfo?.isTemplate) {
			autoValue = operatorInfo.value;
		}

		if (val.label === SegmentConditionOperatorsEnum.True) {
			autoValue = booleanFieldOptions[0].value;
		} else if (val.label === SegmentConditionOperatorsEnum.False) {
			autoValue = booleanFieldOptions[1].value;
		} else if (val.label === SegmentConditionOperatorsEnum.Today) {
			autoValue = moment().format('YYY-M-D HH:mm:ss');
		} else if (val.label === SegmentConditionOperatorsEnum.ThisMonth) {
			autoValue = moment().format('M');
		} else if (
			val.label === SegmentConditionOperatorsEnum.After ||
			val.label === SegmentConditionOperatorsEnum.Before ||
			val.label === SegmentConditionOperatorsEnum.On
		) {
			autoValue = moment().format('YYYY-M-D HH:mm:ss');
			setDateValue(new Date());
		}
		setValue1(autoValue);
		setCondition({...condition, relationalOperatorId: val.id, relationalOperatorValue: val.value, segmentConditionValue: autoValue});
	};

	const handleFieldValue = (event: any) => {
		setCondition({...condition, segmentConditionValue: event.target.value.toString()});
		setValue1(event.target.value);
	};

	const handleFieldValue2 = (val: Date) => {
		const newDateValue = val === null || val === undefined ? '' : moment(val).format('YYYY-M-D HH:mm:ss');
		setDateValue(val);
		setCondition({...condition, segmentConditionValue: newDateValue});
		setValue1(newDateValue);
	};

	const handleLookUpValue = (val: any) => {
		setCondition({...condition, segmentConditionValue: val.value.toString()});
		setValue1(val.value.toString());
		setDateValue(val);
	};

	const handleMultiLookupValue = (val: any) => {
		setLookupValue(val);
		if (val.length > 0) {
			let parsedValue = val.map((i: LookupModel) => i.value).join(',');
			setCondition({...condition, segmentConditionValue: parsedValue});
			setValue1(parsedValue);
		} else if (val.length === 0) {
			setCondition({...condition, segmentConditionValue: ''});
			setValue1('');
		}
	};

	const handleMultiLookupValueWithDependency = (val: any, dependencyLookupId: any, len: number) => {
		setLookupValue(val);
		if (val.length > 0) {
			let parsedValue = val.map((i: LookupModel) => i.value).join(',');
			setCondition({...condition, segmentConditionValue: parsedValue});
			setValue1(parsedValue);
		} else if (val.length === 0) {
			setCondition({...condition, segmentConditionValue: ''});
			setValue1('');
		}

		// for dropdown values with dependencies and resets
		if (len > val.length) {
			switch (dependencyLookupId) {
				case SegmentLookupDrilldownFieldsEnum.MessageStatus:
					//reset message status
					resetSegmentConditionValue(dependencyLookupId);

					//reset message response
					resetSegmentConditionValue(SegmentLookupDrilldownFieldsEnum.MessageResponse);
					break;
				case SegmentLookupDrilldownFieldsEnum.MessageResponse:
					resetSegmentConditionValue(SegmentLookupDrilldownFieldsEnum.MessageResponse);
					break;
				default:
					break;
			}
		}
	};

	const resetSegmentConditionValue = (_id: any) => {
		props.segmentState.segmentConditions
			.filter((i) => i.parentKey === condition.parentKey && i.segmentConditionFieldId === _id)
			.forEach((j) => (j.segmentConditionValue = ''));
	};

	const getVarianceList = (segmentId: number) => {
		getVariancesBySegmentId(segmentId).then((response) => {
			const resultData = Object.assign(new Array<LookupModel>(), response.data);
			setVarianceList(resultData);
		});
	};

	const getCampaignGoalList = (campaignId: number) => {
		getCampaignGoalNamesByCampaignId(campaignId).then((response) => {
			const resultData = Object.assign(new Array<LookupModel>(), response.data);
			setCampaignGoalList(resultData);
		});
	};

	const getMessageStatusList = (caseTypeId: any) => {
		if (caseTypeId) {
			getMessageStatusByCaseTypeId(caseTypeId).then((response) => {
				const resultData = Object.assign(new Array<LookupModel>(), response.data);
				setMessageStatusList(resultData);
			});
		} else setMessageStatusList([]);
	};

	const getMessageResponseList = (messageStatusIds: any) => {
		if (messageStatusIds) {
			getMessageResponseByMultipleId(messageStatusIds).then((response) => {
				const resultData = Object.assign(new Array<LookupModel>(), response.data);
				setMessageResponseList(resultData);
			});
		} else setMessageResponseList([]);
	};

	const clearValues = () => {
		setValue1('');
		setValue2('');
		setLookupValue([]);
	};

	const removeCondition = () => {
		props.remove(condition.key);
	};

	const customStyles = {
		input: (provided: any) => ({
			...provided,
			maxHeight: 30,
		}),
	};

	return (
		<>
			<div className='row g-3'>
				{props.indent && <div className='col-sm-1'></div>}
				<div className='col-sm-2'>
					<div className='mb-3'>
						<span className={!props.condition.operatorLocked ? 'required' : ''}>Field Name</span>
						<Select
							styles={customStyles}
							options={segmentLookups?.fieldList.filter((i) => i.partOfSetCount === 0 && i.label !== SegmentFieldEnum.MlabPlayerId)}
							onChange={handleFieldId}
							value={segmentLookups?.fieldList.filter((i) => i.id === actualFieldValue?.id)}
							isDisabled={props.isReadOnly || props.condition.fieldLocked}
						/>
					</div>
				</div>
				{actualFieldValue && actualFieldValue.segmentConditionTypeId === SegmentConditionTypes.Single && (
					<>
						<div className='col-sm-2'>
							<div className='mb-3'>
								<span className={!props.condition.operatorLocked ? 'required' : ''}>Relational Operator</span>
								<Select
									options={operatorsSorted}
									onChange={handleOperatorId}
									value={segmentLookups?.operatorList.filter((i) => i.id === condition.relationalOperatorId)}
									isDisabled={props.isReadOnly || props.condition.operatorLocked}
								/>
							</div>
						</div>
						{/* TEXT FIELD */}
						{actualFieldValue &&
							actualFieldValue.segmentConditionValueTypeIds.split(',').includes(SegmentConditionValueTypes.text.toString()) &&
							actualOperatorValue?.label !== SegmentConditionOperatorsEnum.InFile && (
								<div className='col-sm-2'>
									<div className='mb-3'>
										<span className='required'>Value</span>
										<input
											type='text'
											className='form-control form-control-sm'
											id='formGroupExampleInput'
											value={value1}
											onChange={handleFieldValue}
											disabled={props.isReadOnly}
										/>
									</div>
								</div>
							)}

						{/* IN FILE */}
						{actualOperatorValue?.label === SegmentConditionOperatorsEnum.InFile && (
							<div className='col-sm-2'>
								<div className='row'>
									<div className='col-sm-12'>
										<span className='required'>Value</span>
									</div>
									<div className='d-grid gap-2'>
										<SegmentPlayerUpload setUploadInFilePlayersId={setUploadInFilePlayersId} setUploadInFileBrandId={setUploadInFileBrandId} />
									</div>
								</div>
							</div>
						)}

						{/* DROPDOWN - LOOKUP AND BOOLEAN */}
						{actualFieldValue && actualFieldValue.segmentConditionValueTypeIds.split(',').includes(SegmentConditionValueTypes.dropdown.toString()) && (
							<div className='col-sm-2'>
								<div className='mb-3'>
									<span className='required'>Value</span>
									{actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.Variance &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.CampaignGoal &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.CaseType &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.MessageStatus &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.MessageResponse &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.VipLevelChangeType &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.NewVipLevel &&
										actualFieldValue.lookupSource !== SegmentLookupFieldsEnum.PreviousVipLevel &&
										actualFieldValue.dataType !== SegmentConditionDataTypesEnum.bit && (
											<>
												{!actualFieldValue.isMulti && (
													<Select
														options={getSegmentLookup(actualFieldValue.lookupSource)}
														onChange={handleLookUpValue}
														value={getSegmentLookup(actualFieldValue.lookupSource).filter((i) => i.value == value1)}
														isDisabled={props.isReadOnly}
													/>
												)}
												{actualFieldValue.isMulti && (
													<Select
														options={getSegmentLookup(actualFieldValue.lookupSource)}
														onChange={handleMultiLookupValue}
														value={lookupValue}
														isDisabled={props.isReadOnly}
														isMulti={actualFieldValue.isMulti}
													/>
												)}
											</>
										)}

									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.Variance && (
										<Select
											options={varianceList}
											onChange={handleLookUpValue}
											value={varianceList.filter((i) => i.value == value1)}
											isDisabled={props.isReadOnly}
										/>
									)}

									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.CampaignGoal && (
										<Select
											options={campaignGoalList}
											onChange={handleLookUpValue}
											value={campaignGoalList.filter((i) => i.value == value1)}
											isDisabled={props.isReadOnly}
										/>
									)}

									{/* Last Call Mesage Status sub fields*/}
									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.CaseType && (
										<Select
											options={caseTypeOptionsList}
											onChange={(e: any) =>
												handleMultiLookupValueWithDependency(
													e,
													SegmentLookupDrilldownFieldsEnum.MessageStatus,
													(
														props.segmentState.segmentConditions.filter(
															(ct) => ct.parentKey === condition.parentKey && ct.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.CaseType
														)[0]?.segmentConditionValue || ''
													).split(',').length
												)
											}
											value={String(
												props.segmentState.segmentConditions.filter(
													(i) => i.parentKey === condition.parentKey && i.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.CaseType
												)[0]?.segmentConditionValue
											)
												.split(',')
												.map((x) => {
													return String(x);
												})
												.map((j) => {
													return caseTypeOptionsList.find((c) => c.value.toString() === j);
												})}
											isDisabled={props.isReadOnly}
											isMulti={actualFieldValue.isMulti}
										/>
									)}

									{/* Start: Dropdown with drilldown dependency */}
									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.MessageStatus && (
										<Select
											options={messageStatusList}
											onChange={(e: any) =>
												handleMultiLookupValueWithDependency(
													e,
													SegmentLookupDrilldownFieldsEnum.MessageResponse,
													(
														props.segmentState.segmentConditions.filter(
															(ct) =>
																ct.parentKey === condition.parentKey && ct.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.MessageStatus
														)[0]?.segmentConditionValue || ''
													).split(',').length
												)
											}
											value={String(
												props.segmentState.segmentConditions.filter(
													(i) => i.parentKey === condition.parentKey && i.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.MessageStatus
												)[0]?.segmentConditionValue
											)
												.split(',')
												.map((x) => {
													return String(x);
												})
												.map((j) => {
													return messageStatusList.find((c) => c.value.toString() === j);
												})}
											isDisabled={props.isReadOnly}
											isMulti={actualFieldValue.isMulti}
										/>
									)}

									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.MessageResponse && (
										<Select
											options={messageResponseList}
											onChange={handleMultiLookupValue}
											value={
												props.segmentState.segmentConditions.filter(
													(d) =>
														d.parentKey === condition.parentKey &&
														d.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.MessageStatus &&
														d.segmentConditionValue !== ''
												).length > 0
													? String(
															props.segmentState.segmentConditions.filter(
																(i) =>
																	i.parentKey === condition.parentKey &&
																	i.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.MessageResponse
															)[0]?.segmentConditionValue
													  )
															.split(',')
															.map((x) => {
																return String(x);
															})
															.map((j) => {
																return messageResponseList.find((c) => c.value.toString() === j);
															})
													: []
											}
											isDisabled={props.isReadOnly}
											isMulti={actualFieldValue.isMulti}
										/>
									)}

									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.NewVipLevel && (
										<Select
											options={getSegmentLookup(actualFieldValue.lookupSource)}
											onChange={handleMultiLookupValue}
											value={
												props.segmentState.segmentConditions.filter(
													(d) =>
														d.parentKey === condition.parentKey &&
														d.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.NewVipLevel &&
														d.segmentConditionValue !== ''
												).length > 0
													? String(
															props.segmentState.segmentConditions.filter(
																(i) =>
																	i.parentKey === condition.parentKey &&
																	i.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.NewVipLevel
															)[0]?.segmentConditionValue
													  )
															.split(',')
															.map((x) => {
																return String(x);
															})
															.map((j) => {
																return getSegmentLookup(actualFieldValue.lookupSource).find((c) => c.value.toString() === j);
															})
													: []
											}
											isDisabled={props.isReadOnly}
											isMulti={actualFieldValue.isMulti}
										/>
									)}

									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.PreviousVipLevel && (
										<Select
											options={getSegmentLookup(actualFieldValue.lookupSource)}
											onChange={handleMultiLookupValue}
											value={
												props.segmentState.segmentConditions.filter(
													(d) =>
														d.parentKey === condition.parentKey &&
														d.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.PreviousVipLevel &&
														d.segmentConditionValue !== ''
												).length > 0
													? String(
															props.segmentState.segmentConditions.filter(
																(i) =>
																	i.parentKey === condition.parentKey &&
																	i.segmentConditionFieldId === SegmentLookupDrilldownFieldsEnum.PreviousVipLevel
															)[0]?.segmentConditionValue
													  )
															.split(',')
															.map((x) => {
																return String(x);
															})
															.map((j) => {
																return getSegmentLookup(actualFieldValue.lookupSource).find((c) => c.value.toString() === j);
															})
													: []
											}
											isDisabled={props.isReadOnly}
											isMulti={actualFieldValue.isMulti}
										/>
									)}

									{actualFieldValue.lookupSource === SegmentLookupFieldsEnum.VipLevelChangeType && (
										<Select
											options={IsVipLevelUpgradedOptions}
											onChange={handleLookUpValue}
											value={IsVipLevelUpgradedOptions.filter((i) => i.value == value1)}
											isDisabled={props.isReadOnly}
										/>
									)}
									{/* End:Dropdown with drilldown dependency */}

									{actualFieldValue.dataType === SegmentConditionDataTypesEnum.bit && (
										<input type='number' disabled={true} className='form-control form-control-sm' value={value1} onChange={handleFieldValue} />
									)}
								</div>
							</div>
						)}

						{/* DATEPICKER - NON TEMPLATE*/}
						{actualFieldValue &&
							actualFieldValue.segmentConditionValueTypeIds.split(',').includes(SegmentConditionValueTypes.datepicker.toString()) &&
							!actualOperatorValue?.isTemplate && (
								<div className='col-sm-2'>
									<div className='mb-3'>
										<span className='required'>Value</span>
										<DefaultDatePicker
											format='dd/MM/yyyy HH:mm:ss'
											onChange={handleFieldValue2}
											value={dateValue instanceof Date ? dateValue : undefined}
											disabled={props.isReadOnly}
										/>
									</div>
								</div>
							)}

						{/* DATEPICKER - TEMPLATE*/}
						{actualOperatorValue &&
							actualOperatorValue.isTemplate &&
							actualOperatorValue.relationalOperatorValueTypeId === SegmentConditionValueTypes.datepicker &&
							actualOperatorValue.value.indexOf('#2#') >= 0 && (
								<div className='col-sm-2'>
									<div className='mb-3'>
										<span className='required'>Value</span>
										<DefaultDatePicker
											format='dd/MM/yyyy HH:mm:ss'
											onChange={handleFieldValue2}
											value={dateValue instanceof Date ? dateValue : undefined}
											disabled={props.isReadOnly}
										/>
									</div>
								</div>
							)}

						{actualOperatorValue &&
							actualOperatorValue.isTemplate &&
							actualOperatorValue.relationalOperatorValueTypeId === SegmentConditionValueTypes.text &&
							actualOperatorValue.value.indexOf('#2#') >= 0 && (
								<div className='col-sm-2'>
									<div className='mb-3'>
										<span className='required'>Value</span>
										{
											<input
												type='number'
												className='form-control form-control-sm'
												value={value1}
												onChange={handleFieldValue}
												disabled={props.isReadOnly}
											/>
										}
									</div>
								</div>
							)}
					</>
				)}
				{(!props.isSet ||
					(props.isSet && props.condition.removable) ||
					props.condition.relationalOperatorId === RelationalOperatorIds.LastThreeMonths) && (
					<div className='col align-self-center mt-6'>
						<BorderedTrashButton
							access={userAccess?.includes(USER_CLAIMS.SegmentationWrite)}
							label={'Condition'}
							onClick={() => removeCondition()}
							disabled={props.isReadOnly}
							color={'#F1416C'}
						/>
					</div>
				)}
			</div>
			{actualFieldValue && actualFieldValue.segmentConditionTypeId === SegmentConditionTypes.Set && (
				<div className='row g-3'>
					{props.segmentState &&
						props.segmentState.segmentConditions
							.filter((i) => i.parentKey === props.condition.key)
							.map((item) => (
								<SegmentCondition
									key={item.key}
									isReadOnly={props.isReadOnly}
									indent={true}
									condition={item}
									remove={props.remove}
									update={props.update}
									isSet={true}
									segmentState={props.segmentState}
									dispatch={props.dispatch}
									setSegmentConditionInFilePlayersId={props.setSegmentConditionInFilePlayersId}
								/>
							))}
				</div>
			)}
		</>
	);
};

export default SegmentCondition;
