import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AgGridReact } from 'ag-grid-react';
import { useFormik } from 'formik';
import { Guid } from 'guid-typescript';
import React, { useEffect, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap-v5';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	FieldContainer,
	FooterContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridLinkButton,
	LoaderButton,
	MainContainer,
	PaddedContainer,
	TableIconButton,
} from '../../../../custom-components';
import { useMasterReferenceOption } from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import { usePromptOnUnload } from '../../../../custom-helpers';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { GoalSettingCommons, TransactionType } from '../../../system/components/constants/CampaignSetting';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstant from '../../constants/useCampaignSettingConstant';
import { GoalTypeGameActivityUdtModel } from '../models';
import { GoalTypeCommunicationRecordUdtModel } from '../models/GoalTypeCommunicationRecordUdtModel';
import { GoalTypeDepositCurrencyMinMaxUdtModel } from '../models/GoalTypeDepositCurrencyMinMaxUdtModel';
import { GoalTypeDepositUdtModel } from '../models/GoalTypeDepositUdtModel';
import { GoalTypeGameActivityCurrMinMaxUdtModel } from '../models/GoalTypeGameActivityCurrMinMaxUdtModel';
import { GoalTypeListConfigurationModel } from '../models/GoalTypeListConfigurationModel';
import { CampaignGoalSettingIdRequestModel } from '../models/request/CampaignGoalSettingIdRequestModel';
import { CampaignGoalSettingRequestModel } from '../models/request/CampaignGoalSettingRequestModel';
import { CampaignGoalSettingByIdResponseModel } from '../models/response/CampaignGoalSettingByIdResponseModel';
import {
	GetCampaignGoalSettingByIdDetails,
	GetCampaignGoalSettingByIdDetailsResult,
	SendCheckCampaignGoalSettingByNameExist,
	UpsertCampaignGoalSetting,
} from '../service/CampaignGoalApi';
import AddEditGoalTypeConfigModal from './shared/components/AddEditGoalTypeConfigModal';
import SkeletonLoading from './shared/components/SkeletonLoading';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	settingName: '',
	settingDescription: '',
};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

