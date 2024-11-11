import React, {useEffect, useState} from 'react';
import {Col, Container, ModalFooter, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../../../constants/Constants';
import {DefaultPrimaryButton, DefaultSecondaryButton, FormModal} from '../../../../../../custom-components';
import {useCurrenciesWithCode, useMasterReferenceOption} from '../../../../../../custom-functions';
import {GoalSettingCommons, MasterReference, MasterReferenceChild, SwalDetails, TransactionType} from '../../../../../system/components/constants/CampaignSetting';
import {GoalTypeGameActivityUdtModel} from '../../../models';
import {GoalTypeCommunicationRecordUdtModel} from '../../../models/GoalTypeCommunicationRecordUdtModel';
import {GoalTypeDepositCurrencyMinMaxUdtModel} from '../../../models/GoalTypeDepositCurrencyMinMaxUdtModel';
import {GoalTypeDepositUdtModel} from '../../../models/GoalTypeDepositUdtModel';
import {GoalTypeGameActivityCurrMinMaxUdtModel} from '../../../models/GoalTypeGameActivityCurrMinMaxUdtModel';
import {GoalTypeListConfigurationModel} from '../../../models/GoalTypeListConfigurationModel';
import GoalTypeCommunicationRecord from './GoalTypeCommunicationRecord';
import GoalTypeDeposit from './GoalTypeDeposit';
import GoalTypeGameActivity from './GoalTypeGameActivity';
interface Props {
	showForm: boolean;
	closeModal: () => void;
	action: string;
	goalTypeName: string;
	goalTypeGuidId: string;
	rowData: Array<GoalTypeListConfigurationModel>;
	setRowData: any;
	setCommunicationRecordTypeData: any; //Array<GoalTypeCommunicationRecordUdtModel>
	communicationRecordTypeData: Array<GoalTypeCommunicationRecordUdtModel>;
	setGameActivityTypeData: any;
	gameActivityTypeData: Array<GoalTypeGameActivityUdtModel>;
	setGameActivityTypeMinData: any;
	gameActivityTypeMinData: Array<GoalTypeGameActivityCurrMinMaxUdtModel>;
	setDepositTypeData: any;
	depositTypeData: Array<GoalTypeDepositUdtModel>;
	setDepositTypeMinMaxData: any;
	depositTypeMinMaxData: Array<GoalTypeDepositCurrencyMinMaxUdtModel>;
	goalTypeConfigId?: any;
	viewMode: boolean;
	actionPage?: string;
}
const AddEditGoalTypeConfigModal: React.FC<Props> = ({
	showForm,
	closeModal,
	action,
	goalTypeName,
	goalTypeGuidId,
	rowData,
	setRowData,
	setCommunicationRecordTypeData,
	communicationRecordTypeData,
	setGameActivityTypeData,
	gameActivityTypeData,
	setGameActivityTypeMinData,
	gameActivityTypeMinData,
	setDepositTypeData,
	depositTypeData,
	setDepositTypeMinMaxData,
	depositTypeMinMaxData,
	goalTypeConfigId,
	viewMode,
	actionPage,
}) => {
	//	Redux
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const masterReference = useMasterReferenceOption(`${MasterReference.GoalType}`);
	const [goalName, setGoalName] = useState<string | any>('');
	const [goalTypeNameModal, setGoalTypeNameModal] = useState<string | any>('');
	const [goalType, setGoalType] = useState<string | any>('');
	const [goalTypeOption, setGoalTypeOption] = useState<string | any>('');
	const [goalTypeCommunicationRecordUdtModel, setGoalTypeCommunicationRecordUdtModel] = useState<GoalTypeCommunicationRecordUdtModel>();
	const [goalTypeGameActivityUdtModel, setGoalTypeGameActivityUdtModel] = useState<GoalTypeGameActivityUdtModel>();
	const [goalTypeGameActivityCurrMinMaxUdtModelList, setGoalTypeGameActivityCurrMinMaxUdtModelList] = useState<
		Array<GoalTypeGameActivityCurrMinMaxUdtModel>
	>([]);
	const [existingGoalTypeList, setExistingGoalTypeList] = useState<Array<any>>([]);
	const [goalTypeDepositUdtModel, setGoalTypeDepositUdtModel] = useState<GoalTypeDepositUdtModel>();
	const [goalTypeDepositCurrencyMinMaxUdtModelList, setGoalTypeDepositCurrencyMinMaxUdtModelList] = useState<
		Array<GoalTypeDepositCurrencyMinMaxUdtModel>
	>([]);
	const [isMapped, setIsMapped] = useState<boolean | any>(false);
	const currencyList = useCurrenciesWithCode();
	const {id}: {id: number} = useParams();
	//Watchers
	useEffect(() => {
		if (showForm) {
			if (action === GoalSettingCommons.EDIT || action === GoalSettingCommons.VIEW) {
				if (goalTypeConfigId === 0) {
					const data = rowData.find((x) => x.goalTypeGuid === goalTypeGuidId);
					populateData(data);
					fillExistingGoalTypeList(data?.goalTypeName);
					switch (data?.goalName) {
						case GoalSettingCommons.COMMUNICATION_RECORD:
							setGoalTypeCommunicationRecordUdtModel(communicationRecordTypeData.find((x) => x.goalTypeGuid === goalTypeGuidId));
							break;
						case GoalSettingCommons.DEPOSIT:
							setGoalTypeDepositUdtModel(depositTypeData.find((x) => x.depositGuid === goalTypeGuidId));
							setGoalTypeDepositCurrencyMinMaxUdtModelList(depositTypeMinMaxData.filter((d) => d.depositGuid === goalTypeGuidId));
							break;
						case GoalSettingCommons.GAME_ACTIVITY:
							setGoalTypeGameActivityUdtModel(gameActivityTypeData.find((x) => x.goalTypeGuid === goalTypeGuidId));
							setGoalTypeGameActivityCurrMinMaxUdtModelList(gameActivityTypeMinData.filter((d) => d.goalTypeGuid === goalTypeGuidId));
							break;
					}
				} else {
					const data = rowData.find((x) => x.goalTypeCommunicationRecordDepositId === goalTypeConfigId);
					populateData(data);
					fillExistingGoalTypeList(data?.goalTypeName);
					switch (data?.goalName) {
						case GoalSettingCommons.COMMUNICATION_RECORD:
							setGoalTypeCommunicationRecordUdtModel(communicationRecordTypeData.find((x) => x.goalTypeCommunicationRecordId === goalTypeConfigId));
							break;
						case GoalSettingCommons.DEPOSIT:
							setGoalTypeDepositUdtModel(depositTypeData.find((x) => x.goalTypeDepositId === goalTypeConfigId));
							setGoalTypeDepositCurrencyMinMaxUdtModelList(depositTypeMinMaxData.filter((d) => d.goalTypeDepositId === goalTypeConfigId));
							break;
						case GoalSettingCommons.GAME_ACTIVITY:
							setGoalTypeGameActivityUdtModel(gameActivityTypeData.find((x) => x.goalTypeGameActivityId === goalTypeConfigId));
							setGoalTypeGameActivityCurrMinMaxUdtModelList(gameActivityTypeMinData.filter((d) => d.goalTypeGameActivityId === goalTypeConfigId));
							break;
					}
				}
			} else if (action === GoalSettingCommons.ADD) {
				fillExistingGoalTypeList(undefined);
				clearFields();
			}
		} else {
			setGoalTypeCommunicationRecordUdtModel(undefined);
			setGoalTypeDepositUdtModel(undefined);
			setGoalTypeDepositCurrencyMinMaxUdtModelList([]);
			setGoalTypeGameActivityUdtModel(undefined);
			setGoalTypeGameActivityCurrMinMaxUdtModelList([]);
			clearFields();
		}
	}, [showForm]);
	useEffect(() => {
		const countMappedGoal = existingGoalTypeList.filter(
			(x) =>
				(goalTypeConfigId !== 0 && x.data.intervalSourceGoalTypeId === goalTypeConfigId) ||
				(goalTypeConfigId === 0 && x.data.intervalSourceGoalTypeName === goalTypeNameModal && x.data.goalTypeName !== goalTypeNameModal)
		).length;
		setIsMapped(countMappedGoal > 0);
	}, [existingGoalTypeList]);
	//Events
	const fillExistingGoalTypeList = (name: string | undefined) => {
		var results = rowData
			.filter((d) => !name || d.goalTypeName !== name)
			.map((item) => {
				return {value: item.goalTypeCommunicationRecordDepositId.toString(), label: item.goalTypeName, data: item};
			});
		const data: GoalTypeListConfigurationModel = {
			campaignSettingId: actionPage === 'edit' ? +id : 0,
			createdBy: userAccessId.toString(),
			goalTypeCommunicationRecordDepositId: 0,
			goalTypeDataSourceName: '',
			goalTypeDataSourceId: 0,
			goalTypeId: goalType ? goalType.value : 0,
			goalName: goalType ? goalType.label : '',
			goalTypePeriodName: '',
			updatedBy: userAccessId.toString(),
			goalTypeGuid: goalTypeGuidId,
			goalTypeName: goalName,
			thresholdTypeId: 0,

			//to  add mapped values here
			intervalRelationalOperatorId: 0,
			intervalRelationalOperatorName: '',
			intervalSourceId: 0,
			intervalSourceName: '',
			intervalNumber: 0,
			goalTypeTransactionTypeId: 0,
			intervalSourceGoalTypeId: 0, // <--- pass the assigned previous goal type id here
			intervalSourceGoalTypeName: '', // <--- pass the assigned previous goal type here
		};
		results.unshift({value: '0', label: 'static', data: data});
		setExistingGoalTypeList(results);
	};
	const clearFields = () => {
		setGoalName('');
		setGoalTypeNameModal('');
		setGoalType(null);
		setGoalTypeOption(null);
	};

	const onchangeGoalType = (val: string | any) => {
		setGoalType(val);
		setGoalTypeOption(val.label);
	};
	const onChangeGoalName = (val: string | any) => {
		setGoalName(val.target.value);
		setGoalTypeNameModal(val.target.value);
	};

	const submitGoalType = () => {
		if (_validateNthNumber()) {
			swal(SwalDetails.ErrorTitle, SwalDetails.ErrorNthNumber, SwalDetails.ErrorIcon);
		} else if (_validateMinMax()) {
			swal(SwalDetails.ErrorTitle, SwalDetails.ErrorMinMaxText, SwalDetails.ErrorIcon);
		} else if (_validate() === true) {
			swal(SwalDetails.ErrorTitle, SwalDetails.ErrorMandatoryText, SwalDetails.ErrorIcon);
		} else if (existingGoalTypeList.find((x) => x.label.toLowerCase() === goalTypeNameModal.toLowerCase().trim())) {
			swal(SwalDetails.ErrorTitle, SwalDetails.DuplicateGoalType, SwalDetails.ErrorIcon);
		} else {
			if (action === GoalSettingCommons.ADD) {
				const goalTypeListConfigurationModel: GoalTypeListConfigurationModel = {
					campaignSettingId: actionPage === 'edit' ? +id : 0,
					createdBy: userAccessId.toString(),
					goalTypeCommunicationRecordDepositId: 0,
					goalTypeDataSourceName: '',
					goalTypeId: goalType.value,
					goalName: goalType.label,
					goalTypePeriodName: '',
					updatedBy: userAccessId.toString(),
					goalTypeGuid: goalTypeGuidId,
					goalTypeName: goalTypeNameModal,
					thresholdTypeId: 0,

					intervalRelationalOperatorId: 0,
					intervalRelationalOperatorName: '',
					intervalSourceId: 0,
					intervalSourceName: '',
					intervalNumber: 0,
					intervalSourceGoalTypeId: 0, // <--- pass the assigned previous goal type id here
					intervalSourceGoalTypeName: '', // <--- pass the assigned previous goal type here
					goalTypeDataSourceId: 0,
					goalTypeTransactionTypeId: 0,
				};

				const addSubmitGoalTypeIsGoalTypeCommRecord = _isGoalTypeCommunicationRecord();
				if (addSubmitGoalTypeIsGoalTypeCommRecord) {
					//	Assign newly added value
					const goalTypeCommunicationRecordModel: GoalTypeCommunicationRecordUdtModel = {
						goalTypeCommunicationRecordId: 0,
						goalTypeId: goalType.value,
						goalName: goalType.label,
						goalTypeName: goalTypeNameModal,
						campaignSettingId: actionPage === 'edit' ? +id : 0,
						messageTypeId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.messageTypeId : 0,
						messageStatusId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.messageStatusId : 0,
						goalTypeDataSourceId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceId : 0,
						goalTypeDataSourceName: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceName : '',
						goalTypePeriodId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.goalTypePeriodId : 0,
						goalTypePeriodName: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.goalTypePeriodName : '',
						createdBy: userAccessId,
						updatedBy: userAccessId,
						intervalRelationalOperatorId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorId : 0,
						intervalRelationalOperatorName: goalTypeCommunicationRecordUdtModel
							? goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorName
							: '',
						intervalSourceId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalSourceId : 0,
						intervalSourceName: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalSourceName : '',
						intervalNumber: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalNumber : 0,
						intervalSourceGoalTypeId: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeId : 0,
						intervalSourceGoalTypeName: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeName : '',
						intervalSourceGoalTypeGUID: goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeGUID : '',
						goalTypeGuid: goalTypeGuidId,
					};
					communicationRecordTypeData.push(goalTypeCommunicationRecordModel);
					setCommunicationRecordTypeData(communicationRecordTypeData);

					goalTypeListConfigurationModel.goalTypeDataSourceName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel.goalTypeDataSourceName
						: '';
					goalTypeListConfigurationModel.goalTypePeriodName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel.goalTypePeriodName
						: '';
					goalTypeListConfigurationModel.goalTypeGuid = goalTypeGuidId;
					goalTypeListConfigurationModel.goalTypeName = goalTypeNameModal;

					goalTypeListConfigurationModel.intervalRelationalOperatorId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorId
						: 0;
					goalTypeListConfigurationModel.intervalRelationalOperatorName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorName
						: '';
					goalTypeListConfigurationModel.intervalSourceId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceId
						: 0;
					goalTypeListConfigurationModel.intervalSourceName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceName
						: '';
					goalTypeListConfigurationModel.intervalNumber = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalNumber
						: 0;
					goalTypeListConfigurationModel.intervalSourceGoalTypeId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeId
						: 0;
					goalTypeListConfigurationModel.intervalSourceGoalTypeName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeName
						: '';
					goalTypeListConfigurationModel.goalTypeDataSourceId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceId
						: 0;
					goalTypeListConfigurationModel.thresholdTypeId = null;

					setRowData([...rowData, ...[goalTypeListConfigurationModel]]);
					// setCommunicationRecordTypeData([...communicationRecordTypeData, ...[goalTypeCommunicationRecordUdtModel]]);
				}

				if (goalTypeOption === GoalSettingCommons.GAME_ACTIVITY) {
					//	Assign newly added value to game activity
					const goalTypeGameActvityModel: GoalTypeGameActivityUdtModel = {
						goalTypeGameActivityId: 0,
						goalTypeName: goalTypeNameModal,
						goalTypeId: goalType.value,
						campaignSettingId: actionPage === 'edit' ? +id : 0,
						goalTypeTransactionTypeId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypeTransactionTypeId : 0,
						goalTypeProductId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypeProductId : '',
						goalTypeProductIds: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypeProductIds : '',
						thresholdTypeId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.thresholdTypeId : 0,
						goalTypeDataSourceId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypeDataSourceId : 0,
						goalTypeDataSourceName: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypeDataSourceName : '',
						goalTypePeriodId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypePeriodId : 0,
						goalTypePeriodName: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypePeriodName : '',
						intervalRelationalOperatorId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalRelationalOperatorId : 0,
						intervalRelationalOperatorName: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalRelationalOperatorName : '',
						intervalSourceId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalSourceId : 0,
						intervalSourceName: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalSourceName : '',
						intervalNumber: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalNumber : 0,
						createdBy: userAccessId,
						updatedBy: userAccessId,
						goalTypeGuid: goalTypeGuidId,
						intervalSourceGoalTypeId: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalSourceGoalTypeId : 0,
						intervalSourceGoalTypeGUID: goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.intervalSourceGoalTypeGUID : '',
						goalName: goalType.label,
					};

					gameActivityTypeData.push(goalTypeGameActvityModel);
					setGameActivityTypeData(gameActivityTypeData);

					goalTypeListConfigurationModel.goalTypeDataSourceName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel.goalTypeDataSourceName
						: '';
					goalTypeListConfigurationModel.goalTypePeriodName = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.goalTypePeriodName : '';
					goalTypeListConfigurationModel.goalTypeGuid = goalTypeGuidId;

					goalTypeListConfigurationModel.intervalRelationalOperatorId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalRelationalOperatorId
						: 0;
					goalTypeListConfigurationModel.intervalRelationalOperatorName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalRelationalOperatorName
						: '';
					goalTypeListConfigurationModel.intervalSourceId = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.intervalSourceId : 0;
					goalTypeListConfigurationModel.intervalSourceName = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.intervalSourceName : '';
					goalTypeListConfigurationModel.intervalNumber = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.intervalNumber : 0;
					goalTypeListConfigurationModel.intervalSourceGoalTypeId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalSourceGoalTypeId
						: 0;
					goalTypeListConfigurationModel.intervalSourceGoalTypeName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalSourceGoalTypeName
						: '';
					goalTypeListConfigurationModel.goalTypeDataSourceId = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.goalTypeDataSourceId : 0;
					goalTypeListConfigurationModel.goalTypeTransactionTypeId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel.goalTypeTransactionTypeId
						: 0;

					goalTypeListConfigurationModel.thresholdTypeId = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.thresholdTypeId : 0;

					setRowData([...rowData, ...[goalTypeListConfigurationModel]]);

					setGameActivityTypeMinData([...gameActivityTypeMinData, ...goalTypeGameActivityCurrMinMaxUdtModelList]);
				}
				if (goalTypeOption === GoalSettingCommons.DEPOSIT) {
					const goalTypeDepositModel: GoalTypeDepositUdtModel = {
						goalTypeDepositId: 0,
						goalTypeName: goalTypeNameModal,
						goalTypeId: goalType.value,
						campaignSettingId: actionPage === 'edit' ? +id : 0,
						goalTypeTransactionTypeId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypeTransactionTypeId : 0,
						goalTypeDataSourceId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypeDataSourceId : 0,
						goalTypeDataSourceName: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypeDataSourceName : '',
						goalTypePeriodId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypePeriodId : 0,
						goalTypePeriodName: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypePeriodName : '',
						createdBy: userAccessId,
						updatedBy: userAccessId,
						intervalRelationalOperatorId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalRelationalOperatorId : 0,
						intervalRelationalOperatorName: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalRelationalOperatorName : '',
						intervalSourceId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceId : 0,
						intervalSourceName: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceName : '',
						intervalNumber: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalNumber : 0,
						nthNumber: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.nthNumber : 0,
						thresholdTypeId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.thresholdTypeId : 0,
						intervalSourceGoalTypeId: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceGoalTypeId : 0,
						intervalSourceGoalTypeGUID: goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceGoalTypeGUID : '',
						goalName: goalType.label,
						depositGuid: goalTypeGuidId,
					};
					depositTypeData.push(goalTypeDepositModel);
					setDepositTypeData(depositTypeData);

					goalTypeListConfigurationModel.goalTypeDataSourceName = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypeDataSourceName : '';
					goalTypeListConfigurationModel.goalTypePeriodName = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypePeriodName : '';
					goalTypeListConfigurationModel.goalTypeGuid = goalTypeGuidId;

					goalTypeListConfigurationModel.intervalRelationalOperatorId = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel.intervalRelationalOperatorId
						: 0;
					goalTypeListConfigurationModel.intervalRelationalOperatorName = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel.intervalRelationalOperatorName
						: '';
					goalTypeListConfigurationModel.intervalSourceId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceId : 0;
					goalTypeListConfigurationModel.intervalSourceName = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceName : '';
					goalTypeListConfigurationModel.intervalNumber = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalNumber : 0;
					goalTypeListConfigurationModel.intervalSourceGoalTypeId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.intervalSourceGoalTypeId : 0;
					goalTypeListConfigurationModel.intervalSourceGoalTypeName = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel.intervalSourceGoalTypeName
						: '';
					goalTypeListConfigurationModel.goalTypeDataSourceId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypeDataSourceId : 0;
					goalTypeListConfigurationModel.goalTypeTransactionTypeId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.goalTypeTransactionTypeId : 0;
					goalTypeListConfigurationModel.thresholdTypeId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.thresholdTypeId : 0;

					setRowData([...rowData, ...[goalTypeListConfigurationModel]]);

					setDepositTypeMinMaxData([...depositTypeMinMaxData, ...goalTypeDepositCurrencyMinMaxUdtModelList]);
				}
			}

			if (action === GoalSettingCommons.EDIT) {
				const goalTypeListConfigurationEditedModel: GoalTypeListConfigurationModel = {
					campaignSettingId: actionPage === 'edit' ? +id : 0,
					createdBy: userAccessId.toString(),
					goalTypeCommunicationRecordDepositId: 0,
					goalTypeDataSourceName: '',
					goalTypeId: goalType.value,
					goalName: goalType.label,
					goalTypePeriodName: '',
					updatedBy: userAccessId.toString(),
					goalTypeGuid: goalTypeGuidId,
					goalTypeName: goalTypeNameModal,
					thresholdTypeId: 0,

					intervalRelationalOperatorId: 0,
					intervalRelationalOperatorName: '',
					intervalSourceId: 0,
					intervalSourceName: '',
					intervalNumber: 0,
					intervalSourceGoalTypeId: 0,
					intervalSourceGoalTypeName: '',
					goalTypeDataSourceId: 0,
					goalTypeTransactionTypeId: 0,
				};

				const editSubmitGoalTypeIsGoalTypeCommRecord = _isGoalTypeCommunicationRecord();

				if (editSubmitGoalTypeIsGoalTypeCommRecord) {
					goalTypeListConfigurationEditedModel.goalTypeDataSourceName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceName
						: '';
					goalTypeListConfigurationEditedModel.campaignSettingId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.campaignSettingId
						: 0;
					goalTypeListConfigurationEditedModel.createdBy = userAccessId.toString();
					goalTypeListConfigurationEditedModel.goalName = goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.goalName : '';
					goalTypeListConfigurationEditedModel.goalTypeCommunicationRecordDepositId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.goalTypeCommunicationRecordId
						: 0;
					goalTypeListConfigurationEditedModel.goalTypeDataSourceId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceId
						: 0;
					goalTypeListConfigurationEditedModel.goalTypeGuid = goalTypeGuidId;
					goalTypeListConfigurationEditedModel.goalTypeId = goalTypeCommunicationRecordUdtModel ? goalTypeCommunicationRecordUdtModel?.goalTypeId : 0;
					goalTypeListConfigurationEditedModel.goalTypePeriodName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.goalTypePeriodName
						: '';
					goalTypeListConfigurationEditedModel.intervalNumber = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalNumber
						: 0;
					goalTypeListConfigurationEditedModel.intervalRelationalOperatorId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorId
						: 0;
					goalTypeListConfigurationEditedModel.intervalRelationalOperatorName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorName
						: '';
					goalTypeListConfigurationEditedModel.intervalSourceGoalTypeId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeId
						: 0;
					goalTypeListConfigurationEditedModel.intervalSourceGoalTypeName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceGoalTypeName
						: '';
					goalTypeListConfigurationEditedModel.intervalSourceId = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceId
						: 0;
					goalTypeListConfigurationEditedModel.intervalSourceName = goalTypeCommunicationRecordUdtModel
						? goalTypeCommunicationRecordUdtModel?.intervalSourceName
						: '';
					goalTypeListConfigurationEditedModel.updatedBy = userAccessId.toString();
					goalTypeListConfigurationEditedModel.thresholdTypeId = null;

					if (goalTypeConfigId === 0) {
						const updatedRowData = rowData.filter((x) => x.goalTypeGuid !== goalTypeGuidId);
						setRowData([...updatedRowData, goalTypeListConfigurationEditedModel]);

						const updatedCommunicationRecordTypeData = communicationRecordTypeData.filter((d) => d.goalTypeGuid !== goalTypeGuidId);
						setCommunicationRecordTypeData([...updatedCommunicationRecordTypeData, ...[goalTypeCommunicationRecordUdtModel]]);
					} else {
						const updatedRowData = rowData.filter((x) => x.goalTypeCommunicationRecordDepositId !== goalTypeConfigId);
						setRowData([...updatedRowData, goalTypeListConfigurationEditedModel]);

						const updatedCommunicationRecordTypeData = communicationRecordTypeData.filter(
							(d) => d.goalTypeCommunicationRecordId !== goalTypeConfigId
						);
						setCommunicationRecordTypeData([...updatedCommunicationRecordTypeData, ...[goalTypeCommunicationRecordUdtModel]]);
					}
				}

				if (goalTypeOption === GoalSettingCommons.DEPOSIT) {
					goalTypeListConfigurationEditedModel.goalTypeDataSourceName = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel?.goalTypeDataSourceName
						: '';
					goalTypeListConfigurationEditedModel.campaignSettingId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.campaignSettingId : 0;
					goalTypeListConfigurationEditedModel.createdBy = userAccessId.toString();
					goalTypeListConfigurationEditedModel.goalName = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.goalName : '';
					goalTypeListConfigurationEditedModel.goalTypeCommunicationRecordDepositId = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel?.goalTypeDepositId
						: 0;
					goalTypeListConfigurationEditedModel.goalTypeDataSourceId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.goalTypeDataSourceId : 0;
					goalTypeListConfigurationEditedModel.goalTypeGuid = goalTypeGuidId;
					goalTypeListConfigurationEditedModel.goalTypeId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.goalTypeId : 0;
					goalTypeListConfigurationEditedModel.goalTypePeriodName = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.goalTypePeriodName : '';
					goalTypeListConfigurationEditedModel.intervalNumber = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.intervalNumber : 0;
					goalTypeListConfigurationEditedModel.intervalRelationalOperatorId = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel?.intervalRelationalOperatorId
						: 0;
					goalTypeListConfigurationEditedModel.intervalRelationalOperatorName = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel?.intervalRelationalOperatorName
						: '';
					goalTypeListConfigurationEditedModel.intervalSourceGoalTypeId = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel?.intervalSourceGoalTypeId
						: 0;
					goalTypeListConfigurationEditedModel.intervalSourceGoalTypeName = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel?.intervalSourceGoalTypeName
						: '';
					goalTypeListConfigurationEditedModel.intervalSourceId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.intervalSourceId : 0;
					goalTypeListConfigurationEditedModel.intervalSourceName = goalTypeDepositUdtModel ? goalTypeDepositUdtModel?.intervalSourceName : '';
					goalTypeListConfigurationEditedModel.updatedBy = userAccessId.toString();

					goalTypeListConfigurationEditedModel.goalTypeTransactionTypeId = goalTypeDepositUdtModel
						? goalTypeDepositUdtModel.goalTypeTransactionTypeId
						: 0;

					goalTypeListConfigurationEditedModel.thresholdTypeId = goalTypeDepositUdtModel ? goalTypeDepositUdtModel.thresholdTypeId : 0;

					if (goalTypeConfigId === 0) {
						const updatedRowData = rowData.filter((x) => x.goalTypeGuid !== goalTypeGuidId);
						setRowData([...updatedRowData, goalTypeListConfigurationEditedModel]);

						const updatedDepositTypeData = depositTypeData.filter((d) => d.depositGuid !== goalTypeGuidId);
						setDepositTypeData([...updatedDepositTypeData, ...[goalTypeDepositUdtModel]]);

						const updatedDepositTypeMinMaxData = depositTypeMinMaxData.filter((d) => d.depositGuid !== goalTypeGuidId);
						setDepositTypeMinMaxData([...updatedDepositTypeMinMaxData, ...goalTypeDepositCurrencyMinMaxUdtModelList]);
					} else {
						const updatedRowData = rowData.filter((x) => x.goalTypeCommunicationRecordDepositId !== goalTypeConfigId);
						setRowData([...updatedRowData, goalTypeListConfigurationEditedModel]);

						const updatedDepositTypeData = depositTypeData.filter((d) => d.goalTypeDepositId !== goalTypeConfigId);
						setDepositTypeData([...updatedDepositTypeData, ...[goalTypeDepositUdtModel]]);

						const updatedDepositTypeMinMaxData = depositTypeMinMaxData.filter((d) => d.goalTypeDepositId !== goalTypeConfigId);
						setDepositTypeMinMaxData([...updatedDepositTypeMinMaxData, ...goalTypeDepositCurrencyMinMaxUdtModelList]);
					}
				}

				if (goalTypeOption === GoalSettingCommons.GAME_ACTIVITY) {
					goalTypeListConfigurationEditedModel.goalTypeDataSourceName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.goalTypeDataSourceName
						: '';
					goalTypeListConfigurationEditedModel.campaignSettingId = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.campaignSettingId : 0;
					goalTypeListConfigurationEditedModel.createdBy = userAccessId.toString();
					goalTypeListConfigurationEditedModel.goalName = goalType ? goalType.label : '';
					goalTypeListConfigurationEditedModel.goalTypeCommunicationRecordDepositId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.goalTypeGameActivityId
						: 0;
					goalTypeListConfigurationEditedModel.goalTypeDataSourceId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.goalTypeDataSourceId
						: 0;

					goalTypeListConfigurationEditedModel.goalTypeDataSourceName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.goalTypeDataSourceName
						: '';
					goalTypeListConfigurationEditedModel.goalTypeGuid = goalTypeGuidId;
					goalTypeListConfigurationEditedModel.goalTypeId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.goalTypeId
						: goalType
						? goalType.value
						: 0;
					goalTypeListConfigurationEditedModel.goalTypePeriodName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.goalTypePeriodName
						: '';
					goalTypeListConfigurationEditedModel.intervalNumber = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.intervalNumber : 0;
					goalTypeListConfigurationEditedModel.intervalRelationalOperatorId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalRelationalOperatorId
						: 0;
					goalTypeListConfigurationEditedModel.intervalRelationalOperatorName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalRelationalOperatorName
						: '';
					goalTypeListConfigurationEditedModel.intervalSourceGoalTypeId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalSourceGoalTypeId
						: 0;
					goalTypeListConfigurationEditedModel.intervalSourceGoalTypeName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalSourceGoalTypeName
						: '';
					goalTypeListConfigurationEditedModel.intervalSourceId = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel?.intervalSourceId : 0;
					goalTypeListConfigurationEditedModel.intervalSourceName = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel?.intervalSourceName
						: '';
					goalTypeListConfigurationEditedModel.updatedBy = userAccessId.toString();

					goalTypeListConfigurationEditedModel.goalTypeTransactionTypeId = goalTypeGameActivityUdtModel
						? goalTypeGameActivityUdtModel.goalTypeTransactionTypeId
						: 0;

					goalTypeListConfigurationEditedModel.thresholdTypeId = goalTypeGameActivityUdtModel ? goalTypeGameActivityUdtModel.thresholdTypeId : 0;

					if (goalTypeConfigId === 0) {
						const updatedRowData = rowData.filter((x) => x.goalTypeGuid !== goalTypeGuidId);
						setRowData([...updatedRowData, goalTypeListConfigurationEditedModel]);

						const updatedGameActivityTypeData = gameActivityTypeData.filter((d) => d.goalTypeGuid !== goalTypeGuidId);
						setGameActivityTypeData([...updatedGameActivityTypeData, ...[goalTypeGameActivityUdtModel]]);

						const updatedGameActivityTypeMinMaxData = gameActivityTypeMinData.filter((d) => d.goalTypeGuid !== goalTypeGuidId);
						setGameActivityTypeMinData([...updatedGameActivityTypeMinMaxData, ...goalTypeGameActivityCurrMinMaxUdtModelList]);
					} else {
						const updatedRowData = rowData.filter((x) => x.goalTypeCommunicationRecordDepositId !== goalTypeConfigId);
						setRowData([...updatedRowData, goalTypeListConfigurationEditedModel]);

						const updatedGameActivityTypeData = gameActivityTypeData.filter((d) => d.goalTypeGameActivityId !== goalTypeConfigId);
						setGameActivityTypeData([...updatedGameActivityTypeData, ...[goalTypeGameActivityUdtModel]]);

						const updatedGameActivityTypeMinMaxData = gameActivityTypeMinData.filter((d) => d.goalTypeGameActivityId !== goalTypeConfigId);
						setGameActivityTypeMinData([...updatedGameActivityTypeMinMaxData, ...goalTypeGameActivityCurrMinMaxUdtModelList]);
					}
				}
			}
			closeModal();
		}
	};

	const populateData = (data: any) => {
		if (data) {
			setGoalName(data.goalTypeName);
			setGoalTypeNameModal(data.goalTypeName);
			const goalTypeOption = masterReference
				.filter((obj) => obj.masterReferenceParentId === MasterReference.GoalType)
				.map((obj) => obj.options)
				.find((o) => o.value === data.goalTypeId.toString());
			setGoalType(goalTypeOption);
			setGoalTypeOption(goalTypeOption?.label);
		}
	};

	const _validate = () => {
		let isError: boolean = false;

		if (goalType.value === '' || goalType.value === undefined) {
			return true;
		}

		if (goalTypeNameModal === '' || goalTypeNameModal === undefined || goalTypeNameModal === null) {
			return true;
		}

		const validateIsGoalTypeCommRecord = _isGoalTypeCommunicationRecord();
		if (validateIsGoalTypeCommRecord) {
			if (goalTypeCommunicationRecordUdtModel?.messageTypeId === 0 || goalTypeCommunicationRecordUdtModel?.messageTypeId === undefined) {
				return true;
			}
			if (
				goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceId === 0 ||
				goalTypeCommunicationRecordUdtModel?.goalTypeDataSourceId === undefined
			) {
				return true;
			}
			if (goalTypeCommunicationRecordUdtModel?.goalTypePeriodId === 0 || goalTypeCommunicationRecordUdtModel?.goalTypePeriodId === undefined) {
				return true;
			}
			if (
				goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId != MasterReferenceChild.OnorAfter &&
				goalTypeCommunicationRecordUdtModel.intervalRelationalOperatorId != MasterReferenceChild.OnorBefore &&
				(goalTypeCommunicationRecordUdtModel?.intervalNumber === 0 || goalTypeCommunicationRecordUdtModel?.intervalNumber === undefined)
			) {
				return true;
			}
			if (
				goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorId === 0 ||
				goalTypeCommunicationRecordUdtModel?.intervalRelationalOperatorId === undefined
			) {
				return true;
			}
			if (
				(goalTypeCommunicationRecordUdtModel?.intervalSourceId === 0 || goalTypeCommunicationRecordUdtModel?.intervalSourceId === undefined) &&
				goalTypeCommunicationRecordUdtModel?.intervalSourceName === ''
			) {
				return true;
			}
			if (goalTypeCommunicationRecordUdtModel?.messageStatusId === 0 || goalTypeCommunicationRecordUdtModel?.messageStatusId === undefined) {
				return true;
			}
		}

		if (goalTypeOption === GoalSettingCommons.DEPOSIT) {
			if (goalTypeDepositUdtModel?.goalTypeTransactionTypeId === 0 || goalTypeDepositUdtModel?.goalTypeTransactionTypeId === undefined) {
				return true;
			}

			if (
				goalTypeDepositUdtModel?.goalTypeTransactionTypeId == MasterReferenceChild.NthNextDeposit &&
				(goalTypeDepositUdtModel?.nthNumber === 0 || goalTypeDepositUdtModel?.nthNumber === undefined)
			) {
				return true;
			}

			if (
				goalTypeDepositUdtModel?.goalTypeTransactionTypeId == MasterReferenceChild.TotalDeposit &&
				(goalTypeDepositUdtModel?.thresholdTypeId === 0 || goalTypeDepositUdtModel?.thresholdTypeId === undefined)
			) {
				return true;
			}

			if (goalTypeDepositUdtModel?.goalTypeDataSourceId === 0 || goalTypeDepositUdtModel?.goalTypeDataSourceId === undefined) {
				return true;
			}
			if (goalTypeDepositUdtModel?.intervalRelationalOperatorId === 0 || goalTypeDepositUdtModel?.intervalRelationalOperatorId === undefined) {
				return true;
			}
			if (
				(goalTypeDepositUdtModel?.intervalSourceId === 0 || goalTypeDepositUdtModel?.intervalSourceId === undefined) &&
				goalTypeDepositUdtModel?.intervalSourceName === ''
			) {
				return true;
			}
			if (
				goalTypeDepositUdtModel.intervalRelationalOperatorId != MasterReferenceChild.OnorAfter &&
				goalTypeDepositUdtModel.intervalRelationalOperatorId != MasterReferenceChild.OnorBefore &&
				(goalTypeDepositUdtModel?.intervalNumber === 0 || goalTypeDepositUdtModel?.intervalNumber === undefined)
			) {
				return true;
			}
			if (goalTypeDepositUdtModel?.goalTypePeriodId === 0 || goalTypeDepositUdtModel?.goalTypePeriodId === undefined) {
				return true;
			}
			if (currencyList.length !== goalTypeDepositCurrencyMinMaxUdtModelList.filter((obj: any) => obj.depositGuid === goalTypeGuidId).length) {
				return true;
			}

			let minNan = goalTypeDepositCurrencyMinMaxUdtModelList.filter(
				(obj: any) => (obj.min.toString().toString() === 'NaN' || obj.min === 0) && obj.depositGuid === goalTypeGuidId
			);

			if (minNan.length !== 0) {
				return true;
			}

			if(goalTypeDepositUdtModel?.goalTypeTransactionTypeId.toString() !== TransactionType.TotalDeposit) {
				let maxNan = goalTypeDepositCurrencyMinMaxUdtModelList.filter(
					(obj: any) => (obj.max.toString() === 'NaN' || obj.max === 0) && obj.depositGuid === goalTypeGuidId
				);
				if (maxNan.length !== 0) {
					return true;
				}
			}
		}
		if (goalTypeOption === GoalSettingCommons.GAME_ACTIVITY) {
			if (goalTypeGameActivityUdtModel?.goalTypeTransactionTypeId === 0 || goalTypeGameActivityUdtModel?.goalTypeTransactionTypeId === undefined) {
				return true;
			}

			if (goalTypeGameActivityUdtModel?.goalTypeProductId === '' || goalTypeGameActivityUdtModel?.goalTypeProductId === undefined) {
				return true;
			}

			if (goalTypeGameActivityUdtModel?.thresholdTypeId === 0 || goalTypeGameActivityUdtModel?.thresholdTypeId === undefined) {
				return true;
			}

			if (goalTypeGameActivityUdtModel?.goalTypeDataSourceId === 0 || goalTypeGameActivityUdtModel?.goalTypeDataSourceId === undefined) {
				return true;
			}
			if (
				goalTypeGameActivityUdtModel?.intervalRelationalOperatorId === 0 ||
				goalTypeGameActivityUdtModel?.intervalRelationalOperatorId === undefined
			) {
				return true;
			}
			if (goalTypeGameActivityUdtModel?.intervalSourceId === 0 || goalTypeGameActivityUdtModel?.intervalSourceId === undefined) {
				return true;
			}
			if (
				goalTypeGameActivityUdtModel.intervalRelationalOperatorId != MasterReferenceChild.OnorAfter &&
				goalTypeGameActivityUdtModel.intervalRelationalOperatorId != MasterReferenceChild.OnorBefore &&
				(goalTypeGameActivityUdtModel?.intervalNumber === 0 || goalTypeGameActivityUdtModel?.intervalNumber === undefined)
			) {
				return true;
			}
			if (goalTypeGameActivityUdtModel?.goalTypePeriodId === 0 || goalTypeGameActivityUdtModel?.goalTypePeriodId === undefined) {
				return true;
			}

			if (currencyList.length !== goalTypeGameActivityCurrMinMaxUdtModelList.filter((obj: any) => obj.goalTypeGuid === goalTypeGuidId).length) {
				return true;
			}

			let minNan = goalTypeGameActivityCurrMinMaxUdtModelList.filter(
				(obj: any) => (obj.min.toString().toString() === 'NaN' || obj.min === 0) && obj.goalTypeGuid === goalTypeGuidId
			);

			if (minNan.length !== 0) {
				return true;
			}
		}
		return isError;
	};
	const _validateNthNumber = () => {
		let isError = false;
		if (goalTypeOption === GoalSettingCommons.DEPOSIT) {
			if (
				goalTypeDepositUdtModel?.goalTypeTransactionTypeId == MasterReferenceChild.NthNextDeposit &&
				(goalTypeDepositUdtModel?.nthNumber === 0 || goalTypeDepositUdtModel?.nthNumber === undefined)
			) {
				return true;
			}
		}
		return isError;
	};
	const _validateMinMax = () => {
		let isError = false;
		if (goalTypeOption === GoalSettingCommons.DEPOSIT && goalTypeDepositUdtModel?.goalTypeTransactionTypeId.toString() !== TransactionType.TotalDeposit) {
			let validMinMax = goalTypeDepositCurrencyMinMaxUdtModelList.filter((obj: any) => obj.max < obj.min && obj.depositGuid === goalTypeGuidId);

			if (validMinMax.length !== 0) {
				return true;
			}
		}
		return isError;
	};

	const _isGoalTypeCommunicationRecord = () => {
		return goalTypeOption === GoalSettingCommons.COMMUNICATION_RECORD;
	}

	const onCloseModal = () => {
		if (action === GoalSettingCommons.VIEW) {
			closeModal();
		} else {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((toConfirm) => {
				if (toConfirm) {
					closeModal();
				}
			});
		}
	};
	return (
		<FormModal headerTitle={action + ' Goal Type'} haveFooter={false} show={showForm}>
			<Container>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label className='form-label-sm required'>Goal Type Name</label>
						<input
							type='text'
							className='form-control form-control-sm'
							aria-label='{c.currencCode} Min'
							min='1'
							value={goalTypeNameModal}
							onChange={onChangeGoalName}
							disabled={viewMode || isMapped}
						/>
					</Col>
					<Col sm={12}>
						<label className='form-label-sm required'>Goal Type</label>
						<Select
							style={{width: '100%'}}
							options={masterReference.filter((obj) => obj.masterReferenceParentId === MasterReference.GoalType).map((obj) => obj.options)}
							onChange={onchangeGoalType}
							value={goalType}
							isDisabled={viewMode || isMapped}
						/>
					</Col>
				</Row>
				{goalTypeOption === '' ? null : (
					<>
						{goalTypeOption === GoalSettingCommons.COMMUNICATION_RECORD ? (
							<GoalTypeCommunicationRecord
								setGoalTypeCommunicationRecordUdtModel={setGoalTypeCommunicationRecordUdtModel}
								goalTypeCommunicationRecordUdtModel={goalTypeCommunicationRecordUdtModel}
								goalType={goalType}
								existingGoalTypeList={existingGoalTypeList}
								action={action}
								viewMode={viewMode}
								actionPage={actionPage}
								isMapped={isMapped}
							></GoalTypeCommunicationRecord>
						) : (
							<></>
						)}
						{goalTypeOption === GoalSettingCommons.GAME_ACTIVITY ? (
							<GoalTypeGameActivity
								goalTypeGuidId={goalTypeGuidId}
								goalTypeGameActivityUdtModel={goalTypeGameActivityUdtModel}
								setGoalTypeGameActivityUdtModel={setGoalTypeGameActivityUdtModel}
								setGoalTypeGameActivityCurrMinMaxUdtModelList={setGoalTypeGameActivityCurrMinMaxUdtModelList}
								goalTypeGameActivityCurrMinMaxUdtModelList={goalTypeGameActivityCurrMinMaxUdtModelList}
								existingGoalTypeList={existingGoalTypeList}
								action={action}
								viewMode={viewMode}
								isMapped={isMapped}
							></GoalTypeGameActivity>
						) : (
							<></>
						)}
						{goalTypeOption === GoalSettingCommons.DEPOSIT ? (
							<GoalTypeDeposit
								goalTypeGuidId={goalTypeGuidId}
								existingGoalTypeList={existingGoalTypeList}
								action={action}
								goalTypeDepositUdtModel={goalTypeDepositUdtModel}
								setGoalTypeDepositUdtModel={setGoalTypeDepositUdtModel}
								goalTypeDepositCurrencyMinMaxUdtModelList={goalTypeDepositCurrencyMinMaxUdtModelList}
								setGoalTypeDepositCurrencyMinMaxUdtModelList={setGoalTypeDepositCurrencyMinMaxUdtModelList}
								viewMode={viewMode}
								goalType={goalType}
								isMapped={isMapped}
							></GoalTypeDeposit>
						) : (
							<></>
						)}
					</>
				)}
			</Container>
			<ModalFooter style={{border: 0}}>
				{!viewMode ? (
					<>
						<DefaultPrimaryButton title={'Submit'} access={true} onClick={submitGoalType} />
					</>
				) : (
					<></>
				)}

				<DefaultSecondaryButton access={true} title={'Close'} onClick={onCloseModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default AddEditGoalTypeConfigModal;
