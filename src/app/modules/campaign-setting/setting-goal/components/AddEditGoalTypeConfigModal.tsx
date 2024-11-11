import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Container} from 'react-bootstrap';
import {Col, ModalFooter, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import {MessageStatusOptionModel, OptionListModel} from '../../../../common/model';
import {GetMessageStatusOptionById} from '../../../../common/services';
import useConstant from '../../../../constants/useConstant';
import {DefaultPrimaryButton, DefaultSecondaryButton, FormModal} from '../../../../custom-components';
import {useCurrenciesWithCode, useMasterReferenceOption, useMessageStatusOption, useMessageTypeOptions} from '../../../../custom-functions';
import {
	DateSourceSelected,
	GoalSettingCommons,
	MasterReference,
	SwalDetails,
	TransactionType,
} from '../../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	CommunicationRecordDepositListModel,
	GoalTypeCommunicationRecordUdtModel,
	GoalTypeDepositCurrencyMinMaxUdtModel,
	GoalTypeDepositUdtModel,
} from '../models';
import * as campaignGoalSetting from '../redux/GoalSettingRedux';

const initialValues = {};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

interface Props {
	showForm: boolean;
	closeModal: () => void;
	action: string;
	goalTypeName?: string;
	goalTypeGuidId?: string;
}