const AddCampaignGoal: React.FC = () => {

	//	States
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [addCampaignGoalRowData, setAddCampaignGoalRowData] = useState<Array<GoalTypeListConfigurationModel>>([]);
	const [goalParameterCount, setGoalParameterCount] = useState<any>('');
	const [goalParameterAmount, setGoalParameterAmount] = useState<any>('');
	const [selectedGoalAmount, setSelectedGoalAmount] = useState<any>(0);
	const [selectedGoalCount, setSelectedGoalCount] = useState<any>(0);
	const [depositTypeData, setDepositTypeData] = useState<Array<GoalTypeDepositUdtModel>>([]);
	const [depositTypeMinMaxData, setDepositTypeMinMaxData] = useState<Array<GoalTypeDepositCurrencyMinMaxUdtModel>>([]);
	const [gameActivityTypeData, setGameActivityTypeData] = useState<Array<GoalTypeGameActivityUdtModel>>([]);
	const [gameActivityTypeMinData, setGameActivityTypeMinData] = useState<Array<GoalTypeGameActivityCurrMinMaxUdtModel>>([]);
	const [communicationRecordTypeData, setCommunicationRecordTypeData] = useState<Array<GoalTypeCommunicationRecordUdtModel>>([]);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [goalTypeGuidId, setGoalTypeGuidId] = useState<any>('');
	const [goalTypeName, setGoalTypeName] = useState<any>('');
	const [action, setAction] = useState<any>('');
	const [actionPage, setActionPage] = useState<any>('');
	const [goalTypeConfigId, setGoalTypeConfigId] = useState<any>();
	const [viewMode, setViewMode] = useState<boolean>(false);

	const [selectedGoalCountNthNextDep, setSelectedGoalCountNthNextDep] = useState<any>(0);
	const [selectedGoalCountTotalDeposit, setSelectedGoalCountTotalDeposit] = useState<any>(0);
	const [selectedGoalCountGameActivity, setSelectedGoalCountGameActivity] = useState<any>(0);
	const [selectedGoalCountCommRecord, setSelectedGoalCountCommRecord] = useState<any>(0);

	const [selectedGoalAmtFTD, setSelectedGoalAmtFTD] = useState<any>(0);
	const [selectedGoalAmtInitDeposit, setSelectedGoalAmtInitDeposit] = useState<any>(0);
	const [selectedGoalAmtNextDeposit, setSelectedGoalAmtNextDeposit] = useState<any>(0);
	const [selectedGoalAmtTotalDeposit, setSelectedGoalAmtTotalDeposit] = useState<any>(0);
	const [selectedGoalAmtGameActivity, setSelectedGoalAmtGameActivity] = useState<any>(0);
	//	hooks
	const { id }: { id: number } = useParams();
	const { successResponse, HubConnected } = useConstant();

	const { DropdownMasterReference, COMMUNICATION_RECORD, DEPOSIT, GAME_ACTIVITY } =
		useCampaignSettingConstant();
	usePromptOnUnload(true, 'Any changes will be discarded, please confirm?');

	const masterReference = useMasterReferenceOption(`${DropdownMasterReference.goalParameterAmount}, ${DropdownMasterReference.goalParameterCount}`);
	const goalParameterOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId === DropdownMasterReference.goalParameterAmount)
		.map((obj) => obj.options);

	const goalParameterCountOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId === DropdownMasterReference.goalParameterCount)
		.map((obj) => obj.options);

	const history = useHistory();
	//Literals
	const goalAmtFTDAId = 48;
	const goalAmtIDAId = 157;
	const goalTotalDepositId = 256;
	const goalNthNextDepositId = 257;
	const goalGameActivityAmtId = 260;
	const goalCountNthNextDeposit = 262;
	const goalCountTotalDeposit = 263;
	const goalCountGameActivity = 264;
	const thresholdTypeIdAmount = 230;
	const thresholdTypeIdCount = 231;
	const communicationRecordId = 50;

	//	Redux
	const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;

	const statusOption = CommonLookups('settingStatuses');
	//	Effects
	useEffect(() => {
		if (id > 0) {
			//	clone
			setActionPage('clone');
			getCampaignGoalDetailsById();
		} else if (id === undefined) {
			setActionPage('create');
		}
	}, []);


	//	Watcher
	useEffect(() => {
		setModalShow(false);

		if (addCampaignGoalRowData.length === 0 || addCampaignGoalRowData == undefined) {
			setGoalParameterAmount(null);
			setGoalParameterCount(null);
		}

		const countFTD_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) => obj.goalTypeTransactionTypeId == TransactionType.FirstTimeDepositId && obj.goalName === DEPOSIT
		).length; //no threshold
		const countInitDeposit_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) => obj.goalTypeTransactionTypeId == TransactionType.InitialDepositId && obj.goalName === DEPOSIT
		).length; //no threshold

		const countNthNextDeposit_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) => obj.goalTypeTransactionTypeId == TransactionType.NthNextDepositId && obj.goalName === DEPOSIT
			// obj.thresholdTypeId == thresholdTypeIdAmount
		).length;
		const countTotalDeposit_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) =>
				obj.goalTypeTransactionTypeId == TransactionType.TotalDeposit && obj.goalName === DEPOSIT && obj.thresholdTypeId == thresholdTypeIdAmount
		).length;

		const countGameActivityAmt_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) => obj.goalName === GAME_ACTIVITY && obj.thresholdTypeId == thresholdTypeIdAmount
		).length;

		setGoalValues(countFTD_AddCampaignGoal, countInitDeposit_AddCampaignGoal, countNthNextDeposit_AddCampaignGoal, countTotalDeposit_AddCampaignGoal, countGameActivityAmt_AddCampaignGoal)

		//	Count Dropdown
		const countNthNextDepositCnt_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) =>
				obj.goalTypeTransactionTypeId == TransactionType.NthNextDepositId && obj.goalName === DEPOSIT && obj.thresholdTypeId == thresholdTypeIdCount
		).length;

		const countTotalDepositCnt_AddCampaignGoal = addCampaignGoalRowData.filter(
			(obj: any) =>
				obj.goalTypeTransactionTypeId == TransactionType.TotalDeposit && obj.goalName === DEPOSIT && obj.thresholdTypeId == thresholdTypeIdCount
		).length;

		const countGameActivityCnt_AddCampaignGoal = addCampaignGoalRowData.filter((obj: any) => obj.goalName === GAME_ACTIVITY && obj.thresholdTypeId == thresholdTypeIdCount).length;
		const countCommRecordCnt_AddCampaignGoal = addCampaignGoalRowData.filter((obj: any) => obj.goalName === COMMUNICATION_RECORD).length;

		setCountGoalValues(countCommRecordCnt_AddCampaignGoal, countNthNextDepositCnt_AddCampaignGoal, countTotalDepositCnt_AddCampaignGoal, countGameActivityCnt_AddCampaignGoal);
		//auto remove selected value on disabled dropdown field

		if (countFTD_AddCampaignGoal === 0 && countInitDeposit_AddCampaignGoal === 0 && countNthNextDeposit_AddCampaignGoal === 0 && countTotalDeposit_AddCampaignGoal === 0 && countGameActivityAmt_AddCampaignGoal === 0) {
			setGoalParameterAmount(null);
		}

		if (countCommRecordCnt_AddCampaignGoal === 0 && countTotalDepositCnt_AddCampaignGoal === 0 && countGameActivityCnt_AddCampaignGoal === 0) {
			setGoalParameterCount(null);
		}

	}, [addCampaignGoalRowData]);


	const setGoalValues = (_countFTD: any,
		_countInitDeposit: any,
		_countNthNextDeposit: any,
		_countTotalDeposit: any,
		_countGameActivityAmt: any) => {
		if (_countFTD > 0) {
			setSelectedGoalAmount(goalAmtFTDAId);
			setSelectedGoalAmtFTD(goalAmtFTDAId);
		} else setSelectedGoalAmtFTD(0);

		if (_countInitDeposit > 0) {
			setSelectedGoalAmount(goalAmtIDAId);
			setSelectedGoalAmtInitDeposit(goalAmtIDAId);
		} else setSelectedGoalAmtInitDeposit(0);

		if (_countNthNextDeposit > 0) {
			setSelectedGoalAmount(goalNthNextDepositId);
			setSelectedGoalAmtNextDeposit(goalNthNextDepositId);
		} else setSelectedGoalAmtNextDeposit(0);

		if (_countTotalDeposit > 0) {
			setSelectedGoalAmount(goalTotalDepositId);
			setSelectedGoalAmtTotalDeposit(goalTotalDepositId);
		} else setSelectedGoalAmtTotalDeposit(0);

		if (_countGameActivityAmt > 0) {
			setSelectedGoalAmount(goalGameActivityAmtId);
			setSelectedGoalAmtGameActivity(goalGameActivityAmtId);
		} else setSelectedGoalAmtGameActivity(0);
	};
	const setCountGoalValues = (countCommRecordCnt: any, countNthNextDepositCnt: any, countTotalDepositCnt: any, countGameActivityCnt: any) => {
		if (countCommRecordCnt > 0) {
			setSelectedGoalCount(goalCountNthNextDeposit);
			setSelectedGoalCountCommRecord(communicationRecordId);
		} else setSelectedGoalCountCommRecord(0);

		if (countNthNextDepositCnt > 0) {
			setSelectedGoalCount(goalCountNthNextDeposit);
			setSelectedGoalCountNthNextDep(goalCountNthNextDeposit);
		} else setSelectedGoalCountNthNextDep(0);

		if (countTotalDepositCnt > 0) {
			setSelectedGoalCount(goalCountTotalDeposit);
			setSelectedGoalCountTotalDeposit(goalCountTotalDeposit);
		} else setSelectedGoalCountTotalDeposit(0);

		if (countGameActivityCnt > 0) {
			setSelectedGoalCount(goalCountGameActivity);
			setSelectedGoalCountGameActivity(goalCountGameActivity);
		} else setSelectedGoalCountGameActivity(0);
	};
	const customCellRendererViewGoalType = (params: any) => {
		return (
			<GridLinkButton
				access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
				title={params.data.goalName}
				disabled={false}
				onClick={() => viewGoalTypeConfig(params.data.goalTypeName, params.data.goalTypeGuid, params.data.goalTypeCommunicationRecordDepositId)}
			/>
		)
	}
	const customCellRendererInternal = (params: any) => {
		return (<>
			{params.data.intervalRelationalOperatorName} {params.data.intervalSourceName ? ' - ' + params.data.intervalSourceName : ''}
			{params.data.intervalNumber === 0 ? '' : ' - ' + params.data.intervalNumber}
		</>)
	}
	const customCellRendererActions = (params: any) => {
		return (<>
			{params.data.messageResponseId != 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-4'>
							<TableIconButton
								access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
								faIcon={faPencilAlt}
								onClick={() =>
									editGoalTypeConfig(params.data.goalTypeName, params.data.goalTypeGuid, params.data.goalTypeCommunicationRecordDepositId)
								}
								toolTipText={editMessage(
									params.data.goalTypeCommunicationRecordDepositId,
									params.data.goalTypeName,
									params.data.intervalSourceGoalTypeName
								)}
								hasCustomTooltip={true}
							/>
						</div>

						<div className='me-4'>
							<TableIconButton
								isDisable={
									removeMessage(
										params.data.goalTypeCommunicationRecordDepositId,
										params.data.goalTypeName,
										params.data.intervalSourceGoalTypeName
									) !== 'Remove'
								}
								access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
								faIcon={faTrash}
								iconColor={'text-danger'}
								toolTipText={removeMessage(
									params.data.goalTypeCommunicationRecordDepositId,
									params.data.goalTypeName,
									params.data.intervalSourceGoalTypeName
								)}
								hasCustomTooltip={true}
								onClick={() => removeGoalTypeConfig(params.data.goalName, params.data.goalTypeName, params.data.goalTypeGuid)}
							/>
						</div>
					</div>
				</ButtonGroup>
			) : null}
		</>)
	}
	//	Pagination and grid
	const columnDefs : (ColDef<GoalTypeListConfigurationModel> | ColGroupDef<GoalTypeListConfigurationModel>)[] =[
		{ headerName: 'Goal Type Name', field: 'goalTypeName' },
		{
			headerName: 'Goal Type',
			field: 'goalName',
			width: 400,
			cellRenderer: customCellRendererViewGoalType
		},
		{ headerName: 'Data Source', field: 'goalTypeDataSourceName' },
		{
			headerName: 'Interval',
			field: 'intervalNumber',
			cellRenderer: customCellRendererInternal
		},
		{ headerName: 'Period', field: 'goalTypePeriodName' },
		{
			headerName: 'Action',
			cellRenderer: customCellRendererActions
		},
	];

	const removeMessage = (goalTypeId: any, goalTypeName: any, intervalSourceName: any) => {
		let message = 'Remove';

		const countMappedGoal = addCampaignGoalRowData.filter(
			(x) =>
				(goalTypeId !== 0 && x.intervalSourceGoalTypeId === goalTypeId) ||
				(goalTypeId === 0 && x.intervalSourceGoalTypeName === goalTypeName && x.goalTypeName !== goalTypeName)
		).length;

		message =
			countMappedGoal > 0 ? 'Goal type used as interval source on other goal type within this setting. Unlink to remove the goal type.' : message;

		return message;
	};

	const editMessage = (goalTypeId: any, goalTypeName: any, intervalSourceName: any) => {
		let message = 'Edit';

		const countMappedGoal = addCampaignGoalRowData.filter(
			(x) =>
				(goalTypeId !== 0 && x.intervalSourceGoalTypeId === goalTypeId) ||
				(goalTypeId === 0 && x.intervalSourceGoalTypeName === goalTypeName && x.goalTypeName !== goalTypeName)
		).length;

		message = countMappedGoal > 0 ? 'Goal type used as interval source on other goal type. Unlink to edit all details.' : message;

		return message;
	};

	const assignIdsToCampaignGoalClone = (responseDataCampaignGoalSetting: CampaignGoalSettingByIdResponseModel) => {
		responseDataCampaignGoalSetting.goalTypeDepositList.forEach((goalTypeDeposit) => {
			let newDepositGuid = Guid.create().toString();

			goalTypeDeposit.depositGuid = newDepositGuid;

			responseDataCampaignGoalSetting.goalTypeDepositCurrencyMinMaxList
				.filter((a) => a.goalTypeDepositId === goalTypeDeposit.goalTypeDepositId)
				.forEach((a) => (a.depositGuid = newDepositGuid));

			responseDataCampaignGoalSetting.goalTypeCommunicationRecordDepositList
				.filter((d) => d.goalTypeCommunicationRecordDepositId === goalTypeDeposit.goalTypeDepositId)
				.forEach((d) => (d.goalTypeGuid = newDepositGuid));
		});

		responseDataCampaignGoalSetting.goalTypeGameActivityTypeList.forEach((goalTypeGameActivity) => {
			let newGoalTypeGuid = Guid.create().toString();

			goalTypeGameActivity.goalTypeGuid = newGoalTypeGuid;

			responseDataCampaignGoalSetting.goalTypeGameActivityCurrencyMinMaxList
				.filter((a) => a.goalTypeGameActivityId === goalTypeGameActivity.goalTypeGameActivityId)
				.forEach((a) => (a.goalTypeGuid = newGoalTypeGuid));

			responseDataCampaignGoalSetting.goalTypeCommunicationRecordDepositList
				.filter((d) => d.goalTypeCommunicationRecordDepositId === goalTypeGameActivity.goalTypeGameActivityId)
				.forEach((d) => (d.goalTypeGuid = newGoalTypeGuid));
		});

		responseDataCampaignGoalSetting.goalTypeCommunicationRecordList.forEach((d) => {
			d.goalTypeGuid = Guid.create().toString();
			let depositIndex = responseDataCampaignGoalSetting.goalTypeCommunicationRecordDepositList.find(
				(i) => i.goalTypeCommunicationRecordDepositId === d.goalTypeCommunicationRecordId
			);
			if (depositIndex) {
				depositIndex.goalTypeGuid = d.goalTypeGuid;
			}
		});

		responseDataCampaignGoalSetting.goalTypeDepositList.forEach((goalTypeDeposit) => {
			let depositGuid = Guid.create().toString();

			goalTypeDeposit.depositGuid = depositGuid;

			responseDataCampaignGoalSetting.goalTypeDepositCurrencyMinMaxList
				.filter((a) => a.goalTypeDepositId === goalTypeDeposit.goalTypeDepositId)
				.forEach((a) => (a.depositGuid = depositGuid));

			responseDataCampaignGoalSetting.goalTypeCommunicationRecordDepositList
				.filter((d) => d.goalTypeCommunicationRecordDepositId === goalTypeDeposit.goalTypeDepositId)
				.forEach((d) => (d.goalTypeGuid = depositGuid));
		});
		//Goal Type Link scenario
		goalTypeLink(responseDataCampaignGoalSetting);
	};
	const goalTypeLink = (responseDataCampaignGoalSetting: CampaignGoalSettingByIdResponseModel) => {
		responseDataCampaignGoalSetting.goalTypeCommunicationRecordDepositList.forEach((goal) => {
			let item = responseDataCampaignGoalSetting.goalTypeCommunicationRecordDepositList.find(
				(d) => d.goalTypeCommunicationRecordDepositId === goal.intervalSourceGoalTypeId
			);
			if (item) {
				switch (goal.goalName) {
					case GoalSettingCommons.COMMUNICATION_RECORD:
						{
							let commRecord = responseDataCampaignGoalSetting.goalTypeCommunicationRecordList.find(
								(d) => d.goalTypeCommunicationRecordId === goal.goalTypeCommunicationRecordDepositId
							);
							updateGoalSettings(commRecord,item)
						}
						break;
					case GoalSettingCommons.DEPOSIT:
						{
							let deposit = responseDataCampaignGoalSetting.goalTypeDepositList.find((d) => d.goalTypeDepositId === goal.goalTypeCommunicationRecordDepositId);
							updateGoalSettings(deposit,item)
						}
						break;
					case GoalSettingCommons.GAME_ACTIVITY:
						{
							let gameActivity = responseDataCampaignGoalSetting.goalTypeGameActivityTypeList.find(
								(d) => d.goalTypeGameActivityId === goal.goalTypeCommunicationRecordDepositId
							);
							updateGoalSettings(gameActivity,item)
						}
						break;
				}
			}
		});
	}
	const updateGoalSettings = (record: any, item: any) => {
		if (record) {
			record.intervalSourceGoalTypeId = 0;
			record.intervalSourceGoalTypeGUID = item.goalTypeGuid;
			record.intervalSourceGoalTypeName = item.goalTypeName;
		}
	}
	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	//	Methods
	const handleChangeStatus = (params: LookupModel) => {
		setSelectedSettingStatus(params);
	};

	const onChangeGoalParameterCount = (val: any) => {
		setGoalParameterCount(val);
	};

	const onChangeGoalParameterAmount = (val: any) => {
		setGoalParameterAmount(val);
	};

	const viewGoalTypeConfig = (paramGoalTypeName: string, paramGoalTypeGuidId: string, paramGoalTypeConfigId: any) => {
		setAction(GoalSettingCommons.VIEW);
		setModalShow(true);
		setGoalTypeName(paramGoalTypeName);
		setGoalTypeGuidId(paramGoalTypeGuidId);
		setGoalTypeConfigId(paramGoalTypeConfigId);
		setViewMode(true);
	};

	const editGoalTypeConfig = (paramGoalTypeName: string, paramGoalTypeGuidId: string, paramGoalTypeConfigId: any) => {
		setAction(GoalSettingCommons.EDIT);
		setModalShow(true);
		setGoalTypeName(paramGoalTypeName);
		setGoalTypeGuidId(paramGoalTypeGuidId);
		setGoalTypeConfigId(paramGoalTypeConfigId);
		setViewMode(false);
	};

	const removeGoalTypeConfig = (paramGoalName: string, paramGoalTypeName: string, paramGoalTypeGuidId: string) => {
		swal({
			title: 'Confirmation',
			text: 'Goal type configuration will be removed from the setting, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				//	Main
				const updatedRowData = addCampaignGoalRowData.filter((cd: any) => cd.goalTypeGuid !== paramGoalTypeGuidId);
				setAddCampaignGoalRowData(updatedRowData);

				if (paramGoalName === COMMUNICATION_RECORD) {
					let removeCommunicationRecord = [];
					removeCommunicationRecord = communicationRecordTypeData.filter((obj: any) => obj.goalTypeName !== paramGoalTypeName);
					setCommunicationRecordTypeData(removeCommunicationRecord);
				} else if (paramGoalName === DEPOSIT) {
					let removeDepositRecord = [];
					removeDepositRecord = depositTypeData.filter((obj: any) => obj.goalTypeName !== paramGoalTypeName);
					setDepositTypeData(removeDepositRecord);
				} else if (paramGoalName === GAME_ACTIVITY) {
					let removeGameActivityRecord = [];
					removeGameActivityRecord = gameActivityTypeData.filter((obj: any) => obj.goalTypeName !== paramGoalTypeName);
					setGameActivityTypeData(removeGameActivityRecord);
				}
			}
		});
	};

	const addGoalTypeConfig = () => {
		setAction('Add');
		setModalShow(true);
		setGoalTypeGuidId(Guid.create().toString());
		setViewMode(false);
	};
	const goalParameterValidateAmount = () => goalParameterAmount === null 
			||	goalParameterAmount.value === '' 
			||	goalParameterAmount.value === undefined 
			|| goalParameterAmount.value === 0 
			|| goalParameterAmount.length === 0;

	const selectedGoalValidateAmount = () => {
		return (
			selectedGoalAmtFTD > 0 ||
			selectedGoalAmtInitDeposit > 0 ||
			selectedGoalAmtNextDeposit > 0 ||
			selectedGoalAmtTotalDeposit > 0 ||
			selectedGoalAmtGameActivity > 0
			)
	}
	const selectedGoalValidateCount = () => {
		return(
			selectedGoalCountCommRecord > 0 ||
			selectedGoalCountNthNextDep > 0 ||
			selectedGoalCountTotalDeposit > 0 ||
			selectedGoalCountGameActivity > 0
		)
	}
	const goalParameterCountValidate = () => {
		return (
			goalParameterCount === null ||
			goalParameterCount.value === '' ||
			goalParameterCount.value === undefined ||
			goalParameterCount.value === 0 ||
			goalParameterCount.length === 0
		)
	}
	const validateForm = () => {
		let isError: boolean = false;
		//Mandatory  Fields
		if (formik.values.settingName === ''
			|| formik.values.settingDescription === ''
			|| selectedSettingStatus?.value === '' || selectedSettingStatus?.value === undefined
			|| addCampaignGoalRowData === undefined || addCampaignGoalRowData.length === 0) {
			return true;
		}

		if (selectedGoalValidateAmount() && goalParameterValidateAmount()) {
			return true;
		}

		if (communicationRecordTypeData.filter((obj: any) => obj.goalName === COMMUNICATION_RECORD).length !== 0
			&& goalParameterCountValidate()
		) {
			return true;
		}

		if (selectedGoalValidateCount() && goalParameterCountValidate()) {
			return true;
		}
		return isError;
	};

	const back = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				history.push('/campaign-management/campaign-setting/campaign-goal');
			}
		});
	};

	//	Formik post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
			setSubmitting(true);

			if (validateForm() === true) {
				swal('Error', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				return;
			}
			SendCheckCampaignGoalSettingByNameExist({ CampaignSettingId: 0, CampaignSettingName: formik.values.settingName })
				.then((response) => {
					if (response.status !== successResponse) {
						swal('Failed', 'Connection error Please close the form and try again 1', 'error');
						return;
					}
					let result = response.data;
					if (result) {
						swal('Error', 'Unable to record, the Setting Name is already exist', 'error');
						return;
					}
					swal({
						title: 'Confirmation',
						text: 'This action will update the setting data and configuration, please confirm',
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then((willUpdate) => {
						if (willUpdate) {
							saveCampaignGoal();
						}
					});

				})
				.catch(() => {
					swal('Failed', 'Connection error Please close the form and try again 2', 'error');
				});
			setSubmitting(false);
		},
	});
	const campaignGoalRequest = () => {
		const request: CampaignGoalSettingRequestModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			campaignSettingName: formik.values.settingName,
			campaignSettingDescription: formik.values.settingDescription,
			campaignSettingId: 0,
			isActive: selectedSettingStatus?.value === '1',
			goalParameterAmountId:
				!goalParameterAmount || goalParameterAmount.value === '' || goalParameterAmount.value === undefined
					? 0
					: parseInt(goalParameterAmount.value),
			goalParameterCountId:
				!goalParameterCount || goalParameterCount.value === '' || goalParameterCount.value === undefined
					? 0
					: parseInt(goalParameterCount.value),
			goalTypeCommunicationRecordList: communicationRecordTypeData,
			goalTypeDepositList: depositTypeData,
			goalTypeDepositCurrencyMinMaxList: depositTypeMinMaxData,
			goalTypeGameActivityList: gameActivityTypeData,
			goalTypeGameActivityCurrencyMinMaxList: gameActivityTypeMinData,
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};
		return request;
	}
	const handleFailure = (errorMessage : any, messagingHub : any) => {
		messagingHub.stop();
		swal('Failed', errorMessage, 'error');
		formik.setSubmitting(false);
	};
	const handleIfSuccess = (resultData: any) => {
		if (resultData.Status === successResponse) {
			swal('Success', 'Transaction successfully submitted', 'success');

			const campaignSettingId = resultData.Data;
			history.push(`/campaign-management/campaign-setting/view-campaign-goal/${campaignSettingId}`);
		} else {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
		}
	}
	const stopMessagingHubSaveSuccess = (messagingHub: any) => {
		if (messagingHub.state === HubConnected) {
			messagingHub.stop();
			formik.setSubmitting(false);
		}
	}
	const saveCampaignGoal = () => {
		formik.setSubmitting(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state !== HubConnected) {
						return
					}
					const request = campaignGoalRequest();
					UpsertCampaignGoalSetting(request)
						.then((response) => {
							//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK 
							if (response.status !== successResponse) {
								handleFailure(response.data.message,messagingHub)
								return
							}
							messagingHub.on(request.queueId.toString(), (message) => {
								let resultData = JSON.parse(message.remarks);
								handleIfSuccess(resultData);
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
								formik.setSubmitting(false);
							});
							setTimeout(() => {
								stopMessagingHubSaveSuccess(messagingHub);
							}, 30000);

						})
						.catch(() => {
							messagingHub.stop();
							swal('Failed', 'Problem in adding goal type', 'error');
							formik.setSubmitting(false);
						});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const campaignGoalDetailRequest = () => {
		const request: CampaignGoalSettingIdRequestModel = {
			campaignSettingId: id,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};
		return request;
	}
	const parseGoalParameterAddGoal = (parameterId: number, name: string): any =>
	parameterId === 0 ? [] : { label: name, value: parameterId };

	const campaignGoalDetailsResult = (responseData : any) => {
		assignIdsToCampaignGoalClone(responseData);

		formik.setFieldValue('settingName', '');
		formik.setFieldValue('settingDescription', responseData.campaignGoalSettingList.campaignSettingDescription);

		setSelectedSettingStatus({
			label: responseData.campaignGoalSettingList.campaignSettingStatus === 'True' ? 'Active' : 'Inactive',
			value: responseData.campaignGoalSettingList.campaignSettingStatus === 'True' ? '1' : '0',
		  });
		setGoalParameterAmount(parseGoalParameterAddGoal(
			responseData.campaignGoalSettingList.goalParameterAmountId,
			responseData.campaignGoalSettingList.goalParameterAmountName
		));
		setGoalParameterCount(parseGoalParameterAddGoal(
			responseData.campaignGoalSettingList.goalParameterCountId,
			responseData.campaignGoalSettingList.goalParameterCountName
		));
		setAddCampaignGoalRowData(responseData.goalTypeCommunicationRecordDepositList);
		setCommunicationRecordTypeData(responseData.goalTypeCommunicationRecordList);

		setDepositTypeData(responseData.goalTypeDepositList);
		setDepositTypeMinMaxData(responseData.goalTypeDepositCurrencyMinMaxList);

		setGameActivityTypeData(responseData.goalTypeGameActivityTypeList);
		setGameActivityTypeMinData(responseData.goalTypeGameActivityCurrencyMinMaxList);
	}
	const messageHubStopSuccess = (messagingHub : any) => {
		if (messagingHub.state === HubConnected) {
			messagingHub.stop();
		}
	}
	const getCampaignGoalDetailsById = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state !== HubConnected) { return }
					const request = campaignGoalDetailRequest();
					GetCampaignGoalSettingByIdDetails(request)
						.then((response) => {
							// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
							if (response.status !== successResponse) {
								messagingHub.stop();
								swal('Failed', response.data.message, 'error');
								return;
							}
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCampaignGoalSettingByIdDetailsResult(message.cacheId)
									.then((data) => {
										let responseData = data.data;
										campaignGoalDetailsResult(responseData);
									})
									.catch(() => {
										messagingHub.stop();
										swal('Failed', 'Problem in getting message type list', 'error');
									});
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
							});
							setTimeout(() => {
								messageHubStopSuccess(messagingHub);
							}, 30000);

						})
						.catch(() => {
							messagingHub.stop();
							swal('Failed', 'Problem in getting message type list', 'error');
						});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const _closeModal = () => {
		setModalShow(false);
	};
	const disabledCountField = () => {
		const isRowDataEmpty = addCampaignGoalRowData.length === 0;
		const isGoalCountConditionMet = selectedGoalCountCommRecord > 0 || selectedGoalCountTotalDeposit > 0 || selectedGoalCountGameActivity > 0;
		let isDisabled;
		if (isRowDataEmpty) {
			isDisabled = true;
		} else if (isGoalCountConditionMet) {
			isDisabled = false;
		} else {
			isDisabled = true;
		}
		return isDisabled
	}
	const disabledAmountField = () => {
		const isRowDataEmpty = addCampaignGoalRowData.length === 0;
		const isAnyGoalAmountPositive = selectedGoalAmtInitDeposit > 0 ||
			selectedGoalAmtFTD > 0 ||
			selectedGoalAmtNextDeposit > 0 ||
			selectedGoalAmtTotalDeposit > 0 ||
			selectedGoalAmtGameActivity > 0;

		let isDisabled;

		if (isRowDataEmpty) {
			isDisabled = true;
		} else if (isAnyGoalAmountPositive) {
			isDisabled = false;
		} else {
			isDisabled = true;
		}
		return isDisabled;
	}
	return (
		<MainContainer>
			<FormContainer onSubmit={formik.handleSubmit}>
				<FormHeader headerLabel={`Add Campaign Goal Setting`} />
				<ContentContainer>
					{actionPage === 'clone' && id > 0 && addCampaignGoalRowData.length === 0 && <SkeletonLoading />}
					{(actionPage === 'create' || addCampaignGoalRowData.length > 0) && (
						<>
							<FormGroupContainer>
								<div className='col-lg-4'>
									<label className='col-form-label required'>Setting Name</label>
									<input type='text' className='form-control form-control-sm' aria-label='Setting Name' {...formik.getFieldProps('settingName')} />
								</div>
								<div className='col-lg-5'>
									<label className='col-form-label required'>Setting Description</label>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Setting Description'
										{...formik.getFieldProps('settingDescription')}
									/>
								</div>
								<div className='col-lg-3'>
									<label className='col-form-label required'>Setting Status</label>
									<Select size='small' style={{ width: '100%' }} options={statusOption} onChange={handleChangeStatus} value={selectedSettingStatus} />
								</div>
							</FormGroupContainer>
							{/* <Separator /> */}
							<div className='separator separator-dashed my-5'></div>
							<div className='col-lg-12'>
								<p className='form-control-plaintext fw-bolder required'>Goal Type Configuration</p>
							</div>

							<div className='ag-theme-quartz' style={{ height: 300, width: '100%' }}>
								<AgGridReact
									rowData={addCampaignGoalRowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={true}
									paginationPageSize={10}
									columnDefs={columnDefs}
								/>
							</div>
							<FieldContainer>
								<ButtonsContainer>
									<DefaultButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)} title={'Add'} onClick={() => addGoalTypeConfig()} />
								</ButtonsContainer>
							</FieldContainer>
							{/* <Separator /> */}
							<div className='separator separator-dashed my-5'></div>
							<div className='col-lg-12'>
								<label className='form-label'>
									<b>Goal Parameters</b>
								</label>
							</div>
							<FormGroupContainer>
								<div className='col-lg-4'>
									<label className='col-form-label'>Amount</label>
									<Select
										isDisabled={
											disabledAmountField()
										}
										size='small'
										style={{ width: '100%' }}
										options={
											selectedGoalAmount != 0
												? goalParameterOptions.filter(
													(obj: any) =>
														obj.value == selectedGoalAmtFTD ||
														obj.value == selectedGoalAmtInitDeposit ||
														obj.value == selectedGoalAmtNextDeposit ||
														obj.value == selectedGoalAmtTotalDeposit ||
														obj.value == selectedGoalAmtGameActivity
												)
												: goalParameterOptions
										}
										onChange={onChangeGoalParameterAmount}
										value={goalParameterAmount}
									/>
								</div>

								<div className='col-lg-4'>
									<label className='col-form-label'>Count</label>
									<Select
										isDisabled={
											disabledCountField()
										}
										size='small'
										style={{ width: '100%' }}
										options={
											selectedGoalCount != 0
												? goalParameterCountOptions.filter(
													(obj: any) =>
														obj.value == selectedGoalCountTotalDeposit ||
														obj.value == selectedGoalCountGameActivity ||
														obj.value == selectedGoalCountCommRecord
												)
												: goalParameterCountOptions
										}
										onChange={onChangeGoalParameterCount}
										value={goalParameterCount}
									/>
								</div>
							</FormGroupContainer>

							<AddEditGoalTypeConfigModal
								showForm={modalShow}
								closeModal={_closeModal}
								action={action}
								goalTypeGuidId={goalTypeGuidId}
								goalTypeName={goalTypeName}
								setRowData={setAddCampaignGoalRowData}
								rowData={addCampaignGoalRowData}
								setCommunicationRecordTypeData={setCommunicationRecordTypeData}
								communicationRecordTypeData={communicationRecordTypeData}
								setGameActivityTypeData={setGameActivityTypeData}
								gameActivityTypeData={gameActivityTypeData}
								setGameActivityTypeMinData={setGameActivityTypeMinData}
								gameActivityTypeMinData={gameActivityTypeMinData}
								setDepositTypeData={setDepositTypeData}
								depositTypeData={depositTypeData}
								setDepositTypeMinMaxData={setDepositTypeMinMaxData}
								depositTypeMinMaxData={depositTypeMinMaxData}
								goalTypeConfigId={goalTypeConfigId}
								viewMode={viewMode}
							/>
						</>
					)}
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
							loading={formik.isSubmitting}
							title={'Submit'}
							loadingTitle={' Please wait... '}
							disabled={formik.isSubmitting}
						/>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)} title={'Back'} onClick={back} />
					</PaddedContainer>
				</FooterContainer>
			</FormContainer>
		</MainContainer>
	);
};

export default AddCampaignGoal;
