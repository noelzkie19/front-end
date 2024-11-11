import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {AgGridReact} from 'ag-grid-react'
import {useFormik} from 'formik'
import {Guid} from 'guid-typescript'
import React, {useEffect, useState} from 'react'
import {Modal} from 'react-bootstrap'
import {shallowEqual,  useSelector} from 'react-redux'
import swal from 'sweetalert'
import * as Yup from 'yup'
import {RootState} from '../../../../../setup'
import * as hubConnection from '../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../constants/Constants'
import {DefaultSecondaryButton, SuccesLoaderButton} from '../../../../custom-components'
import DefaultDatePicker from '../../../../custom-components/date-range-pickers/DefaultDatePicker'
import {USER_CLAIMS} from '../../../../modules/user-management/components/constants/UserClaims'

//Services
import {deleteDailyReport, upsertDailyReport} from '../../../campaign-agent-monitoring/redux/AgentMonitoringService'

//Models
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import useConstant from '../../../../constants/useConstant'
import {DailyReportRequestModel} from '../../../campaign-agent-monitoring/models/request/DailyReportRequestModel'
import {DailyReportResponseModel} from '../../../campaign-agent-monitoring/models/response/DailyReportResponseModel'
import {DeleteDailyReportRequestModel} from '../../models/request/DeleteDailyReportRequestModel'
import { ColDef, ColGroupDef } from 'ag-grid-community';

type ModalProps = {
  modal: boolean
  toggle: (id: number, agentName: string) => void
  campaignAgentId: number
  campaignAgentName: string
  selectedDailyReportDetail: Array<DailyReportResponseModel>
  selectedCampaignIds: string
}

const initialValues = {
  hour: '',
  minute: '',
  second: '',
}

const dailyReportSchema = Yup.object().shape({
  hour: Yup.string(),
  minute: Yup.string(),
  second: Yup.string(),
})

