/* eslint-disable jsx-a11y/anchor-is-valid */
import {AgGridReact} from 'ag-grid-react'
import React from 'react'
import {FtdPercentageResponseModel} from '../models/response/FtdPercentageResponseModel'
import { ColDef, ColGroupDef } from 'ag-grid-community';


type ftdPercentageReportProps = {
    title: string,
    data: Array<FtdPercentageResponseModel>
}

const FtdPercentageTable: React.FC<ftdPercentageReportProps> = (props: ftdPercentageReportProps) => {
    const columnDefPercentTables : (ColDef<FtdPercentageResponseModel> | ColGroupDef<FtdPercentageResponseModel>)[] = [
        { headerName: 'Currency', field: 'currency' },
        { headerName: 'FTD (Yes)', field: 'ftdYesCount' },
        { headerName: 'Call List Count', field: 'totalCallListCount' },
        { headerName: 'FTD %', field: 'ftdPercentage' }
    ]

    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    }
    
    return (
        <div className={`card card-custom perc-tbl`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                </h3>
            </div>
            {/* end::Header */}
            {/* begin::Body */}
            <div className='card-body py-3 perc-tbl'>
                <div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
                    <AgGridReact
                        rowData={props.data}
                        defaultColDef={{
                            sortable: true,
                            resizable: true
                        }}
                        onGridReady={onGridReady}
                        rowBuffer={0}
                        enableRangeSelection={true}
                        pagination={false}
                        columnDefs={columnDefPercentTables}
                    />
                </div>
            </div>
            {/* begin::Body */}
        </div>
    )
}

export default FtdPercentageTable
