import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons'
import React, {useEffect, useRef, useState} from 'react'
import {DefaultGridPagination, FieldContainer, MlabButton, TableIconButton} from '../../../custom-components'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import swal from 'sweetalert';
import {CampaignStatusEnum, ElementStyle, HttpStatusCodeEnum, MessageGroupEnum, PaginationEventsEnum, pageMode} from '../../../constants/Constants'
import { LookupModel } from '../../../shared-models/LookupModel'
import { useSelector,shallowEqual, useDispatch } from 'react-redux'
import { RootState } from '../../../../setup'
import { CampaignModel } from '../models/request/CampaignModel'
import * as campaign from '../redux/CampaignManagementRedux'
import { getAllCampaignCustomEventSettingName } from '../redux/CampaignManagementService'
import { useCurrencies, useMasterReferenceOption } from '../../../custom-functions'
import { MasterReferenceOptionModel, PaginationModel } from '../../../common/model'
import useConstant from '../../../constants/useConstant'
import { MESSAGE_TYPE_OPTIONS } from '../../system/components/constants/SelectOptions'
import CampaignCommunicationCustomEventModal from './CampaignCommunicationCustomEventModal'
import { AgGridReact } from 'ag-grid-react'
import { ButtonGroup } from 'react-bootstrap-v5'
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../common-template/gridTemplates'
import { CampaignCommunicationCustomEventRequestModel } from '../models/request/CampaignCommunicationCustomEventRequestModel'
import { CampaignCustomEventCountryRequestModel } from '../models/request/CampaignCustomEventCountryRequestModel'
import CommonLookups from '../../../custom-functions/CommonLookups'
import { ColDef, ColGroupDef } from 'ag-grid-community';


