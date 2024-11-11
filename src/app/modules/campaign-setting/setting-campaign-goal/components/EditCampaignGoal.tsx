import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, pageMode} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultSecondaryButton,
	FieldContainer,
	FooterContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridLinkButton,
	LoaderButton,
	MainContainer,
	MlabButton,
	PaddedContainer,
	TableIconButton,
} from '../../../../custom-components';
import {useMasterReferenceOption} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {GoalSettingCommons, GoalSettingFields, GoalSettingHeaders, TransactionType} from '../../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstant from '../../constants/useCampaignSettingConstant';
import {ActiveEndedCampaignListModel, GoalTypeGameActivityUdtModel} from '../models';
import {GoalTypeCommunicationRecordUdtModel} from '../models/GoalTypeCommunicationRecordUdtModel';
import {GoalTypeDepositCurrencyMinMaxUdtModel} from '../models/GoalTypeDepositCurrencyMinMaxUdtModel';
import {GoalTypeDepositUdtModel} from '../models/GoalTypeDepositUdtModel';
import {GoalTypeGameActivityCurrMinMaxUdtModel} from '../models/GoalTypeGameActivityCurrMinMaxUdtModel';
import {GoalTypeListConfigurationModel} from '../models/GoalTypeListConfigurationModel';
import {CampaignGoalSettingIdRequestModel} from '../models/request/CampaignGoalSettingIdRequestModel';
import {CampaignGoalSettingRequestModel} from '../models/request/CampaignGoalSettingRequestModel';
import {CampaignGoalSettingByIdResponseModel} from '../models/response/CampaignGoalSettingByIdResponseModel';
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

