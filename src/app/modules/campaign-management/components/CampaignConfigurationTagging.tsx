import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import { DangerButton, FieldContainer, MlabButton } from '../../../custom-components';
import { right } from '@popperjs/core';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { AgGridReact } from 'ag-grid-react';
import { Checkbox } from 'rsuite';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import * as campaign from '../redux/CampaignManagementRedux';
import { CampaignModel } from '../models/request/CampaignModel';
import { RootState } from '../../../../setup';
import { LookupModel } from '../../../common/model';
import { getAutoTaggingDetailsById } from '../redux/CampaignManagementService';
import { CampaignConfigurationAutoTaggingModel } from '../models/request/CampaignConfigurationAutoTaggingModel';
import { Link } from 'react-router-dom';
import { UserSelectionModel } from '../../campaign-setting/setting-auto-tagging/models/UserSelectionModel';
import { CampaignStatusEnum, ElementStyle, MessageGroupEnum } from '../../../constants/Constants';
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims';
import swal from 'sweetalert';
import useCampaignManagementOptions from '../../../custom-functions/system/option/useCampaignManagementOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';


type CampaignConfiguration = {
	viewMode: boolean;
	currentCampaignStatus?: number;
};

export const CampaignConfigurationTagging = (Props: CampaignConfiguration) => {
	const dispatch = useDispatch();
	const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
	const [taggingToggle, setTaggingToggle] = useState<boolean>(false);
	const [isAutoTagging, setIsAutoTagging] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>();

	const [seletedAutoTaggingSetting, setSeletedAutoTaggingSetting] = useState<any>();
	const [seletedAgent, setSeletedAgent] = useState<any>();
	const [discardPlayerAgent, setDiscardPlayerAgent] = useState<Array<LookupModel>>([]);

	const campaignState = useSelector<RootState>(({ campaign }) => campaign.campaign, shallowEqual) as CampaignModel;
	const getAllAutoTaggingSetting = useSelector<RootState>(({ campaign }) => campaign.getAllAutoTaggingSetting, shallowEqual) as Array<LookupModel>;
	const getUserAgentForTagging = useSelector<RootState>(
		({ campaign }) => campaign.getAllUserAgentForTagging,
		shallowEqual
	) as Array<UserSelectionModel>;
	const campaignStatusIdState = useSelector<RootState>(({ campaign }) => campaign.campaignStatusId, shallowEqual) as number;

	//Create AutoTagging Model
	const [autoTaggingList, setAutoTaggingList] = useState<Array<CampaignConfigurationAutoTaggingModel>>();
	const [autoTaggingOptions, setAutoTaggingOptions] = useState<Array<LookupModel>>([]);
	const {getCampaignAutotaggingOptions
		  ,campaignAutotaggingOptions
		  ,getCampaignTaggingUserOptions
		  ,campaignTagginUserOptions} = useCampaignManagementOptions();
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.hideOverlay();
	};

	const onClickTaggingToggle = () => {
		setTaggingToggle(!taggingToggle);
	};

	const toggleIsAutoTag = (_value: any, checked: boolean, _event: any) => {
		if (!checked) {
			swal({
				title: 'Confirmation',
				text: 'This action will disable auto tagging feature on this campaign, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (!willUpdate) {
					return;
				} else {
					setIsAutoTagging(checked);
				}
			});
		} else {
			setIsAutoTagging(checked);
		}
	};

	const styleHideDetails = {
		display: 'none',
	};

	const addAutoTaggingConfig = () => {
		if (seletedAutoTaggingSetting) {
			const campaignSettingId = Number(seletedAutoTaggingSetting?.value);
			getAutoTaggingDetailsById(campaignSettingId).then((response) => {
				if (response.status === 200) {
					if (response.data != null) {
						let resultData = Object.assign(new Array<CampaignConfigurationAutoTaggingModel>(), response.data);
						const sortedData = [...resultData];
						resultData.sort((s: any, t: any) => {
							return parseInt(s.priorityNumber) - parseInt(t.priorityNumber);
							});
						setAutoTaggingList(sortedData);
						campaignState.campaignConfigurationAutoTaggingModel = resultData;
						dispatch(campaign.actions.campaign({ ...campaignState }));
					}
				}
			});
		}
	};

	function removeAutoTaggingSetting() {
		swal({
			title: 'Confirmation',
			text: 'This action will remove the Auto Tagging Setting, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				//gridApi.setRowData([]);
				setSeletedAutoTaggingSetting('');
				setAutoTaggingList([]);
				campaignState.campaignConfigurationAutoTaggingModel = new Array<CampaignConfigurationAutoTaggingModel>();
				campaignState.campaignConfigurationModel.autoTaggingId = 0;
				dispatch(campaign.actions.campaign({ ...campaignState }));
			} else return;
		});
	}

	const onChangeAutoTagging = (data: any) => {
		if (data) {
			setSeletedAutoTaggingSetting(data);
			campaignState.campaignConfigurationModel.autoTaggingId = data.value;
			dispatch(campaign.actions.campaign({ ...campaignState }));
		}
	};

	const handleDeactivate = (data: any) => {
		const newStatus = data.isActive;
		if (autoTaggingList) {
			autoTaggingList.forEach((item: CampaignConfigurationAutoTaggingModel) => {
				let rowNode = gridApi?.getRowNode(item.taggingConfigurationId);
				if (item.taggingConfigurationId == data.taggingConfigurationId) {
					item.isActive = !newStatus;
					rowNode.setData(item);
				}
			});
		}
		const autoTaggingSetting = autoTaggingList;

		if (autoTaggingSetting) {
			campaignState.campaignConfigurationAutoTaggingModel = autoTaggingSetting;
			dispatch(campaign.actions.campaign({ ...campaignState }));
		}
	};

	const getRowNodeId = useCallback(
		(params: any) => params.data.taggingConfigurationId,
		[],
	  );
	useEffect(() => {
		if(campaignState.campaignConfigurationCommunicationModel?.messageGroupId === MessageGroupEnum.Call)
			return;

		campaignState.campaignConfigurationModel.isAutoTag =false;
		campaignState.campaignConfigurationModel.agentId =0;
		campaignState.campaignConfigurationModel.autoTaggingId =0;
		dispatch(campaign.actions.campaign({...campaignState}));
		setIsAutoTagging(false)
	}, [campaignState.campaignConfigurationCommunicationModel.messageGroupId]);
	useEffect(() => {
		if (campaignState != undefined && campaignState.campaignId !== 0) {
			setAutoTaggingList(campaignState.campaignConfigurationAutoTaggingModel);
			setIsAutoTagging(campaignState.campaignConfigurationModel?.isAutoTag || campaignState.campaignConfigurationModel?.autoTaggingId != 0);
			const selectedAutoTagSetting = autoTaggingOptions?.find((a) => a.value == campaignState.campaignConfigurationModel?.autoTaggingId.toString());
			const selectedAgent = discardPlayerAgent?.find((a) => a.value == campaignState.campaignConfigurationModel?.agentId.toString());
			setSeletedAgent(selectedAgent);
			setSeletedAutoTaggingSetting(selectedAutoTagSetting);
		}
	}, [campaignState]);

	useEffect(() => {
		if (!isAutoTagging) {
			if (campaignState.campaignConfigurationModel) {
				/*Clear the Ag-Grid */
				//gridApi?.setRowData([]);
				setAutoTaggingList([]);
				campaignState.campaignConfigurationAutoTaggingModel = [];
				campaignState.campaignConfigurationModel.autoTaggingId = 0;
				/* Clear the Selected Auto Tagging option */
				setSeletedAutoTaggingSetting('');
			}
		}
		campaignState.campaignConfigurationModel.isAutoTag = isAutoTagging;
		dispatch(campaign.actions.campaign({ ...campaignState }));
	}, [isAutoTagging]);

	useEffect(() => {
		if (getAllAutoTaggingSetting != undefined && getAllAutoTaggingSetting.length > 0) {
			setAutoTaggingOptions(getAllAutoTaggingSetting);
		}
		if (getUserAgentForTagging != undefined && getUserAgentForTagging.length > 0) {
			setUserAgentForTaggingOption();
		}
	}, []);

	useEffect(() => {
		if (campaignAutotaggingOptions !== undefined && campaignAutotaggingOptions.length > 0) {
			setAutoTaggingOptions(campaignAutotaggingOptions)
		}
	}, [campaignAutotaggingOptions]);
	useEffect(() => {
		if (campaignTagginUserOptions !== undefined && campaignTagginUserOptions.length > 0) {
			setUserAgentForTaggingOption(campaignTagginUserOptions)
		}
	}, [campaignTagginUserOptions]);
	const tagginUserOptionOnMenuOpen = () => {
		getCampaignTaggingUserOptions();
	}
	const autoTaggingOnMenuOpen = ()=> {
		getCampaignAutotaggingOptions();
	}
	const setUserAgentForTaggingOption = (userSelectionModel? : Array<UserSelectionModel>) => {
		let agentsForTagging = Array<LookupModel>();
		let _getUserAgentForTagging = getUserAgentForTagging;

		if(userSelectionModel !== undefined){
			_getUserAgentForTagging = userSelectionModel;
		}

		_getUserAgentForTagging.forEach((item) => {
			const lookUpModel: LookupModel = {
				label: item.fullName,
				value: item.userId.toString(),
			};
			agentsForTagging.push(lookUpModel);
		});
		if (agentsForTagging && agentsForTagging.length > 0) setDiscardPlayerAgent(agentsForTagging);
	}
	const segmentCellRenderer = (params: any) =>
		<>
			{params ? (
				<Link to={'/player-management/segment/view/' + params.data.segmentId} target='_blank'>
					{params.data.segmentName}
				</Link>
			) : null}
		</>
	const statusCellRenderer = (params: any) => <>
		{params?.data.isActive && <span className='badge badge-light-success'> Active</span>}
		{!params?.data.isActive && <span className='badge badge-light-danger'> Inactive</span>}
	</>
	const buttonCellRenderer = (params: any) => 
		<button
			type='button'
			disabled={
				Props.viewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)
			}
			onClick={() => handleDeactivate(params.data)}
			className={'btn btn-outline-dark btn-sm px-4'}
		>
			{params.data.isActive ? 'Deactivate' : 'Activate'}
		</button>

	function onChangeDiscardPlayerTo(val: any) {
		if (val) {
			debugger
			setSeletedAgent(val);
			campaignState.campaignConfigurationModel.agentId = Number(val.value);
			dispatch(campaign.actions.campaign({ ...campaignState }));
		}
	}

	const columnDefs : (ColDef<CampaignConfigurationAutoTaggingModel> | ColGroupDef<CampaignConfigurationAutoTaggingModel>)[] = 
	[
		{
			headerName: 'Priority',
			field: 'priorityNumber',
			resizable: true,
			minWidth: 90,
			maxWidth: 90,
		},
		{
			headerName: 'Configuration Name',
			cellRenderer: (params: any) => params.data.taggingConfigurationName,
			resizable: true,
			minWidth: 285,
			suppressSizeToFit: false,
		},
		{
			headerName: 'Segment Name',
			field: 'segmentName',
			resizable: true,
			minWidth: 415,
			suppressSizeToFit: false,
			cellRenderer: segmentCellRenderer,
		},
		{
			headerName: 'Status',
			resizable: true,
			minWidth: 140,
			cellRenderer: statusCellRenderer,
			suppressSizeToFit: false,
		},
		{
			headerName: 'Action',
			resizable: true,
			cellRenderer: buttonCellRenderer,
			minWidth: 100,
		},
	];
	
	return (
		<>
			<div className='col-lg-12 mt-3'></div>
			<div className='form-group row' style={{ border: '1px solid #e9ecef' }}>
				<div className='col-lg-4 mt-3'>
					<h6>Tagging</h6>
				</div>
				<div className='col-lg-8 mt-3'>
					<div
						className='btn btn-icon w-auto px-0'
						style={{ float: right, marginTop: '-10px' }}
						data-kt-toggle='true'
						data-kt-toggle-state='active'
						onClick={onClickTaggingToggle}
					>
						<FontAwesomeIcon icon={taggingToggle ? faMinusSquare : faPlusSquare} />
					</div>
				</div>
			</div>
			<div className='row' style={taggingToggle ? {} : styleHideDetails}>
				<FieldContainer>
					<div className='col-lg-2 mt-4 required'>
						<label className='form-label-sm'>Discard Player To</label>
					</div>
					<div className='col-lg-3 mt-2 campaign-goal'>
						<Select
							value={seletedAgent}
							onChange={onChangeDiscardPlayerTo}
							options={discardPlayerAgent.map((i) => {
								return {
									label: i.label,
									value: i.value,
								};
							})}
							isDisabled={Props.viewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)}
							placeholder='Select'
							onMenuOpen = {tagginUserOptionOnMenuOpen}
						/>
					</div>

					<div className='col-lg-2 mt-2 required'>
						<Checkbox
							checked={isAutoTagging}
							onChange={(value: any, checked: boolean, event: any) => toggleIsAutoTag(value, checked, event)}
							disabled={Props.viewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)}
						>
							Auto Tagging
						</Checkbox>
					</div>
					<div className='col-lg-3 mt-2'>
						<Select
							size='small'
							style={{ width: '100%' }}
							onMenuOpen = {autoTaggingOnMenuOpen}
							options={autoTaggingOptions}
							onChange={onChangeAutoTagging}
							value={seletedAutoTaggingSetting}
							isDisabled={
								!isAutoTagging ||
								Props.viewMode ||
								(campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)
							}
						/>
					</div>

					<button type='button' onClick={addAutoTaggingConfig} disabled={!isAutoTagging} className='btn btn-primary btn-sm me-2 col-lg-1 mt-2'>
						Add
					</button>
					<div className='col-lg-12 mt-3'></div>
					{isAutoTagging && (
						<div className='ag-theme-quartz' style={{ minHeight: '250px', width: '100%' }}>
							<AgGridReact
								onGridReady={onGridReady}
								columnDefs={columnDefs}
								defaultColDef={{
									resizable: true,
								}}
								rowData={autoTaggingList}
								getRowId={getRowNodeId}
							>
								
							</AgGridReact>
						</div>
					)}
					<>
						{isAutoTagging && (
							<div className='col-lg-12 mt-2'>
								<Link to={'/campaign-management/campaign-setting/view-auto-tagging/' + Number(seletedAutoTaggingSetting?.value)} target='_blank'>
									<MlabButton
										access={userAccess.includes(USER_CLAIMS.CampaignSettingRead) === true}
										label='View Setting'
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										// onClick={() => handleSubmitCampaign(CampaignStatusEnum.Onhold)}
										disabled={false}
									/>
								</Link>

								{(campaignStatusIdState == CampaignStatusEnum.Draft || campaignStatusIdState == CampaignStatusEnum.Onhold) && (
									<DangerButton access={true} title={'Remove'} onClick={removeAutoTaggingSetting} />
								)}
							</div>
						)}
					</>
				</FieldContainer>
			</div>
		</>
	);
};
