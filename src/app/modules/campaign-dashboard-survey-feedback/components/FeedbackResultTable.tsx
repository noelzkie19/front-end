/* eslint-disable jsx-a11y/anchor-is-valid */
import {AgGridReact} from 'ag-grid-react'
import React from 'react'
import {FeedbackResultResponseModel} from '../models'
import { ColDef, ColGroupDef } from 'ag-grid-community';


type feedbackReportProps = {
    title: string,
    data: Array<FeedbackResultResponseModel>
}

const FeedbackResultTable: React.FC<feedbackReportProps> = (props: feedbackReportProps) => {
  const columnDefsFeedback : (ColDef<FeedbackResultResponseModel> | ColGroupDef<FeedbackResultResponseModel>)[] =[
      { headerName: 'Feedback Category', field: 'feedbackCategory', minWidth: 155 },
      { headerName: 'Feedback Answer', field: 'feedbackAnswer', minWidth: 145 },
      { headerName: 'Count', field: 'count', minWidth: 85 },
      { headerName: 'FTD', field: 'ftd', minWidth: 52 },
      { headerName: 'FTD %', field: 'ftdPercentage', minWidth: 52 },
      { headerName: 'Initial Deposit', field: 'initialDeposit', minWidth: 52 },
      { headerName: 'Initial Deposit %', field: 'initialDepositPercentage', minWidth: 52 }
  ]

  const onGridReady = (params: any) => {
      params.api.sizeColumnsToFit();
  }

  return (
    <div className={`card card-custom feedback-res`}>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
        </h3>
      </div>
      <div className='card-body py-3 feedback-res'>
      <div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
            <AgGridReact
                rowData={props.data}
                defaultColDef={{
                    sortable: true,
                    resizable: true,
                    wrapText: true,     // <-- HERE
                    autoHeight: true,   // <-- & HERE    
                }}
                components={{
                    tableLoader: tableLoader,
                }}
                rowBuffer={0}
                enableRangeSelection={true}
                pagination={false}
                columnDefs={columnDefsFeedback}
                onGridReady={onGridReady}
            />
        </div>
      </div>
    </div>
  )
}
const tableLoader = (data: any) => {
  return (
      <div
          className="ag-custom-loading-cell"
          style={{ paddingLeft: '10px', lineHeight: '25px' }}
      >
          <i className="fas fa-spinner fa-pulse"></i>{' '}
          <span> {data.loadingMessage}</span>
      </div>
  )
}

export default FeedbackResultTable
