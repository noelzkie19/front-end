import {HubConnection} from '@microsoft/signalr'
import {AxiosResponse} from 'axios'
import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import Select from 'react-select'
import swal from 'sweetalert'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {OptionListModel} from '../../../../../common/model'
import {ElementStyle, HttpStatusCodeEnum} from '../../../../../constants/Constants'
import useConstant from '../../../../../constants/useConstant'
import {FieldContainer, MlabButton, NumberTextInput, RequiredLabel, SearchTextInput} from '../../../../../custom-components'
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims'
import {UpsertPaymentMethodRequestModel} from '../../../models/UpsertPaymentMethodRequestModel'
import {ValidateCommunicationProviderRequestModel} from '../../../models/requests/ValidateCommunicationProviderRequestModel'
import {ValidatePaymentMethodNameRequestModel} from '../../../models/requests/ValidatePaymentMethodNameRequestModel'
import {PaymentMethodResponseModel} from '../../../models/response/PaymentMethodResponseModel'
import {ValidatePaymentMethodCommunicationProvider, ValidatePaymentMethodName, savePaymentMethod, savePaymentMethodResult} from '../../../redux/SystemService'
import {StatusCode} from '../../constants/PlayerConfigEnums'
import {PAYMENT_METHOD_VERIFIER, STATUS_OPTIONS} from '../../constants/SelectOptions'

type ModalProps = {
    title: string
    paymentMethodInfo: PaymentMethodResponseModel | undefined
    messageTypeOptionList?: Array<OptionListModel>
    modal: boolean
    type?: number
    isEditMode: boolean
    toggle: () => void
    handleSave: () => void
    closeModal: () => void
}

