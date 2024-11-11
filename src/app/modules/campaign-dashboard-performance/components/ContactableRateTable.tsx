/* eslint-disable jsx-a11y/anchor-is-valid */
import {AgGridReact} from 'ag-grid-react'
import React from 'react'
import {ContactableRateResponseModel} from '../models/response/ContactableRateResponseModel'
import { ColDef, ColGroupDef } from 'ag-grid-community';

type contactableRateReportProps = {
    title: string,
    data: Array<ContactableRateResponseModel>
}

const ContactableRateTable: React.FC<contactableRateReportProps> = (props: contactableRateReportProps) => {
    const columnDefs : (ColDef<ContactableRateResponseModel> | ColGroupDef<ContactableRateResponseModel>)[] =[
        { headerName: 'Currency', field: 'currency' },
        { headerName: 'Contactable', field: 'totalContactableCount' },
        { headerName: 'Call List Count', field: 'totalCallListCount' },
        { headerName: 'Contactable %', field: 'contactablePercentage' }
    ]

    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    }
    return (
        <div className={`card card-custom`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5 rate-table-0'>
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                </h3>
            </div>
            {/* end::Header */}
            {/* begin::Body */}
            <div className='card-body py-3 rate-table-0'>
                <div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
                        <AgGridReact
                            rowData={props.data}
                            defaultColDef={{
                                sortable: true,
                                resizable: true
                            }}
                            rowBuffer={0}
                            enableRangeSelection={true}
                            pagination={false}
                            columnDefs={columnDefs}
                            onGridReady={onGridReady}
                        />
                </div>
            </div>
            {/* begin::Body */}
        </div>
    )
}

export default ContactableRateTable
