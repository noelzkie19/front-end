import {AgGridReact} from 'ag-grid-react'
import React from 'react'
import {SurveyResultResponseModel} from '../models'
import { ColDef, ColGroupDef } from 'ag-grid-community';


type feedbackReportProps = {
  title: string
  data: Array<SurveyResultResponseModel>
}

const SurveyResultTable: React.FC<feedbackReportProps> = (props: feedbackReportProps) => {
  const columnDefsSurveyTbl : (ColDef<SurveyResultResponseModel> | ColGroupDef<SurveyResultResponseModel>)[] =[
    {headerName: 'Survey Answer', field: 'surveyAnswer'},
    {headerName: 'Count', field: 'count'},
    { headerName: 'FTD', field: 'ftd'},
    { headerName: 'FTD %', field: 'ftdPercentage'},
    { headerName: 'Initial Deposit', field: 'initialDeposit'},
    { headerName: 'Initial Deposit %', field: 'initialDepositPercentage'}
  ]

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit()
  }
  
  return (
    <div className={`card card-custom survey-tbl`}>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
        </h3>
      </div>
      <div className='card-body py-3 survey-tbl'>
        <div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
          <AgGridReact
            rowData={props.data}
            defaultColDef={{
              sortable: true,
              resizable: true,
              wrapText: true, 
              autoHeight: true,
            }}
            components={{
              tableLoader: tableLoader,
            }}
            onGridReady={onGridReady}
            rowBuffer={0}
            enableRangeSelection={true}
            pagination={false}
            columnDefs={columnDefsSurveyTbl}
          />
        </div>
      </div>
    </div>
  )
}

const tableLoader = (data: any) => {
  return (
    <div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
      <i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
    </div>
  )
}
export default SurveyResultTable
