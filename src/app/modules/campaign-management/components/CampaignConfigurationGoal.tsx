import {faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {right} from '@popperjs/core';
import {useCallback, useEffect, useState} from 'react';
import {DefaultTableButton, FieldContainer} from '../../../custom-components';
import Select from 'react-select';
import {AgGridReact} from 'ag-grid-react';
import * as campaign from '../redux/CampaignManagementRedux';
import {useSelector, shallowEqual, useDispatch} from 'react-redux';
import { getCampaignGoalSettingById} from '../redux/CampaignManagementService';
import {CampaignGoalSettingListModel} from '../models/response/CampaignGoalSettingListModel';
import {RootState} from '../../../../setup';
import {CampaignModel} from '../models/request/CampaignModel';
import {CampaignIncentiveDataSourceModel} from '../models/request/CampaignIncentiveDataSourceModel';
import {IncentiveDataSourceOptionsModel} from '../models/options/IncentiveDataSourceOptionsModel';
import {LookupModel} from '../../../common/model';
import {CampaignConfigurationGoalModel} from '../models/request/CampaignConfigurationGoalModel';
import {CampaignStatusEnum, HttpStatusCodeEnum, MessageGroupEnum} from '../../../constants/Constants';
import {Link} from 'react-router-dom';
import {CampaignConfigurationCommunicationModel} from '../models/request/CampaignConfigurationCommunicationModel';
import useCampaignManagementOptions from '../../../custom-functions/system/option/useCampaignManagementOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';


type CampaignConfiguration = {
	viewMode: boolean;
	currentCampaignStatus?: number;
};

export const CampaignConfigurationGoal = (Props: CampaignConfiguration) => {
	const dispatch = useDispatch();
	const [campaignGoalToggle, setCampaignGoalToggle] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>();
	const [selectedCampaignGoal, setSelectedCampaignGoal] = useState<any>();
	const [campaignGoalList, setCampaignGoalList] = useState<Array<any>>([]);
	const [selectedCampaignGoalList, setSelectedCampaignGoalList] = useState<Array<CampaignGoalSettingListModel>>([]);
	const [selectedPrimaryGoal, setSelectedPrimaryGoal] = useState<any>();
	const [selectedValidationRule, setSelectedValidationRule] = useState<any>();
	const [selectedLeaderValidation, setSelectedLeaderValidation] = useState<any>();
	const campaignStatusIdState = useSelector<RootState>(({campaign}) => campaign.campaignStatusId, shallowEqual) as number;
	const [disableAddCampaignGoal, setDisableAddCampaignGoal] = useState<boolean>(false);

	const leaderValidationOptions: LookupModel[] = [
		{
			label: 'Valid',
			value: '1',
		},
		{
			label: 'ALL',
			value: '2',
		},
	];
	const [selectedPointSetting, setSelectedPointSetting] = useState<LookupModel | null>();
	const [selectedValueSetting, setSelectedValueSetting] = useState<LookupModel | null>();

	const [pointSettings, setPointSettings] = useState<Array<LookupModel>>();
	const [valueSettings, setValueSettings] = useState<Array<LookupModel>>();

	const [selectedIncentiveDataSource, setSelectedIncentiveDataSource] = useState<IncentiveDataSourceOptionsModel | null>();
	const [incentiveDataSourceOptions, setIncentiveDataSourceOptions] = useState<Array<IncentiveDataSourceOptionsModel>>([]);
	let _campaignGoalListItem = Array<IncentiveDataSourceOptionsModel>();

	// State
	const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign, shallowEqual) as CampaignModel;
	const getGoalParameterPointSettingState = useSelector<RootState>(
		({campaign}) => campaign.getAllCampaignGoalParameterPointSetting,
		shallowEqual
	) as Array<LookupModel>;
	const getGoalParameterValueSettingState = useSelector<RootState>(
		({campaign}) => campaign.getAllCampaignGoalParameterValueSetting,
		shallowEqual
	) as Array<LookupModel>;
	const {messageGroupId} = useSelector<RootState>(
		({campaign}) => campaign.campaign?.campaignConfigurationCommunicationModel,
		shallowEqual
	) as CampaignConfigurationCommunicationModel;

	const {getCampaignGoalSettingOptions,campaignGoalOptions
			,getCampaignGoalParameterPointOptions,campaignGoalParameterPointOptions
			,getCampaignGoalParameterValueOptions, campaignGoalParamaterValueOptions
		} 
	= useCampaignManagementOptions();
	
	const MAX_CAMPAIGN_GOAL = 5;

	useEffect(() => {
		if(selectedValidationRule){
			console.log('asdasds');
		}
	}, [selectedValidationRule]);
	// USE EFFECTS
	useEffect(() => {
		getCampaignGoalSettingOptions();
		setSelectedLeaderValidation(leaderValidationOptions[0]);
		if (getGoalParameterValueSettingState != undefined && getGoalParameterValueSettingState.length > 0)
			setValueSettings(getGoalParameterValueSettingState);
		if (getGoalParameterPointSettingState != undefined && getGoalParameterPointSettingState.length > 0)
			setPointSettings(getGoalParameterPointSettingState);
	}, []);
	useEffect(() => {
		if(campaignState.campaignConfigurationCommunicationModel?.messageGroupId === MessageGroupEnum.Call)
		{
			setSelectedLeaderValidation(leaderValidationOptions[0]);
			return;
		}
		
		resetCampaignConfigurationGoal();

	}, [campaignState.campaignConfigurationCommunicationModel.messageGroupId]);
	useEffect(() => {
		checkLeaderValidation();
		
		if (campaignState.campaignId === 0 || campaignState.campaignId === undefined) {
			return;
		}
		handleSetCampaingGoalList();

		const selectedValidateRules = campaignState.campaignConfigurationGoalModel.find(
			(a) => a.campaignGoalSettingId == campaignState.campaignConfigurationModel?.validationRulesId
		);

		if (selectedValidateRules != undefined) {
			const validateRule: any = {
				label: selectedValidateRules.campaignSettingName,
				value: selectedValidateRules.campaignGoalSettingId,
			};
			setSelectedValidationRule(validateRule);
		}else {
			setSelectedValidationRule(undefined);
		}

		const selectedPrimaryRule = campaignState.campaignConfigurationGoalModel.find(
			(a) => a.campaignGoalSettingId == campaignState.campaignConfigurationModel?.primaryGoalId
		);

		if (selectedPrimaryRule !== undefined) {
			const validateRule: any = {
				label: selectedPrimaryRule.campaignSettingName,
				value: selectedPrimaryRule.campaignGoalSettingId,
			};
			setSelectedPrimaryGoal(validateRule);
		}

		const selectedPointSetting = getGoalParameterPointSettingState.find(
			(a) => a.value == campaignState.campaignConfigurationModel?.goalParameterPointSettingId.toString()
		);

		if (selectedPointSetting !== undefined) {
			setSelectedPointSetting(selectedPointSetting);
		}

		const selectedValueSetting = getGoalParameterValueSettingState.find(
			(a) => a.value == campaignState.campaignConfigurationModel?.pointValueSettingId.toString()
		);

		if (selectedValueSetting !== undefined) {
			setSelectedValueSetting(selectedValueSetting);
		}
		setSelectedLeaderValidation(
			leaderValidationOptions.find((a) => a.value === campaignState.campaignConfigurationModel?.leaderValidationId.toString())
		);

	}, [campaignState]);

	useEffect(() => {
		if (selectedCampaignGoalList.length > 0) {
			_campaignGoalListItem = [];
			selectedCampaignGoalList.forEach((element) => {
				populateIncentiveDataSource(element);
			});
		}
		setIncentiveDataSourceOptions([..._campaignGoalListItem]);
		if (_campaignGoalListItem.length > 0 && campaignState.campaignConfigurationGoalModel.length > 0) {
			let goalParameterName = '';
			let goalParameterId = 0;
			if (campaignState.campaignIncentiveDataSourceModel?.amountParameterId != 0) {
				goalParameterName = 'GoalParameterAmount';
				goalParameterId = campaignState.campaignIncentiveDataSourceModel?.amountParameterId;
			} else if (campaignState.campaignIncentiveDataSourceModel?.countParameterId != 0) {
				goalParameterName = 'GoalParameterCount';
				goalParameterId = campaignState.campaignIncentiveDataSourceModel.countParameterId;
			}
			let datasource = _campaignGoalListItem?.find(
				(a) => a.value == (goalParameterName + campaignState.campaignIncentiveDataSourceModel?.campaignSettingId + goalParameterId).toString()
			);
			setSelectedIncentiveDataSource(datasource);
		}
		setDisableAddCampaignGoal(false);
		if (selectedCampaignGoalList.length === MAX_CAMPAIGN_GOAL) {
			setDisableAddCampaignGoal(true);
		}
	}, [selectedCampaignGoalList]);

	useEffect(() => {
		if (selectedPrimaryGoal) {
			setRowNodeData(selectedPrimaryGoal);
			campaignState.campaignConfigurationModel.primaryGoalId = selectedPrimaryGoal?.value;
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedPrimaryGoal]);

	useEffect(() => {
		if (selectedValidationRule) {
			setRowNodeData(selectedValidationRule);
			campaignState.campaignConfigurationModel.validationRulesId = selectedValidationRule?.value;
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedValidationRule]);

	useEffect(() => {
		if (selectedIncentiveDataSource) {
			setRowNodeData(selectedIncentiveDataSource);
		}
	}, [selectedIncentiveDataSource]);

	useEffect(() => {
		if (campaignGoalOptions) {
			setCampaignGoalList(campaignGoalOptions);
		}
	}, [campaignGoalOptions]);

	const checkLeaderValidation = () => {
		if (campaignState.campaignConfigurationModel
			&& campaignState.campaignConfigurationModel.leaderValidationId == 0
			&& campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call) {
			campaignState.campaignConfigurationModel.leaderValidationId = Number(leaderValidationOptions[0].value);
		}
	}
	const handleSetCampaingGoalList = () => {
		if (campaignState.campaignConfigurationGoalModel.length > 0) {
			let campaignGoalModelList = Array<CampaignGoalSettingListModel>();
			campaignState.campaignConfigurationGoalModel.forEach((item) => {
				let isSelected = false;
				if (
					item.campaignGoalSettingId === campaignState.campaignConfigurationModel.primaryGoalId ||
					item.campaignGoalSettingId === campaignState.campaignConfigurationModel.validationRulesId ||
					item.campaignGoalSettingId === campaignState.campaignIncentiveDataSourceModel?.campaignSettingId
				)
					isSelected = true;
				const _campaignGoalList: CampaignGoalSettingListModel = {
					campaignSettingDescription: item.campaignSettingDescription,
					campaignSettingId: item.campaignGoalSettingId,
					campaignSettingName: item.campaignSettingName,
					goalParameterAmountId: item.goalParameterAmountId,
					goalParameterAmountName: item.goalParameterAmountName,
					goalParameterCountId: item.goalParameterCountId,
					goalParameterCountName: item.goalParameterCountName,
					selected: isSelected,
				};

				campaignGoalModelList.push(_campaignGoalList);
			});
			// focus on the input
			setSelectedCampaignGoalList([...campaignGoalModelList]);
		}
	}
	const resetCampaignConfigurationGoal = () => {
		campaignState.campaignConfigurationModel.validationRulesId = 0;
		let campaingIncentive :  CampaignIncentiveDataSourceModel = {
			campaignIncentiveDataSourceId : 0,
			campaignConfigurationId : 0,
			campaignSettingId : null,
			campaignSettingName: '',
			amountParameterId: 0,
			countParameterId : 0
		}
		campaignState.campaignConfigurationModel.pointValueSettingId = 0;
		campaignState.campaignIncentiveDataSourceModel = campaingIncentive;
		campaignState.campaignConfigurationModel.goalParameterPointSettingId = 0;
		campaignState.campaignConfigurationModel.leaderValidationId = 0;
		campaignState.campaignConfigurationModel.isAutoTag =false;
		campaignState.campaignConfigurationModel.agentId =0;
		campaignState.campaignConfigurationModel.autoTaggingId =0;
		setSelectedValueSetting(null);
		setSelectedPointSetting(null);
		setSelectedValidationRule(null);
		setSelectedLeaderValidation(null);
		setSelectedIncentiveDataSource(null)
		dispatch(campaign.actions.campaign({...campaignState}));
	}
	const onToggleCampaignGoal = () => {
		setCampaignGoalToggle(!campaignGoalToggle);
	};
	const styleHideDetails = {
		display: 'none',
	};
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.hideOverlay();
	};
	const onChangeCampaignGoal = (data: any) => {
		if (data) {
			setSelectedCampaignGoal(data);
		}
	};
	const onChangeIncentiveDataSource = (data: IncentiveDataSourceOptionsModel) => {
		if (data) {
			setSelectedIncentiveDataSource(data);
			const incentiveDataSource: CampaignIncentiveDataSourceModel = {
				campaignIncentiveDataSourceId: 0,
				campaignConfigurationId: 0,
				campaignSettingId: parseInt(data.campaignSettingId),
				campaignSettingName: data.label,
				amountParameterId: data.goalParameterAmountId,
				countParameterId: data.goalParameterCountId,
			};
			campaignState.campaignIncentiveDataSourceModel = incentiveDataSource;
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	};
	const onChangeLeaderValidation = (data: any) => {
		if (data) {
			setSelectedLeaderValidation(data);
			campaignState.campaignConfigurationModel.leaderValidationId = parseInt(data.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	};
	// Add campaign on the Grid
	const addCampaignGoal = () => {
		if (selectedCampaignGoal) {
			if (selectedCampaignGoalList.filter((a) => a.campaignSettingId == selectedCampaignGoal.value).length > 0) {
				return;
			}
			if (selectedCampaignGoalList.length === MAX_CAMPAIGN_GOAL) {
				return;
			}
			getCampaignGoalSettingById(selectedCampaignGoal.value).then((response) => {
				if (response.status !== HttpStatusCodeEnum.Ok) {
					return
				}
				if (response.data == null) {
					return
				}
				let resultData = response.data;
				gridApi.applyTransaction({ add: [response.data] });
				setSelectedCampaignGoalList([...selectedCampaignGoalList, response.data]);
				const _campaignGoal: CampaignConfigurationGoalModel = {
					campaignConfigurationGoalId: 0,
					campaignGoalSettingId: response.data.campaignSettingId,
					campaignConfigurationId: 0,
					campaignSettingDescription: response.data.campaignSettingDescription,
					goalParameterAmountId: 0,
					goalParameterAmountName: response.data.goalParameterAmountName,
					goalParameterCountId: 0,
					goalParameterCountName: response.data.goalParameterCountName,
					campaignSettingName: '',
				};
				campaignState.campaignConfigurationGoalModel = [...campaignState.campaignConfigurationGoalModel, _campaignGoal];
				dispatch(campaign.actions.campaign({ ...campaignState }));
				setSelectedCampaignGoal(undefined);
				_campaignGoalListItem = [];
				populateIncentiveDataSource(resultData);
				setIncentiveDataSourceOptions([...incentiveDataSourceOptions, ..._campaignGoalListItem]);
			});
		}
	};

	// Populate the Incentive Data source Added on the Grid
	const populateIncentiveDataSource = (value: CampaignGoalSettingListModel) => {
		if (value.goalParameterAmountId != 0 && value.goalParameterAmountName !== '') {
			const incentiveDataSource: IncentiveDataSourceOptionsModel = {
				label: value.campaignSettingName?.toString() + ' - ' + value.goalParameterAmountName?.toString(),
				value: 'GoalParameterAmount' + value.campaignSettingId?.toString() + value.goalParameterAmountId?.toString(),
				goalParameterAmountId: value.goalParameterAmountId,
				goalParameterCountId: 0,
				campaignSettingId: value.campaignSettingId?.toString(),
			};
			_campaignGoalListItem.push(incentiveDataSource);
		}
		if (value.goalParameterCountId != 0 && value.goalParameterCountName !== '') {
			const incentiveDataSource: IncentiveDataSourceOptionsModel = {
				label: value.campaignSettingName + ' - ' + value.goalParameterCountName,
				value: 'GoalParameterCount' + value.campaignSettingId?.toString() + value.goalParameterCountId?.toString(),
				goalParameterCountId: value.goalParameterCountId,
				goalParameterAmountId: 0,
				campaignSettingId: value.campaignSettingId.toString(),
			};
			_campaignGoalListItem.push(incentiveDataSource);
		}
	};
	const getRowNodeId = useCallback(
		(params: any) => params.data.campaignSettingId,
		[],
	  );

	function setRowNodeData(_data: any) {
			if (selectedCampaignGoalList.length > 0) {
				selectedCampaignGoalList.forEach((item) => {
					let rowNode = gridApi?.getRowNode(item.campaignSettingId);
					if (rowNode) {
						item.selected = false;
						if (
							item.campaignSettingId == selectedPrimaryGoal?.value ||
							item.campaignSettingId == selectedValidationRule?.value ||
							item.campaignSettingId == Number(selectedIncentiveDataSource?.campaignSettingId)
						) {
							item.selected = true;
						}
						// rowNode.setData(item)
					}
				});
				//gridApi?.setRowData(selectedCampaignGoalList);
			}
		}
	//Remove campaign Goal
	const onRemoveCampaignGoal = (val: any) => {
		const newList =  selectedCampaignGoalList?.filter((cat) => cat.campaignSettingId !== val.campaignSettingId);
		campaignState.campaignConfigurationGoalModel = campaignState?.campaignConfigurationGoalModel?.filter((goal) => goal.campaignGoalSettingId !== val.campaignSettingId);
		dispatch(campaign.actions.campaign({...campaignState}));
		setSelectedCampaignGoalList([...newList]);
	};
	//onChanges
	const onChangePrimaryGoal = (data: any) => {
		setSelectedPrimaryGoal(data);
	};
	const onChangeValidationRule = (data: any) => {
		setSelectedValidationRule(data);
	};
	const campaignGoalOptionOnMenuOpen = () => {
		getCampaignGoalSettingOptions();
	};
	
	const onChangePointSetting = (data: any) => {
		if (data) {
			setSelectedPointSetting(data);
			campaignState.campaignConfigurationModel.goalParameterPointSettingId = Number(data?.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	};
	const onChangeValueSetting = (data: any) => {
		if (data) {
			setSelectedValueSetting(data);
			campaignState.campaignConfigurationModel.pointValueSettingId = Number(data?.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	};
	const settingNameCellRenderer = (params: any) => 
		<>
			{params ? (
				<Link to={`/campaign-management/campaign-setting/view-campaign-goal/${params.data.campaignSettingId}`} target='_blank'>
					{params.data.campaignSettingName}
				</Link>
			) : null}
		</>
	const actionButtonCellRenderer = (params: any) =>
		<>
			{!params.data.selected ? (
				<DefaultTableButton
					access={true}
					title={'Remove'}
					isDisabled={Props.viewMode}
					onClick={() => (Props.viewMode ? null : onRemoveCampaignGoal(params.data))}
				/>
			) : (
				params.data.selected
			)}
		</>
	const disableCampaignGoalDropDown = () => {
		if(Props.viewMode || 
			(campaignStatusIdState !== CampaignStatusEnum.Draft && campaignStatusIdState !== CampaignStatusEnum.Onhold))
			return true
			else
			return false
	}
	const disableAddCampaignGoalButton = () => {
		if(Props.viewMode ||
			disableAddCampaignGoal ||
			(campaignStatusIdState !== CampaignStatusEnum.Draft && campaignStatusIdState !== CampaignStatusEnum.Onhold))
			return true
		else return false
	}
	const disableIncentiveDataSourceOption = () => {
		if( Props.viewMode ||
			(campaignStatusIdState !== CampaignStatusEnum.Draft && campaignStatusIdState !== CampaignStatusEnum.Onhold) ||
			messageGroupId !== MessageGroupEnum.Call){
				return true
			}
		else{
			return false
		}
	}
	const pointSettingOptionOnMenuOpen = () => {
		getCampaignGoalParameterPointOptions();
	}
	const valueSettingOptionOnMenuOpen = () => {
		getCampaignGoalParameterValueOptions();
	}
	useEffect(() => {
		if (campaignGoalParameterPointOptions) {
			setPointSettings(campaignGoalParameterPointOptions);
		}
	}, [campaignGoalParameterPointOptions]);

	useEffect(() => {
		if (campaignGoalParamaterValueOptions) {
			setValueSettings(campaignGoalParamaterValueOptions);
		}
	}, [campaignGoalParamaterValueOptions]);

	const columnDefs : (ColDef<CampaignGoalSettingListModel> | ColGroupDef<CampaignGoalSettingListModel>)[] = [
		{
			headerName: 'No',
			field: 'campaignSettingId',
			suppressSizeToFit: false, 
			maxWidth: 60,
			valueGetter:('node.rowIndex + 1 + ' + 0).toString()
		},
		{
			headerName: 'Setting Name',
			field: 'campaignSettingName',
			maxWidth: 285,
			cellRenderer: settingNameCellRenderer,
			suppressSizeToFit: false
		},
		{
			headerName: 'Segment Description',
			field: 'campaignSettingDescription',
			maxWidth: 415,
			suppressSizeToFit: false
		},
		{
			headerName: 'Amount Parameter',
			field: 'goalParameterAmountName',
			maxWidth: 285,
			suppressSizeToFit: false,
		},
		{
			headerName: 'Count Parameter',
			field: 'goalParameterCountName',
			maxWidth: 285,
			suppressSizeToFit: false,
		},
		{
			headerName: 'Action',
			maxWidth: 150,
			minWidth: 115,
			suppressSizeToFit: false,
			cellRenderer: actionButtonCellRenderer,
		},
	]

	return (
		<>
			<div className='col-lg-12 mt-3'></div>
			<div className='form-group row' style={{border: '1px solid #e9ecef'}}>
				<div className='col-lg-4 mt-3'>
					<h6>Goal, Validation and Incentive</h6>
				</div>
				<div className='col-lg-8 mt-3'>
					<div
						className='btn btn-icon w-auto px-0'
						style={{float: right, marginTop: '-10px'}}
						data-kt-toggle='true'
						data-kt-toggle-state='active'
						onClick={onToggleCampaignGoal}
					>
						<FontAwesomeIcon icon={campaignGoalToggle ? faMinusSquare : faPlusSquare} />
					</div>
				</div>
			</div>
			<div className='row' style={campaignGoalToggle ? {} : styleHideDetails}>
				<FieldContainer>
					<div className='col-lg-2 mt-4 required'>
						<label className='form-label-sm'>Campaign Goal</label>
					</div>
					<div className='col-lg-3 mt-2 campaign-goal'>
						<Select
							value={selectedCampaignGoal}
							onChange={onChangeCampaignGoal}
							options={campaignGoalList.map((i) => {
								return {
									label: i.campaignSettingName,
									value: i.campaignSettingId,
								};
							})}
							isDisabled={disableCampaignGoalDropDown()}
							placeholder='Select'
							onMenuOpen = {campaignGoalOptionOnMenuOpen}
						/>
					</div>
					<button
						type='button'
						disabled={disableAddCampaignGoalButton()}
						onClick={addCampaignGoal}
						className='btn btn-primary btn-sm me-2 col-lg-1 mt-2'
					>
						Add
					</button>
					<div className='col-lg-12 mt-3'></div>
					<div className='ag-theme-quartz' style={{minHeight: '250px', width: '100%'}}>
						<AgGridReact
							onGridReady={onGridReady}
							defaultColDef={{
								resizable: true,
							}}
							getRowId={getRowNodeId}
							rowData={selectedCampaignGoalList}
							columnDefs={columnDefs}
						>
						</AgGridReact>
					</div>
					<div className='col-lg-12 mt-3'></div>
					<FieldContainer>
						<div className='col-sm-3 mt-3 required'>
							<label className='form-label-sm'>Primary Goal</label>
						</div>
						<div className='col-sm-3'>
							<Select
								size='small'
								options={selectedCampaignGoalList.map((i) => {
									return {
										label: i.campaignSettingName,
										value: i.campaignSettingId,
									};
								})}
								style={{width: '100%'}}
								onChange={onChangePrimaryGoal}
								value={selectedPrimaryGoal}
								isDisabled={disableCampaignGoalDropDown()}
							/>
						</div>
						<div className='col-sm-3 mt-3'>
							<label className={`form-label-sm ${messageGroupId == MessageGroupEnum.Call ? 'required' : ''}`}>Incentive Data Source</label>
						</div>
						<div className='col-sm-3'>
							<Select
							  isClearable={true}
								size='small'
								options={incentiveDataSourceOptions}
								style={{width: '100%'}}
								onChange={onChangeIncentiveDataSource}
								value={selectedIncentiveDataSource}
								isDisabled={disableIncentiveDataSourceOption()}
							/>
						</div>
					</FieldContainer>
					<FieldContainer>
						<div className='col-sm-3 mt-3'>
							<label className={`form-label-sm ${messageGroupId == MessageGroupEnum.Call ? 'required' : ''}`}>Validation Rules</label>
						</div>
						<div className='col-sm-3'>
							<Select
								size='small'
								options={selectedCampaignGoalList.map((i) => {
									return {
										label: i.campaignSettingName,
										value: i.campaignSettingId,
									};
								})}
								style={{width: '100%'}}
								onChange={onChangeValidationRule}
								value={selectedValidationRule}
								isClearable={true}
								isDisabled={
									disableIncentiveDataSourceOption()
								}
							/>
						</div>
						<div className='col-sm-3 mt-3'> 
							<label className={`form-label-sm ${messageGroupId == MessageGroupEnum.Call ? 'required' : ''}`}>Leader Validation</label>
						</div>
						<div className='col-sm-3'>
							<Select
								size='small'
								options={leaderValidationOptions}
								style={{width: '100%'}}
								onChange={onChangeLeaderValidation}
								value={selectedLeaderValidation}
								isDisabled={
									disableIncentiveDataSourceOption()
								}
							/>
						</div>
					</FieldContainer>
					<div className='row justify-content-end '>
						<div className='col-sm-3  mt-3'>
							<label className={`form-label-sm ${messageGroupId == MessageGroupEnum.Call ? 'required' : ''}`}>
								Goal Parameter to Point Setting{' '}
							</label>
						</div>
						<div className='col-sm-3'>
							<Select
								size='small'
								options={pointSettings}
								style={{width: '100%'}}
								onChange={onChangePointSetting}
								value={selectedPointSetting}
								isDisabled={
									disableIncentiveDataSourceOption()
								}
								onMenuOpen = {pointSettingOptionOnMenuOpen}
							/>
						</div>
					</div>
					<div className='row justify-content-end mt-3'>
						<div className='col-sm-3  mt-3'>
							<label className={`form-label-sm ${messageGroupId == MessageGroupEnum.Call ? 'required' : ''}`}>Point to Value Setting </label>
						</div>
						<div className='col-sm-3'>
							<Select
								size='small'
								options={valueSettings}
								style={{width: '100%'}}
								onChange={onChangeValueSetting}
								value={selectedValueSetting}
								isDisabled={
									disableIncentiveDataSourceOption()
								}
								onMenuOpen={valueSettingOptionOnMenuOpen}
							/>
						</div>
					</div>
				</FieldContainer>
			</div>
		</>
	);
};