const EditCampaignGoal: React.FC = () => {
	
	//	hooks
	const history = useHistory();
	const {successResponse, HubConnected} = useConstant();
	const {DropdownMasterReference, COMMUNICATION_RECORD, DEPOSIT, GAME_ACTIVITY} =
		useCampaignSettingConstant();
	usePromptOnUnload(true, 'Any changes will be discarded, please confirm?');

	const masterReference = useMasterReferenceOption(`${DropdownMasterReference.goalParameterAmount}, ${DropdownMasterReference.goalParameterCount}`);
	const goalParameterOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId === DropdownMasterReference.goalParameterAmount)
		.map((obj) => obj.options);
		//	Redux
		const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
		const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//	States
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [rowData, setRowData] = useState<Array<GoalTypeListConfigurationModel>>([]);
	const [goalParameterCount, setGoalParameterCount] = useState<any>('');
	const [goalParameterAmount, setGoalParameterAmount] = useState<any>('');
	const [selectedGoalAmount, setSelectedGoalAmount] = useState<any>(0);
	const [selectedGoalCount, setSelectedGoalCount] = useState<any>(0);
	const [depositTypeData, setDepositTypeData] = useState<Array<GoalTypeDepositUdtModel>>([]);
	const [depositTypeMinMaxData, setDepositTypeMinMaxData] = useState<Array<GoalTypeDepositCurrencyMinMaxUdtModel>>([]);
	const [gameActivityTypeData, setGameActivityTypeData] = useState<Array<GoalTypeGameActivityUdtModel>>([]);
	const [gameActivityTypeMinData, setGameActivityTypeMinData] = useState<Array<GoalTypeGameActivityCurrMinMaxUdtModel>>([]);
	const [communicationRecordTypeData, setCommunicationRecordTypeData] = useState<Array<GoalTypeCommunicationRecordUdtModel>>([]);
	const [goalTypeActiveEndedCampaignListRowData, setGoalTypeActiveEndedCampaignListRowData] = useState<Array<ActiveEndedCampaignListModel>>([]);

	const [modalShow, setModalShow] = useState<boolean>(false);
	const [goalTypeGuidId, setGoalTypeGuidId] = useState<any>('');
	const [goalTypeName, setGoalTypeName] = useState<any>('');
	const [action, setAction] = useState<any>('');
	const [actionPage, setActionPage] = useState<any>('');
	const [goalTypeConfigId, setGoalTypeConfigId] = useState<any>();

	const [viewMode, setViewMode] = useState<boolean>(false);
	const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
	const {id}: {id: number} = useParams();

	const [selectedGoalCountNthNextDep, setSelectedGoalCountNthNextDep] = useState<any>(0);
	const [selectedGoalCountTotalDeposit, setSelectedGoalCountTotalDeposit] = useState<any>(0);
	const [selectedGoalCountGameActivity, setSelectedGoalCountGameActivity] = useState<any>(0);
	const [selectedGoalCountCommRecord, setSelectedGoalCountCommRecord] = useState<any>(0);

	const [selectedGoalAmtFTD, setSelectedGoalAmtFTD] = useState<any>(0);
	const [selectedGoalAmtInitDeposit, setSelectedGoalAmtInitDeposit] = useState<any>(0);
	const [selectedGoalAmtNextDeposit, setSelectedGoalAmtNextDeposit] = useState<any>(0);
	const [selectedGoalAmtTotalDeposit, setSelectedGoalAmtTotalDeposit] = useState<any>(0);
	const [selectedGoalAmtGameActivity, setSelectedGoalAmtGameActivity] = useState<any>(0);

	const [rowCampaignActiveEndedData, setRowCampaignActiveEndedData] = useState<Array<ActiveEndedCampaignListModel>>([]);

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

	const isCamapaigActiveEnded: boolean = (goalTypeActiveEndedCampaignListRowData || []).some(
		(obj: any) => obj.campaignStatus === GoalSettingCommons.ACTIVE || obj.campaignStatus === GoalSettingCommons.ENDED
	  );
	  

	const goalParameterCountOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId === DropdownMasterReference.goalParameterCount)
		.map((obj) => obj.options);

	const statusOption = CommonLookups('settingStatuses');
	//	Effects
	useEffect(() => {
		if (id > 0) {
			//	edit
			setActionPage('edit');
			getCampaignGoalDetailsById();
		}
	}, []);

	const setAmountCountValues = (countFTD : any,countInitDeposit: any,countNthNextDeposit: any,countTotalDeposit: any,countGameActivityAmt: any) => {
		if (countFTD > 0) {
			setSelectedGoalAmount(goalAmtFTDAId);
			setSelectedGoalAmtFTD(goalAmtFTDAId);
		} else setSelectedGoalAmtFTD(0);

		if (countInitDeposit > 0) {
			setSelectedGoalAmount(goalAmtIDAId);
			setSelectedGoalAmtInitDeposit(goalAmtIDAId);
		} else setSelectedGoalAmtInitDeposit(0);

		if (countNthNextDeposit > 0) {
			setSelectedGoalAmount(goalNthNextDepositId);
			setSelectedGoalAmtNextDeposit(goalNthNextDepositId);
		} else setSelectedGoalAmtNextDeposit(0);

		if (countTotalDeposit > 0) {
			setSelectedGoalAmount(goalTotalDepositId);
			setSelectedGoalAmtTotalDeposit(goalTotalDepositId);
		} else setSelectedGoalAmtTotalDeposit(0);

		if (countGameActivityAmt > 0) {
			setSelectedGoalAmount(goalGameActivityAmtId);
			setSelectedGoalAmtGameActivity(goalGameActivityAmtId);
		} else setSelectedGoalAmtGameActivity(0);

	}
	const setCountValues = (countCommRecordCnt: any,countNthNextDepositCnt: any,countTotalDepositCnt: any,countGameActivityCnt: any) => {
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
	}
	//	Watcher
	useEffect(() => {
		setModalShow(false);

		if (rowData.length === 0 || rowData == undefined) {
			setGoalParameterAmount(null);
			setGoalParameterCount(null);
		}
		const countFTD = rowData.filter(
			(obj: any) => obj.goalTypeTransactionTypeId == TransactionType.FirstTimeDepositId && obj.goalName === DEPOSIT
		).length; //no threshold
		const countInitDeposit = rowData.filter(
			(obj: any) => obj.goalTypeTransactionTypeId == TransactionType.InitialDepositId && obj.goalName === DEPOSIT
		).length; //no threshold

		const countNthNextDeposit = rowData.filter(
			(obj: any) => obj.goalTypeTransactionTypeId == TransactionType.NthNextDepositId && obj.goalName === DEPOSIT
			// obj.thresholdTypeId == thresholdTypeIdAmount
		).length;
		const countTotalDeposit = rowData.filter(
			(obj: any) =>
				obj.goalTypeTransactionTypeId == TransactionType.TotalDeposit && obj.goalName === DEPOSIT && obj.thresholdTypeId == thresholdTypeIdAmount
		).length;

		const countGameActivityAmt = rowData.filter(
			(obj: any) => obj.goalName === GAME_ACTIVITY && obj.thresholdTypeId == thresholdTypeIdAmount
		).length;
		//	Amount Dropdown

		setAmountCountValues(countFTD, countInitDeposit, countNthNextDeposit, countTotalDeposit, countGameActivityAmt)

		//	Count Dropdown
		const countNthNextDepositCnt = rowData.filter(
			(obj: any) =>
				obj.goalTypeTransactionTypeId == TransactionType.NthNextDepositId && obj.goalName === DEPOSIT && obj.thresholdTypeId == thresholdTypeIdCount
		).length;

		const countTotalDepositCnt = rowData.filter(
			(obj: any) =>
				obj.goalTypeTransactionTypeId == TransactionType.TotalDeposit && obj.goalName === DEPOSIT && obj.thresholdTypeId == thresholdTypeIdCount
		).length;

		const countGameActivityCnt = rowData.filter((obj: any) => obj.goalName === GAME_ACTIVITY && obj.thresholdTypeId == thresholdTypeIdCount).length;
		const countCommRecordCnt = rowData.filter((obj: any) => obj.goalName === COMMUNICATION_RECORD).length;

		setCountValues(countCommRecordCnt, countNthNextDepositCnt, countTotalDepositCnt, countGameActivityCnt);

		//auto remove selected value on disabled dropdown field

		if (countFTD === 0 && countInitDeposit === 0 && countNthNextDeposit === 0 && countTotalDeposit === 0 && countGameActivityAmt === 0) {
			setGoalParameterAmount(null);
		}

		if (countCommRecordCnt === 0 && countTotalDepositCnt === 0 && countGameActivityCnt === 0) {
			setGoalParameterCount(null);
		}

	}, [rowData]);

	const onGridCampaignReadyEditCampaignGoal = (params: any) => {
		setRowCampaignActiveEndedData(goalTypeActiveEndedCampaignListRowData);
	};

	const _viewCampaign = (campaignId: number) => {
		const win: any = window.open(`/campaign-management/campaign-setting/view-campaign-goal/${campaignId}`, '_blank');
		win.focus();
	};
	const cellRendererEditViewGoal = (params: any) => {
		return (
			<GridLinkButton
				access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
				title={params.data.campaignName}
				disabled={false}
				onClick={() => _viewCampaign(params.data.campaignId)}
			/>)
	}
	const columnCampaignDefs = [
		{headerName: GoalSettingHeaders.HEADER_NO, data: GoalSettingFields.FIELD_NO, width: 100},
		{
			headerName: GoalSettingHeaders.HEADER_CAMPAIGN_NAME,
			data: GoalSettingFields.FIELD_CAMPAIGN_NAME,
			cellRenderer: cellRendererEditViewGoal
		},
		{headerName: GoalSettingHeaders.HEADER_CAMPAIGN_STATUS, data: GoalSettingFields.FIELD_CAMPAIGN_STATUS},
		{headerName: GoalSettingHeaders.HEADER_CAMPAIGN_REPORT_PERIOD, data: GoalSettingFields.FIELD_CAMPAIGN_REPORT_PERIOD, width: 300},
	];
	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const editMessage = (goalTypeId: any, goalTypeName: any, intervalSourceName: any) => {
		let message = 'Edit';

		const countMappedGoal = rowData.filter(
			(x) =>
				(goalTypeId !== 0 && x.intervalSourceGoalTypeId === goalTypeId) ||
				(goalTypeId === 0 && x.intervalSourceGoalTypeName === goalTypeName && x.goalTypeName !== goalTypeName)
		).length;

		message = countMappedGoal > 0 ? 'Goal type used as interval source on other goal type. Unlink to edit all details.' : message;

		return message;
	};
	const cellRendererEditPageViewGoalSetting = (params: any) => {
		return (
			<GridLinkButton
				access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
				title={params.data.goalName}
				disabled={false}
				onClick={() => viewGoalTypeConfigEditCampaignGoal(params.data.goalTypeName, params.data.goalTypeGuid, params.data.goalTypeCommunicationRecordDepositId)}
			/>
		)
	}
	const cellRendererEditPageInterval = (params: any) => {
		return (
			<>
				{params.data.intervalRelationalOperatorName} {params.data.intervalSourceName ? ' - ' + params.data.intervalSourceName : ''}
				{params.data.intervalNumber === 0 ? '' : ' - ' + params.data.intervalNumber}
			</>
		)
	}
	const cellRendererEditPageAction = (params : any) => {
		return (
			<>
					{params.data.messageResponseId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										faIcon={faPencilAlt}
										isDisable={isCamapaigActiveEnded}
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
										iconColor={isCamapaigActiveEnded === true ? '' : 'text-danger'}
										isDisable={
											isCamapaigActiveEnded === true
												? true
												: removeMessage(
														params.data.goalTypeCommunicationRecordDepositId,
														params.data.goalTypeName,
														params.data.intervalSourceGoalTypeName
												  ) !== 'Remove'
										}
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										faIcon={faTrash}
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
				</>
		)
	}
	//	Pagination and grid
	const columnDefs : (ColDef<GoalTypeListConfigurationModel> | ColGroupDef<GoalTypeListConfigurationModel>)[] =[
		{headerName: 'Goal Type Name', field: 'goalTypeName'},
		{
			headerName: 'Goal Type',
			field: 'goalName',
			width: 400,
			cellRenderer: cellRendererEditPageViewGoalSetting
		},
		{headerName: 'Data Source', field: 'goalTypeDataSourceName'},
		{
			headerName: 'Interval',
			field: 'intervalNumber',
			cellRenderer: cellRendererEditPageInterval
		},
		{headerName: 'Period', field: 'goalTypePeriodName'},
		{
			headerName: 'Action',
			cellRenderer: cellRendererEditPageAction
		},
	];
	const removeMessage = (goalTypeId: any, goalTypeName: any, intervalSourceName: any) => {
		let message = 'Remove';

		const countMappedGoal = rowData.filter(
			(x) =>
				(goalTypeId !== 0 && x.intervalSourceGoalTypeId === goalTypeId) ||
				(goalTypeId === 0 && x.intervalSourceGoalTypeName === goalTypeName && x.goalTypeName !== goalTypeName)
		).length;

		message =
			countMappedGoal > 0 ? 'Goal type used as interval source on other goal type within this setting. Unlink to remove the goal type.' : message;

		return message;
	};
	const onGridReadyEditCampaignGoal = (params: any) => {
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	//	Methods
	const handleChangeStatusEditCampaignGoal = (params: LookupModel) => {
		setSelectedSettingStatus(params);
	};

	const onChangeGoalParameterCountEditCampaignGoal = (val: any) => {
		setGoalParameterCount(val);
	};

	const onChangeGoalParameterAmountEditCampaignGoal = (val: any) => {
		setGoalParameterAmount(val);
	};

	const viewGoalTypeConfigEditCampaignGoal = (paramGoalTypeName: string, paramGoalTypeGuidId: string, paramGoalTypeConfigId: any) => {
		setAction(GoalSettingCommons.VIEW);
		setModalShow(true);
		setGoalTypeName(paramGoalTypeName);
		setGoalTypeGuidId(paramGoalTypeGuidId);
		setGoalTypeConfigId(paramGoalTypeConfigId);
		setViewMode(true);
	};

	const editGoalTypeConfig = (paramGoalTypeName: string, paramGoalTypeGuidId: string, paramGoalTypeConfigId: any) => {
		if (isCamapaigActiveEnded === false) {
			setAction(GoalSettingCommons.EDIT);
			setModalShow(true);
			setGoalTypeName(paramGoalTypeName);
			setGoalTypeGuidId(paramGoalTypeGuidId);
			setGoalTypeConfigId(paramGoalTypeConfigId);
			setViewMode(false);
		}
	};

	const removeGoalTypeConfig = (_paramGoalName: string, _paramGoalTypeName: string, paramGoalTypeGuidId: string) => {
		swal({
			title: 'Confirmation',
			text: 'Goal type configuration will be removed from the setting, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				//	Main
				const updatedRowData = rowData.filter((cd: any) => cd.goalTypeName !== _paramGoalTypeName);
				setRowData(updatedRowData);

				if (_paramGoalName === COMMUNICATION_RECORD) {
					let removeCommunicationRecord = [];
					removeCommunicationRecord = communicationRecordTypeData.filter((obj: any) => obj.goalTypeName !== _paramGoalTypeName);
					setCommunicationRecordTypeData(removeCommunicationRecord);
				} else if (_paramGoalName === DEPOSIT) {
					let removeDepositRecord = [];
					removeDepositRecord = depositTypeData.filter((obj: any) => obj.goalTypeName !== _paramGoalTypeName);
					setDepositTypeData(removeDepositRecord);
				} else if (_paramGoalName === GAME_ACTIVITY) {
					let removeGameActivityRecord = [];
					removeGameActivityRecord = gameActivityTypeData.filter((obj: any) => obj.goalTypeName !== _paramGoalTypeName);
					setGameActivityTypeData(removeGameActivityRecord);
				}
			}
		});
	};

	const addGoalTypeConfigEditCampaignGoal = () => {
		setAction('Add');
		setModalShow(true);
		setGoalTypeGuidId(Guid.create().toString());
		setViewMode(false);
		setGoalTypeConfigId(0);
	};
	const validateFormikValues = () => {
		if (formik.values.settingName === ''
		|| formik.values.settingDescription === '') {
			return true;
		}
		if (selectedSettingStatus?.value === '' || selectedSettingStatus?.value === undefined) {
			return true;
		}

		if (rowData === undefined || rowData.length === 0) {
			return true;
		}
	}
	const selectedGoalValidateAmountEditCampaign = () => {
		return (
			selectedGoalAmtFTD > 0 ||
			selectedGoalAmtInitDeposit > 0 ||
			selectedGoalAmtNextDeposit > 0 ||
			selectedGoalAmtTotalDeposit > 0 ||
			selectedGoalAmtGameActivity > 0
			)
	}
	const goalParameterValidateAmountEditCampaign = () => goalParameterAmount === null 
			||	goalParameterAmount.value === '' 
			||	goalParameterAmount.value === undefined 
			|| goalParameterAmount.value === 0 
			|| goalParameterAmount.length === 0;


	const goalParameterCountValidateEditCampaign = () => {
		return (
			goalParameterCount === null ||
			goalParameterCount.value === '' ||
			goalParameterCount.value === undefined ||
			goalParameterCount.value === 0 ||
			goalParameterCount.length === 0
		)
	}	
	const selectedGoalValidateCountEditCampaign = () => {
		return(
			selectedGoalCountCommRecord > 0 ||
			selectedGoalCountNthNextDep > 0 ||
			selectedGoalCountTotalDeposit > 0 ||
			selectedGoalCountGameActivity > 0
		)
	}	
	const validateForm = () => {
		let isError: boolean = false;

		//Mandatory  Fields
		if(validateFormikValues())
		{
			return true
		}

		if (selectedGoalValidateAmountEditCampaign() && goalParameterValidateAmountEditCampaign()) {
			return true;
		}

		if (communicationRecordTypeData.filter((obj: any) => obj.goalName === COMMUNICATION_RECORD).length !== 0
		 && goalParameterCountValidateEditCampaign()) {
				return true;
		}

		if (
			selectedGoalValidateCountEditCampaign() && goalParameterCountValidateEditCampaign()
		) {
			
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
	const handleSubmitFormik = (result: any) => {
		if (result) {
			swal('Error', 'Unable to record, the Setting Name is already exist', 'error');
		} else {
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
		}
	}
	//	Formik post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
			setSubmitting(true);
			if (validateForm() === true) {
				swal('Error', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				setSubmitting(false);
				return;
			}
			SendCheckCampaignGoalSettingByNameExist({ CampaignSettingId: id, CampaignSettingName: formik.values.settingName })
				.then((response) => {
					if (response.status !== successResponse) {
						swal('Failed', 'Connection error Please close the form and try again 1', 'error');
						return;
					}
					let result = response.data;
					handleSubmitFormik(result);
				})
				.catch(() => {
					swal('Failed', 'Connection error Please close the form and try again 2', 'error');
				});
			setSubmitting(false);
		},
	});
	const  setCampaignGoalSettingRequestModel = () => {
		const req: CampaignGoalSettingRequestModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			campaignSettingId: id,
			campaignSettingName: formik.values.settingName,
			campaignSettingDescription: formik.values.settingDescription,
			isActive: selectedSettingStatus?.value === '1',
			createdBy: userAccessId,
			updatedBy: userAccessId,
			goalTypeCommunicationRecordList: communicationRecordTypeData,
			goalTypeDepositList: depositTypeData,
			goalTypeDepositCurrencyMinMaxList: depositTypeMinMaxData,
			goalTypeGameActivityList: gameActivityTypeData,
			goalTypeGameActivityCurrencyMinMaxList: gameActivityTypeMinData,
			goalParameterAmountId:
				!goalParameterAmount || goalParameterAmount.value === '' || goalParameterAmount.value === undefined
					? 0
					: parseInt(goalParameterAmount.value),
			goalParameterCountId:
				!goalParameterCount || goalParameterCount.value === '' || goalParameterCount.value === undefined
					? 0
					: parseInt(goalParameterCount.value),
		};
		return req;
	}
	const handleIfSuccessEditCampaign = (resultData: any) => {
		if (resultData.Status === successResponse) {
			swal('Success', 'Transaction successfully submitted, ', 'success');
			const campaignSettingId = resultData.Data;
			history.push(`/campaign-management/campaign-setting/view-campaign-goal/${campaignSettingId}`);
		} else {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
		}
	}
	const stopMessagingHubToDisconnect = (messagingHub: any) => {
		if (messagingHub.state === HubConnected) {
			messagingHub.stop();
			formik.setSubmitting(false);
		}
	}
	const saveCampaignGoal = () => {
		formik.setSubmitting(true);
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state !== HubConnected) { return }
					//filter gaming currency
					// KC: This causes to truncate game activity minmax data, if game activity goaltype count > 1
					// const uniqueCurrencyIds: any = [];
					// const gameActivityTypeMinDataObj = gameActivityTypeMinData.filter((element) => {
					// 	const isDuplicate = uniqueCurrencyIds.includes(element.currencyId);
					// 	if (!isDuplicate) {
					// 		uniqueCurrencyIds.push(element.currencyId);
					// 		return true;
					// 	}
					// 	return false;
					// });

					const request = setCampaignGoalSettingRequestModel();

					UpsertCampaignGoalSetting(request)
						.then((response) => {
							//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
							if (response.status !== successResponse) {
								messagingHub.stop();
								swal('Failed', response.data.message, 'error');
								formik.setSubmitting(false);
								return;
							}
							messagingHub.on(request.queueId.toString(), (message) => {
								let resultData = JSON.parse(message.remarks);
								handleIfSuccessEditCampaign(resultData);
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
								formik.setSubmitting(false);
							});
							setTimeout(() => {
								stopMessagingHubToDisconnect(messagingHub);
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
	const parseGoalParameter = (parameterId: number, name: string): any =>
		parameterId === 0 ? [] : { label: name, value: parameterId };
	const campaignGoalDetailRequestEditCampaignGoal = () => {
		const request: CampaignGoalSettingIdRequestModel = {
			campaignSettingId: id,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};
		return request;
	}
	const setCampaignGoalDetails = (responseData: any) => {
		assignIdsToCampaignGoal(responseData);
		formik.setFieldValue('settingName', responseData.campaignGoalSettingList.campaignSettingName);
		formik.setFieldValue('settingDescription', responseData.campaignGoalSettingList.campaignSettingDescription);
		setSelectedSettingStatus({
			label: responseData.campaignGoalSettingList.campaignSettingStatus === 'True' ? 'Active' : 'Inactive',
			value: responseData.campaignGoalSettingList.campaignSettingStatus === 'True' ? '1' : '0',
		});
		setGoalParameterAmount(parseGoalParameter(
			responseData.campaignGoalSettingList.goalParameterAmountId,
			responseData.campaignGoalSettingList.goalParameterAmountName
		));
		setGoalParameterCount(parseGoalParameter(
			responseData.campaignGoalSettingList.goalParameterCountId,
			responseData.campaignGoalSettingList.goalParameterCountName
		));
		setRowData(responseData.goalTypeCommunicationRecordDepositList);
		setCommunicationRecordTypeData(responseData.goalTypeCommunicationRecordList);

		setDepositTypeData(responseData.goalTypeDepositList);
		setDepositTypeMinMaxData(responseData.goalTypeDepositCurrencyMinMaxList);
		setGoalTypeActiveEndedCampaignListRowData(responseData.campaignList);
		setGameActivityTypeData(responseData.goalTypeGameActivityTypeList);
		setGameActivityTypeMinData(responseData.goalTypeGameActivityCurrencyMinMaxList);
	}
	const getCampaignGoalDetailsById = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						const request =campaignGoalDetailRequestEditCampaignGoal();

						GetCampaignGoalSettingByIdDetails(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status !== successResponse) {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
									return
								}
								messagingHub.on(request.queueId.toString(), (message) => {
									GetCampaignGoalSettingByIdDetailsResult(message.cacheId)
										.then((data) => {
											setIsPageLoaded(true);
											let responseData = data.data;
											setCampaignGoalDetails(responseData);
										})
										.catch(() => {
											messagingHub.stop();
										});
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								});
								setTimeout(() => {
									if (messagingHub.state === HubConnected) {
										messagingHub.stop();
									}
								}, 30000);

							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in getting message type list', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const _closeModal = () => {
		setModalShow(false);
	};
	const shouldBeDisabledAmountSelect = () => {
		const isNoDataSelected =
			rowData.length === 0 ||
			selectedGoalAmtInitDeposit > 0 ||
			selectedGoalAmtFTD > 0 ||
			selectedGoalAmtNextDeposit > 0 ||
			selectedGoalAmtTotalDeposit > 0 ||
			selectedGoalAmtGameActivity > 0;
		return isCamapaigActiveEnded  || !isNoDataSelected;
	}
	const shoulBeDisabledCountSelect = () => {
		const isDisabled =
			isCamapaigActiveEnded ||
			rowData.length === 0 ||
			!(selectedGoalCountCommRecord > 0 || selectedGoalCountTotalDeposit > 0 || selectedGoalCountGameActivity > 0);
		return isDisabled
	}
	const assignIdsToCampaignGoal = (responseData: CampaignGoalSettingByIdResponseModel) => {
		responseData.goalTypeDepositList.forEach((goalTypeDeposit) => {
			let depositGuid = Guid.create().toString();

			goalTypeDeposit.depositGuid = depositGuid;

			responseData.goalTypeDepositCurrencyMinMaxList
				.filter((a) => a.goalTypeDepositId === goalTypeDeposit.goalTypeDepositId)
				.forEach((a) => (a.depositGuid = depositGuid));

			responseData.goalTypeCommunicationRecordDepositList
				.filter((d) => d.goalTypeCommunicationRecordDepositId === goalTypeDeposit.goalTypeDepositId)
				.forEach((d) => (d.goalTypeGuid = depositGuid));
		});

		responseData.goalTypeGameActivityTypeList.forEach((goalTypeGameActivity) => {
			let goalTypeGuid = Guid.create().toString();

			goalTypeGameActivity.goalTypeGuid = goalTypeGuid;

			responseData.goalTypeGameActivityCurrencyMinMaxList
				.filter((a) => a.goalTypeGameActivityId === goalTypeGameActivity.goalTypeGameActivityId)
				.forEach((a) => (a.goalTypeGuid = goalTypeGuid));

			responseData.goalTypeCommunicationRecordDepositList
				.filter((d) => d.goalTypeCommunicationRecordDepositId === goalTypeGameActivity.goalTypeGameActivityId)
				.forEach((d) => (d.goalTypeGuid = goalTypeGuid));
		});
	};
	const isDisabledSubmit = () => {
	return	formik.isSubmitting || (goalTypeActiveEndedCampaignListRowData?.some(
			(obj: any) => obj.campaignStatus === GoalSettingCommons.ACTIVE || obj.campaignStatus === GoalSettingCommons.ENDED
		  ))
	}
	return (
		<MainContainer>
			<FormContainer onSubmit={formik.handleSubmit}>
				<FormHeader headerLabel={`Edit Campaign Goal Setting`} />
				<ContentContainer>
					{actionPage === pageMode.edit && id > 0 && rowData.length === 0 && !isPageLoaded && <SkeletonLoading />}

					{actionPage === pageMode.edit && isPageLoaded && formik.values.settingName !== '' && (
						<>
							<FormGroupContainer>
								<div className='col-lg-4'>
									<label className='col-form-label required'>Setting Name</label>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Setting Name'
										{...formik.getFieldProps('settingName')}
										disabled={isCamapaigActiveEnded}
									/>
								</div>
								<div className='col-lg-5'>
									<label className='col-form-label required'>Setting Description</label>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Setting Description'
										{...formik.getFieldProps('settingDescription')}
										disabled={isCamapaigActiveEnded}
									/>
								</div>
								<div className='col-lg-3'>
									<label className='col-form-label required'>Setting Status</label>
									<Select
										size='small'
										style={{width: '100%'}}
										options={statusOption}
										onChange={handleChangeStatusEditCampaignGoal}
										value={selectedSettingStatus}
										isDisabled={isCamapaigActiveEnded}
									/>
								</div>
							</FormGroupContainer>
							{/* <Separator /> */}
							<div className='separator separator-dashed my-5'></div>
							<div className='col-lg-12'>
								<p className='form-control-plaintext fw-bolder required'>Goal Type Configuration</p>
							</div>

							<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReadyEditCampaignGoal}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={true}
									paginationPageSize={10}
									columnDefs={columnDefs}
								/>
							</div>
							<FieldContainer>
								<ButtonsContainer>
									<MlabButton
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										onClick={() => addGoalTypeConfigEditCampaignGoal()}
										disabled={
											goalTypeActiveEndedCampaignListRowData === undefined
												? false
												: goalTypeActiveEndedCampaignListRowData.filter(
														(obj: any) => obj.campaignStatus === GoalSettingCommons.ACTIVE || obj.campaignStatus === GoalSettingCommons.ENDED
												  ).length > 0
										}
										label={'Add'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										size={'sm'}
									></MlabButton>
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
											shouldBeDisabledAmountSelect()
										}
										size='small'
										style={{width: '100%'}}
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
										onChange={onChangeGoalParameterAmountEditCampaignGoal}
										value={goalParameterAmount}
									/>
								</div>
								<div className='col-lg-4'>
									<label className='col-form-label'>Count</label>
									<Select
										isDisabled={
											shoulBeDisabledCountSelect()
										}
										size='small'
										style={{width: '100%'}}
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
										onChange={onChangeGoalParameterCountEditCampaignGoal}
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
								setRowData={setRowData}
								rowData={rowData}
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
								actionPage={actionPage}
							/>

							<hr />
							{goalTypeActiveEndedCampaignListRowData !== undefined ? (
								goalTypeActiveEndedCampaignListRowData.length !== 0 && (
									<>
										<div className='card-title mb-5'>
											<h5 className='fw-bolder m-0'>Active and Ended Campaign</h5>
										</div>
										<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
											<AgGridReact
												rowData={rowCampaignActiveEndedData}
												defaultColDef={{
													sortable: true,
													resizable: true,
												}}
												components={{
													tableLoader: tableLoader,
												}}
												onGridReady={onGridCampaignReadyEditCampaignGoal}
												rowBuffer={0}
												//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
												pagination={true}
												paginationPageSize={10}
												columnDefs={columnCampaignDefs}
											/>
										</div>
										<hr />
									</>
								)
							) : (
								<></>
							)}
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
							disabled={
								isDisabledSubmit()
							}
						/>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)} title={'Back'} onClick={back} />
					</PaddedContainer>
				</FooterContainer>
			</FormContainer>
		</MainContainer>
	);
};

export default EditCampaignGoal;