const AddEditGoalTypeConfigModal: React.FC<Props> = ({showForm, closeModal, action, goalTypeName, goalTypeGuidId}) => {
	// Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const goalTypeCommnunicationRecordDepositListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCommnunicationRecordDepositList,
		shallowEqual
	) as any;
	const goalTypeCommunicationRecordListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCommunicationRecordList,
		shallowEqual
	) as any;
	const goalTypeDepositListData = useSelector<RootState>(({campaignGoalSetting}) => campaignGoalSetting.goalTypeDepositList, shallowEqual) as any;
	const goalTypeDepositCurrencyListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeDepositCurrencyList,
		shallowEqual
	) as any;
	const {HubConnected, successResponse} = useConstant();

	// States
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [sequence, setSequence] = useState<string | any>('');
	const [goalType, setGoalType] = useState<string | any>('');
	const [goalTypeOption, setGoalTypeOption] = useState<string | any>('');
	const [messageType, setMessageType] = useState<string | any>('');
	const [messageStatus, setMessageStatus] = useState<string | any>('');
	const [commRecordDataSource, setCommRecordDataSource] = useState<string | any>('');
	const [commRecordPeriod, setCommRecordPeriod] = useState<string | any>('');
	const [transactionType, setTransactionType] = useState<string | any>('');
	const [depositDataSource, setDepositDataSource] = useState<string | any>('');
	const [depositPeriod, setDepositPeriod] = useState<string | any>('');
	const [communicationDepositGuid, setCommunicationDepositGuid] = useState<string | any>('');
	const [min, setMin] = useState<number | any>(0);
	const [max, setMax] = useState<number | any>(0);
	const [dateSourceOptionFilter, setDateSourceOptionFilter] = useState<number | any>(0);

	// const masterReference = useMasterReferenceOption('36,53,60,64,51,67,69,160');
	const masterReference = useMasterReferenceOption(
		`${MasterReference.GoalType},
		 ${MasterReference.Sequence},
		 ${MasterReference.CommunicationDataSource},
		 ${MasterReference.CommunicationPeriod},
		 ${MasterReference.GoalTypeTransactionType},
		 ${MasterReference.DepositDateSourceFTD},
		 ${MasterReference.DepositPeriod},
		 ${MasterReference.DepositDateSourceInitialDeposit}`
	);

	let mappedSequence =
		goalTypeCommnunicationRecordDepositListData === undefined
			? []
			: goalTypeCommnunicationRecordDepositListData
					.filter((obj: any) => obj.sequenceName !== '0')
					.map((obj: any) => ({label: obj.sequenceName, value: obj.sequenceId.toString()}));

	const sequenceReference = useMasterReferenceOption(`${MasterReference.Sequence}`)
		.map((obj) => obj.options)
		.filter((x) => !mappedSequence.includes(x));

	const filterSequence = sequenceReference.map((x) => x).filter((x) => !mappedSequence.map((y: any) => y.value).includes(x.value));

	const messageTypeOptions = useMessageTypeOptions();
	const messageStatusOption = useMessageStatusOption(parseInt(messageType.value));
	const currencyList = useCurrenciesWithCode();
	const dispatch = useDispatch();

	// Watcher
	useEffect(() => {
		setLoading(false);
		setHasErrors(false);
		setErrorMessage('');

		if (showForm === true && action === GoalSettingCommons.ADD) {
			setSequence('');
			setGoalType('');
			setGoalTypeOption('');
			setMessageType('');
			setMessageStatus('');
			setCommRecordDataSource('');
			setDepositDataSource('');
			setCommRecordPeriod('');
			setTransactionType('');
			setDepositPeriod('');
		}

		if (showForm === true && action === GoalSettingCommons.EDIT) {
			_getMessageStatus();
			setGoalTypeOption(goalTypeName);
			_displayCommRecordDepositData();
		}
	}, [showForm]);

	useEffect(() => {
		if (transactionType != '') {
			let dateSourceOption: any, dateSourceSelected: any;
			if (transactionType.value === TransactionType.InitialDepositId) {
				dateSourceOption = MasterReference.DepositDateSourceInitialDeposit;
				dateSourceSelected = DateSourceSelected.UpdatedDateId;
			} else if (transactionType.value === TransactionType.FirstTimeDepositId) {
				dateSourceOption = MasterReference.DepositDateSourceFTD;
				dateSourceSelected = DateSourceSelected.FirstTimeDepositDateId;
			}

			setDateSourceOptionFilter(dateSourceOption);
			setDepositDataSource(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == dateSourceOption)
					.map((obj) => obj.options)
					.find((op) => op.value === dateSourceSelected)
			);
		} else {
			setDateSourceOptionFilter(0);
		}
	}, [transactionType]);

	// Methods
	const _validate = () => {
		let isError: boolean = false;

		if (goalTypeOption === '' || goalTypeOption === undefined) {
			return true;
		}

		if (goalTypeOption === GoalSettingCommons.COMMUNICATION_RECORD) {
			if (sequence.value === '' || sequence.value === undefined) {
				return true;
			}
			if (goalType.value === '' || goalType.value === undefined) {
				return true;
			}
			if (messageType.value === '' || messageType.value === undefined) {
				return true;
			}
			if (messageStatus.value === '' || messageStatus.value === undefined) {
				return true;
			}
			if (commRecordDataSource.value === '' || commRecordDataSource.value === undefined) {
				return true;
			}
			if (commRecordPeriod.value === '' || commRecordPeriod.value === undefined) {
				return true;
			}
		}

		if (goalTypeOption === GoalSettingCommons.DEPOSIT) {
			if (sequence.value === '' || sequence.value === undefined) {
				return true;
			}
			if (goalType.value === '' || goalType.value === undefined) {
				return true;
			}
			if (transactionType.value === '' || transactionType.value === undefined) {
				return true;
			}
			if (depositDataSource.value === '' || depositDataSource.value === undefined) {
				return true;
			}
			if (depositPeriod.value === '' || depositPeriod.value === undefined) {
				return true;
			}

			if (action === GoalSettingCommons.ADD) {
				if (currencyList.length !== goalTypeDepositCurrencyListData.filter((obj: any) => obj.depositGuid === communicationDepositGuid).length) {
					return true;
				}

				let minNan = goalTypeDepositCurrencyListData.filter(
					(obj: any) => obj.min.toString().toString() === 'NaN' && obj.depositGuid === communicationDepositGuid
				);

				if (minNan.length !== 0) {
					return true;
				}

				let maxNan = goalTypeDepositCurrencyListData.filter(
					(obj: any) => obj.max.toString() === 'NaN' && obj.depositGuid === communicationDepositGuid
				);
				if (maxNan.length !== 0) {
					return true;
				}
			}

			if (action === GoalSettingCommons.EDIT) {
				if (currencyList.length !== goalTypeDepositCurrencyListData.filter((obj: any) => obj.depositGuid === goalTypeGuidId).length) {
					return true;
				}

				let minNan = goalTypeDepositCurrencyListData.filter(
					(obj: any) => obj.min.toString().toString() === 'NaN' && obj.depositGuid === goalTypeGuidId
				);

				if (minNan.length !== 0) {
					return true;
				}

				let maxNan = goalTypeDepositCurrencyListData.filter((obj: any) => obj.max.toString() === 'NaN' && obj.depositGuid === goalTypeGuidId);
				if (maxNan.length !== 0) {
					return true;
				}
			}
		}

		return isError;
	};

	const _validateCurrency = () => {
		//	For currency input validation. Min vs max checking. Values greater than 0
		const hasInvalidValue = Boolean(
			goalTypeDepositCurrencyListData.filter(
				(c: any) =>
					c.depositGuid === (action === GoalSettingCommons.ADD ? communicationDepositGuid : goalTypeGuidId) &&
					(c.min > c.max || c.min === 0 || c.max === 0)
			).length
		);

		return hasInvalidValue;
	};

	const _getMessageStatus = () => {
		let paramSelectedMessageStatusId: number = parseInt(
			goalTypeCommunicationRecordListData
				.filter((x: any) => x.communicationGuid === goalTypeGuidId)
				.map((x: any) => x.messageTypeId)
				.toString()
		);

		GetMessageStatusOptionById(paramSelectedMessageStatusId)
			.then((response) => {
				if (response.status === successResponse) {
					let messageStatus = Object.assign(new Array<MessageStatusOptionModel>(), response.data);

					let tempList = Array<OptionListModel>();
					messageStatus.forEach((item) => {
						const OptionValue: OptionListModel = {
							value: item.messageStatusId,
							label: item.messageStatusName,
						};
						tempList.push(OptionValue);
					});

					setMessageStatus(
						tempList.find(
							(obj) =>
								obj.value ===
								goalTypeCommunicationRecordListData
									.filter((x: any) => x.communicationGuid === goalTypeGuidId)
									.map((x: any) => x.messageStatusId)
									.toString()
						)
					);
				} else {
					console.log('Problem in Message Status');
				}
			})
			.catch(() => {
				console.log('Problem in Message Status');
			});
	};

	const onCurrencyChanged = (currencyValue: number, currencyId: number, currencyCode: string, minMax: string) => {
		if (action === GoalSettingCommons.ADD) {
			let storedGoalTypeDepositCurrencyListData = goalTypeDepositCurrencyListData !== undefined ? goalTypeDepositCurrencyListData : [];
			let currencyIndex = goalTypeDepositCurrencyListData.findIndex(
				(c: any) => c.currencyId === currencyId && c.depositGuid === communicationDepositGuid
			);

			if (currencyIndex !== -1) {
				storedGoalTypeDepositCurrencyListData[currencyIndex].min =
					minMax == GoalSettingCommons.MIN ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].min;
				storedGoalTypeDepositCurrencyListData[currencyIndex].max =
					minMax == GoalSettingCommons.MAX ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].max;

				dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(storedGoalTypeDepositCurrencyListData));
			} else {
				const requestGoalTypeDepositCurrencyListData = [
					{
						goalTypeDepositCurrencyMinMaxId: 0,
						currencyId: currencyId,
						goalTypeDepositId: 0,
						min: minMax === GoalSettingCommons.MIN ? currencyValue : 0,
						max: minMax === GoalSettingCommons.MAX ? currencyValue : 0,
						createdBy: userAccessId,
						createdDate: '',
						updatedBy: userAccessId,
						updatedDate: '',
						depositGuid: communicationDepositGuid,
					},
				];
				let newRequestGoalTypeDepositCurrencyListData = storedGoalTypeDepositCurrencyListData.concat(requestGoalTypeDepositCurrencyListData);

				dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(newRequestGoalTypeDepositCurrencyListData));
			}
		} else {
			let storedGoalTypeDepositCurrencyListData = goalTypeDepositCurrencyListData !== undefined ? goalTypeDepositCurrencyListData : [];
			let currencyIndex = storedGoalTypeDepositCurrencyListData.findIndex(
				(c: any) => c.currencyId === currencyId && c.depositGuid === goalTypeGuidId
			);

			if (currencyIndex !== -1) {
				const requestCurrency: GoalTypeDepositCurrencyMinMaxUdtModel = {
					goalTypeDepositCurrencyMinMaxId: storedGoalTypeDepositCurrencyListData[currencyIndex].goalTypeDepositCurrencyMinMaxId,
					currencyId: storedGoalTypeDepositCurrencyListData[currencyIndex].currencyId,
					goalTypeDepositId: storedGoalTypeDepositCurrencyListData[currencyIndex].goalTypeDepositId,
					min: minMax === GoalSettingCommons.MIN ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].min,
					max: minMax === GoalSettingCommons.MAX ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].max,
					createdBy: parseInt(userAccessId.toString()),
					updatedBy: parseInt(userAccessId.toString()),
					depositGuid: storedGoalTypeDepositCurrencyListData[currencyIndex].depositGuid,
				};

				let newGoalTypeDepositCurrencyListDataGuid = goalTypeDepositCurrencyListData.filter((obj: any) => obj.depositGuid !== goalTypeGuidId);
				let newGoalTypeDepositCurrencyListData = goalTypeDepositCurrencyListData.filter(
					(obj: any) => obj.currencyId !== currencyId && obj.depositGuid === goalTypeGuidId
				);
				let updateCurrency = [...newGoalTypeDepositCurrencyListData, ...newGoalTypeDepositCurrencyListDataGuid, requestCurrency];

				dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(updateCurrency));
			} else {
				const requestGoalTypeDepositCurrencyListData = [
					{
						goalTypeDepositCurrencyMinMaxId: 0,
						currencyId: currencyId,
						goalTypeDepositId: 0,
						min: minMax === GoalSettingCommons.MIN ? currencyValue : 0,
						max: minMax === GoalSettingCommons.MAX ? currencyValue : 0,
						createdBy: userAccessId,
						createdDate: '',
						updatedBy: userAccessId,
						updatedDate: '',
						depositGuid: goalTypeGuidId,
					},
				];
				let newRequestGoalTypeDepositCurrencyListData = storedGoalTypeDepositCurrencyListData.concat(requestGoalTypeDepositCurrencyListData);
				dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(newRequestGoalTypeDepositCurrencyListData));
			}
		}
	};

	const _displayCommRecordDepositData = () => {
		if (goalTypeName === GoalSettingCommons.COMMUNICATION_RECORD) {
			setSequence(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === MasterReference.Sequence)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.sequenceId)
								.toString()
					)
			);

			setGoalType(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === MasterReference.GoalType)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeId)
								.toString()
					)
			);

			setMessageType(
				messageTypeOptions.find(
					(obj) =>
						obj.value ===
						goalTypeCommunicationRecordListData
							.filter((x: any) => x.communicationGuid === goalTypeGuidId)
							.map((x: any) => x.messageTypeId)
							.toString()
				)
			);

			setMessageStatus(
				messageStatusOption.find(
					(obj) =>
						obj.value ===
						goalTypeCommunicationRecordListData
							.filter((x: any) => x.communicationGuid === goalTypeGuidId)
							.map((x: any) => x.messageStatusId)
							.toString()
				)
			);

			setCommRecordDataSource(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == MasterReference.CommunicationDataSource)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeDataSourceId)
								.toString()
					)
			);

			setCommRecordPeriod(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == MasterReference.CommunicationPeriod)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypePeriodId)
								.toString()
					)
			);
		} else {
			setSequence(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === MasterReference.Sequence)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.sequenceId)
								.toString()
					)
			);

			setGoalType(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === MasterReference.GoalType)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeId)
								.toString()
					)
			);

			setTransactionType(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeTransactionType)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeTransactionTypeId)
								.toString()
					)
			);

			let dateSourceOption: any, dateSourceSelected: any;

			if (transactionType.value === TransactionType.InitialDepositId) {
				dateSourceOption = MasterReference.DepositDateSourceInitialDeposit;
				dateSourceSelected = DateSourceSelected.UpdatedDateId;
			} else if (transactionType.value === TransactionType.FirstTimeDepositId) {
				dateSourceOption = MasterReference.DepositDateSourceFTD;
				dateSourceSelected = DateSourceSelected.FirstTimeDepositDateId;
			}

			setDepositDataSource(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == dateSourceOption)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeDataSourceId)
								.toString()
					)
			);

			setDepositPeriod(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypePeriodId)
								.toString()
					)
			);
		}
	};

	const _dispatchGoalTypeConfiguration = () => {
		if (_validate() === true) {
			swal(SwalDetails.ErrorTitle, SwalDetails.ErrorMandatoryText, SwalDetails.ErrorIcon);
		} else if (goalType.label === GoalSettingCommons.DEPOSIT && _validateCurrency()) {
			swal(SwalDetails.ErrorTitle, SwalDetails.ErrorMinMaxText, SwalDetails.ErrorIcon);
		} else {
			if (action === GoalSettingCommons.ADD) {
				//Parent
				let storedGoalTypeCommnunicationRecordDepositListData =
					goalTypeCommnunicationRecordDepositListData !== undefined ? goalTypeCommnunicationRecordDepositListData : [];

				const requestCommnunicationRecordDepositListData: CommunicationRecordDepositListModel = {
					goalTypeCommunicationRecordDepositId: 0,
					sequenceId: parseInt(sequence.value),
					sequenceName: sequence.label,
					goalTypeName: goalType.label,
					goalTypeId: parseInt(goalType.value),
					campaignSettingId: 0,
					goalTypeDataSourceName: goalType.label === GoalSettingCommons.COMMUNICATION_RECORD ? commRecordDataSource.label : depositDataSource.label,
					goalTypePeriodName: goalType.label === GoalSettingCommons.COMMUNICATION_RECORD ? commRecordPeriod.label : depositPeriod.label,
					createdBy: userAccessId.toString(),
					createdDate: null,
					updatedBy: userAccessId.toString(),
					updatedDate: null,
					goalTypeGuid: communicationDepositGuid,
				};

				let newRequestCommnunicationRecordDepositListData = storedGoalTypeCommnunicationRecordDepositListData.concat(
					requestCommnunicationRecordDepositListData
				);

				dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList(newRequestCommnunicationRecordDepositListData));
				//Communication Record
				if (goalType.label === GoalSettingCommons.COMMUNICATION_RECORD) {
					let storedGoalTypeCommunicationRecordListData =
						goalTypeCommunicationRecordListData !== undefined ? goalTypeCommunicationRecordListData : [];

					const requestGoalTypeCommunicationRecordListData: GoalTypeCommunicationRecordUdtModel = {
						goalTypeCommunicationRecordId: 0,
						sequenceId: parseInt(sequence.value),
						sequenceName: sequence.label,
						goalTypeId: parseInt(goalType.value),
						goalTypeName: goalType.label,
						campaignSettingId: 0,
						messageTypeId: parseInt(messageType.value),
						messageStatusId: parseInt(messageStatus.value),
						goalTypeDataSourceId: parseInt(commRecordDataSource.value),
						goalTypePeriodId: parseInt(commRecordPeriod.value),
						createdBy: userAccessId,
						updatedBy: userAccessId,
						communicationGuid: communicationDepositGuid,
					};

					let newRequestGoalTypeCommunicationRecordListData = storedGoalTypeCommunicationRecordListData.concat(
						requestGoalTypeCommunicationRecordListData
					);

					dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList(newRequestGoalTypeCommunicationRecordListData));
				}

				//Deposit Record
				if (goalType.label === GoalSettingCommons.DEPOSIT) {
					let storedGoalTypeDepositListData = goalTypeDepositListData !== undefined ? goalTypeDepositListData : [];
					const requestGoalTypeDepositListData: GoalTypeDepositUdtModel = {
						goalTypeDepositId: 0,
						sequenceId: parseInt(sequence.value),
						sequenceName: sequence.label,
						goalTypeId: parseInt(goalType.value),
						campaignSettingId: 0,
						goalTypeTransactionTypeId: parseInt(transactionType.value),
						goalTypeDataSourceId: parseInt(depositDataSource.value),
						goalTypePeriodId: parseInt(depositPeriod.value),
						createdBy: userAccessId,
						updatedBy: userAccessId,
						depositGuid: communicationDepositGuid,
					};

					let newRequestGoalTypeDepositListData = storedGoalTypeDepositListData.concat(requestGoalTypeDepositListData);
					dispatch(campaignGoalSetting.actions.goalTypeDepositList(newRequestGoalTypeDepositListData));
				}
			} else {
				//Parent
				let storedGoalTypeCommnunicationRecordDepositListData =
					goalTypeCommnunicationRecordDepositListData !== undefined ? goalTypeCommnunicationRecordDepositListData : [];
				let parentIndex = goalTypeCommnunicationRecordDepositListData.findIndex((obj: any) => obj.goalTypeGuid === goalTypeGuidId);

				const requestCommnunicationRecordDepositListData: CommunicationRecordDepositListModel = {
					goalTypeCommunicationRecordDepositId: storedGoalTypeCommnunicationRecordDepositListData[parentIndex].goalTypeCommunicationRecordDepositId,
					sequenceId: parseInt(sequence.value),
					sequenceName: sequence.label,
					goalTypeId: parseInt(goalType.value),
					goalTypeName: goalType.label,
					campaignSettingId: storedGoalTypeCommnunicationRecordDepositListData[parentIndex].campaignSettingId,
					goalTypeDataSourceName: goalType.label === GoalSettingCommons.COMMUNICATION_RECORD ? commRecordDataSource.label : depositDataSource.label,
					goalTypePeriodName: goalType.label === GoalSettingCommons.COMMUNICATION_RECORD ? commRecordPeriod.label : depositPeriod.label,
					createdBy: userAccessId.toString(),
					createdDate: null,
					updatedBy: userAccessId.toString(),
					updatedDate: null,
					goalTypeGuid: goalTypeGuidId,
				};

				let newGoalTypeCommnunicationRecordDepositListData = goalTypeCommnunicationRecordDepositListData
					.filter((obj: any) => obj.goalTypeGuid !== goalTypeGuidId)
					.concat(requestCommnunicationRecordDepositListData);

				dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList(newGoalTypeCommnunicationRecordDepositListData));

				//Communication Record
				if (goalType.label === GoalSettingCommons.COMMUNICATION_RECORD) {
					let storedgoalTypeCommunicationRecordListData =
						goalTypeCommunicationRecordListData !== undefined ? goalTypeCommunicationRecordListData : [];
					let communicationIndex = goalTypeCommunicationRecordListData.findIndex((obj: any) => obj.communicationGuid === goalTypeGuidId);

					const requestGoalTypeCommunicationRecordListData: GoalTypeCommunicationRecordUdtModel = {
						goalTypeCommunicationRecordId: storedgoalTypeCommunicationRecordListData[communicationIndex].goalTypeCommunicationRecordId,
						sequenceId: parseInt(sequence.value),
						sequenceName: sequence.label,
						goalTypeId: parseInt(goalType.value),
						goalTypeName: goalType.label,
						campaignSettingId: storedgoalTypeCommunicationRecordListData[communicationIndex].campaignSettingId,
						messageTypeId: parseInt(messageType.value),
						messageStatusId: parseInt(messageStatus.value),
						goalTypeDataSourceId: parseInt(commRecordDataSource.value),
						goalTypePeriodId: parseInt(commRecordPeriod.value),
						createdBy: userAccessId,
						updatedBy: userAccessId,
						communicationGuid: goalTypeGuidId,
					};

					let newGoalTypeCommunicationRecordListData = goalTypeCommunicationRecordListData
						.filter((obj: any) => obj.communicationGuid !== goalTypeGuidId)
						.concat(requestGoalTypeCommunicationRecordListData);

					dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList(newGoalTypeCommunicationRecordListData));
				}

				//Deposit
				if (goalType.label === GoalSettingCommons.DEPOSIT) {
					let storedGoalTypeDepositListData = goalTypeDepositListData !== undefined ? goalTypeDepositListData : [];
					let depositIndex = goalTypeDepositListData.findIndex((obj: any) => obj.depositGuid === goalTypeGuidId);

					const requestGoalTypeDepositListData: GoalTypeDepositUdtModel = {
						goalTypeDepositId: storedGoalTypeDepositListData[depositIndex].goalTypeDepositId,
						sequenceId: parseInt(sequence.value),
						sequenceName: sequence.label,
						goalTypeId: parseInt(goalType.value),
						campaignSettingId: storedGoalTypeDepositListData[depositIndex].campaignSettingId,
						goalTypeTransactionTypeId: parseInt(transactionType.value),
						goalTypeDataSourceId: parseInt(depositDataSource.value),
						goalTypePeriodId: parseInt(depositPeriod.value),
						createdBy: userAccessId,
						updatedBy: userAccessId,
						depositGuid: goalTypeGuidId,
					};

					let newGoalTypeDepositListData = goalTypeDepositListData
						.filter((obj: any) => obj.depositGuid !== goalTypeGuidId)
						.concat(requestGoalTypeDepositListData);

					dispatch(campaignGoalSetting.actions.goalTypeDepositList(newGoalTypeDepositListData));
				}
			}
		}
	};

	const onchangeSequence = (val: string | any) => {
		setSequence(val);
	};

	const onchangeMessageType = (val: string | any) => {
		setMessageType(val);
	};

	const onchangeGoalType = (val: string | any) => {
		setGoalType(val);
		setGoalTypeOption(val.label);
		setCommunicationDepositGuid(Guid.create().toString());
	};

	const onchangeMessageStatus = (val: string | any) => {
		setMessageStatus(val);
	};

	const onchangeCommRecordDataSource = (val: string | any) => {
		setCommRecordDataSource(val);
	};

	const onchangeCommRecordPeriod = (val: string | any) => {
		setCommRecordPeriod(val);
	};

	const onchangeTransactionType = (val: string | any) => {
		setTransactionType(val);
	};

	const onchangeDepositDataSource = (val: string | any) => {
		setDepositDataSource(val);
	};

	const onchangeDepositPeriod = (val: string | any) => {
		setDepositPeriod(val);
	};

	const enforceNumberValidation = (e: any) => {
		let checkIfNum;
		if (e.key !== undefined) {
			// Check if it's a "e", "+" or "-"
			checkIfNum = e.key === 'e' || e.key === '+' || e.key === '-';
		} else if (e.keyCode !== undefined) {
			// Check if it's a "e" (69), "." (190), "+" (187) or "-" (189)
			checkIfNum = e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 187 || e.keyCode === 189;
		}
		return checkIfNum && e.preventDefault();
	};

	// Return element
	return (
		<FormModal headerTitle={action + ' Goal Type'} haveFooter={false} show={showForm}>
			<Container>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label className='form-label-sm'>Sequence</label>
						<Select style={{width: '100%'}} options={filterSequence} onChange={onchangeSequence} value={sequence} />
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label className='form-label-sm'>Goal Type</label>
						<Select
							style={{width: '100%'}}
							options={masterReference.filter((obj) => obj.masterReferenceParentId === MasterReference.GoalType).map((obj) => obj.options)}
							onChange={onchangeGoalType}
							value={goalType}
						/>
					</Col>
				</Row>
				{goalTypeOption === '' ? null : (
					<>
						{goalTypeOption === GoalSettingCommons.COMMUNICATION_RECORD ? (
							<>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Message Type</label>
										<Select style={{width: '100%'}} options={messageTypeOptions} onChange={onchangeMessageType} value={messageType} />
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Message Status</label>
										<Select style={{width: '100%'}} options={messageStatusOption} onChange={onchangeMessageStatus} value={messageStatus} />
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Date Source</label>
										<Select
											style={{width: '100%'}}
											options={masterReference
												.filter((obj) => obj.masterReferenceParentId == MasterReference.CommunicationDataSource)
												.map((obj) => obj.options)}
											onChange={onchangeCommRecordDataSource}
											value={commRecordDataSource}
										/>
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Period</label>
										<Select
											style={{width: '100%'}}
											options={masterReference
												.filter((obj) => obj.masterReferenceParentId == MasterReference.CommunicationPeriod)
												.map((obj) => obj.options)}
											onChange={onchangeCommRecordPeriod}
											value={commRecordPeriod}
										/>
									</Col>
								</Row>
							</>
						) : (
							<>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Transaction Type</label>
										<Select
											style={{width: '100%'}}
											options={masterReference
												.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeTransactionType)
												.map((obj) => obj.options)}
											onChange={onchangeTransactionType}
											value={transactionType}
										/>
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Date Source</label>
										<Select
											style={{width: '100%'}}
											options={masterReference.filter((obj) => obj.masterReferenceParentId == dateSourceOptionFilter).map((obj) => obj.options)}
											onChange={onchangeDepositDataSource}
											value={depositDataSource}
										/>
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label className='form-label-sm'>Period</label>
										<Select
											style={{width: '100%'}}
											options={masterReference
												.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod)
												.map((obj) => obj.options)}
											onChange={onchangeDepositPeriod}
											value={depositPeriod}
										/>
									</Col>
								</Row>

								{action === GoalSettingCommons.ADD
									? currencyList.map((key: any, index: number) => {
											return (
												<Row style={{marginTop: 10}}>
													<Col sm={6}>
														<label className='form-label-sm'>{key.label} Min</label>
														<input
															type='number'
															className='form-control form-control-sm'
															aria-label='{c.currencCode} Min'
															min='1'
															onKeyPress={enforceNumberValidation}
															onChange={(value) =>
																onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)
															}
														/>
													</Col>
													<Col sm={6}>
														<label className='form-label-sm'>{key.label} Max</label>
														<input
															type='number'
															className='form-control form-control-sm'
															aria-label='{c.label} Max'
															min='1'
															onKeyPress={enforceNumberValidation}
															onChange={(value) =>
																onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MAX)
															}
														/>
													</Col>
												</Row>
											);
									  })
									: currencyList.map((key: any, index: number) => {
											return (
												<Row style={{marginTop: 10}}>
													<Col sm={6}>
														<label className='form-label-sm'>{key.label} Min</label>
														<input
															type='number'
															className='form-control form-control-sm'
															aria-label='{c.label} Min'
															min='1'
															onKeyPress={enforceNumberValidation}
															value={goalTypeDepositCurrencyListData
																.filter(
																	(obj: any) => obj.currencyId === parseInt(key.value) && obj.depositGuid.toString() === goalTypeGuidId?.toString()
																)
																.map((obj: any) => obj.min)}
															onChange={(value) =>
																onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)
															}
														/>
													</Col>
													<Col sm={6}>
														<label className='form-label-sm'>{key.label} Max</label>
														<input
															type='number'
															className='form-control form-control-sm'
															aria-label='{c.label} Max'
															min='1'
															onKeyPress={enforceNumberValidation}
															value={goalTypeDepositCurrencyListData
																.filter(
																	(obj: any) => obj.currencyId === parseInt(key.value) && obj.depositGuid.toString() === goalTypeGuidId?.toString()
																)
																.map((obj: any) => obj.max)}
															onChange={(value) =>
																onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MAX)
															}
														/>
													</Col>
												</Row>
											);
									  })}
							</>
						)}{' '}
					</>
				)}
			</Container>
			<ModalFooter style={{border: 0}}>
				<DefaultPrimaryButton
					title={'Submit'}
					access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
					onClick={_dispatchGoalTypeConfiguration}
				/>
				<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)} title={'Close'} onClick={closeModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default AddEditGoalTypeConfigModal;
