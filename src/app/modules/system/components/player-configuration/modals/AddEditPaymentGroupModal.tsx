import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../../constants/Constants'
import {FieldContainer, NumberTextInput, PaddedContainer} from '../../../../../custom-components'
import {PaymentGroupResponseModel} from '../../../models'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {InfoDataSourceId, PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: PaymentGroupResponseModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  toggle: () => void
  handleSave: () => void
  closeModal: () => void
}

const AddEditPaymentGroupModal: React.FC<ModalProps> = (props) => {
  // States
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

  const [paymentGroupId, setPaymentGroupId] = useState('')
  const [paymentGroupICoreId, setPaymentGroupICoreId] = useState('')
  const [paymentGroupName, setPaymentGroupName] = useState('')
  const [configBU, setConfigBU] = useState<PaymentGroupResponseModel>()
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Side Effects
  useEffect(() => {
    if (props.modal) {
      setPaymentGroupId('')
      setPaymentGroupICoreId('')
      setPaymentGroupName('')
      if (props.isEditMode) {
        setPaymentGroupId(props.configInfo !== undefined ? (props.configInfo.id != null ? props.configInfo?.id.toString() : '') : '')
        setPaymentGroupICoreId(props.configInfo !== undefined ? (props.configInfo?.iCoreId != null ? props.configInfo?.iCoreId.toString() : '') : '')
        setPaymentGroupName(props.configInfo !== undefined ? props.configInfo.paymentGroupName : '')
        setConfigBU(props.configInfo)
      }
    }
  }, [props.modal])

  // Methods
  const handleIdChange = (event: any) => {
    setPaymentGroupId(event.target.value)
  }

  const handleICoreIdChange = (event: any) => {
    setPaymentGroupICoreId(event.target.value)
  }

  const handleNameChange = (event: any) => {
    setPaymentGroupName(event.target.value)
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
          savePaymentGroup()
        }
      })
    }
  }

  const validateRecord = async () => {
    let isValid = true

    if (paymentGroupICoreId === undefined || paymentGroupICoreId === '' || paymentGroupName === undefined || paymentGroupName === '') {
      swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      return false
    }

    if (Object.is(Number(paymentGroupICoreId), NaN)) {
      swal('Failed', 'Unable to proceed. kindly input valid Payment Group Id', 'error')
      return false
    }

    const request: PlayerConfigValidatorRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.PaymentGroupTypeId,
      playerConfigurationId: paymentGroupId != '' ? Number(paymentGroupId) : null,
      playerConfigurationName: props.isEditMode
        ? !Object.is(paymentGroupName.toUpperCase(), configBU?.paymentGroupName?.toUpperCase())
          ? paymentGroupName
          : null
        : paymentGroupName,
      playerConfigurationCode: null,
      playerConfigurationICoreId: Number(paymentGroupICoreId),
      playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
    }

    const hasDuplicate = await checkCodeDetailsIfExisting(request)
    if (hasDuplicate && hasDuplicate.data) {
      isValid = false
      swal(
        PROMPT_MESSAGES.FailedValidationTitle,
        `Unable to proceed, ${props.isEditMode ? '' : 'iCore ID or '}Payment Group Name already exists.`,
        'error'
      )
    }

    return isValid
  }

  const savePaymentGroup = () => {
    const request: UpsertPlayerConfigTypeRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.PaymentGroupTypeId,
      playerConfigCodeListDetailsType: [
        {
          playerConfigurationId: paymentGroupId ? Number(paymentGroupId) : null,
          playerConfigurationCode: '',
          playerConfigurationName: paymentGroupName,
          isComplete: false,
          dataSourceId: InfoDataSourceId.MLab,
          iCoreId: Number(paymentGroupICoreId),
        },
      ],
      userId: userAccessId.toString(),
      queueId: Guid.create().toString(),
    }

    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction()
      messagingHub.start().then(() => {
        if (messagingHub.state === StatusCode.Connected) {
          saveCodeDetailsList(request).then((response) => {
            if (response.status === StatusCode.OK) {
              messagingHub.on(request.queueId.toString(), (message) => {
                saveCodeDetailsListResult(message.cacheId)
                  .then((returnData) => {
                    if (returnData.status !== StatusCode.OK) {
                      swal('Failed', 'Error Saving Player Status Details', 'error')
                    } else {
                      messagingHub.off(request.queueId.toString())
                      messagingHub.stop()
                      swal('Successful!', 'The data has been submitted', 'success')
                      setSubmitting(false)
                      props.handleSave()
                    }
                  })
                  .catch(() => {
                    swal('Failed', 'savePlayerStatusListResult', 'error')
                    setSubmitting(false)
                  })
              })
            } else {
              swal('Failed', response.data.message, 'error')
              setSubmitting(false)
            }
          })
        }
      })
    }, 1000)
  }

  const confirmClose = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will discard any changes made and return to the Payment Group page, please confirm',
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
          {props.isEditMode ? 'Edit' : 'Add'}
          {' ' + props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <PaddedContainer>
          <FieldContainer>
            <FieldContainer>
              <div className='col-sm-5'>
                <label className='form-label-sm'>{props.title} Id</label>
              </div>
              <div className='col'>
                <NumberTextInput
                  ariaLabel={props.title + ' Id'}
                  className={'form-control form-control-sm'}
                  disabled={true}
                  {...{value: paymentGroupId, onChange: handleIdChange}}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-5'>
                <label className='form-label-sm required'>iCore Id</label>
              </div>
              <div className='col'>
                <NumberTextInput
                  ariaLabel={'iCoreId'}
                  min='0'
                  className={'form-control form-control-sm'}
                  disabled={props.isEditMode}
                  {...{value: paymentGroupICoreId, onChange: handleICoreIdChange}}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-5'>
                <label className='form-label-sm required'>{props.title} Name</label>
              </div>
              <div className='col'>
                <input
                  type='text'
                  className='form-control form-control-sm'
                  aria-label='Question Name'
                  value={paymentGroupName}
                  onChange={handleNameChange}
                />
              </div>
            </FieldContainer>
          </FieldContainer>
        </PaddedContainer>
      </Modal.Body>
      <Modal.Footer className='d-flex'>
        <Button variant='primary' className='btn btn-primary btn-sm me-2' onClick={handleSave} disabled={submitting}>
          Submit
        </Button>
        <Button variant='secondary' className='btn btn-primary btn-sm me-2' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddEditPaymentGroupModal
