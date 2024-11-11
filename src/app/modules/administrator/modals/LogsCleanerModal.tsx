import { useFormik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import * as Yup from 'yup'
import swal from 'sweetalert'
import { FieldContainer, FormContainer, PaddedContainer } from '../../../custom-components'
import { PROMPT_MESSAGES } from '../../../constants/Constants'
import { useSelector, shallowEqual } from 'react-redux'
import { RootState } from '../../../../setup'
import DefaultDateRangePicker from '../../../custom-components/date-range-pickers/DefaultDateRangePicker'
import { DateRangePicker } from 'rsuite/esm/DateRangePicker'
import { DeleteQueueByDateCreatedModel } from '../models/DeleteQueueByDateCreatedModel'
import { QueueCountAffectedModel } from '../models/QueueCountAffectedModel'
import { deleteQueueByCreatedDateRange } from '../redux/AdministratorService'

type ModalProps = {
    logCleaner?: null
    modal: boolean
    toggle: () => void
    saveFilter: () => void
}

const validationParamSchema = Yup.object().shape({
    dateFrom: Yup.string(),
    dateTo: Yup.string(),
    userId: Yup.string()
})

const initialValues = {
    dateFrom: '',
    dateTo: '',
    userId: ''
}

const LogsCleanerModal: React.FC<ModalProps> = (props: ModalProps) => {

    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const [filterCreatedDateRange, setFilterCreatedDateRange] = useState<any>()
    const [filterCreatedStartDate, setfilterCreatedStartDate] = useState<any>()
    const [filterCreatedEndDate, setfilterCreatedEndDate] = useState<any>()
    const [hstoryRowCount, setHstoryRowCount] = useState<any>(0);
    const [rqstRowCount, setRqstRowCount] = useState<any>(0);

    useEffect(() => {
        if (!props.modal) {
            formik.resetForm()
            setFilterCreatedDateRange('')
            setfilterCreatedStartDate([]);
            setfilterCreatedEndDate([]);
            setHstoryRowCount(0);
            setRqstRowCount(0);
        }
    }, [props.modal])

    const handleSaveChanges = () => {
        swal({
            title: PROMPT_MESSAGES.ConfirmSubmitTitle,
            text: PROMPT_MESSAGES.ConfirmDeletionMessage,
            icon: 'warning',
            buttons: {
                confirm: {
                    text: 'YES',
                    value: true,
                    visible: true,
                },
                cancel: {
                    text: 'NO',
                    value: null,
                    visible: true,
                },
            },
            dangerMode: true,
        }).then((willCreate) => {
            if (willCreate) {
                formik.submitForm()
            }
        })
    }

    const handleClose = () => {
        swal({
            title: PROMPT_MESSAGES.ConfirmCloseTitle,
            text: PROMPT_MESSAGES.ConfirmCloseMessage,
            icon: 'warning',
            buttons: {
                confirm: {
                    text: 'YES',
                    value: true,
                    visible: true,
                },
                cancel: {
                    text: 'NO',
                    value: null,
                    visible: true,
                },
            },
            dangerMode: true,
        }).then((willCreate) => {
            if (willCreate) {
                formik.resetForm()
                props.toggle()
            }
        })
    }

    //datepicker function
    function onChangeCreatedDateRange(val: any) {
        if (val != undefined) {
            setFilterCreatedDateRange(val)
            setfilterCreatedStartDate(val[0]);
            setfilterCreatedEndDate(val[1]);
        }
    }

    function checkIfEndDateIsValid(date: Date) {
        return new Date(date.toDateString()) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const formik = useFormik({
        initialValues,
        validationSchema: validationParamSchema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
            //Validate
            let isValid: boolean = true

            if (filterCreatedDateRange === '' || filterCreatedDateRange === undefined || filterCreatedDateRange.length == 0) {
                swal(
                    PROMPT_MESSAGES.FailedValidationTitle,
                    PROMPT_MESSAGES.FailedValidationSingleMandatoryMessage,
                    'error'
                )
                setSubmitting(false)
                isValid = false
            }

            if (!(filterCreatedEndDate === '' || filterCreatedEndDate === undefined || filterCreatedEndDate.length == 0)) {
                if (!(checkIfEndDateIsValid(filterCreatedEndDate))) {
                    swal(
                        PROMPT_MESSAGES.FailedValidationTitle,
                        PROMPT_MESSAGES.FailedValidationMandatoryMessageForLogCleaner,
                        'error'
                    )
                    setSubmitting(false)
                    isValid = false
                }
            }

            if (isValid === true) {
                const deleteDateRange: DeleteQueueByDateCreatedModel = {
                    createdFrom: filterCreatedStartDate,
                    createdTo: filterCreatedEndDate,
                    userId: userAccessId.toString()
                }

                setSubmitting(false)
                resetForm({})
                setTimeout(() => {
                    deleteQueueByCreatedDateRange(deleteDateRange).then((response) => {
                        if (response.status === 200) {
                            let resultHstoryRowsCount = response.data.totalHstoryRecordCnt;
                            let resultRqstRowsCount = response.data.totalRqstRecordCnt;
                            setHstoryRowCount(resultHstoryRowsCount)
                            setRqstRowCount(resultRqstRowsCount)
                        } else {
                            swal('Failed', response.data.message, 'error')
                            // disableSplashScreen()
                        }
                    }).catch((ex) => {
                        //setLoading(false)
                    })
                }, 1000)

            }
        }
    });

    return (
        <Modal show={props.modal} size={'lg'} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>LOG CLEANER</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormContainer onSubmit={formik.handleSubmit}>
                    <PaddedContainer>
                        <FieldContainer>
                            <FieldContainer>
                                <div className='col-sm-4'>
                                    <label>Select date range:*</label>
                                </div>
                                <div className='col'>
                                    <DefaultDateRangePicker
                                        format='yyyy-MM-dd HH:mm:ss'
                                        maxDays={180}
                                        onChange={onChangeCreatedDateRange}
                                        value={filterCreatedDateRange}
                                    />
                                </div>
                            </FieldContainer>
                            <FieldContainer>
                                <div className='col-sm-4'>
                                    <label>No. of Records Deleted: </label>
                                </div>
                                <div className='col'>
                                    <label> {rqstRowCount == '' || rqstRowCount == undefined ? 0 : rqstRowCount} QRequests Rows Deleted | &nbsp;
                                        {hstoryRowCount == '' || hstoryRowCount == undefined ? 0 : hstoryRowCount} QHistory Rows Deleted</label>
                                </div>
                            </FieldContainer>
                        </FieldContainer>
                    </PaddedContainer>
                </FormContainer>
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-start'>
                <Button disabled={formik.isSubmitting} variant='primary' onClick={handleSaveChanges}>
                    Clean Now
                </Button>
                <Button variant='secondary' onClick={handleClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LogsCleanerModal
