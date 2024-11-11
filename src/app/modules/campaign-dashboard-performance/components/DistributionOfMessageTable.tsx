/* eslint-disable jsx-a11y/anchor-is-valid */
import {AgGridReact} from 'ag-grid-react'
import React from 'react'
import {DistributionOfMessagePerCurrencyResponseModel} from '../models/response/DistributionOfMessagePerCurrencyResponseModel'
import { ColDef, ColGroupDef } from 'ag-grid-community';

type distributionOfMessageReportProps = {
    title: string,
    data: Array<DistributionOfMessagePerCurrencyResponseModel>
}

const DistributionOfMessageTable: React.FC<distributionOfMessageReportProps> = (props: distributionOfMessageReportProps) => {
    const columnDefMessages : (ColDef<DistributionOfMessagePerCurrencyResponseModel> | ColGroupDef<DistributionOfMessagePerCurrencyResponseModel>)[] =[
        { headerName: 'Currency', field: 'currency' },
        { headerName: 'Contactable', field: 'totalContactableCount' },
        { headerName: 'Uncontactable', field: 'totalUncontactableCount' },
        { headerName: 'Invalid Number', field: 'totalInvalidNumberCount' }
    ]

    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    }
    
    return (
        <div className={`card card-custom`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5 message-table'>
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                </h3>
            </div>
            {/* end::Header */}
            {/* begin::Body */}
            <div className='card-body py-3 message-table'>
            <div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
                    <AgGridReact
                        rowData={props.data}
                        defaultColDef={{
                            sortable: true,
                            resizable: true
                        }}
                        onGridReady={onGridReady}
                        rowBuffer={0}
                        pagination={false}
                        columnDefs={columnDefMessages}
                        enableRangeSelection={true}
                    />
                </div>
            </div>
            {/* begin::Body */}
        </div>
    )
}

export default DistributionOfMessageTable
