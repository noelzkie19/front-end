import { Guid } from 'guid-typescript';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap-v5';
import { shallowEqual, useSelector } from 'react-redux';
import Select from 'react-select';
import { RootState } from '../../../../../../../setup';
import { MessageStatusOptionModel, MessageTypeOptionModel } from '../../../../../../common/model';
import { GetMessageStatusOptionById, GetMessageTypeOptionList } from '../../../../../../common/services';
import { useMasterReferenceOption, useMessageStatusOption } from '../../../../../../custom-functions';
import { LookupModel } from '../../../../../../shared-models/LookupModel';
import {
	DateSourceCommunicationRecord,
	GoalSettingCommons,
	GoalType,
	MasterReference,
	MasterReferenceChild
} from '../../../../../system/components/constants/CampaignSetting';
import useCampaignSettingConstant from '../../../../constants/useCampaignSettingConstant';
import { GoalTypeCommunicationRecordUdtModel } from '../../../models/GoalTypeCommunicationRecordUdtModel';

interface Props {
	goalTypeCommunicationRecordUdtModel?: GoalTypeCommunicationRecordUdtModel;
	setGoalTypeCommunicationRecordUdtModel: any;
	goalType: any;
	existingGoalTypeList: Array<any>;
	action: any;
	viewMode: boolean;
	actionPage?: any;
	isMapped: boolean;
}
const GoalTypeCommunicationRecord: React.FC<Props> = ({
	goalTypeCommunicationRecordUdtModel,
	setGoalTypeCommunicationRecordUdtModel,
	goalType,
	existingGoalTypeList,
	action,
	viewMode,
	actionPage,
	isMapped,
}) => {
	//	Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const [messageType, setMessageType] = useState<any>('');
	const [messageStatus, setMessageStatus] = useState<any>('');
	const [commRecordPeriod, setCommRecordPeriod] = useState<any>('');
	const [depositDataSource, setDepositDataSource] = useState<any>('');
	const [interval, setInterval] = useState<any>('');
	const [intervalSource, setIntervalSource] = useState<any>('');
	const [disableIntervalSource, setDisableIntervalSource] = useState<boolean>(false);
	const [intervalNumber, setIntervalNumber] = useState<any>('');
	const [disableIntervalNumber, setDisableIntervalNumber] = useState<boolean>(false);
	const [existingGoalName, setExistingGoalName] = useState<any>('');
	const [staticDataSourceOptions, setStaticDataSourceOptions] = useState<Array<LookupModel>>([]);

	const [messageTypeOptionValues, setMessageTypeOptionValues] = useState<Array<LookupModel>>();
	const [messageStatusOptions, setMessageStatusOptions] = useState<Array<LookupModel>>();
	//constant

	const masterReference = useMasterReferenceOption(
		`${MasterReference.GoalTypeIntervalRelationalOperator},
		 ${MasterReference.GoalTypeCommunicationIntervalSource},
		 ${MasterReference.CommunicationPeriod}`
	);
	const messageStatusOption = useMessageStatusOption(parseInt(messageType?.value));
	const {enforceNumberValidationNoPeriod} = useCampaignSettingConstant();

	const dateSourceOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeCommunicationIntervalSource)
		.map((obj) => obj.options);

	const intervalOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator)
		.map((obj) => obj.options);

	const communicationPeriodOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId == MasterReference.CommunicationPeriod)
		.map((obj) => obj.options);

	//UseEffects
	useEffect(() => {
		console.log('udt is ', goalTypeCommunicationRecordUdtModel);

		if (!goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel = {
				goalTypeId: +GoalType.CommunicationRecordId,
				campaignSettingId: 0,
				createdBy: userAccessId,
				goalTypeCommunicationRecordId: 0,
				goalTypeDataSourceId: 0,
				goalTypeDataSourceName: '',
				goalTypeName: '',
				goalTypePeriodId: 0,
				goalTypePeriodName: '',
				intervalNumber: 0,
				intervalRelationalOperatorId: 0,
				intervalRelationalOperatorName: '',
				intervalSourceId: 0,
				intervalSourceName: '',
				messageStatusId: 0,
				messageTypeId: 0,
				updatedBy: userAccessId,
				intervalSourceGoalTypeId: 0,
				goalName: 'Communication Record',
				goalTypeGuid: Guid.create().toString(),
				intervalSourceGoalTypeGUID: '',
			};
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
	}, [goalTypeCommunicationRecordUdtModel]);

	useEffect(() => {
		if (goalTypeCommunicationRecordUdtModel && goalType) {
			goalTypeCommunicationRecordUdtModel.goalTypeId = goalType.value;
			goalTypeCommunicationRecordUdtModel.goalName = goalType.label;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
	}, [goalType]);
	useEffect(() => {
		if (masterReference && masterReference.length > 0) {
			const results = masterReference
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator) return obj;
				})
				.map((obj) => obj.options);
			const result = results.find((e) => +e.value === MasterReferenceChild.OnorAfter);
			if (goalTypeCommunicationRecordUdtModel && goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId === 0 && result) {
				goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId = +result.value;
				goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorName = result.label;
				setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
				setInterval(result);
			}
			const periods = masterReference.filter((obj) => obj.masterReferenceParentId == MasterReference.CommunicationPeriod).map((obj) => obj.options);
			if (periods.length > 0 && action === GoalSettingCommons.ADD) {
				onchangeCommRecordPeriod(periods[0]); // Set default value selected for period
			}
			setDisableIntervalNumber(true);
			loadData();
		}
	}, [masterReference]);
	useEffect(() => {
		if ((action === GoalSettingCommons.EDIT || action === GoalSettingCommons.VIEW) && staticDataSourceOptions && staticDataSourceOptions.length > 0) {
			const item = staticDataSourceOptions.find((d) => d.value === goalTypeCommunicationRecordUdtModel?.intervalSourceId.toString());
			console.log('staticDataSourceOptions', item);
			onchangeIntervalSource(item);
		}
	}, [staticDataSourceOptions]);

	//Events

	const loadData = async () => {
		const messageTypeOptions = await loadMessageTypeOptions();
		const messageStatusOptions = await getMessageStatusOptions(goalTypeCommunicationRecordUdtModel?.messageTypeId);
		if ((action === GoalSettingCommons.EDIT || action === GoalSettingCommons.VIEW) && goalTypeCommunicationRecordUdtModel) {
			console.log('date source ', goalTypeCommunicationRecordUdtModel, staticDataSourceOptions);
			goalTypeCommunicationRecordUdtModel.updatedBy = userAccessId;
			if(goalTypeCommunicationRecordUdtModel){
				setMessageType(messageTypeOptions.find((mt) => mt.value === goalTypeCommunicationRecordUdtModel?.messageTypeId?.toString()));
				setMessageStatus(messageStatusOptions.find((mt) => mt.value === goalTypeCommunicationRecordUdtModel?.messageStatusId?.toString()));
				const item = DateSourceCommunicationRecord.find(
					(mt) => mt.value.toString() === goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceId?.toString()
				);
				onchangeDepositDataSource(item);
				onchangeInterval(intervalOptions.find((mt) => mt.value === goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorId?.toString()));
				if (goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeId > 0) {
					const item = existingGoalTypeList.find((d) => +d.value === goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeId);
					onchangeExistingGoalName(item);
				} else if (goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeGUID) {
					const item = existingGoalTypeList.find((d) => d.data.goalTypeGuid === goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeGUID);
					onchangeExistingGoalName(item);
				} else if (goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeId === 0) {
					onchangeExistingGoalName({value: '', label: 'static'});
				}
				onchangeCommRecordPeriod(
					communicationPeriodOptions.find((mt) => mt.value === goalTypeCommunicationRecordUdtModel?.goalTypePeriodId?.toString())
				);
				setIntervalNumber(goalTypeCommunicationRecordUdtModel?.intervalNumber);
			}
		}
	};

	const loadMessageTypeOptions = async () => {
		let options: Array<LookupModel> = [];
		await GetMessageTypeOptionList()
			.then((response) => {
				if (response.status === 200) {
					let subTopics = Object.assign(new Array<MessageTypeOptionModel>(), response.data);

					let tempList = Array<LookupModel>();

					subTopics.forEach((item) => {
						const OptionValue: LookupModel = {
							value: item.messageTypeId,
							label: item.messageTypeName,
						};
						tempList.push(OptionValue);
					});
					options = tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i);
					setMessageTypeOptionValues(options);
				} else {
					console.log('Problem in message type list');
				}
			})
			.catch(() => {
				console.log('Problem in message type brand list');
			});
		return options;
	};

	const onchangeMessageType = async (val: any) => {
		if (goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel.messageTypeId = +val?.value;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setMessageType(val);
		const newStatusOptions = await getMessageStatusOptions(val?.value);
		setMessageStatusOptions(newStatusOptions);
	};

	const onchangeMessageStatus = (val: any) => {
		if (goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel.messageStatusId = +val?.value;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setMessageStatus(val);
	};

	const onchangeDepositDataSource = (val:any) => {
		if (goalTypeCommunicationRecordUdtModel && val) {
			goalTypeCommunicationRecordUdtModel.goalTypeDataSourceId = +val?.value;
			goalTypeCommunicationRecordUdtModel.goalTypeDataSourceName = val?.label;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setDepositDataSource(val);
	};

	const onchangeInterval = (val: any) => {
		if (goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId = +val?.value;
			goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorName = val?.label;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		if (
			goalTypeCommunicationRecordUdtModel &&
			(goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId == MasterReferenceChild.OnorAfter ||
				goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId == MasterReferenceChild.OnorBefore)
		) {
			setDisableIntervalNumber(true);
			setIntervalNumber('');
		} else setDisableIntervalNumber(false);
		setInterval(val);
	};
	const onchangeIntervalSource = (val: any) => {
		if (goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel.intervalSourceId = +val?.value || 0;
			goalTypeCommunicationRecordUdtModel.intervalSourceName = val?.label || '';
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setIntervalSource(val);
	};
	const onchangeCommRecordPeriod = (val:any) => {
		if (goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel.goalTypePeriodId = +val?.value;
			goalTypeCommunicationRecordUdtModel.goalTypePeriodName = val?.label;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setCommRecordPeriod(val);
	};

	const onChangeIntervalNumber = (val: any) => {
		if (goalTypeCommunicationRecordUdtModel) {
			goalTypeCommunicationRecordUdtModel.intervalNumber = +val.target.value;
			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setIntervalNumber(val.target.value);
	};

	const onchangeExistingGoalName = (val: any) => {
		if (goalTypeCommunicationRecordUdtModel && val) {
			const results = masterReference
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeCommunicationIntervalSource) return obj;
				})
				.map((obj) => obj.options);
			setIntervalSource(null);
			if (val?.label == 'static') {
				setStaticDataSourceOptions(results);
				setDisableIntervalSource(false);
				goalTypeCommunicationRecordUdtModel.intervalSourceGoalTypeGUID = undefined;
				if (results.findIndex((d) => d.value === goalTypeCommunicationRecordUdtModel?.intervalSourceId.toString()) == -1) {
					goalTypeCommunicationRecordUdtModel.intervalSourceId = 0;
					goalTypeCommunicationRecordUdtModel.intervalSourceName = '';
				}
			} else {
				setDisableIntervalSource(true);
				const selectedGoalDataSource = {value: String(val.data.goalTypeDataSourceId), label: val.data.goalTypeDataSourceName};
				setStaticDataSourceOptions([selectedGoalDataSource]);
				onchangeIntervalSource(selectedGoalDataSource);
				goalTypeCommunicationRecordUdtModel.intervalSourceGoalTypeGUID = val?.data?.goalTypeGuid;
			}
			goalTypeCommunicationRecordUdtModel.intervalSourceGoalTypeId = +val.value;
			goalTypeCommunicationRecordUdtModel.intervalSourceGoalTypeName = val.label;

			setGoalTypeCommunicationRecordUdtModel(goalTypeCommunicationRecordUdtModel);
		}
		setExistingGoalName(val);
	};

	const getMessageStatusOptions = async (messageTypeId: any) => {
		let options: Array<LookupModel> = [];
		await GetMessageStatusOptionById(messageTypeId)
			.then((response) => {
				if (response.status === 200) {
					let messageStatus = Object.assign(new Array<MessageStatusOptionModel>(), response.data);

					let tempList = Array<LookupModel>();

					messageStatus.forEach((item) => {
						const OptionValue: LookupModel = {
							value: item.messageStatusId,
							label: item.messageStatusName,
						};
						tempList.push(OptionValue);
					});

					options = tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i);

					setMessageStatusOptions(options);
				} else {
					console.log('Problem in message status options list');
				}
			})
			.catch(() => {
				console.log('Problem in message status options list');
			});
		return options;
	};

	return (
		<>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Message Type</label>
					<Select
						isDisabled={viewMode}
						style={{width: '100%'}}
						options={messageTypeOptionValues}
						onChange={onchangeMessageType}
						value={messageType}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Message Status</label>
					<Select
						isDisabled={viewMode}
						style={{width: '100%'}}
						options={messageStatusOptions ?? messageStatusOption}
						onChange={onchangeMessageStatus}
						value={messageStatus}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Date Source</label>
					<Select
						isDisabled={viewMode || isMapped}
						style={{width: '100%'}}
						options={DateSourceCommunicationRecord}
						onChange={onchangeDepositDataSource}
						value={depositDataSource}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={3}>
					<label className='form-label-sm required'>Interval</label>
					<Select isDisabled={viewMode} style={{width: '100%'}} options={intervalOptions} onChange={onchangeInterval} value={interval} />
				</Col>
				<Col sm={4}>
					<label className='form-label-sm'></label>
					<Select
						isDisabled={viewMode}
						style={{width: '100%'}}
						options={existingGoalTypeList}
						onChange={onchangeExistingGoalName}
						value={existingGoalName}
					/>
				</Col>
				<Col sm={3}>
					<label className='form-label-sm'></label>
					<Select
						isDisabled={disableIntervalSource || viewMode}
						style={{width: '100%'}}
						options={dateSourceOptions || staticDataSourceOptions}
						onChange={onchangeIntervalSource}
						value={intervalSource}
					/>
				</Col>
				<Col sm={2}>
					<label className='form-label-sm'></label>
					<input
						type='number'
						className='form-control form-control-sm'
						aria-label='{c.currencCode} Min'
						min='1'
						value={intervalNumber}
						onChange={onChangeIntervalNumber}
						disabled={disableIntervalNumber || viewMode}
						onKeyPress={enforceNumberValidationNoPeriod}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Period</label>
					<Select
						isDisabled={viewMode}
						style={{width: '100%'}}
						options={communicationPeriodOptions}
						onChange={onchangeCommRecordPeriod}
						value={commRecordPeriod}
					/>
				</Col>
			</Row>
		</>
	);
};

export default GoalTypeCommunicationRecord;