const AddEditPaymentMethodModal: React.FC<ModalProps> = (props) => {
    // States
    // States
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;

    const { SwalFailedMessage, SwalSuccessRecordMessage, SwalFeedbackMessage } = useConstant();

    const [paymentMethodId, setPaymentMethodId] = useState('')
    const [paymentMethodICoreId, setPaymentMethodICoreId] = useState('')
    const [paymentMethodName, setPaymentMethodName] = useState('')
    const [paymentMethodVerifier, setPaymentMethodVerifier] = useState<any>('');
    const [paymentMethodStatus, setPaymentMethodStatus] = useState<any>('');
    const [paymentMethodAccountMessageTypeId, setPaymentMethodAccountMessageTypeId] = useState<any>('');
    const [paymentMethodAccountProviderId, setPaymentMethodAccountProviderId] = useState('')

    const [submitting, setSubmitting] = useState<boolean>(false)

    useEffect(() => {
        handleModalChange();
    }, [props.modal, props.isEditMode, props.paymentMethodInfo, props.messageTypeOptionList]);

    const handleModalChange = () => {
        if (props.modal) {
            clearFields();
            if (props.isEditMode && props.paymentMethodInfo !== undefined) {
                handleEditMode(props.paymentMethodInfo);
            }
        }
    };

    const handleEditMode = (paymentMethodInfo: any) => {
        if (paymentMethodInfo !== undefined) {
            setPaymentMethodId(paymentMethodInfo.paymentMethodExtId != null ? paymentMethodInfo?.paymentMethodExtId.toString() : '');
            setPaymentMethodName(paymentMethodInfo?.paymentMethodExtName || '');
            setPaymentMethodICoreId(paymentMethodInfo?.iCoreId != null ? paymentMethodInfo?.iCoreId.toString() : '');
            setPaymentMethodVerifier(
                paymentMethodInfo?.verifier
                    ? PAYMENT_METHOD_VERIFIER.find((d) => d.value === Number(paymentMethodInfo?.verifier))
                    : null
            );
            setPaymentMethodStatus(
                STATUS_OPTIONS.find((d) => d.value === paymentMethodInfo?.status)
            );
            setPaymentMethodAccountProviderId(paymentMethodInfo?.providerAccount || '');
            setPaymentMethodAccountMessageTypeId(
                paymentMethodInfo?.messageTypeId
                    ? props.messageTypeOptionList?.find((d) => d.value === paymentMethodInfo?.messageTypeId?.toString())
                    : null
            );
        }
    };

    // Methods
    const clearFields = () => {
        setPaymentMethodId('')
        setPaymentMethodICoreId('')
        setPaymentMethodName('')
        setPaymentMethodVerifier(PAYMENT_METHOD_VERIFIER[0])
        setPaymentMethodStatus(STATUS_OPTIONS[0])
        setPaymentMethodAccountMessageTypeId('')
        setPaymentMethodAccountProviderId('')
    }

    const handleICoreIdChange = (event: any) => {
        setPaymentMethodICoreId(event.target.value)
    }

    const handleNameChange = (event: any) => {
        setPaymentMethodName(event.target.value)
    }


    const handleProviderIdChange = (event: any) => {
        setPaymentMethodAccountProviderId(event.target.value)
    }

    const handleClose = () => {
        confirmClose()
    }

    const handleSave = async () => {
        if (await validateRecord()) {
            swal({
                title: 'Confirmation',
                text: 'This action will save the changes made. Please confirm',
                icon: 'warning',
                buttons: ['No', 'Yes'],
                dangerMode: true,
            }).then((onFormSubmit) => {
                if (onFormSubmit) {
                    setSubmitting(true)
                    savePaymentMethodAction()
                }
            })
        }
    }

    const validateRecord = async () => {
        let isValid = true

        if (paymentMethodICoreId === undefined || paymentMethodICoreId === ''
            || paymentMethodName === undefined || paymentMethodName === ''
            || paymentMethodVerifier === null || paymentMethodStatus === null) {
            swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
            return false
        }

        if (paymentMethodName) {
            const commProviderHasNoDuplicate = await checkForPaymentMethodNameDuplicate()

            if (commProviderHasNoDuplicate === true) {
                swal(SwalFailedMessage.title, SwalFailedMessage.textPaymentMethodNameIcoreIdExists, SwalFailedMessage.icon);
                return false
            }
        }

        if (paymentMethodAccountMessageTypeId && paymentMethodAccountProviderId) {
            const commProviderHasNoDuplicate = await checkForCommunicationProviderDuplicate()

            if (commProviderHasNoDuplicate === true) {
                swal(SwalFailedMessage.title, SwalFailedMessage.textAccountIdExists, SwalFailedMessage.icon);
                return false
            }
        }

        return isValid
    }

    const checkForPaymentMethodNameDuplicate = async () => {
        let validatePaymentMethodName: ValidatePaymentMethodNameRequestModel = {
            paymentMethodExtId: props.isEditMode ? paymentMethodId : 0,
            paymentMethodName: paymentMethodName,
            iCoreId: Number(paymentMethodICoreId),
        };
        const response = await ValidatePaymentMethodName(validatePaymentMethodName);
        return response.data;
    }

    const checkForCommunicationProviderDuplicate = async () => {
        let validatePaymentMethodCommunicationProvider: ValidateCommunicationProviderRequestModel = {
            paymentMethodExtId: props.isEditMode ? paymentMethodId : 0,
            messageTypeId: paymentMethodAccountMessageTypeId.value,
            providerAccount: paymentMethodAccountProviderId,
        };
        const response = await ValidatePaymentMethodCommunicationProvider(validatePaymentMethodCommunicationProvider);
        return response.data;
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

    async function createUpsertPaymentMethodRequest() {
        const request: UpsertPaymentMethodRequestModel = {
            reqPaymentMethodId: paymentMethodId != '' ? Number(paymentMethodId) : 0,
            reqPaymentMethodICoreId: Number(paymentMethodICoreId),
            reqPaymentMethodName: paymentMethodName,
            reqPaymentMethodStatus: paymentMethodStatus.value,
            reqPaymentMethodVerifier: paymentMethodVerifier.value,
            reqPaymentMethodMessageTypeId: paymentMethodAccountMessageTypeId !== '' ? Number(paymentMethodAccountMessageTypeId?.value) : null,
            reqPaymentMethodProviderId: paymentMethodAccountProviderId,
            userId: userAccessId.toString(),
            queueId: Guid.create().toString(),
        }

        return request
    }

    const savePaymentMethodAction = () => {
        setTimeout(async () => {
            const messagingHub = hubConnection.createHubConnenction()
            const request = await createUpsertPaymentMethodRequest();
            messagingHub.start().then(() => {
                if (messagingHub.state === StatusCode.Connected) {
                    savePaymentMethod(request).then((response) => {
                        processSavePaymentMethodResult(messagingHub, response, request)
                    })
                }
            })
        }, 1000)
    }

    const processSavePaymentMethodResult = (messagingHub: HubConnection, response: AxiosResponse<any>, request: UpsertPaymentMethodRequestModel) => {
        if (response.status === StatusCode.OK) {
            messagingHub.on(request.queueId.toString(), (message) => {
                savePaymentMethodResult(message.cacheId)
                    .then((returnData) => {
                        if (returnData.status !== HttpStatusCodeEnum.Ok) {
                            swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorSavingPlayerConfig('Payment Method'), SwalFailedMessage.icon);
                        } else {
                            messagingHub.off(request.queueId.toString())
                            messagingHub.stop()
                            swal(SwalSuccessRecordMessage.title, 'The data has been submitted', SwalSuccessRecordMessage.icon);
                            setSubmitting(false)
                            props.handleSave()
                        }
                    })
                    .catch(() => {
                        swal(SwalFailedMessage.title, 'savePaymentMethod', SwalFailedMessage.icon)
                        setSubmitting(false)
                    })
            })
        } else {
            swal('Failed', response.data.message, 'error')
            setSubmitting(false)
        }
    }

    return (
        <Modal show={props.modal} onHide={handleClose} centered>
            <Modal.Header>
                <Modal.Title>
                    {props.isEditMode ? 'Edit' : 'Add'}
                    {' ' + props.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FieldContainer>
                    {props.isEditMode && (
                        
                        <div className="row m-0">
                            <RequiredLabel title='Payment Method ID' />
                            <NumberTextInput
                                ariaLabel={'Payment Method ID'}
                                min='0'
                                className={'form-control form-control-sm'}
                                disabled={props.isEditMode}
                                {...{ value: paymentMethodId }}
                            />
                        </div>
                    )}
                    <div className="row m-0">
                        <RequiredLabel title='iCore ID' />
                        <NumberTextInput
                            ariaLabel={'iCore ID'}
                            min='0'
                            className={'form-control form-control-sm'}
                            disabled={props.isEditMode || submitting}
                            {...{ value: paymentMethodICoreId, onChange: handleICoreIdChange }}
                        />
                    </div>
                    <div className="row m-0">
                        <RequiredLabel title={props.title + ' Name'} />
                        <SearchTextInput
                            ariaLabel={''}
                            disabled={submitting}
                            {...{ value: paymentMethodName, onChange: handleNameChange }} />
                    </div>
                    <div className="row m-0">
                        <RequiredLabel title='Verifier' />
                        <Select
                            size="small"
                            style={{ width: '100%' }}
                            options={PAYMENT_METHOD_VERIFIER}
                            onChange={(val: any) => setPaymentMethodVerifier(val)}
                            value={paymentMethodVerifier}
                            isClearable={true}
                        />
                    </div>
                    <div className="row m-0">
                        <RequiredLabel title='Status' />
                        <Select
                            size="small"
                            style={{ width: '100%' }}
                            options={STATUS_OPTIONS}
                            onChange={(val: any) => setPaymentMethodStatus(val)}
                            value={paymentMethodStatus}
                            isClearable={true}
                        />
                    </div>
                    <div className="row m-0">
                        <label htmlFor='message-type-field' className='col-form-label col-sm'>Communication Provider Message Type</label>
                        <Select
                            id='message-type-field'
                            size="small"
                            style={{ width: '100%' }}
                            options={props.messageTypeOptionList}
                            onChange={(val: any) => setPaymentMethodAccountMessageTypeId(val)}
                            value={paymentMethodAccountMessageTypeId}
                            isClearable={true}
                        />
                    </div>
                    <div className="row m-0">
                        <label htmlFor='account-id-field' className='col-form-label col-sm'>Communication Provider Account ID</label>
                        <SearchTextInput
                            ariaLabel={''}
                            disabled={submitting}
                            {...{ id: 'account-id-field', value: paymentMethodAccountProviderId, onChange: handleProviderIdChange }} />
                    </div>
                </FieldContainer>
            </Modal.Body>
            <Modal.Footer className='d-flex'>
                <MlabButton
                    access={userAccess.includes(USER_CLAIMS.PaymentMethodWrite)}
                    label='Submit'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    loading={submitting}
                    loadingTitle={'Please wait...'}
                    onClick={handleSave}
                    disabled={submitting}
                />
                <Button variant='secondary' className='btn btn-primary btn-sm me-2' onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddEditPaymentMethodModal

