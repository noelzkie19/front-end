import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../../constants/Constants'
import {FieldContainer, NumberTextInput, PaddedContainer} from '../../../../../custom-components'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {CurrencyConfigResponseModel} from '../../../models/response/CurrencyConfigResponseModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {InfoDataSourceId, PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: CurrencyConfigResponseModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  toggle: () => void
  handleSave: () => void
  closeModal: () => void
}

const AddEditCurrencyModal: React.FC<ModalProps> = (props) => {
  // States
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

  const [currencyId, setCurrencyId] = useState('')
  const [iCoreId, setICoreId] = useState('')
  const [currencyName, setCurrencyName] = useState('')
  const [currencyCode, setCurrencyCode] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [configBU, setConfigBU] = useState<CurrencyConfigResponseModel | undefined>()
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Side Effects
  useEffect(() => {
    if (props.modal) {
      setCurrencyId('')
      setICoreId('')
      setCurrencyName('')
      setCurrencyCode('')
      setIsComplete(false)
      if (props.isEditMode) {
        setConfigBU(props.configInfo)
        setCurrencyId(props.configInfo?.currencyId !== undefined ? props.configInfo.currencyId.toString() : '')
        setICoreId(props.configInfo?.iCoreId != null ? props.configInfo?.iCoreId.toString() : '')
        setCurrencyName(props.configInfo?.currencyName != null ? props.configInfo.currencyName : '')
        setCurrencyCode(props.configInfo?.currencyCode !== undefined ? props.configInfo.currencyCode : '')
        setIsComplete(props.configInfo?.isComplete !== undefined ? props.configInfo.isComplete : false)
      }
    }
  }, [props.modal])

  // Methods
  const handleIdChange = (event: any) => {
    setCurrencyId(event.target.value)
  }

  const handleICoreIdChange = (event: any) => {
    setICoreId(event.target.value)
  }

  const handleNameChange = (event: any) => {
    setCurrencyName(event.target.value)
  }

  const handleCodeChange = (event: any) => {
    setCurrencyCode(event.target.value)
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
          saveCurrency()
        }
      })
    }
  }

  const validateRecord = async () => {
    let isValid = true

    if (iCoreId === undefined || iCoreId === '' || currencyCode === undefined || currencyCode === '') {
      swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      return false
    }

    if (Object.is(Number(iCoreId), NaN)) {
      swal('Failed', 'Unable to proceed. kindly input valid Currency Id', 'error')
      return false
    }

    const request: PlayerConfigValidatorRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.CurrencyTypeId,
      playerConfigurationId: currencyId != '' ? Number(currencyId) : null,
      playerConfigurationName: currencyName,
      playerConfigurationCode: props.isEditMode
        ? !Object.is(currencyCode.toUpperCase(), configBU?.currencyCode.toUpperCase())
          ? currencyCode
          : null
        : currencyCode,
      playerConfigurationICoreId: Number(iCoreId),
      playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
    }

    const hasDuplicate = await checkCodeDetailsIfExisting(request)
    if (hasDuplicate && hasDuplicate.data) {
      isValid = false
      swal(
        PROMPT_MESSAGES.FailedValidationTitle,
        `Unable to proceed, ${props.isEditMode ? '' : 'iCore ID,'} Currency Name or Currency Code already exists.`,
        'error'
      )
    }

    return isValid
  }

  const saveCurrency = () => {
    const request: UpsertPlayerConfigTypeRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.CurrencyTypeId,
      playerConfigCodeListDetailsType: [
        {
          playerConfigurationId: currencyId != '' ? Number(currencyId) : null,
          playerConfigurationCode: currencyCode,
          playerConfigurationName: currencyName,
          isComplete: iCoreId != '' && currencyName != '' && currencyCode != '' ? true : false,
          dataSourceId: InfoDataSourceId.MLab,
          status: props.isEditMode ? configBU?.status : 1,
          iCoreId: Number(iCoreId),
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
      text: 'This action will discard any changes made and return to the Currency page, please confirm',
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
              <div className='col-sm-4'>
                <label className='form-label-sm'>{props.title} Id</label>
              </div>
              <div className='col'>
                <NumberTextInput
                  ariaLabel={props.title + ' Id'}
                  className={'form-control form-control-sm'}
                  disabled={true}
                  {...{value: currencyId, onChange: handleIdChange}}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-4'>
                <label className='form-label-sm required'>iCore Id</label>
              </div>
              <div className='col'>
                <NumberTextInput
                  ariaLabel={'iCore Id'}
                  min='0'
                  className={'form-control form-control-sm'}
                  disabled={props.isEditMode}
                  {...{value: iCoreId, onChange: handleICoreIdChange}}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-4'>
                <label className='form-label-sm'>{props.title} Name</label>
              </div>
              <div className='col'>
                <input
                  type='text'
                  className='form-control form-control-sm'
                  aria-label={`${props.title} Name`}
                  value={currencyName}
                  onChange={handleNameChange}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-4'>
                <label className='form-label-sm required'>{props.title} Code</label>
              </div>
              <div className='col'>
                <input
                  type='text'
                  className='form-control form-control-sm'
                  aria-label={`${props.title} Code`}
                  value={currencyCode}
                  maxLength={4}
                  onChange={handleCodeChange}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-4'>
                <label className='form-label-sm'>Complete</label>
              </div>
              <div className='col'>
                <input
                  type='text'
                  disabled={true}
                  className='form-control form-control-sm'
                  aria-label='Complete'
                  value={props.configInfo?.isComplete === true ? 'Yes' : 'No'}
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

export default AddEditCurrencyModal