const DailyReport: React.FC<ModalProps> = (props: ModalProps) => {
  //Redux
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const {HubConnected, successResponse} = useConstant()

  //States
  const [filterDate, setFilterDate] = useState<any>()
  const [filterShift, setFilterShift] = useState<any>()
  const [isLoaded, setLoaded] = useState<boolean>(false)
  const [specificAgentDetailList, setspecificAgentDetailList] = useState<Array<DailyReportResponseModel>>([])
  const [loading, setLoading] = useState(false)

  const [gridApi, setGridApi] = useState<any>()
  const [gridColumnApi, setGridColumnApi] = useState(null)

  //inputs
  const [reportHour, setReportHour] = useState<string>('')
  const [reportMinute, setReportMinute] = useState<string>('')
  const [reportSecond, setReportSecond] = useState<string>('')

  const [actionType, setActionType] = useState<string>('ADD')

  const [deleteReportDate, setDeleteReportDate] = useState<string>('')
  const [deleteShift, setDeleteShift] = useState<string>('')
  const [deleteCmsOnline, setDeleteCmsOnline] = useState<string>('')
  const [deleteReportId, setDeleteReportId] = useState<number>(0)

  const [previousCampaigAgentId, setPreviousCampaigAgentId] = useState<number>(0)
  const [forDeletionDailyReports, setForDeletionDailyReports] = useState<Array<DeleteDailyReportRequestModel>>([])
  const {SwalConfirmMessage} = useConstant();
  
  function onChangeDate(val: any) {
    if (val !== undefined && val !== null) {
      setFilterDate(val)
    }
    else{
      setFilterDate('')
    }
  }

  function onChangeShift(val: any) {
    if (val !== undefined && val !== null) {
      let shiftDate = new Date(val)
      setFilterShift(val)
    }
    else{
      setFilterShift('')
    }
  }

  useEffect(() => {
    if (props.campaignAgentId === 0) {
      onClear()
      setPreviousCampaigAgentId(props.campaignAgentId)
    }

    if (props.campaignAgentId != 0 && !isLoaded && props.campaignAgentId != previousCampaigAgentId) {
      onClear()
      setspecificAgentDetailList([])
      setForDeletionDailyReports([])
      setPreviousCampaigAgentId(props.campaignAgentId)
      loadDailyReports()
      setLoaded(true)
    }
  })

  function loadDailyReports() {
    let reports = props.selectedDailyReportDetail.filter((x) => x.campaignAgentId === props.campaignAgentId)
    setspecificAgentDetailList(reports)
  }

  const handleClose = () => {
    swal({
      title: PROMPT_MESSAGES.ConfirmCloseTitle,
      text: PROMPT_MESSAGES.ConfirmCloseMessage,
      icon: 'warning',
      buttons: {
        cancel: {
          text: SwalConfirmMessage.btnNo,
          value: null,
          visible: true,
        },confirm: {
          text: SwalConfirmMessage.btnYes,
          value: true,
          visible: true,
        },
      },
      dangerMode: true,
    }).then((onHandleClose) => {
      if (onHandleClose) {
        setLoaded(false)
        setForDeletionDailyReports([])
        props.toggle(0, '')
      }
    })
  }
  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.sizeColumnsToFit()
  }

  const onAddDailyReport = () => {
    if (
      filterDate === '' ||
      filterShift === '' ||
      reportHour === '' ||
      reportMinute === '' ||
      reportSecond === '' ||
      filterDate === 'undefined' ||
      filterShift === 'undefined'
    ) {
      swal('Failed', 'Unable to proceed. Please complete the details', 'error')
      return
    }

    let zero: number = 0
    let oneDay: number = 24
    let oneMin: number = 59

    if (parseInt(reportHour) < zero || parseInt(reportHour) > oneDay) {
      swal('Failed', 'Unable to proceed. Hour is not within range', 'error')
      return
    }

    if (parseInt(reportMinute) < zero || parseInt(reportMinute) > oneMin) {
      swal('Failed', 'Unable to proceed. Minute is not within range', 'error')
      return
    }

    if (parseInt(reportSecond) < zero || parseInt(reportSecond) > oneMin) {
      swal('Failed', 'Unable to proceed. Minute is not within range', 'error')
      return
    }

    let rDate = new Date(filterDate)

    let dMonth = rDate.getMonth() + 1
    let dDay = rDate.getDate()
    let dYear = rDate.getFullYear()
    let dailyReportDate = dMonth.toString() + '/' + dDay.toString() + '/' + dYear.toString()

    let shift = new Date(filterShift)
    let shiftDate = shift.getHours().toString() + ':' + shift.getMinutes().toString()

    let reports = Object.assign(Array<DailyReportResponseModel>(), specificAgentDetailList)

    let dateInput = Date.parse(dailyReportDate + ' ' + reportHour + ':' + reportMinute + ':' + reportSecond)

    if (isNaN(dateInput)) {
      swal('Failed', 'Unable to proceed. invalid date time inputted', 'error')
      return
    }

    let newReportDate = new Date(dailyReportDate)

    let isWithinRange: boolean = false

    reports.map((row) => {
      let currentDate = new Date(row.reportDate)
      if (currentDate.toString() === newReportDate.toString()) {
        swal('Failed', 'Unable to proceed. Date already exists', 'error')
        isWithinRange = true
        return
      }
    })
    if (isWithinRange === false) {
      const item: DailyReportResponseModel = {
        dailyReportId: 0,
        campaignAgentId: props.campaignAgentId,
        campaignID: parseInt(props.selectedCampaignIds),
        reportDate: dailyReportDate,
        shift: shiftDate,
        hour: parseInt(reportHour),
        minute: parseInt(reportMinute),
        second: parseInt(reportSecond),
        createdBy: userAccessId,
        createdDate: getCurrentDate(),
        updatedBy: 0,
        updatedDate: getCurrentDate(),
      }

      reports.push(item)
      setspecificAgentDetailList(reports)
      onClear()
    }
  }
  const onClear = () => {
    setFilterDate(null)
    setFilterShift(null)
    setReportHour('')
    setReportMinute('')
    setReportSecond('')
  }

  const onHourChanged = (val: string) => {
    if ((parseInt(val) <= 24 && parseInt(val) > 0) || val == '') {
			setReportHour(val)
		}
  }

  const onMinuteChanged = (val: string) => {
    if ((parseInt(val) <= 59 && parseInt(val) > 0) || val == '') {
      setReportMinute(val)
    }
  }
  const onSecondChanged = (val: string) => {
    if ((parseInt(val) <= 59 && parseInt(val) > 0) || val == '') {
      setReportSecond(val)
    }
  }

  const onRemove = (reportId: number, reportDate: string, shift: string, cmsOnline: string) => {
    setDeleteReportId(reportId)
    setDeleteReportDate(reportDate)
    setDeleteShift(shift)
    setDeleteCmsOnline(cmsOnline)
    setActionType('DELETE')

    swal({
      title: 'Confirmation',
      text: 'This will remove the selected record. Please confirm.',
      icon: 'warning',
      buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
      dangerMode: true,
    }).then((onRemoveSuccess) => {
      if (onRemoveSuccess) {
        let currentForDeletion = Object.assign(Array<DeleteDailyReportRequestModel>(), forDeletionDailyReports)
        let cmsBuffer = cmsOnline.split(':')

        let batchQueueId: string = Guid.create().toString()
        if (currentForDeletion.length > 0) {
          batchQueueId = currentForDeletion.find((x) => x)?.queueId!
        }

        const itemForDeletion: DeleteDailyReportRequestModel = {
          queueId: batchQueueId,
          userId: userAccessId.toString(),
          reportDate: reportDate,
          shift: shift,
          hour: parseInt(cmsBuffer[0]),
          minute: parseInt(cmsBuffer[1]),
          second: parseInt(cmsBuffer[2]),
          campaignAgentId: props.campaignAgentId,
        }
        currentForDeletion.push(itemForDeletion)
        setForDeletionDailyReports(currentForDeletion)

        let reports = Object.assign(new Array<DailyReportResponseModel>(), specificAgentDetailList)

        for (var i = 0; i <= specificAgentDetailList.length - 1; i++) {
          let item = specificAgentDetailList[i]

          if (
            item.reportDate === reportDate &&
            item.shift === shift &&
            item.hour === parseInt(cmsBuffer[0]) &&
            item.minute === parseInt(cmsBuffer[1]) &&
            item.second === parseInt(cmsBuffer[2]) &&
            item.campaignAgentId === props.campaignAgentId
          ) {
            reports.splice(i, 1)
          }
        }
        setspecificAgentDetailList(reports)
      }
    })
  }

  // Formik Form Post
  const formik = useFormik({
    initialValues,
    validationSchema: dailyReportSchema,
    onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
      setLoading(true)
      setSubmitting(true)

      setTimeout(() => {
        swal({
          title: 'Confirmation',
          text: 'This action will update the record, please confirm',
          icon: 'warning',
          buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
          dangerMode: true,
        }).then((willCreate) => {
          if (willCreate) {
            if (forDeletionDailyReports.length > 0) {
              const messagingHubForDeletion = hubConnection.createHubConnenction()

              messagingHubForDeletion
                .start()
                .then(() => {
                  if (messagingHubForDeletion.state === HubConnected) {
                    deleteDailyReport(forDeletionDailyReports)
                      .then((response) => {
                        if (response.status === successResponse) {
                          let batchQueueId: string = forDeletionDailyReports.find((x) => x)?.queueId!

                          messagingHubForDeletion.on(batchQueueId, (message) => {
                            let resultData = JSON.parse(message.remarks)
                            if (resultData.Status !== successResponse) {
                              swal('Failed', resultData.Message, 'error') 
                              setLoading(false)
                              setSubmitting(false)
                            } else {
                              setForDeletionDailyReports([])
                              swal('Successful!', 'The data has been submitted', 'success')
                              setLoading(false)
                              setSubmitting(false)
                            }

                            messagingHubForDeletion.off(batchQueueId)
                            messagingHubForDeletion.stop()
                          })

                          setTimeout(() => {
                            if (messagingHubForDeletion.state === HubConnected) {
                              messagingHubForDeletion.stop()
                              setLoading(false)
                              setSubmitting(false)
                            }
                          }, 30000)
                        } else {
                          swal('Failed', response.data.message, 'error')
                          setLoading(false)
                          setSubmitting(false)
                        }
                      })
                      .catch(() => {
                        messagingHubForDeletion.stop()
                        swal('Failed', 'Problem updating daily reports', 'error')
                        setLoading(false)
                        setSubmitting(false)
                      })
                  } else {
                    messagingHubForDeletion.stop()
                    swal('Failed', 'Problem connecting to the server, Please refresh', 'error')
                    setLoading(false)
                    setSubmitting(false)
                  }
                })
                .catch((err) => console.log('Error while starting connection: ' + err))
            }

          if(specificAgentDetailList.length > 0){
            const messagingHub = hubConnection.createHubConnenction()

            messagingHub
              .start()
              .then(() => {
                if (messagingHub.state === HubConnected) {
                  let request = new Array<DailyReportRequestModel>()
                  let batchQueueId = Guid.create().toString()
                  let batchUserId = userAccessId.toString()

                  specificAgentDetailList.map((row) => {
                    const item: DailyReportRequestModel = {
                      queueId: batchQueueId,
                      userId: batchUserId,
                      reportDate: row.reportDate,
                      shift: row.shift,
                      hour: row.hour,
                      minute: row.minute,
                      second: row.second,
                      campaignAgentId: row.campaignAgentId,
                      createdBy: userAccessId,
                      updatedBy: 0,
                      dailyReportId: row.dailyReportId === 0 ? 0 : row.dailyReportId,
                    }
                    request.push(item)
                  })

                  upsertDailyReport(request)
                    .then((response) => {
                      if (response.status === successResponse) {
                        messagingHub.on(batchQueueId, (message) => {
                          let resultData = JSON.parse(message.remarks)
                          if (resultData.Status !== successResponse) {
                            swal('Failed', resultData.Message, 'error')
                            setLoading(false)
                            setSubmitting(false)
                          } else {
                            swal('Successful!', 'The data has been submitted', 'success')
                            setLoading(false)
                            setSubmitting(false)
                          }

                          messagingHub.off(batchQueueId)
                          messagingHub.stop()
                        })

                        setTimeout(() => {
                          if (messagingHub.state === HubConnected) {
                            messagingHub.stop()
                            setLoading(false)
                            setSubmitting(false)
                          }
                        }, 30000)
                      } else {
                        swal('Failed', response.data.message, 'error')
                        setLoading(false)
                        setSubmitting(false)
                      }
                    })
                    .catch(() => {
                      messagingHub.stop()
                      swal('Failed', 'Problem updating daily reports', 'error')
                      setLoading(false)
                      setSubmitting(false)
                    })
                } else {
                  messagingHub.stop()
                  swal('Failed', 'Problem connecting to the server, Please refresh', 'error')
                  setLoading(false)
                  setSubmitting(false)
                }
              })
              .catch((err) => console.log('Error while starting connection: ' + err))
          }
          } else {
            setLoading(false)
            setSubmitting(false)
          }
        })
      }, 1000)
    },
  })

  function getCurrentDate(): string {
    let today = new Date()
    return today.toISOString()
  }

  // Table Content
  const columnDefs : (ColDef<DailyReportResponseModel> | ColGroupDef<DailyReportResponseModel>)[] = [
    {headerName: 'Date', field: 'reportDate'},
    {headerName: 'Shift', field: 'shift'},
    {
      headerName: 'CMS Time Online ',
      cellRenderer: (params: any) => <>{params ? params.data.hour + ':' + params.data.minute + ':' + params.data.second : null}</>,
    },
    {
      headerName: 'Action',
      cellRenderer: (params: any) => (
        <>
          {params ? (
            <div className='d-flex justify-content-left flex-shrink-0 mt-1'>
              {userAccess.includes(USER_CLAIMS.UpdateDailyReportWrite) === true && (
                <h2>
                  {' '}
                  <a
                    className='align-middle fw-bolder text-danger'
                    href='#'
                    title='Remove'
                    role='button'
                    onClick={() =>
                      onRemove(
                        params.data.dailyReportId,
                        params.data.reportDate,
                        params.data.shift,
                        params.data.hour + ':' + params.data.minute + ':' + params.data.second
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />{' '}
                  </a>
                </h2>
              )}
            </div>
          ) : null}
        </>
      ),
    },
  ]

  return (
    (<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>Daily Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='d-flex p-2 bd-highlight'>
          <div className='col-sm-3'>
            <span className='form-label-sm m-2 required'>Agent name </span>
          </div>
          <div className='col-sm-8'>
            <span className='form-label-sm m-2 fw-bolder '>{props.campaignAgentName}</span>
          </div>
        </div>
        <div className='d-flex p-2 bd-highlight'>
          <div className='col-sm-3'>
            <span className='form-label-sm m-2 required'>Date</span>
          </div>

          <div className='col-sm-8'>
            <DefaultDatePicker format='dd/MM/yyyy' onChange={onChangeDate} value={filterDate} placeholder="DD/mm/yyyy"/>
          </div>
        </div>
        <div className='d-flex p-2 bd-highlight'>
          <div className='col-sm-3'>
            <span className='form-label-sm m-2 required'>Shift</span>
          </div>
          <div className='col-sm-8'>
            <DefaultDatePicker format='HH:mm' onChange={onChangeShift} value={filterShift} placeholder="HH:mm" ranges={[]}/>
          </div>
        </div>
        <div className='d-flex p-2 bd-highlight'>
          <div className='col-sm-3'>
            <span className='form-label-sm m-2 required'>Hour</span>
          </div>

          <div className='col-sm-8'>
            <input
              type='number'
              className='form-control form-control-sm'
              min='0'
              max='24'
              onChange={(event) => onHourChanged(event.target.value)}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              value={reportHour}
            />
          </div>
        </div>
        <div className='d-flex p-2 bd-highlight'>
          <div className='col-sm-3'>
            <span className='form-label-sm m-2 required'>Minute</span>
          </div>

          <div className='col-sm-8'>
            <input
              type='number'
              className='form-control form-control-sm'
              min='0'
              max='59'
              onChange={(event) => onMinuteChanged(event.target.value)}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              value={reportMinute}
            />
          </div>
        </div>
        <div className='d-flex p-2 bd-highlight'>
          <div className='col-sm-3'>
            <span className='form-label-sm m-2 required'>Second</span>
          </div>

          <div className='col-sm-8'>
            <input
              type='number'
              className='form-control form-control-sm'
              min='0'
              max='59'
              onChange={(event) => onSecondChanged(event.target.value)}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              value={reportSecond}
            />
          </div>
        </div>
        {userAccess.includes(USER_CLAIMS.UpdateDailyReportWrite) === true && (
          <div className='d-flex m-3'>
            <button type='button' className='btn btn-primary btn-sm me-2' onClick={onAddDailyReport}>
              Add
            </button>
          </div>
        )}
        <div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
          <AgGridReact
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            onGridReady={onGridReady}
            rowBuffer={0}
            enableRangeSelection={true}
            pagination={true}
            paginationPageSize={10}
            columnDefs={columnDefs}
            rowData={specificAgentDetailList}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className='d-flex bd-highlights'>
          <SuccesLoaderButton onClick={formik.submitForm} title={'Submit'} loading={loading} disabled={formik.isSubmitting ||  specificAgentDetailList.length <= 0} loadingTitle={'Please wait ...'}/>
          <DefaultSecondaryButton access={true} title={'Close'} onClick={handleClose}/>
      </Modal.Footer>
    </Modal>)
  );
}
export default DailyReport
