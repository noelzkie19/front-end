import {AgGridReact} from 'ag-grid-react'
import React, {useEffect, useRef, useState} from 'react'
import {Modal} from 'react-bootstrap-v5'
import {KTSVG} from '../../../../_metronic/helpers'
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter'
import {PlayerDepositAttemptsResponseModel} from '../models'
import {GetPlayerDepositAttempts} from '../redux/AgentWorkspaceService'
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
  callListId: number
  modal: boolean
  toggle: () => void
}

const DepositAtteptsModal = ({callListId, modal, toggle}: Props) => {
  const { mlabFormatDate } = useFnsDateFormatter();
  
  const customCellDepositAttemptsRender = (params: any) => {
    const { data } = params;
    const formattedDate = mlabFormatDate(data.transactionDate);

    return <>{formattedDate}</>;
  };

  const columnDefs : (ColDef<PlayerDepositAttemptsResponseModel> | ColGroupDef<PlayerDepositAttemptsResponseModel>)[] =[
    {headerName: 'Transaction ID', field: 'transactionId', flex: 1, minWidth: 300},
    {headerName: 'Transaction Status', field: 'transactionStatusName', flex: 1},
    {headerName: 'Transaction Date', field: 'transactionDate', flex: 1, 
     cellRenderer: customCellDepositAttemptsRender
    },
    
    {headerName: 'Amount', field: 'amount', flex: 1, cellRenderer: (params: any) => (params.data.currencyCode+ ' ' + params.data.amount) },
    {headerName: 'Payment Method', field: 'paymentMethodExtName', flex: 1, minWidth: 250},
  ]
  const gridRef: any = useRef()
  const [depositAttempts, setDepositAttempts] = useState<Array<PlayerDepositAttemptsResponseModel>>([])

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit()
  }

  const getDepositAttempts = async () => {
    GetPlayerDepositAttempts(callListId)
    .then((response) => {
      if(response) {
        setDepositAttempts(response.data)
      }
    })
  }
  
  useEffect(() => {
    if(modal) {
      //get the deposit attempts
      getDepositAttempts()
    } else {
      setDepositAttempts([])
    }
  }, [modal])

  return (
    <Modal show={modal} size={'xl'} onHide={() => toggle()}>
      <Modal.Header >
        <Modal.Title>Deposit Attempts</Modal.Title>
        <div className='btn btn-icon btn-sm btn-light-primary' onClick={() => toggle()}>
            <KTSVG className='svg-icon-2' path='/media/icons/duotone/Navigation/Close.svg' />
          </div>
      </Modal.Header>
      <Modal.Body>
        <div className=' p-3'>
          <div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
            <AgGridReact
              rowData={depositAttempts}
              rowStyle={{userSelect: 'text'}}
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
              //enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
              pagination={false}
              columnDefs={columnDefs}
              ref={gridRef}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

const tableLoader = (data: any) => {
  return (
    <div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
      <i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
    </div>
  )
}

export default DepositAtteptsModal