type Props = {
  viewMode: boolean
  currentCampaignStatus?: number
}
export const CampaignCommunication = (_props: Props) => {
  const dispatch = useDispatch()
  const currentUserId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
  const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign,shallowEqual) as CampaignModel
  const [selectedCommunicationInterval, setSelectedCommunicationInterval] = useState<any>()
  const [customEventsOptions, setCustomEventsOptions] = useState<any>()
  const getAllCampaignCustomEvent = useSelector<RootState>(({campaign}) => campaign.getAllCampaignCustomEvent,shallowEqual) as Array<LookupModel>
  const mode = useSelector<RootState>(({campaign}) => campaign.mode, shallowEqual) as string
  const [isViewMode, setIsViewMode] = useState<boolean>(false)
  const campaignStatusIdState = useSelector<RootState>(({campaign}) => campaign.campaignStatusId,shallowEqual) as number
  let dateNow = new Date()
	const {masterReferenceIds} = useConstant()
	const [messageTypeOptions, setMessageTypeOptions] = useState<Array<LookupModel>>(MESSAGE_TYPE_OPTIONS);
	const [selectedMessageType, setSelectedMessageType] = useState<Array<LookupModel>>([]);

	const messageGroupOptions =  useMasterReferenceOption(masterReferenceIds.parentId.MessageGroup.toString())
	.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === masterReferenceIds.parentId.MessageGroup)
	.map((x: MasterReferenceOptionModel) => x.options).filter(p => p.value !== MessageGroupEnum.Chat.toString() && p.value !== MessageGroupEnum.SMS.toString());
	
  const [customEventModalShow, setCustomEventModalShow] = useState<boolean>(false);
  const [customEventRecord, setCustomEventRecord] = useState<CampaignCommunicationCustomEventRequestModel | null>(null);
  const [messageModalTitle, setMessageModalTitle] = useState('');
  const [customEventList, setCustomEventList] = useState<Array<CampaignCommunicationCustomEventRequestModel>>([]);
  const [paginatedCustomEventList, setPaginatedCustomEventList] = useState<Array<CampaignCommunicationCustomEventRequestModel>>([]);
  const currencyOptions = useCurrencies(currentUserId);
  const countryOptions = CommonLookups('countries');
	const { SwalConfirmMessage, SwalCampaignMessage } = useConstant();
  
  const gridRef: any = useRef();
	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 20,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});

  const columnDefs : (ColDef<CampaignCommunicationCustomEventRequestModel> | ColGroupDef<CampaignCommunicationCustomEventRequestModel>)[] = [
			{
        headerName: 'Custom Event Name', 
        field: 'campaignEventSettingId',
        sort: 'desc' as 'desc',
        cellRenderer: (params: any) => getAllCampaignCustomEvent.find(i => i.value === params.data.campaignEventSettingId)?.label ?? ''
      },
			{
        headerName: 'Currency', 
        field: 'currencyId',
        cellRenderer: (params: any) => currencyOptions.find(i => i.value === params.data.currencyId.toString())?.label ?? ''
      },
      {
        headerName: 'Country', 
        field: 'campaignCommunicationCustomEventId',
        cellRenderer: (params: any) => countryOptions.filter(i =>  campaignState.campaignCustomEventCountryModel.filter(j => params.data.campaignCommunicationCustomEventId == 0 ?  j.parentCustomEventGuid === params.data.customEventGuid :  j.campaignCommunicationCustomEventId === params.data.campaignCommunicationCustomEventId).map(k => k.countryId).includes(Number(i.value))).map(i => i.label).join(", ")
      },
			{
				headerName: 'Action',
				sortable: false,
				cellRenderer: (params: any) => renderAgGridAction(params)
			}
  ];

 useEffect(() => {
    setDateNowToZero();
    setCustomEventsOptions(getAllCampaignCustomEvent);
    setSelectedCommunicationInterval(dateNow)
    setMessageTypeOptions(MESSAGE_TYPE_OPTIONS);
    handlePagination(PaginationEventsEnum.FirstPage);
  }, [])

  useEffect(() => {
    setIsViewMode(false);
     if (mode === pageMode.view.toString()) {
       setIsViewMode(true);
     }
   }, [mode])
 useEffect(() => {
    if(campaignState.campaignConfigurationCommunicationModel.customEventId === null){
      setDateNowToZero();
      setSelectedCommunicationInterval(dateNow)
    }
   }, [campaignState.campaignConfigurationCommunicationModel.customEventId])
 useEffect(() => {
  let hrs = campaignState.campaignConfigurationCommunicationModel.interval?.substring(0,2);
  let mins = campaignState.campaignConfigurationCommunicationModel.interval?.substring(3,5); 
  if(campaignState.campaignConfigurationCommunicationModel.interval){
    if((hrs) && mins){
      dateNow.setHours(parseInt(hrs));
      dateNow.setMinutes(parseInt(mins));
      setSelectedCommunicationInterval(dateNow);
    }
    else{
      setDateNowToZero();
      setSelectedCommunicationInterval(dateNow);
    }
  }
  
  campaignState.campaignConfigurationCommunicationModel.caseType = 'Campaign'
  campaignState.campaignConfigurationCommunicationModel.messageStatus = 'Pending'

   //The message type is comma delimited
   const existingCampaignMessageType = campaignState.campaignConfigurationCommunicationModel?.messageType?.split(',');
   const _messageType = messageTypeOptions.filter((option) =>
     existingCampaignMessageType?.includes(option.label)
   );

   setSelectedMessageType(_messageType);


  }, [campaignState.campaignConfigurationCommunicationModel])

  useEffect(() => {
    if(campaignState.campaignCommunicationCustomEventModel && campaignState.campaignCommunicationCustomEventModel.length === 0){
      setCustomEventList([]);
      setPaginatedCustomEventList([]);
    } else{
      const updatedCustomEventList = customEventList.filter(event =>
        campaignState.campaignCommunicationCustomEventModel.some(a => a.currencyId === event.currencyId)
      );
      setCustomEventList(updatedCustomEventList);
      setPaginatedListValue(pagination.currentPage, pagination.pageSize);
    }
   }, [campaignState.campaignCommunicationCustomEventModel])

  useEffect(() => {
    if (campaignState.campaignConfigurationCommunicationModel.messageGroupId === 0) return;
    if (campaignState.campaignConfigurationCommunicationModel.messageType !== '') return; //do not go here if alread saved

    if (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Notification) {
      setMessageTypeOptions([MESSAGE_TYPE_OPTIONS[1]]);
			setSelectedMessageType([MESSAGE_TYPE_OPTIONS[1]]);
    }
    else if (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call) {
      setMessageTypeOptions([MESSAGE_TYPE_OPTIONS[2],MESSAGE_TYPE_OPTIONS[3],MESSAGE_TYPE_OPTIONS[4]]);
      setSelectedMessageType([MESSAGE_TYPE_OPTIONS[2],MESSAGE_TYPE_OPTIONS[3],MESSAGE_TYPE_OPTIONS[4]]);
      campaignState.campaignConfigurationCommunicationModel.interval = "";
      setDateNowToZero();
      setSelectedCommunicationInterval(dateNow)
      dispatch(campaign.actions.campaign({...campaignState}));
    }
    else if (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Email) {
      setMessageTypeOptions([MESSAGE_TYPE_OPTIONS[0]]);
			setSelectedMessageType([MESSAGE_TYPE_OPTIONS[0]]);
    }
  }, [campaignState.campaignConfigurationCommunicationModel.messageGroupId])

  useEffect(() => {
    if(selectedMessageType && selectedMessageType?.length > 0){
      campaignState.campaignConfigurationCommunicationModel.messageType = Object.assign(Array<LookupModel>(), selectedMessageType).map((el:any) => el.value).join(',');
      dispatch(campaign.actions.campaign({...campaignState}));
    }
	}, [selectedMessageType]);

  const renderAgGridAction = (params: any) => (

    <ButtonGroup aria-label='Basic example'>
      <div className='d-flex justify-content-center flex-shrink-0'>
        <div className='me-4'>
          <TableIconButton
            access={true}
            faIcon={faPencilAlt}
            toolTipText={'Edit'}
            onClick={() => editCustomEvent(params.data)}
            isDisable={isViewMode || campaignStatusIdState > CampaignStatusEnum.Draft}
          />
        </div>
        <div className='me-4'>
          <TableIconButton
            access={true}
            faIcon={faTrash}
            toolTipText={'Remove'}
            onClick={() => removeCustomEvent(params.data)}
            isDisable={isViewMode || campaignStatusIdState > CampaignStatusEnum.Draft}
          />
        </div>
      </div>
    </ButtonGroup>
    
    );

  const setDateNowToZero = () => {
    dateNow.setHours((0));
    dateNow.setMinutes((0));
  }
  
  const onChangeCommInterval = (val: any) => {
    if(val){
      let hours = val?.getHours();
      let minutes = val?.getMinutes();
      campaignState.campaignConfigurationCommunicationModel.interval = (hours < 10 ? '0'+ hours : hours) +':'+ (minutes < 10 ? '0'+ minutes: minutes);
      dispatch(campaign.actions.campaign({...campaignState }))
      setSelectedCommunicationInterval(val)
    }
    else{
      dateNow.setHours((0));
      dateNow.setMinutes((0));
      setSelectedCommunicationInterval(dateNow)
      campaignState.campaignConfigurationCommunicationModel.interval = '00:00';
    }
  }

  const disabledByMessageGroup = () => {
    return (campaignState.campaignConfigurationCommunicationModel?.messageGroupId === MessageGroupEnum.Call
      || isViewMode
      || (campaignStatusIdState !== CampaignStatusEnum.Draft && campaignStatusIdState !== CampaignStatusEnum.Onhold))
  }

  const onChangeMessageType = (value: any) => {
		setSelectedMessageType(value);
	};

  const closeCustomEventModal = () => setCustomEventModalShow(false);

  const addCustomEvent = () => {

    if(campaignState.campaignCommunicationCustomEventModel.length > 30) {
      swal(SwalCampaignMessage.titleFailed, SwalCampaignMessage.textMaxCustomEventLimitReached, SwalCampaignMessage.iconError);
    } else {
      setCustomEventRecord(null);
      setMessageModalTitle('Add Message - ' + Object.assign(Array<LookupModel>(), selectedMessageType).map((el:any) => el.label).join(' , '));
      setCustomEventModalShow(true);
    }
  }
  
  const editCustomEvent = (value: any) => {
    const customEventInfo = campaignState.campaignCommunicationCustomEventModel.find(i => i.customEventGuid == value.customEventGuid);
    if(customEventInfo != undefined) {
      setCustomEventRecord(customEventInfo);
      setMessageModalTitle('Edit Message - ' + Object.assign(Array<LookupModel>(), selectedMessageType).map((el:any) => el.label).join(' , '));
      setCustomEventModalShow(true);
    }
  }
  const saveCustomEvent = (customEventName: string, customEvent: CampaignCommunicationCustomEventRequestModel, customEventCountries: Array<CampaignCustomEventCountryRequestModel>) => {
    if(customEventName.trim() !== '') {
      getAllCampaignCustomEventSettingName().then((refreshedCustomEventList) => {
        if (refreshedCustomEventList.status === HttpStatusCodeEnum.Ok) {
          dispatch(campaign.actions.getAllCampaignCustomEvent(refreshedCustomEventList.data));
          setCustomEventsOptions(refreshedCustomEventList.data);
          const resultData = refreshedCustomEventList.data as Array<LookupModel>;
          const newItem = resultData.find(i => i.label.toLowerCase() === customEventName.toLowerCase());
          if(newItem != undefined) {
            if(campaignState.campaignCommunicationCustomEventModel.some(i => i.customEventGuid === customEvent.customEventGuid)) {
              updateCustomEventList({...customEvent, campaignEventSettingId: Number(newItem.value) }, customEventCountries);
            } else {
              const newCustomEventList = [...campaignState.campaignCommunicationCustomEventModel, {...customEvent, campaignEventSettingId: Number(newItem.value) }];
              const newCustomEventCountryList = [...campaignState.campaignCustomEventCountryModel, ...customEventCountries];
              setCustomEventList(newCustomEventList);
              campaignState.campaignCommunicationCustomEventModel = newCustomEventList;
              campaignState.campaignCustomEventCountryModel = newCustomEventCountryList;
              dispatch(campaign.actions.campaign({...campaignState}));
            }
          }
        } 
      });
    } else {
      updateCustomEventList(customEvent, customEventCountries);
    }
    closeCustomEventModal();
  }

  const updateCustomEventList = (customEvent: CampaignCommunicationCustomEventRequestModel, customEventCountries: Array<CampaignCustomEventCountryRequestModel>) => {
    setCustomEventList([...customEventList, customEvent]);
    let newCustomEventList = [...campaignState.campaignCommunicationCustomEventModel.filter(i => i.customEventGuid !== customEvent.customEventGuid), customEvent];

    const customEventCountryIds = customEventCountries.map((i) => i.countryId);
    let otherCustomEventCountries = campaignState.campaignCustomEventCountryModel.filter(i => (i.campaignCommunicationCustomEventId !== null && i.campaignCommunicationCustomEventId > 0 && i.campaignCommunicationCustomEventId !== customEvent.campaignCommunicationCustomEventId) || ((i.campaignCommunicationCustomEventId == null || i.campaignCommunicationCustomEventId === 0) && i.parentCustomEventGuid !== customEvent.customEventGuid));
    const selectedCustomEventCountries = campaignState.campaignCustomEventCountryModel.filter( (i) => 
        ((i.campaignCommunicationCustomEventId !== null && i.campaignCommunicationCustomEventId > 0 && i.campaignCommunicationCustomEventId === customEvent.campaignCommunicationCustomEventId) ||
        ((i.campaignCommunicationCustomEventId == null || i.campaignCommunicationCustomEventId === 0) && i.parentCustomEventGuid === customEvent.customEventGuid)));
    const newSelectedCustomEventCountries = [
      ...selectedCustomEventCountries.filter(i => customEventCountryIds.includes(i.countryId)),
      ...customEventCountries.filter( (i) => !selectedCustomEventCountries.map(i => i.countryId).includes(i.countryId)),
    ];
    let newCustomEventCountryList = [...otherCustomEventCountries, ...newSelectedCustomEventCountries];
    

    campaignState.campaignCommunicationCustomEventModel = newCustomEventList;
    campaignState.campaignCustomEventCountryModel = newCustomEventCountryList;
    dispatch(campaign.actions.campaign({...campaignState}));
  }

  const removeCustomEvent = (value: any) => {
    swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textConfirmRemove,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
        const newCustomEventList = campaignState.campaignCommunicationCustomEventModel.filter(i => i.customEventGuid !== value.customEventGuid);
        const newCustomEventCountryList = campaignState.campaignCustomEventCountryModel.filter(i => i.parentCustomEventGuid !== value.customEventGuid);
        setCustomEventList([...newCustomEventList]);
        campaignState.campaignCommunicationCustomEventModel = [...newCustomEventList];
        campaignState.campaignCustomEventCountryModel = [...newCustomEventCountryList];
        dispatch(campaign.actions.campaign({...campaignState}));
        handlePagination(PaginationEventsEnum.FirstPage);
			}
		});
     
  }

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
    gridRef.current.api.sizeColumnsToFit();
	};

  const dataRendered = () => {
    gridRef.current.api.sizeColumnsToFit();
  }

  const handlePagination = (actionType: PaginationEventsEnum) => {
    const totalPage = Math.ceil(campaignState.campaignCommunicationCustomEventModel.length / pagination.pageSize) | 0;
    switch (actionType) {
      case PaginationEventsEnum.FirstPage:
        setPagination({...pagination, currentPage: 1 });
        setPaginatedListValue(1, pagination.pageSize);
        break;
      case PaginationEventsEnum.PrevPage:
        if(pagination.currentPage > 1) {
          setPagination({...pagination, currentPage: pagination.currentPage - 1 });
          setPaginatedListValue(pagination.currentPage - 1, pagination.pageSize);
        }
        break;
      case PaginationEventsEnum.NextPage:
        if(pagination.currentPage < totalPage) {
          setPagination({...pagination, currentPage: pagination.currentPage + 1 });
          setPaginatedListValue(pagination.currentPage + 1, pagination.pageSize);
        }
        break;
      case PaginationEventsEnum.LastPage:
        setPagination({...pagination, currentPage: totalPage });
        setPaginatedListValue(totalPage, pagination.pageSize);
        break;
      case PaginationEventsEnum.PageSize:
        const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        setPagination({...pagination, currentPage: 1, pageSize: Number(value) });
        setPaginatedListValue(1, Number(value));
        break;
      default:
        break;
    }
  }

  const setPaginatedListValue = (currentPage: number, pageSize: number) => {
    let offSetValue = (currentPage - 1) * pageSize;
    if(campaignState.campaignCommunicationCustomEventModel && campaignState.campaignCommunicationCustomEventModel.length > 0)
      setPaginatedCustomEventList(campaignState.campaignCommunicationCustomEventModel.slice(offSetValue, offSetValue + pageSize));
    else
      setPaginatedCustomEventList([]);
  }

  return (
    <>
      <div className='col-lg-12 mt-3'></div>
      
      <div className='row' >
      <FieldContainer>
          <div className='col-lg-2 mt-2'>
            <label className='form-label-sm'>Interval</label>
          </div>
          <div className='col-lg-2 mt-1'>
            <DatePicker
              dateFormat='HH:mm'
              selected={selectedCommunicationInterval}
              onChange={onChangeCommInterval}
              showTimeSelectOnly={true}
              timeCaption='time'
              className='form-control form-control-sm'
              timeFormat='HH:mm'
              placeholderText='HH:mm'
              timeIntervals={1}
              showTimeSelect
              disabled={disabledByMessageGroup()}
            />
          </div>
        </FieldContainer>
      <FieldContainer>
          <div className='col-lg-2 mt-4'>
            <label className='form-label-sm'>Message Group</label>
          </div>
          <div className='col-lg-3 mt-3'>
          <label>{messageGroupOptions.find(messageGroup => messageGroup.value === campaignState.campaignConfigurationCommunicationModel?.messageGroupId?.toString())?.label  }</label>
          </div>
        </FieldContainer>
        <FieldContainer>
				<div className='col-lg-2 mt-4'>
					<label className='form-label-sm required'>Message Type</label>
				</div>
				<div className='col-lg-4 mt-3'>
					<Select
						size='small'
            isMulti
						style={{width: '100%'}}
						options={messageTypeOptions}
						onChange={onChangeMessageType}
						value={selectedMessageType}
						isDisabled={isViewMode || campaignStatusIdState > CampaignStatusEnum.Draft}
					/>
				</div>
			</FieldContainer>
      <br />
      {campaignState.campaignConfigurationCommunicationModel.messageGroupId !== MessageGroupEnum.Call 
      && (
        <div style={{marginRight: 5}}>
							<MlabButton
								access={true}
								label='Add Message'
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
                onClick={addCustomEvent}
                disabled={isViewMode || campaignStatusIdState > CampaignStatusEnum.Draft}
							/>
						</div>
      )}
		</div>
      {campaignState.campaignConfigurationCommunicationModel.messageGroupId !== MessageGroupEnum.Call && (
        <div className='row mt-5'>
          <div className='ag-theme-quartz' style={{ height: 540, width: '100%', marginBottom: '50px' }}>
            <AgGridReact
              rowStyle={{ userSelect: 'text' }}
              rowData={paginatedCustomEventList}
              defaultColDef={{
                sortable: true,
                resizable: true,
              }}
              suppressExcelExport={true}
              rowSelection={'multiple'}
              alwaysShowHorizontalScroll={false}
              animateRows={true}
              onGridReady={onGridReady}
              rowBuffer={0}
              //enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
              pagination={false}
              paginationPageSize={pagination.pageSize}
              columnDefs={columnDefs}
              overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
              overlayLoadingTemplate={gridOverlayTemplate}
              onComponentStateChanged={dataRendered}
              ref={gridRef}
            />
            <DefaultGridPagination
								recordCount={campaignState.campaignCommunicationCustomEventModel.length}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                onClickFirst={() => handlePagination(PaginationEventsEnum.FirstPage)}
                onClickPrevious={() => handlePagination(PaginationEventsEnum.PrevPage)}
                onClickNext={() => handlePagination(PaginationEventsEnum.NextPage)}
                onClickLast={() => handlePagination(PaginationEventsEnum.LastPage)}
								onPageSizeChanged={() => handlePagination(PaginationEventsEnum.PageSize)}
								pageSizes={[10, 20, 50, 100]}
            />
          </div>
        </div>
      )}
      <CampaignCommunicationCustomEventModal 
       customEvent={customEventRecord}
       modal={customEventModalShow}
       onHide={closeCustomEventModal}
       onSubmit={saveCustomEvent}
       title={messageModalTitle}
       customEventsOptions={customEventsOptions}
      />
    </>
  )
}
