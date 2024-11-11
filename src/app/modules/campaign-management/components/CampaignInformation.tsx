import moment from 'moment';
import {useEffect, useState} from 'react';
import DatePicker from 'react-datepicker';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import {LookupModel, MasterReferenceOptionModel, OptionListModel} from '../../../common/model';
import {CampaignStatusEnum, HttpStatusCodeEnum, MessageGroupEnum, pageMode} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {FieldContainer} from '../../../custom-components';
import {useLoadCurrencyList} from '../../../custom-functions';
import CommonLookups from '../../../custom-functions/CommonLookups';
import useCampaignManagementOptions from '../../../custom-functions/system/option/useCampaignManagementOptions';
import {CAMPAIGN_REPORT_PERIOD} from '../../system/components/constants/SelectOptions';
import {getSystemLookups} from '../../system/redux/SystemService';
import {CampaignConfigurationExchangeRateModel} from '../models/request/CampaignConfigurationExchangeRateModel';
import {CampaignInformationCurrencyModel} from '../models/request/CampaignInformationCurrencyModel';
import {CampaignModel} from '../models/request/CampaignModel';
import * as campaign from '../redux/CampaignManagementRedux';
import {getAllCampaignType, getlAllSurveyTemplate} from '../redux/CampaignManagementService';

interface Props {
	formik: any;
	initialValues: any;
}

export const CampaignInformation = (Props: Props) => {
	const dispatch = useDispatch();
	const [brandList,setBrandList] = useState<Array<LookupModel>>([]);
	const [selectedCampaignPeriodDateFrom, setSelectedCampaignPeriodDateFrom] = useState<any>();
	const [selectedCampaignPeriodDateTo, setSelectedCampaignPeriodDateTo] = useState<any>();
	const [selectedCurrency, setSelectedCurrency] = useState<Array<LookupModel>>([]);
	const [selectedBrand, setSelectedBrand] = useState<LookupModel>();
	const [selectedCampaignType, setSelectedCampaignType] = useState<LookupModel>();
	const [selectedReportPeriodDate, setSelectedReportPeriodDate] = useState<LookupModel>();
    const [selectedSurveyTemplate, setSelectedSurveyTemplate] = useState<any>('');
	const [selectedCampaignName, setSelectedCampaignName] = useState<string>('');
	const [selectedCampaignDescription, setSelectedCampaignDescription] = useState<string>('');
	const [isViewMode, setIsViewMode] = useState<boolean>(false);
	const [campaignTypeList, setCampaignTypeList] = useState<Array<LookupModel>>([]);
	const [surveyTemplateList, setSurveyTemplateList] = useState<Array<LookupModel>>([]);
	const [campaignStatusId, setCampaignStatusId] = useState<number>(0);
	const campaignStatusIdState = useSelector<RootState>(({campaign}) => campaign.campaignStatusId, shallowEqual) as number;
	const mode = useSelector<RootState>(({campaign}) => campaign.mode, shallowEqual) as string;
	const [selectedPreviousCampaignType, setSelectedPreviousCampaignType] = useState<LookupModel>();
	const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign, shallowEqual) as CampaignModel;
	const lookUpCurriencies = CommonLookups('currencies');
	const campaignType = useSelector<RootState>(({campaign}) => campaign.getCampaignType, shallowEqual) as LookupModel[];
	const [campaignReportPeriodDateList, setCampaignReportPeriodDateList] = useState<Array<LookupModel>>([]);
	const [selectedMessageGroup, setSelectedMessageGroup] = useState<LookupModel>();
	const {masterReferenceIds} = useConstant();
	const {getMasterReferenceOptions,masterReferenceOptions} = useCampaignManagementOptions();
	const [messageGroupOptions,setMessageGroupOptions] = useState<Array<OptionListModel>>([]);
	const [showCurrencyAll,setShowCurrencyAll] =  useState<boolean>(true);
	const [currencyOptions,setCurrencyOptions] =  useState<Array<LookupModel>>(lookUpCurriencies);
	const {loadCurrencyList,currencyFilterList} = useLoadCurrencyList();
	let RemoveCurrencyId = 0;

	//Constant
	let OptionAll = [{label: "All", value: "0" }]
	let currencies = currencyFilterList
		.filter((x) => x.isComplete)
		.flatMap((x) => [{ label: x.currencyCode, value: x.currencyId?.toString()}]);
		
	if(lookUpCurriencies.every(a => a.value !== "0")){
			lookUpCurriencies.unshift({label: "All", value: "0" });
	}
	// Use EFFECTS
	useEffect(() => {
		if(currencyOptions.length === 0) return;
		//This will check the currencies if ALL currencies selected when editing
		lookForCurrencyAll(currencyOptions);
	},[currencyOptions])

	const lookForCurrencyAll = (values : any) => {
		if(campaignState.campaignInformationCurrencyModel.length === 0) return;
		setShowCurrencyAll(false);
		for (const item of currencyOptions) {
			if(item.value !== "0") {
				const foundObject =  campaignState.campaignInformationCurrencyModel?.find(a => a.currencyId.toString() == item.value)
				if(!foundObject){
					setShowCurrencyAll(true);
					//Show the ALL Option in Currency
				}
			}
		}
	}
	useEffect(() => {
		setCurrencyOptions(lookUpCurriencies);
		setCampaignReportPeriodDateList(CAMPAIGN_REPORT_PERIOD);
		getCampaignType();
		getSurveyTemplate();
		brandOptionMenuOpen();
		currencyOptionMenuOpen();
		getMasterReferenceOptions(masterReferenceIds.parentId.MessageGroup.toString());

		if (campaignState.campaignId == 0) {
			setSelectedReportPeriodDate(undefined);
		}

	}, []);
	useEffect(() => {
		if (lookUpCurriencies.length > 1 && currencyOptions.length === 1) {
			setCurrencyOptions(lookUpCurriencies);
		} //Added this to make sure the currency option has values.
	}, [lookUpCurriencies]);
	//Use This Currency Option when Create Mode
	useEffect(() => {
		if (currencyFilterList && mode === pageMode.create) {
			currencyFilterList
				.filter((x) => x.isComplete)
				.flatMap((x) => [{ label: x.currencyCode, value: x.currencyId?.toString() }]);
			setCurrencyOptions([...OptionAll, ...currencies]);
		}
	}, [currencyFilterList]);

	useEffect(() => {
		setIsViewMode(false);
		if (mode === pageMode.view) {
			setIsViewMode(true);
		}
	}, [mode]);

	useEffect(() => {
		campaignState.campaignName = selectedCampaignName;
		dispatch(campaign.actions.campaign({...campaignState}));
	}, [selectedCampaignName]);

	useEffect(() => {
		campaignState.campaignInformationModel.campaignDescription = selectedCampaignDescription;
		dispatch(campaign.actions.campaign({...campaignState}));
	}, [selectedCampaignDescription]);

	//Map the Selected Currency to the campaign Configuration Exchange Rate
	useEffect(() => {
		if (selectedCurrency) updateCampaignConfigurationExchangeRate();
	}, [selectedCurrency]);

	useEffect(() => {
		if (selectedSurveyTemplate) {
			campaignState.campaignInformationModel.surveyTemplateId = selectedSurveyTemplate?.value;
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedSurveyTemplate]);

	useEffect(() => {
		if (selectedBrand) {
			campaignState.campaignInformationModel.brandId = Number(selectedBrand?.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedBrand]);
	
	useEffect(() => {
		if (selectedMessageGroup) {
			campaignState.campaignConfigurationCommunicationModel.messageGroupId = Number(selectedMessageGroup?.value);
			campaignState.campaignConfigurationCommunicationModel.messageType = ""; //Reset the Message Type
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	}, [selectedMessageGroup]);
	
	useEffect(() => {
		if (masterReferenceOptions) {
			let _masterGroupOptions = masterReferenceOptions.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === masterReferenceIds.parentId.MessageGroup)
			.map((x: MasterReferenceOptionModel) => x.options).filter(p => p.value !== MessageGroupEnum.Chat.toString() && p.value !== MessageGroupEnum.SMS.toString());
			//Exclude the CHAT AND SMS. Filter only EMAIL, NOTIFICATION and CALL - MLAB 3336
			setMessageGroupOptions(_masterGroupOptions)
		}
	}, [masterReferenceOptions]);

	useEffect(() => {
		if (campaignState.campaignId === 0 && campaignState.campaignId === undefined) {
			return
		}
		setCampaignStatusId(campaignState.campaignStatusId);

		const brand = brandList.find((a) => a.value == campaignState.campaignInformationModel?.brandId.toString());
		const campaignReportPeriod = CAMPAIGN_REPORT_PERIOD.find(
			(a) => a.value == campaignState.campaignInformationModel?.campaignReportPeriod?.toString()
		);
		if (campaignReportPeriod != null) {
			const reportPeriod: LookupModel = {
				label: campaignReportPeriod?.label,
				value: campaignReportPeriod?.value,
			};
			const infoCurrency = new Array<LookupModel>();
			campaignState.campaignInformationCurrencyModel?.map((item) => {
				const _currency = currencyOptions.find((a) => a.value == item.currencyId.toString());
				if (_currency) infoCurrency.push(_currency);
			});
			setSelectedCurrency(infoCurrency);
			const campaignTypeSelected = campaignTypeList.find((a) => a.value == campaignState.campaignInformationModel.campaignTypeId.toString());
			if (brand) setSelectedBrand(brand);
			setSelectedCampaignName(campaignState.campaignName);
			setSelectedCampaignDescription(campaignState.campaignInformationModel.campaignDescription);
			setSelectedReportPeriodDate(reportPeriod);
			setSelectedCampaignType(campaignTypeSelected);
			setSelectedPreviousCampaignType(campaignTypeSelected);
			if (
				campaignState.campaignInformationModel.campaignPeriodFrom != undefined &&
				campaignState.campaignInformationModel.campaignPeriodTo != undefined
			) {
				const dateFrom = new Date(campaignState.campaignInformationModel.campaignPeriodFrom);
				const dateTo = new Date(campaignState.campaignInformationModel.campaignPeriodTo);
				setSelectedCampaignPeriodDateFrom(dateFrom);
				setSelectedCampaignPeriodDateTo(dateTo);
			} else {
				setSelectedCampaignPeriodDateFrom(undefined);
				setSelectedCampaignPeriodDateTo(undefined);
			}
			if (surveyTemplateList.length > 0) {
				const surveyTemplate = surveyTemplateList.find((a) => a.value == campaignState.campaignInformationModel?.surveyTemplateId?.toString());
				setSelectedSurveyTemplate(surveyTemplate);
			}
			
			setSelectedMessageGroup(
				messageGroupOptions.find((a) => a.value === campaignState.campaignConfigurationCommunicationModel?.messageGroupId?.toString())
			);
		}

	}, [campaignState]);
	//END USE EFFECT
	const validateCurrencyIfAlreadyUsed = (currenciesValues: Array<LookupModel>) => {
		let found = true;
		campaignState.campaignCommunicationCustomEventModel.forEach((item) => {
			const foundObject = currenciesValues.find(a => a.value == item.currencyId?.toString())
			if(!foundObject){
				RemoveCurrencyId = item.currencyId ?? 0;
				found = false;
			} 
		});
		return found;
	}
	const onChangeCurrency = (val: Array<LookupModel>) => {
		if(!validateCurrencyIfAlreadyUsed(val) ){
			swal({
				title: 'Confirmation',
				text: 'This action will remove the configuration on communication tab, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willSave) => {
				if (willSave) {
					changeCurrency(val);
				} 
			});
		}
		else{
			changeCurrency(val);
		}
	};
	const changeCurrency =(val: Array<LookupModel>)=> {
		let campaignCurrency = Array<CampaignInformationCurrencyModel>();
		let currenciesTmp = currencyOptions;
		setShowCurrencyAll(true);
		if(val.length  === 0){
			setSelectedCurrency([]);
		    setShowCurrencyAll(true);
		}
		else if(val.findIndex(curr => curr.value === "0") >= 0 ){ //check if All selected
			setShowCurrencyAll(false);
			val = currenciesTmp.filter(a => a.value !== "0"); //Do not include the "ALL" option 
			setSelectedCurrency(val);
			if(mode !== pageMode.create) { //they have different set of options depends on create and Edit.
				val = currenciesTmp.filter(a => a.value !== "0");
			}   
		}
		else {	
			if(val.some(curr => curr.value === "0")){  //reset the selectedCurrency from ALL to specific Currency
				setSelectedCurrency([]);
			}
			setSelectedCurrency(val.filter(a => a.value !== "0"));
		}
		//Map the Currencies
		val.forEach((item) => {
			const _campaignCurrencyInformation: CampaignInformationCurrencyModel = {
				currencyId: Number(item.value),
				campaignInformationCurrencyId: 0,
				campaignInformationId: 0,
			};
			campaignCurrency.push(_campaignCurrencyInformation);
		});
		campaignState.campaignInformationCurrencyModel = campaignCurrency;
		removeCurrencyFromCampaignCommunication();
		dispatch(campaign.actions.campaign({ ...campaignState }));
		lookForCurrencyAll(val)
	}
	const removeCurrencyFromCampaignCommunication = () =>{
		campaignState.campaignCommunicationCustomEventModel.forEach((customEvent, index) => {
			const foundObject = campaignState.campaignCommunicationCustomEventModel.findIndex(a => a.currencyId === RemoveCurrencyId)
			if(foundObject !== -1){
				 campaignState.campaignCommunicationCustomEventModel = campaignState.campaignCommunicationCustomEventModel.filter(a => a.currencyId !== RemoveCurrencyId);
				 dispatch(campaign.actions.campaign({ ...campaignState }));
			} 
		})
	}
	const onChangeBrand = (data: any) => {
		setSelectedBrand(data);
	};
	const onChangeCampaignType = (val: any) => {
		if (val && val.value != campaignState.campaignInformationModel.campaignTypeId && mode == 'edit' && val.value == 145) {
			showCampaignTypeAlert(val);
		} else {
			setSelectedCampaignType(val);
			dispatch(campaign.actions.eligibilityTypeId(0));
			campaignState.campaignInformationModel.campaignTypeId = Number(val.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
		//Reset the Eligibility When changing CampaignType
		campaignState.campaignConfigurationCommunicationModel.subTopic = val?.label;
		dispatch(campaign.actions.campaign({...campaignState}));
	};
	const onChangeCampaignPeriodDateFrom = (val: any) => {
		if (val != undefined) {
			setSelectedCampaignPeriodDateFrom(val);

			let fromDateString = moment(val).add(8, 'h').toISOString();
			if(fromDateString.indexOf('.') !== -1){
				fromDateString = fromDateString.slice(0,fromDateString.indexOf('.'));
			}
			
			campaignState.campaignInformationModel.campaignPeriodFrom = fromDateString;
			dispatch(campaign.actions.campaign({...campaignState}));
			dispatch(campaign.actions.campaignPeriodFrom(campaignState.campaignInformationModel.campaignPeriodFrom));
		}
	};
	const onChangeCampaignPeriodDateTo = (val: any) => {
		if (val != undefined) {
			setSelectedCampaignPeriodDateTo(val);

			let toDateString = moment(val).add(8, 'h').toISOString();
			if(toDateString.indexOf('.') !== -1){
				toDateString = toDateString.slice(0,toDateString.indexOf('.'));
			}

			campaignState.campaignInformationModel.campaignPeriodTo = toDateString;
			dispatch(campaign.actions.campaign({...campaignState}));
			dispatch(campaign.actions.campaignPeriodTo(campaignState.campaignInformationModel.campaignPeriodTo));
		}
	};
	const onChangeCampaignReportPeriodDate = (val: any) => {
		if (val != undefined) {
			setSelectedReportPeriodDate(val);
			campaignState.campaignInformationModel.campaignReportPeriod = Number(val?.value);
			dispatch(campaign.actions.campaign({...campaignState}));
		}
	};
	const getCampaignType = () => {
		if (campaignType != undefined && campaignType.length == 0) {
			getAllCampaignType().then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setCampaignTypeList(response.data);
					dispatch(campaign.actions.getCampaignType(response.data));
				}
			});
		} else setCampaignTypeList(campaignType);
	};

	const getSurveyTemplate = () => {
		getlAllSurveyTemplate().then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				setSurveyTemplateList(response.data);
				dispatch(campaign.actions.getAllSurveyTemplate(response.data));
			}
		});
	};
	const onChangeSurveyTemplate = (value: LookupModel) => {
		setSelectedSurveyTemplate(value);
		campaignState.campaignInformationModel.surveyTemplateId = Number(value.value);
		dispatch(campaign.actions.campaign({...campaignState}));
	};
	const onOpenDropDownReFetch = (value: any) => {
		getCampaignType();
		getSurveyTemplate();
	};
	//Add these code to sync the campaign Information currency and campaign exchange rate
	const updateCampaignConfigurationExchangeRate = () => {
		let selectedCurrencyInCampaignInformation = Array<CampaignConfigurationExchangeRateModel>();
		let _campaignStateExchangeList = campaignState.campaignConfigurationExchangeRateModel;
		campaignState.campaignInformationCurrencyModel?.forEach((data) => {
			let exchangeRate = _campaignStateExchangeList?.find((a) => a.currencyId == data.currencyId);
			const campaignConfigExchangeCurrency: CampaignConfigurationExchangeRateModel = {
				currencyName: currencyOptions.find((a) => Number(a.value) == data.currencyId)?.label,
				currencyId: data.currencyId,
				exchangeRate: exchangeRate && exchangeRate?.exchangeRate !== 0 ? exchangeRate?.exchangeRate : undefined,
				campaignConfigurationExchangeRateId: exchangeRate ? exchangeRate?.campaignConfigurationExchangeRateId : 0,
				campaignConfigurationId: exchangeRate ? exchangeRate?.campaignConfigurationId : 0,
				campaignInformationCurrencyId: exchangeRate ? exchangeRate?.campaignInformationCurrencyId : 0,
			};
			selectedCurrencyInCampaignInformation.push(campaignConfigExchangeCurrency);
		});

		campaignState.campaignConfigurationExchangeRateModel = selectedCurrencyInCampaignInformation;
		dispatch(campaign.actions.campaign({...campaignState}));
	};

	const showCampaignTypeAlert = (val: any) => {
		swal({
			title: 'Confirmation',
			text: 'This action will update campaign record, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				setSelectedCampaignType(val);
				dispatch(campaign.actions.eligibilityTypeId(0));
				campaignState.campaignInformationModel.campaignTypeId = Number(val.value);
				dispatch(campaign.actions.campaign({...campaignState}));
				setSelectedPreviousCampaignType(val);
			} else {
				setSelectedCampaignType(selectedPreviousCampaignType);
			}
		});
	};
	const removeMessageConfiguration = (value: any) => {

		function assignMessageTypeAndGroup() {
			setSelectedMessageGroup(value);
		}

		if(campaignState.campaignCommunicationCustomEventModel.length === 0){
			assignMessageTypeAndGroup();
			return;
		}
		swal({
			title: 'Confirmation',
			text: 'This action will remove the configuration on communication, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				campaignState.campaignCommunicationCustomEventModel = [];
				campaignState.campaignCustomEventCountryModel = [];
				assignMessageTypeAndGroup();
				dispatch(campaign.actions.campaign({...campaignState}));
			}
		
		});
		
	};
	const onChangeMessageGroup = (value: any) => {
	
		if(value.value === MessageGroupEnum.Notification.toString()){
		    setSelectedMessageGroup(value);
		}
		else if(value.value === MessageGroupEnum.Call.toString()){
			removeMessageConfiguration(value);
			campaignState.campaignConfigurationCommunicationModel.customEventId = null;
			campaignState.campaignConfigurationCommunicationModel.interval = "";
		}
		else if(value.value === MessageGroupEnum.Email.toString()){
			setSelectedMessageGroup(value);
		}
	};
	const brandOptionMenuOpen = () => { 
		getSystemLookups()
		.then((response) => {
		  if (response.status === HttpStatusCodeEnum.Ok) {
			setBrandList(response.data.brands);
		  }
		})
	}	
	//On Demand Currency Option 
	const currencyOptionMenuOpen = () => {
		if ((mode !== pageMode.create)) {
			getSystemLookups()
				.then((response) => {
					if (response.status !== HttpStatusCodeEnum.Ok) { return }
					let _curriencies = Object.assign(new Array<LookupModel>(), response.data.currencies);
					_curriencies.unshift({ label: "All", value: "0" });
					setCurrencyOptions(_curriencies);
				})
		}
		else{
			loadCurrencyList()
		}
	}
	const messageGroupOnMenuOpen = () => {
		getMasterReferenceOptions(masterReferenceIds.parentId.MessageGroup.toString());
	}
	return (
		<FieldContainer>
			<div className='col-lg-12 mt-3'></div>
			<div className='col-lg-12 mt-3'></div>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Brand</label>
				</div>
				<div className='col-sm-6'>
					<Select
						size='small'
						style={{width: '100%'}}
						isDisabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						options={brandList}
						onChange={onChangeBrand}
						value={selectedBrand}
						onMenuOpen={brandOptionMenuOpen}
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Currency</label>
				</div>
				<div className='col-sm-6'>
					<Select
						isMulti
						closeMenuOnSelect={false}
						size='small'
						style={{width: '100%'}}
						isDisabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						options={currencyOptions.filter(a => showCurrencyAll ? a.value !== "": a.value !== "0")}				
						onChange={onChangeCurrency}
						value={selectedCurrency}
						onMenuOpen={currencyOptionMenuOpen}
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Campaign Type</label>
				</div>
				<div className='col-sm-6'>
					<Select
						size='small'
						options={campaignTypeList}
						isDisabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						style={{width: '100%'}}
						onChange={onChangeCampaignType}
						value={campaignTypeList.find((a) => a.value === selectedCampaignType?.value)}
						onMenuOpen={onOpenDropDownReFetch}
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Campaign Name</label>
				</div>
				<div className='col-sm-6'>
					<input
						type='text'
						className={'form-control form-control-sm '}
						disabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						onChange={(e: any) => setSelectedCampaignName(e.target.value)}
						value={selectedCampaignName}
						aria-label='Campaign Name'
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm'>Campaign Description</label>
				</div>
				<div className='col-sm-6'>
					<textarea
						className='form-control form-control-sm'
						disabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						onChange={(e: any) => setSelectedCampaignDescription(e.target.value)}
						value={selectedCampaignDescription}
						aria-label='Campaign Description'
					></textarea>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Campaign Period</label>
				</div>
				<div className='col-sm-2'>
					<DatePicker
						dateFormat='yyyy-MM-dd HH:mm:ss'
						selected={selectedCampaignPeriodDateFrom}
						onChange={onChangeCampaignPeriodDateFrom}
						className='form-control form-control-sm'
						timeFormat='HH:mm'
						placeholderText='From'
						disabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						minDate={moment().toDate()}
						timeIntervals={1}
						showTimeSelect
					/>
				</div>
				<div className='col-sm-2'>
					<DatePicker
						dateFormat='yyyy-MM-dd HH:mm:ss'
						selected={selectedCampaignPeriodDateTo}
						onChange={onChangeCampaignPeriodDateTo}
						className='form-control form-control-sm'
						timeFormat='HH:mm'
						disabled={isViewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)}
						placeholderText='To'
						minDate={moment(selectedCampaignPeriodDateFrom).toDate()}
						timeIntervals={1}
						showTimeSelect
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Campaign Report Period</label>
				</div>
				<div className='col-sm-6'>
					<Select
						size='small'
						style={{width: '100%'}}
						isDisabled={isViewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold)}
						options={campaignReportPeriodDateList}
						onChange={onChangeCampaignReportPeriodDate}
						value={selectedReportPeriodDate}
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Message Group</label>
				</div>
				<div className='col-sm-6'>
					<Select
						size='small'
						style={{width: '100%'}}
						options={messageGroupOptions}
						onChange={onChangeMessageGroup}
						value={selectedMessageGroup}
						isDisabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						onMenuOpen = {messageGroupOnMenuOpen}
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className={selectedMessageGroup?.value === MessageGroupEnum.Call.toString() ? 'form-label-sm required' : 'form-label-sm'}>Survey Template</label>
				</div>
				<div className='col-sm-6'>
					<Select
						size='small'
						style={{width: '100%'}}
						options={surveyTemplateList}
						isDisabled={isViewMode || campaignStatusId > CampaignStatusEnum.Draft}
						onChange={onChangeSurveyTemplate}
						value={selectedSurveyTemplate}
						onMenuOpen={onOpenDropDownReFetch}
					/>
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm'>Campaign Journey</label>
				</div>
				<div className='col-sm-6'>
					<input
						type='text'
						className={'form-control form-control-sm '}
						disabled={true}
						value={campaignState.campaignInformationModel.campaignJourneyName}
						aria-label='Campaign Journey'
					/>
				</div>
			</FieldContainer>
			{campaignStatusId == CampaignStatusEnum.Onhold && (
				<FieldContainer>
					<div className='col-sm-3'>
						<label className='form-label-sm'>Hold Reason</label>
					</div>
					<div className='col-sm-6'>{campaignState.holdReason}</div>
				</FieldContainer>
			)}
		</FieldContainer>
	);
};
