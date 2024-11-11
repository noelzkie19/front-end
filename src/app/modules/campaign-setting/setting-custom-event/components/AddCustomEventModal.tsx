import React, {useEffect, useState} from 'react'
import * as hubConnection from '../../../../../setup/hub/MessagingHub'
import swal from 'sweetalert'
import {ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../constants/Constants'
import {useSelector, shallowEqual} from 'react-redux'
import {RootState} from '../../../../../setup'
import {CustomEventModel} from '../models/CustomEventModel'
import {ModalFooter} from 'react-bootstrap-v5'
import {Guid} from 'guid-typescript'
import {
  ContentContainer,
  MainContainer,
  FormModal,
  FormGroupContainer,
  MlabButton,
} from '../../../../custom-components'
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims'
import {CustomEventFilterModel} from '../models'
import {
  addCampaignCustomEventSettingList,
  addCampaignCustomEventSettingListResult,
  validatePlayerConfigurationRecord,
} from '../services/CampaignCustomEventSettingService'

type ModalProps = {
  title: string
  configInfo: CustomEventModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  rowData: Array<any>
  closeModal: () => void
  confirmSave: () => void
}

const AddCustomEventModal: React.FC<ModalProps> = (props: ModalProps) => {
  // States
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const [loading, setLoading] = useState(false)
  const [customEventName, setCustomEventName] = useState('')
  
  // Effects
  useEffect(() => {
    if (props.modal) {
      setCustomEventName('')
    }
  }, [props.modal])

  // Methods
  const handleEventNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEventName(event.target.value)
  }

  const saveCustomEvent = async () => {
    setLoading(true)
    if (await validateRecord()) {
      const request: CustomEventModel = {
        campaignEventSettingId: 0,
        customEventName: customEventName,
        createdBy: userAccessId.toString(),
        userId: userAccessId.toString(),
        queueId: Guid.create().toString(),
      }

      setTimeout(() => {
        const messagingHub = hubConnection.createHubConnenction()
        messagingHub
          .start()
          .then(() => {
            if (messagingHub.state === 'Connected') {
              addCampaignCustomEventSettingList(request)
                .then((response) => {
                  if (response.status === HttpStatusCodeEnum.Ok) {
                    messagingHub.on(request.queueId.toString(), (message) => {
                      addCampaignCustomEventSettingListResult(message.cacheId).then(
                        (returnData) => {
                          if (returnData.status !== HttpStatusCodeEnum.Ok) {
                            swal('Failed', 'Error Saving Player Status Details', 'error')
                          } else {
                            messagingHub.off(request.queueId.toString())
                            messagingHub.stop()
                            setLoading(false)
                            swal('Successful!', 'The data has been submitted', 'success')
                            props.confirmSave()
                          }
                        }
                      )
                    })
                    setTimeout(() => {
                      if (messagingHub.state === 'Connected') {
                        messagingHub.stop()
                      }
                    }, 30000)
                  } else {
                    messagingHub.stop()
                    setLoading(false)
                  }
                })
                .catch(() => {
                  setLoading(false)
                })
            }
          })
          .catch(() => {
            messagingHub.stop()
            setLoading(false)
          })
      }, 1000)
    } else {
      setLoading(false)
    }
  }

  const validateRecord = async () => {
    let isValid = true

    //Check if not Empty / Whitespace
    if (customEventName.trim() === '') {
      swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      setLoading(false)
      isValid = false
    }

    //Check for duplicates
    let request: CustomEventFilterModel = {
      customEventName: customEventName,
      pageSize: 10,
      offsetValue: 0,
      sortColumn: 'CampaignEventSettingId',
      sortOrder: 'ASC',
      queueId: Guid.create().toString(),
      userId: userAccessId.toString(),
    }
    const response = await validatePlayerConfigurationRecord(request)
    if (response.data && response.data.status !== HttpStatusCodeEnum.Ok) {
      isValid = false
      swal(
        PROMPT_MESSAGES.FailedValidationTitle,
        'Unable to proceed. Airship Custom Event Name already exist.',
        'error'
      )
    }

    return isValid
  }

  const closeModalForm = () => {
    swal({
      title: 'Confirmation',
      text: 'Any changes will be discarded, please confirm',
      icon: 'warning',
      buttons: ['No', 'Yes'],
      dangerMode: true,
    }).then((willClose) => {
      if (willClose) {
        props.closeModal()
      }
    })
  }

  const saveModalForm = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will save the record, please confirm',
      icon: 'warning',
      buttons: ['No', 'Yes'],
      dangerMode: true,
    }).then((onFormSubmit) => {
      if (onFormSubmit) {
        saveCustomEvent();
      }
    })
  }

  return (
    <FormModal
      customSize={'lg'}
      haveFooter={false}
      show={props.modal}
      headerTitle={'Add Airship Custom Event'}
    >
      <MainContainer>
        <ContentContainer>
          <FormGroupContainer>
            <label className='col-form-label text-right col-lg-4 col-sm-12 required'>
              Airship Custom Event Name
            </label>
            <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
              <div className='input-group'>
                <input
                  type='text'
                  className='form-control form-control-sm'
                  aria-label='Airship Custom Event Name'
                  required
                  value={customEventName}
                  onChange={handleEventNameFilterChange}
                />
              </div>
            </div>
          </FormGroupContainer>
        </ContentContainer>
      </MainContainer>
      <ModalFooter style={{border: 0, float: 'right'}}>
        <MlabButton
          access={userAccess.includes(USER_CLAIMS.CustomEventSettingWrite)}
          size={'sm'}
          label={'Submit'}
          style={ElementStyle.primary}
          type={'button'}
          weight={'solid'}
          loading={loading}
          disabled={loading}
          loadingTitle={' Please wait...'}
          onClick={saveModalForm}
        />
        <MlabButton
          access={userAccess.includes(USER_CLAIMS.CustomEventSettingRead)}
          size={'sm'}
          label={'Close'}
          style={ElementStyle.secondary}
          type={'button'}
          weight={'solid'}
          loading={loading}
          disabled={loading}
          loadingTitle={' Please wait...'}
          onClick={closeModalForm}
        />
      </ModalFooter>
    </FormModal>
  )
}

export default AddCustomEventModal
