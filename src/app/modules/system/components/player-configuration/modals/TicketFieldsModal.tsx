import {HubConnection} from '@microsoft/signalr'
import {AxiosResponse} from 'axios'
import {Guid} from 'guid-typescript'
import $ from "jquery"
import {useEffect, useState} from 'react'
import {Button, Modal, Row} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {OptionListModel} from '../../../../../common/model'
import {ElementStyle, HttpStatusCodeEnum} from '../../../../../constants/Constants'
import useConstant from '../../../../../constants/useConstant'
import {FieldContainer, MlabButton, SearchTextInput} from '../../../../../custom-components'
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims'
import {UpsertTicketFieldsRequestModel} from '../../../models/UpsertTicketFieldsRequestModel'
import {PaymentMethodResponseModel} from '../../../models/response/PaymentMethodResponseModel'
import {saveSelectedTicketFields, saveSelectedTicketFieldsResult} from '../../../redux/SystemService'
import {StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
    paymentMethodInfo: PaymentMethodResponseModel
    modal: boolean
    ticketFieldsList: Array<OptionListModel>
    toggle: () => void
    handleSave: () => void
    closeModal: () => void
}

const TicketFieldsModal: React.FC<ModalProps> = (props) => {
    // States
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const [selectedTicketFieldOption, setSelectedTicketFieldOption] = useState<Array<OptionListModel>>([]);
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const [loading, setLoading] = useState<boolean>(false)

    const { SwalFailedMessage, SwalSuccessRecordMessage, SwalFeedbackMessage } = useConstant();


    useEffect(() => {
       if (props.modal) {
        if (props.paymentMethodInfo) {
            setSelectedTicketFieldOption([]);
            let initTicketFields = props.paymentMethodInfo.ticketFields?.split(",")
            initTicketFields?.forEach(item => {
                let id = item.trim()
                const selectedTicketFields: OptionListModel = {
                    value: id.toString(),
                    label: props.ticketFieldsList.find(i => i.value === id)?.label ?? ''
                }
                setSelectedTicketFieldOption(prevOption => [...prevOption, selectedTicketFields]);
                $("#custom-checkbox-" + id).prop('checked', true);
            })
        }
       }
    }, [props.closeModal])
    

    const handleOnTicketFieldsChange = (e: any) => {
        const selectedField: OptionListModel = {
            value: e.target.value,
            label: e.target.name,
        };

        if (e.target.checked) {
            setSelectedTicketFieldOption([...selectedTicketFieldOption, selectedField]);
        }
        else {
            setSelectedTicketFieldOption(selectedTicketFieldOption.filter((item) => item.value !== e.target.value));
           
        }
    }

    const handleClose = () => {
        confirmClose()
    }

    const handleSave = async () => {
        swal({
            title: 'Confirmation',
            text: 'This action will save the changes made. Please confirm',
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((onFormSubmit) => {
            if (onFormSubmit) {
                saveTicketFieldsAction()
            }
        })
    }

    const saveTicketFieldsAction = () => {
        let selectedTicketFields = selectedTicketFieldOption.map((item: any) => item.value).join(',');
      
        const request: UpsertTicketFieldsRequestModel = {
            paymentMethodId: props.paymentMethodInfo.paymentMethodExtId,
            selectedTicketFields: selectedTicketFields,
            userId: userAccessId.toString(),
            queueId: Guid.create().toString(),
        }
        setLoading(true)
        setTimeout(() => {
            const messagingHub = hubConnection.createHubConnenction()
            messagingHub.start().then(() => {
                if (messagingHub.state === StatusCode.Connected) {
                    saveSelectedTicketFields(request).then((response) => {
                        processSaveSelectedTicketFieldsResult(messagingHub, response, request)
                    })
                }
            })
        }, 1000)
    }

    const processSaveSelectedTicketFieldsResult = (messagingHub: HubConnection, response: AxiosResponse<any>, request: UpsertTicketFieldsRequestModel) => {
        if (response.status === StatusCode.OK) {
            messagingHub.on(request.queueId.toString(), (message) => {
                saveSelectedTicketFieldsResult(message.cacheId)
                    .then((returnData) => {
                        if (returnData.status !== HttpStatusCodeEnum.Ok) {
                            setLoading(false)
                            swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorSavingPlayerConfig('Ticket Fields'), SwalFailedMessage.icon);
                        } else {
                            messagingHub.off(request.queueId.toString())
                            messagingHub.stop()
                            setSelectedTicketFieldOption([])
                            setLoading(false)
                            swal(SwalSuccessRecordMessage.title, 'The data has been submitted', SwalSuccessRecordMessage.icon);
                            props.handleSave()
                        }
                    })
                    .catch(() => {
                        swal(SwalFailedMessage.title, 'saveTicketFields', SwalFailedMessage.icon)
                        setLoading(false)
                    })
                setLoading(false)
            })
        } else {
            swal('Failed', response.data.message, 'error')
        }
    }

    const confirmClose = () => {
        swal({
            title: 'Confirmation',
            text: 'This action will discard any changes made and return to the Payment Method page, please confirm',
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((onFormSubmit) => {
            if (onFormSubmit) {
                props.toggle()
            }
        })
    }

    return (
        <Modal show={props.modal} onHide={handleClose} centered>
            <Modal.Header>
                <Modal.Title>
                    Ticket Fields
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FieldContainer>
                    <Row>
                        <label htmlFor='payment-method-name-label' className='col-form-label col-sm'>Payment Method Name</label>
                        <SearchTextInput
                            ariaLabel={''}
                            disabled={true}
                            {...{ id: 'payment-method-name-label', value: props.paymentMethodInfo?.paymentMethodExtName }} />
                    </Row>
                    <Row>
                        <label htmlFor='ticket-fields-contents' className='col-form-label col-sm'>Please select below the fields that will be hidden whenever the Payment Method is selected</label>
                        <div id='ticket-fields-contents' className="ag-theme-quartz" style={{ height: 400, width: '100%', overflowY: 'auto' }}>
                            <ul className="ticket-fields-list">
                                {
                                    props.ticketFieldsList.map((item: OptionListModel) => {
                                        return (
                                            <div className="form-check form-check-custom form-check-solid mt-4" key={`ticket-field-${item.value?.toString()}`}>
                                                <input
                                                    type="checkbox"
                                                    id={`custom-checkbox-${item.value}`}
                                                    name={item.label}
                                                    value={item.value.toString()}
                                                    className='form-check-input'
                                                    onChange={handleOnTicketFieldsChange}
                                                    disabled={!userAccess.includes(USER_CLAIMS.PaymentMethodWrite)}
                                                />
                                                <label className='form-check-label' htmlFor={`custom-checkbox-${item.label}`}>{item.label}</label>
                                            </div>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </Row>
                </FieldContainer>
            </Modal.Body>
            <Modal.Footer className='d-flex'>
                <MlabButton
                    access={userAccess.includes(USER_CLAIMS.PaymentMethodWrite)}
                    label='Save'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    loading={loading}
                    loadingTitle={'Please wait...'}
                    onClick={handleSave}
                    disabled={loading}
                />
                <Button variant='secondary' className='btn btn-primary btn-sm me-2' onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default TicketFieldsModal


