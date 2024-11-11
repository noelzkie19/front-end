import {faMinusSquare, faPlusSquare, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {right} from '@popperjs/core';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import {LookupModel} from '../../../common/model';
import {CustomLookupModel} from '../../../common/model/CustomLookupModel';
import {CampaignStatusEnum, CampaignTypeEnum, dataType, EligibilityTypeEnum, HttpStatusCodeEnum, SegmentTypes} from '../../../constants/Constants';
import {FieldContainer, TableIconButton} from '../../../custom-components';
import {getSegmentById, getVariancesBySegmentId} from '../../player-management/segmentation/redux/SegmentationService';
import {MasterReference} from '../../system/components/constants/CampaignSetting';
import {CampaignModel} from '../models/request/CampaignModel';
import {SegmentationListModel} from '../models/response/SegmentationListModel';
import * as campaign from '../redux/CampaignManagementRedux';
import {getCampaignConfigurationSegmentById, GetCampaignPeriodBySourceId, getEligibilityType, getSegmentationById, getSegmentWithSegmentTypeName} from '../redux/CampaignManagementService';
import { ColDef, ColGroupDef } from 'ag-grid-community';


type CampaignConfiguration = {
	viewMode?: boolean;
	currentCampaignStatus?: number;
};
export const CampaignConfigurationEligibility = (Props: CampaignConfiguration) => {
	const dispatch = useDispatch();

	const campaignTypeState = useSelector<RootState>(({campaign}) => campaign.getCampaignType, shallowEqual) as LookupModel[];

	const [eligibilityToggle, setEligibilityToggle] = useState<boolean>(false);
	const [selectedSegment, setSelectedSegment] = useState<any>('');
	const [selectedVariance, setSelectedVariance] = useState<LookupModel | null>();
	const [selectedInPeriod, setSelectedInPeriod] = useState<CustomLookupModel | null>();
	const [gridApi, setGridApi] = useState<any>();

	//Create segment Model
	const [segmentList, setSegmentList] = useState<Array<SegmentationListModel>>();
	const [allSegment, setAllSegment] = useState<Array<CustomLookupModel>>();
	const [varianceList, setVarianceList] = useState<Array<LookupModel>>([]);

	const [inPeriodList, setInPeriodList] = useState<Array<CustomLookupModel>>([]);

	const campaignStatusIdState = useSelector<RootState>(({campaign}) => campaign.campaignStatusId, shallowEqual) as number;
	const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign, shallowEqual) as CampaignModel;
	const campaignPeriodToFromState = useSelector<RootState>(({campaign}) => campaign.campaignPeriodTo, shallowEqual) as any;
	const campaignPeriodFromFromState = useSelector<RootState>(({campaign}) => campaign.campaignPeriodFrom, shallowEqual) as any;
	const campaignEligibilityType = useSelector<RootState>(({campaign}) => campaign.getEligibilityType, shallowEqual) as Array<LookupModel>;
	const campaignInPeriod = useSelector<RootState>(({campaign}) => campaign.getCampaignPeriod, shallowEqual) as Array<CustomLookupModel>;

	const [eligibilityType, setEligibilityType] = useState<Array<LookupModel>>([]);
	const [selectedEligibilityType, setSelectedEligibilityType] = useState<LookupModel | null>();
	const [isUploadPlayerList, setIsUploadPlayerList] = useState<boolean>(false);
	const [eligibilityTypeDisable, setEligibilityTypeDisable] = useState<boolean>(true);
	const [isSegmentDistribution, setIsSegmentDistribution] = useState<boolean>(false);
	const [segmentTypeId, setSegmentTypeId] = useState<number>(0);
	const [enableAddSegmentBtn, setEnableAddSegmentBtn] = useState<boolean>(false);

	const campaignDurationInMinsToPeriodMapping = [
		{
			duration: 1,
			campaignIntervalIds: [1, 13],
		},
		{
			duration: 2,
			campaignIntervalIds: [2],
		},
		{
			duration: 60,
			campaignIntervalIds: [3],
		},
		{
			duration: 180,
			campaignIntervalIds: [14],
		},
		{
			duration: 1440,
			campaignIntervalIds: [4, 15],
		},
		{
			duration: 10080,
			campaignIntervalIds: [5, 16],
		},
	];

	const dayOfTheWeek = [
		{day: 0, name: 'Sunday', campaignIntervalIds: [6, 17]},
		{day: 1, name: 'Monday', campaignIntervalIds: [7, 18]},
		{day: 2, name: 'Tuesday', campaignIntervalIds: [8, 19]},
		{day: 3, name: 'Wednesday', campaignIntervalIds: [9, 20]},
		{day: 4, name: 'Thursday', campaignIntervalIds: [10, 21]},
		{day: 5, name: 'Friday', campaignIntervalIds: [11, 22]},
		{day: 6, name: 'Saturday', campaignIntervalIds: [12, 23]},
	];
	// USE EFFECT
	useEffect(() => {
		if (gridApi) gridApi.hideOverlay();
	}, [segmentList]);

	useEffect(() => {
		if (campaignState.campaignConfigurationModel && selectedSegment) {
			setSelectedVariance(null);
			getVarianceList();
			getSegmentById(selectedSegment?.value)
				.then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						const data = Object.assign(response.data);
						setSegmentTypeId(data.segmentTypeId);
						setEnableAddSegmentBtn(data.segmentTypeId.toString() == SegmentTypes.Normal);
					}
				})
				.catch(() => {
					swal('Failed', 'Problem in Get Segment', 'error');
				});
			onCampaignPeriodChange();

			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedSegment]);

	useEffect(() => {
		if (campaignState.campaignConfigurationModel && selectedInPeriod) {
			campaignState.campaignConfigurationModel.inPeriodId = Number(selectedInPeriod?.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedInPeriod]);

	useEffect(() => {
		if (campaignState.campaignConfigurationModel) {
			setEnableAddSegmentBtn(true);
			campaignState.campaignConfigurationModel.varianceId = Number(selectedVariance?.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedVariance]);
	
	const getCampaignEligibilityTypes = () => {
			getEligibilityType().then((eligibilityType) => {
				if (eligibilityType.status === HttpStatusCodeEnum.Ok) {
					dispatch(campaign.actions.getEligibilityType(eligibilityType.data));
				} 
			});
	};
	const getInPeriods = () => {
			GetCampaignPeriodBySourceId(MasterReference.DatasourceAllId).then((campaignPeriod) => {
				if (campaignPeriod.status === HttpStatusCodeEnum.Ok) {
					dispatch(campaign.actions.getCampaignPeriod(campaignPeriod.data));
					
						onCampaignPeriodChange(campaignPeriod.data);
					
				}
			});
	};
	useEffect(() => {
		getAllSegmentList();
		setEligibilityType(campaignEligibilityType);
	}, []);

	useEffect(() => {
		if (campaignState.campaignConfigurationModel?.segmentId != 0 && campaignState.campaignConfigurationModel?.segmentId != undefined) {
			if (campaignState.campaignConfigurationModel?.segmentId != undefined) {
				const segment = allSegment?.find((a) => a.value == campaignState.campaignConfigurationModel?.segmentId?.toString());
				setSelectedSegment(segment);
				viewSegment().catch(() => {});
			}
		}
		if (
			campaignState.campaignConfigurationModel?.eligibilityTypeId != undefined &&
			campaignState.campaignConfigurationModel?.eligibilityTypeId != 0
		) {
			if (campaignState.campaignConfigurationModel?.eligibilityTypeId != undefined) {
				const setcampaignEligibilityType = campaignEligibilityType?.find(
					(a) => a.value == campaignState.campaignConfigurationModel?.eligibilityTypeId?.toString()
				);
				setSelectedEligibilityType(setcampaignEligibilityType);
				setEligibilityTypeOption(setcampaignEligibilityType);
			}
		}
	}, [campaignState.campaignConfigurationModel]);

	useEffect(() => {
		setEligibilityType([]);
		setEligibilityTypeDisable(true);

		if (campaignState.campaignInformationModel.campaignTypeId != 0) {
			setEligibilityTypeDisable(false);
			let campaignEligibilitySegmentation = campaignEligibilityType.find((a) => a.value == EligibilityTypeEnum.Segmentation.toString());
			let campaignTypeWelcomeCall = campaignTypeState.find((a) => a.value == CampaignTypeEnum.WelcomeCall.toString());
			if (
				campaignEligibilitySegmentation &&
				campaignState.campaignInformationModel?.campaignTypeId.toString() == campaignTypeWelcomeCall?.value?.toString()
			) {
				setEligibilityType(campaignEligibilityType.filter((a) => a.value == campaignEligibilitySegmentation?.value));
				setSelectedEligibilityType(campaignEligibilitySegmentation);
				campaignState.campaignConfigurationModel.eligibilityTypeId = campaignEligibilitySegmentation?.value
					? +campaignEligibilitySegmentation.value
					: 0;
			} else {
				setEligibilityType(campaignEligibilityType);
				if (campaignState.campaignConfigurationModel.eligibilityTypeId === 0) {
					setSelectedEligibilityType(campaignEligibilitySegmentation);
				}
			}
		}
		dispatch(campaign.actions.campaign({...campaignState}));
	}, [campaignState.campaignInformationModel.campaignTypeId]);

	useEffect(() => {
		setEligibilityTypeOption(selectedEligibilityType);
	}, [selectedEligibilityType]);

	useEffect(() => {
		setSelectedInPeriod(null);
		onCampaignPeriodChange();
	}, [campaignPeriodToFromState]);

	useEffect(() => {
		setSelectedInPeriod(null);
		onCampaignPeriodChange();
	}, [campaignPeriodFromFromState]);

	const range = (start: number, end: number) => Array.from(Array(end - start + 1).keys()).map((x) => x + start);

	const onCampaignPeriodChange = (_campaignInPeriod? : Array<CustomLookupModel>) => {
		//added _campaignInPeriod so that the list is updated once the user open it,
		let datasourceId = MasterReference.DatasourceMlabId;
		if (selectedSegment?.hasTableau) datasourceId = MasterReference.DatasourceTableauId;

		const fromDate = moment(campaignState.campaignInformationModel.campaignPeriodFrom);
		const toDate = moment(campaignState.campaignInformationModel.campaignPeriodTo);
		const minuteDifference = toDate.diff(fromDate, 'minutes');

		let filterCampaignDurationInMinsToPeriodMapping = campaignDurationInMinsToPeriodMapping.filter((d) => d.duration <= minuteDifference);

		let availableDayOfTheWeek: any[] = [];
		let dayOftheWeeks: number[] = [];

		if (toDate.diff(fromDate, 'days') > 1 && toDate.diff(fromDate, 'days') < 7) {
			//calculate day of the week when campaign duration is less than 7 days
			//display all day of the week if campaign duration is more than 7 days

			if (toDate.day() > fromDate.day()) {
				dayOftheWeeks = range(fromDate.day() + 1, toDate.day() - 1);
				availableDayOfTheWeek = dayOfTheWeek.filter((d) => dayOftheWeeks.includes(d.day));
			} else {
				dayOftheWeeks = range(toDate.day(), fromDate.day());
				availableDayOfTheWeek = dayOfTheWeek.filter((d) => !dayOftheWeeks.includes(d.day));
			}
		}

		if (toDate.diff(fromDate, 'days') > 7) {
			availableDayOfTheWeek = dayOfTheWeek;
		}

    let campaignIntervalIds = filterCampaignDurationInMinsToPeriodMapping.flatMap((({ campaignIntervalIds }) => campaignIntervalIds));
    if(availableDayOfTheWeek.length > 0){
      campaignIntervalIds = [...campaignIntervalIds,...availableDayOfTheWeek.flatMap(({campaignIntervalIds})=>campaignIntervalIds)];
    }
    
    let result = campaignInPeriod.filter(d=>d.value !== undefined && campaignIntervalIds.includes(+d.value) && d.dataSourceId == datasourceId);
    
	if(_campaignInPeriod !== undefined){
		result = _campaignInPeriod.filter(d=>d.value !== undefined && campaignIntervalIds.includes(+d.value) && d.dataSourceId == datasourceId);
	}
	setInPeriodList(result);

    setValuesForInPeriod(result);

    dispatch(campaign.actions.campaign({...campaignState}));
  }
  const setValuesForInPeriod =(result:CustomLookupModel[])=>{
    if(campaignState.campaignConfigurationModel.inPeriodId != undefined && campaignState.campaignConfigurationModel.inPeriodId != 0){
		let selectedPeriod = result.find(a => a.value == campaignState.campaignConfigurationModel.inPeriodId?.toString());
      if(selectedPeriod)
        setSelectedInPeriod(selectedPeriod);
      else{
        setSelectedInPeriod(null);
        campaignState.campaignConfigurationModel.inPeriodId = 0;
      }
    }else{
      if(selectedSegment?.hasTableau){
        setDefaultInperiodForTableau(result);
      }
      else{
        setDefaultInperiodForMLAB(result);
      }
    }
  }
  const setDefaultInperiodForTableau = (result:CustomLookupModel[])=>{
    let defaultSelected = result.find(d=>Number(d.value) === MasterReference.DatasourceDefaultSelectedTableauId);
    campaignState.campaignConfigurationModel.inPeriodId = Number(defaultSelected?.value);
    if(defaultSelected)
      setSelectedInPeriod(defaultSelected);
    else{
      setSelectedInPeriod(null);
      campaignState.campaignConfigurationModel.inPeriodId = 0;
    }
  }
  const setDefaultInperiodForMLAB = (result:CustomLookupModel[])=>{
    let defaultSelected =result.find(d=>Number(d.value) === MasterReference.DatasourceDefaultSelectedId);
        campaignState.campaignConfigurationModel.inPeriodId = Number(defaultSelected?.value);
        if(defaultSelected)
          setSelectedInPeriod(defaultSelected);
        else{
          setSelectedInPeriod(null);
          campaignState.campaignConfigurationModel.inPeriodId = 0;
        }
  }
  const setEligibilityTypeOption =(val : any)=>{ 
    let typeId = selectedEligibilityType?.value ? +selectedEligibilityType?.value : 0;
    dispatch(campaign.actions.eligibilityTypeId(typeId))
    setIsUploadPlayerList(false)
    if(val){
      campaignState.campaignConfigurationModel.eligibilityTypeId =  (val?.value != undefined ? (val?.value) : 0);
      dispatch(campaign.actions.eligibilityTypeId(val?.value))
      if(val?.label.trim().toLocaleLowerCase() === 'Upload Player List'.toLocaleLowerCase()){
        setIsUploadPlayerList(true)
        setSegmentList([])
        setSelectedSegment(null)
        setVarianceList([])
        setSelectedVariance(null)
        onCampaignPeriodChange();

				campaignState.campaignConfigurationModel.segmentId = 0;
				campaignState.campaignConfigurationModel.varianceId = 0;
				campaignState.campaignGuid = Guid.create().toString();
			}
		}
		dispatch(campaign.actions.campaign({...campaignState}));
	};

	// END USE EFFECT
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
		params.api.hideOverlay();
	};

	const onClickEligibilityToggle = () => {
		setEligibilityToggle(!eligibilityToggle);
	};

	const styleHideDetails = {
		display: 'none',
	};

	const getAllSegmentList = () => {
		getSegmentWithSegmentTypeName().then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				setAllSegment(response.data);
				dispatch(campaign.actions.getAllSegment(response.data));
			}
		});
	};

	const _removeSegment = () => {
		swal({
			title: 'Confirmation',
			text: 'Segmentation will be removed and might affect the campaign ',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setTimeout(() => (gridApi ? gridApi.hideOverlay() : false), 100);
				setSelectedSegment(null);
				setSelectedInPeriod(null);
				setSelectedVariance(null);
				setVarianceList([]);
				setSegmentList([]);
				setIsSegmentDistribution(false);
				setSegmentTypeId(0);
				setEnableAddSegmentBtn(false);

				campaignState.campaignConfigurationModel.segmentId = 0;
				campaignState.campaignConfigurationModel.varianceId = 0;
				campaignState.campaignConfigurationModel.segmentTypeId = 0;
				campaignState.campaignConfigurationModel.inPeriodId = 0;
				dispatch(campaign.actions.campaign({...campaignState}));
			}
		});
	};

	function onChangeSegment(val: Array<LookupModel>) {
		setSelectedSegment(val);
		setSelectedInPeriod(null);
		campaignState.campaignConfigurationModel.inPeriodId = 0;
	}

	function onChangeVariance(val: LookupModel) {
		setSelectedVariance(val);
	}

	function onChangeEligibilityType(val?: LookupModel) {
		setSelectedEligibilityType(val);
	}

	const getVarianceList = () => {
		if (selectedSegment || campaignState.campaignConfigurationModel.segmentId) {
			const segmentId = selectedSegment ? selectedSegment.value : campaignState.campaignConfigurationModel.segmentId;
			getVariancesBySegmentId(segmentId)
				.then((response) => {
					const resultData = Object.assign(new Array<LookupModel>(), response.data);
					setVarianceList(resultData);
				})
				.catch(() => {
					swal('Failed', 'Problem in Get Variance by Segment', 'error');
				});
		}
	};

	function ValidateAddSegment() {
		if (segmentTypeId.toString() == SegmentTypes.Distribution && selectedVariance?.label == '') {
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
			return false;
		}
		if ((isEmpty(selectedSegment?.value) || isEmpty(campaignState.campaignConfigurationModel.segmentId)) && !enableAddSegmentBtn) {
			return false;
		}

		return true;
	}
	const onChangeInPeriod = (val: any) => {
		setSelectedInPeriod(val);
	};
	async function addSegment() {
		if (!ValidateAddSegment()) {
			return;
		}

		setIsSegmentDistribution(segmentTypeId.toString() == SegmentTypes.Distribution);
		campaignState.campaignConfigurationModel.segmentTypeId = segmentTypeId;
		campaignState.campaignConfigurationModel.segmentId = selectedSegment?.value;
		if (!isEmpty(selectedVariance?.value)) {
			addSegmentWithVariance();
		} else {
			addSegmentWithoutVariance();
		}
		dispatch(campaign.actions.campaign({...campaignState}));
	}

	function addSegmentWithVariance() {
		const varianceId = Number(selectedVariance?.value);
		getCampaignConfigurationSegmentById(campaignState.campaignConfigurationModel.segmentId as number, varianceId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					campaignState.campaignConfigurationModel.varianceId = varianceId;
					setSegmentList(response.data);
				}
			})
			.catch(() => {});

		return true;
	}
	function addSegmentWithoutVariance() {
		getSegmentationById(campaignState.campaignConfigurationModel.segmentId as number)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					let varianceName = selectedVariance ? selectedVariance?.label : campaignState.campaignConfigurationModel?.VarianceName;
					const updatedData = {varianceName: varianceName ?? ''};
					let segmentData = response.data.map((item) => (item.segmentId > 0 ? {...item, ...updatedData} : item));
					campaignState.campaignConfigurationModel.varianceId = selectedVariance ? Number(selectedVariance?.value) : 0;
					setSegmentList(segmentData);
				}
			})
			.catch(() => {});

		return true;
	}
	async function viewSegment() {
		if (isEmpty(campaignState.campaignConfigurationModel.segmentId)) {
			return;
		}

		if (!isEmpty(campaignState.campaignConfigurationModel.varianceId) && !Object.is(NaN, campaignState.campaignConfigurationModel.varianceId)) {
			getCampaignConfigurationSegmentById(
				campaignState.campaignConfigurationModel.segmentId as number,
				campaignState.campaignConfigurationModel.varianceId
			)
				.then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						setSegmentList(response.data);

						const variance: LookupModel = {
							label: response.data[0].varianceName,
							value: response.data[0].varianceId.toString(),
						};

						setSelectedVariance(variance);
						setIsSegmentDistribution(true);
					}
				})
				.catch(() => {});
		} else {
			getSegmentationById(campaignState.campaignConfigurationModel.segmentId as number)
				.then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						const updatedData = {varianceName: campaignState.campaignConfigurationModel?.VarianceName as string};
						let segmentData = response.data.map((item) => (item.segmentId > 0 ? {...item, ...updatedData} : item));
						setIsSegmentDistribution(false);
						setSegmentList(segmentData);
					}
				})
				.catch(() => {});

			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}

	const isEmpty = (value: any) => {
		const whatType = typeof value;
		switch (whatType) {
			case dataType.string.toString():
				return Boolean(value.trim() === '' || value === null || value === undefined);
			case dataType.number.toString():
			case dataType.undefined.toString():
			case dataType.object.toString():
				return Boolean(value === 0 || value === null || value === undefined);
			default:
				break;
		}
	};
	setTimeout(() => (gridApi ? gridApi.sizeColumnsToFit() : false), 100);

	function onRemoveSegment() {
		_removeSegment();
	}
	const segmentNameCellRenderer = (params: any) =>
		<>
			{params ? (
				<Link to={'/player-management/segment/view/' + params.data.segmentId} target='_blank'>
					{params.data.segmentName}
				</Link>
			) : null}
		</>
	const segmentStatusCellRenderer = (params: any) =>
		<>
			{params && params.data.segmentStatus === true && <span className='badge badge-light-success'> Active</span>}
			{params && params.data.segmentStatus === false && <span className='badge badge-light-danger'> Inactive</span>}
		</>
	const gridActionRenderer = () =>
		<>
			<TableIconButton
				access={true}
				faIcon={faTrash}
				isDisable={
					Props.viewMode || (campaignStatusIdState !== CampaignStatusEnum.Draft && campaignStatusIdState !== CampaignStatusEnum.Onhold)
				}
				iconColor={Props.viewMode ? '' : 'text-danger'}
				toolTipText={'Remove'}
				onClick={() =>
					Props.viewMode || (campaignStatusIdState !== CampaignStatusEnum.Draft && campaignStatusIdState !== CampaignStatusEnum.Onhold)
						? null
						: onRemoveSegment()
				}
			/>
		</>

	const columnDefs : (ColDef<SegmentationListModel> | ColGroupDef<SegmentationListModel>)[] = [
		{
			headerName: 'Segment Name', 
			field: 'segmentName',
			suppressSizeToFit: false,
			cellRenderer: segmentNameCellRenderer,
		},
		{
			headerName: 'Variance Name',
			field: 'varianceName', 
			suppressSizeToFit: false,
			cellRenderer:(params: any) => params.data.varianceName,
			hide: !isSegmentDistribution,
		},
		{
			headerName: 'Segment Status',
			field: 'segmentStatus',
			suppressSizeToFit: false,
			cellRenderer: segmentStatusCellRenderer
		},
		{
			headerName: 'Action',
			suppressSizeToFit: false,
			cellRenderer: gridActionRenderer
		}
	]

	return (
		<>
			<div className='form-group row' style={{border: '1px solid #e9ecef'}}>
				<div className='col-lg-4 mt-3'>
					<h6>Eligibility</h6>
				</div>

				<div className='col-lg-8 mt-3'>
					<div
						className='btn btn-icon w-auto px-0'
						style={{float: right, marginTop: '-10px'}}
						data-kt-toggle='true'
						data-kt-toggle-state='active'
						onClick={onClickEligibilityToggle}
					>
						<FontAwesomeIcon icon={eligibilityToggle ? faMinusSquare : faPlusSquare} />
					</div>
				</div>
			</div>
			<div className='row' style={eligibilityToggle ? {} : styleHideDetails}>
				<FieldContainer>
					<div className='col-lg-2 mt-3 required'>
						<label className='form-label-sm'>Eligibility Type</label>
					</div>
					<div className='col-lg-4 mt-2'>
						<Select
							size='small'
							style={{width: '100%'}}
							options={eligibilityType}
							onChange={onChangeEligibilityType}
							isDisabled={
								eligibilityTypeDisable ||
								Props.viewMode ||
								(campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)
							}
							value={selectedEligibilityType}
							onMenuOpen={getCampaignEligibilityTypes}
						/>
					</div>
					<div className='col-lg-2 mt-3 required'>
						<label className='form-label-sm'>In-Period</label>
					</div>
					<div className='col-lg-4 mt-2'>
						<Select
							size='small'
							style={{width: '100%'}}
							options={inPeriodList}
							onChange={onChangeInPeriod}
							isDisabled={Props.viewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)}
							value={selectedInPeriod}
							onMenuOpen={getInPeriods}
						/>
					</div>
				</FieldContainer>
				<FieldContainer>
					<div className='row'>
						{!isUploadPlayerList && (
							<>
								<div className='col-lg-2 mt-3 required'>
									<label className='form-label-sm'>Segment Name</label>
								</div>
								<div className='col-lg-4 mt-2'>
									<Select
										size='small'
										style={{width: '100%'}}
										options={allSegment}
										onChange={onChangeSegment}
										isDisabled={
											Props.viewMode ||
											(campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold) ||
											isUploadPlayerList
										}
										value={selectedSegment}
										onMenuOpen={getAllSegmentList}
									/>
								</div>

								{varianceList.length > 0 && (
									<>
										<div className='col-lg-2 mt-3 required'>
											<label className='form-label-sm'>Variance Name</label>
										</div>
										<div className='col-lg-2 mt-2' style={{marginLeft: '12px'}}>
											<Select
												size='small'
												style={{width: '100%'}}
												options={varianceList}
												onChange={onChangeVariance}
												isDisabled={
													Props.viewMode ||
													(campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold) ||
													isUploadPlayerList
												}
												value={selectedVariance}
											/>
										</div>
									</>
								)}
								<button
									type='button'
									disabled={Props.viewMode === true || !enableAddSegmentBtn}
									onClick={addSegment}
									className='btn btn-primary btn-sm me-2 col-lg-1 mt-2'
								>
									Select
								</button>
								{/* <div className='col-lg-12 mt-3'></div> */}
							</>
						)}
						{isUploadPlayerList && (
							<div className='col-lg-3 mt-2'>
								<span className='text-danger label label-lg label-light-danger label-inline'>
									<strong>NOTE: Please Upload list of Players in Player List Tab</strong>
								</span>
							</div>
						)}
					</div>
				</FieldContainer>
				<FieldContainer>
					<div className='col-lg-12 mt-3'></div>
					{!isUploadPlayerList && (
						<div className='ag-theme-quartz' style={{height: '100px', width: '100%'}}>
							<AgGridReact
								rowData={segmentList}
								columnDefs={columnDefs}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								onGridReady={onGridReady}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								animateRows={true}
							>
							</AgGridReact>
						</div>
					)}
				</FieldContainer>
			</div>
		</>
	);
};
