import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../../constants/Constants'
import {FieldContainer, NumberTextInput, PaddedContainer} from '../../../../../custom-components'
import {MarketingChannelResponseModel} from '../../../models'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {InfoDataSourceId, PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: MarketingChannelResponseModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  toggle: () => void
  handleSave: () => void
  closeModal: () => void
}

const AddEditMarketingChannelModal: React.FC<ModalProps> = (props) => {
  // States
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

  const [marketingChannelId, setMarketingChannelId] = useState('')
  const [marketingChannelICoreId, setMarketingChannelICoreId] = useState('')
  const [marketingChannelName, setMarketingChannelName] = useState('')
  const [configBU, setConfigBU] = useState<MarketingChannelResponseModel>()
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Side Effects
  useEffect(() => {
    if (props.modal) {
      setMarketingChannelId('')
      setMarketingChannelICoreId('')
      setMarketingChannelName('')
      if (props.isEditMode) {
        setMarketingChannelId(props.configInfo !== undefined ? props.configInfo.id.toString() : '')
        setMarketingChannelICoreId(
          props.configInfo !== undefined ? (props.configInfo?.iCoreId != null ? props.configInfo?.iCoreId.toString() : '') : ''
        )
        setMarketingChannelName(props.configInfo !== undefined ? props.configInfo.marketingChannelName : '')
        setConfigBU(props.configInfo)
      }
    }
  }, [props.modal])

  // Methods
  const handleIdChange = (event: any) => {
    setMarketingChannelId(event.target.value)
  }

  const handleICoreIdChange = (event: any) => {
    setMarketingChannelICoreId(event.target.value)
  }

  const handleNameChange = (event: any) => {
    setMarketingChannelName(event.target.value)
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
          saveMarketingChannel()
        }
      })
    }
  }

  const validateRecord = async () => {
    let isValid = true

    if (
      marketingChannelICoreId === undefined ||
      marketingChannelICoreId === '' ||
      marketingChannelName === undefined ||
      marketingChannelName === ''
    ) {
      swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      return false
    }

    if (Object.is(Number(marketingChannelICoreId), NaN)) {
      swal('Failed', 'Unable to proceed, kindly input valid Marketing Channel iCore Id', 'error')
      return false
    }

    const request: PlayerConfigValidatorRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.MarketingChannelTypeId,
      playerConfigurationId: marketingChannelId != '' ? Number(marketingChannelId) : null,
      playerConfigurationName: props.isEditMode
        ? !Object.is(marketingChannelName.toUpperCase(), configBU?.marketingChannelName?.toUpperCase())
          ? marketingChannelName
          : null
        : marketingChannelName,
      playerConfigurationCode: null,
      playerConfigurationICoreId: Number(marketingChannelICoreId),
      playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
    }

    const hasDuplicate = await checkCodeDetailsIfExisting(request)
    if (hasDuplicate && hasDuplicate.data) {
      isValid = false
      swal(
        PROMPT_MESSAGES.FailedValidationTitle,
        `Unable to proceed, ${props.isEditMode ? '' : 'iCore ID, or '}Marketing Channel Name already exists.`,
        'error'
      )
    }

    return isValid
  }

  const saveMarketingChannel = () => {
    const request: UpsertPlayerConfigTypeRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.MarketingChannelTypeId,
      playerConfigCodeListDetailsType: [
        {
          playerConfigurationId: marketingChannelId.toString() != '' ? Number(marketingChannelId) : null,
          playerConfigurationCode: '',
          playerConfigurationName: marketingChannelName,
          isComplete: false,
          dataSourceId: InfoDataSourceId.MLab,
          iCoreId: Number(marketingChannelICoreId),
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
      text: 'This action will discard any changes made and return to the Marketing Channel page, please confirm',
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
                  {...{value: marketingChannelId, onChange: handleIdChange}}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-sm-5'>
                <label className='form-label-sm required'>iCore Id</label>
              </div>
              <div className='col'>
                <NumberTextInput
                  ariaLabel={props.title + ' Id'}
                  min='0'
                  className={'form-control form-control-sm'}
                  disabled={props.isEditMode}
                  {...{value: marketingChannelICoreId, onChange: handleICoreIdChange}}
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
                  value={marketingChannelName}
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

export default AddEditMarketingChannelModal
