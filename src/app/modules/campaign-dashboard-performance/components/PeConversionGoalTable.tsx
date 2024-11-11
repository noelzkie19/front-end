/* eslint-disable jsx-a11y/anchor-is-valid */
import {AgGridReact} from 'ag-grid-react'
import React from 'react'
import {PeConversionListResponseModel} from '../models/response/PeConversionListResponseModel'
import { ColDef, ColGroupDef } from 'ag-grid-community';

type perConversionGoalReportProps = {
    title: string,
    data: Array<PeConversionListResponseModel>
    isUSD: boolean
}

const PeConversionGoalTable: React.FC<perConversionGoalReportProps> = (props: perConversionGoalReportProps) => {
    const columnDefConvTables : (ColDef<PeConversionListResponseModel> | ColGroupDef<PeConversionListResponseModel>)[] =[
        { headerName: 'Currency', field: 'currency', minWidth: 155 },
        { headerName: 'Goal Reached %', field: 'goalReachedPercentage', minWidth: 145 },
        { headerName: 'Goal Reached Count', field: 'goalReachedCount', minWidth: 145 },
        { headerName: 'Call List', field: 'totalCallListCount', minWidth: 95 },
        { headerName: 'Total Goal Count', field: 'totalGoalCount', minWidth: 115 },
        { 
            headerName: 'Total Goal Amount', 
            minWidth: 115,
            comparator: (_valueA: any, _valueB: any, nodeA: any, nodeB: any, _isInverted: boolean) => {
                if(props.isUSD) {
                    if (nodeA.data.totalGoalAmountInUSD == nodeB.data.totalGoalAmountInUSD) return 0;
                    return (nodeA.data.totalGoalAmountInUSD > nodeB.data.totalGoalAmountInUSD) ? 1 : -1;
                } else {
                    if (nodeA.data.totalGoalAmount == nodeB.data.totalGoalAmount) return 0;
                    return (nodeA.data.totalGoalAmount > nodeB.data.totalGoalAmount) ? 1 : -1;
                }
            },
            cellRenderer: (params: any) => (props.isUSD ? parseFloat(params.data.totalGoalAmountInUSD).toLocaleString() : parseFloat(params.data.totalGoalAmount).toLocaleString())
        }
  
    ]

    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    }

    return (
        <div className={`card card-custom conv-tbl`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                </h3>
            </div>
            {/* end::Header */}
            {/* begin::Body */}
            <div className='card-body py-3 conv-tbl'>
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
                    enableRangeSelection={true}
                    columnDefs={columnDefConvTables}
                    />
                </div>
            </div>
            {/* begin::Body */}
        </div>
    )
}

export default PeConversionGoalTable
