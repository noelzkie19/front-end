import {faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useEffect, useState} from 'react'
import {right} from '@popperjs/core'
import {FieldContainer} from '../../../custom-components'
import {AgGridReact} from 'ag-grid-react'
import {RootState} from '../../../../setup'
import {useSelector, shallowEqual, useDispatch} from 'react-redux'
import {CampaignModel} from '../models/request/CampaignModel'
import {CampaignConfigurationExchangeRateModel} from '../models/request/CampaignConfigurationExchangeRateModel'
import CommonLookups from '../../../custom-functions/CommonLookups'
import * as campaign from '../redux/CampaignManagementRedux'
import { CampaignStatusEnum } from '../../../constants/Constants'
import DoublingEditor from './DoublingEditor'
import { ColDef, ColGroupDef } from 'ag-grid-community';


type CampaignConfiguration = {
  viewMode: boolean,
  currentCampaignStatus?: number
}

export const CampaignConfigurationExchangeRate = (Props : CampaignConfiguration) => {
  const dispatch = useDispatch()
  const [exchangeRateToggle, setExchangeRateToggle] = useState<boolean>(false)

  const campaignState = useSelector<RootState>(
    ({campaign}) => campaign.campaign,
    shallowEqual
  ) as CampaignModel

  const [exchangeRateList, setExchangeRateList] =
    useState<Array<CampaignConfigurationExchangeRateModel>>([])

  const campaignStatusIdState = useSelector<RootState>(({campaign}) => campaign.campaignStatusId,shallowEqual) as number

  const onClickCampaignGoal = () => {
    setExchangeRateToggle(!exchangeRateToggle)
  }
  const lookUpCurriencies = CommonLookups('currencies')
  const styleHideDetails = {
    display: 'none',
  }

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit()
    params.api.hideOverlay()
  }
  //-------------------------------------
  // USE EFFECTS
  //-------------------------------------
  useEffect(() => {
    let selectedCurrencyInCampaignInformation = Array<CampaignConfigurationExchangeRateModel>()
    let _campaignStateExchangeList = campaignState.campaignConfigurationExchangeRateModel;
    campaignState.campaignInformationCurrencyModel?.forEach((data) => {
      let exchangeRate = _campaignStateExchangeList?.find(a => a.currencyId == data.currencyId);
        const campaignConfigExchangeCurrency: CampaignConfigurationExchangeRateModel = {
          currencyName: lookUpCurriencies.find((a) => Number(a.value) == data.currencyId)?.label,
          currencyId: data.currencyId,
          exchangeRate: exchangeRate && exchangeRate?.exchangeRate !== 0  ?  exchangeRate?.exchangeRate : undefined,
          campaignConfigurationExchangeRateId: exchangeRate ? exchangeRate?.campaignConfigurationExchangeRateId : 0,
          campaignConfigurationId: exchangeRate ? exchangeRate?.campaignConfigurationId: 0,
          campaignInformationCurrencyId:exchangeRate ? exchangeRate?.campaignInformationCurrencyId : 0,
        }
        selectedCurrencyInCampaignInformation.push(campaignConfigExchangeCurrency)
    })
    setExchangeRateList(selectedCurrencyInCampaignInformation)
  }, [campaignState.campaignInformationCurrencyModel])

  useEffect(() => {
    let currencySelected = Array<CampaignConfigurationExchangeRateModel>()
    exchangeRateList?.forEach((element) => {
      const selectedCurrency: CampaignConfigurationExchangeRateModel = {
        campaignConfigurationExchangeRateId: 0,
        campaignConfigurationId: campaignState.campaignConfigurationModel?.campaignConfigurationId,
        campaignInformationCurrencyId: 0,
        currencyId: element.currencyId,
        exchangeRate:isNaN(Number(element?.exchangeRate)) ? undefined : Number(element.exchangeRate),
        currencyName: element.currencyName,
      }
      currencySelected.push(selectedCurrency)
    })
    
    campaignState.campaignConfigurationExchangeRateModel = currencySelected;
    dispatch(campaign.actions.campaign({...campaignState}))
   
  }, [exchangeRateList])

  const onChangeRate = (data : any) => {
    let currencyExchangeRate = exchangeRateList?.find(a => a.currencyId == data.data.currencyId);
    if(currencyExchangeRate){
      currencyExchangeRate.exchangeRate = data.newValue;
      const newList = exchangeRateList.filter(a => a.currencyId !== data.data.currencyId);
      setExchangeRateList([...newList ,currencyExchangeRate]);
    }
  }

  const columnDefs : (ColDef<CampaignConfigurationExchangeRateModel> | ColGroupDef<CampaignConfigurationExchangeRateModel>)[] =[
    {
      headerName: 'Currency',
      field: 'currencyName',
      maxWidth: 285,
      minWidth: 285,
      suppressSizeToFit: false,
			sort: 'asc' as 'asc',
    },
    {
      headerName: 'Rate per USD',
      field: 'exchangeRate',
      minWidth: 250,
      editable: !Props.viewMode  && !(campaignStatusIdState == CampaignStatusEnum.Completed || campaignStatusIdState == CampaignStatusEnum.Inactive),
      cellEditor: 'doublingEditor',
      onCellValueChanged: onChangeRate,
      suppressSizeToFit: false
    }
  ]

  return (
    <>
      <div className='col-lg-12 mt-3'></div>
      <div className='form-group row' style={{border: '1px solid #e9ecef'}}>
        <div className='col-lg-4 mt-3'>
          <h6>Exchange Rate</h6>
        </div>
        <div className='col-lg-8 mt-3'>
          <div
            className='btn btn-icon w-auto px-0'
            style={{float: right, marginTop: '-10px'}}
            data-kt-toggle='true'
            data-kt-toggle-state='active'
            onClick={onClickCampaignGoal}
          >
            <FontAwesomeIcon icon={exchangeRateToggle ? faMinusSquare : faPlusSquare} />
          </div>
        </div>
      </div>
      <div className='row' style={exchangeRateToggle ? {} : styleHideDetails}>
        <FieldContainer>
          <div className='col-lg-12 mt-3'></div>
          <div className='ag-theme-quartz' style={{height: '300px', width: '50%'}}>
            <AgGridReact
              onGridReady={onGridReady}
              columnDefs={columnDefs}
              defaultColDef={{
                initialWidth: 100,
                resizable: true,
              }}
              rowData={exchangeRateList}
              components={{
                doublingEditor: DoublingEditor,
              }}
            >
            </AgGridReact>
          </div>
        </FieldContainer>
      </div>
    </>
  )
}
