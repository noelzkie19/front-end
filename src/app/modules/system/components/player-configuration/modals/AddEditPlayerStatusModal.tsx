import {useFormik} from 'formik'
import {Guid} from 'guid-typescript'
import {useEffect} from 'react'
import {ModalFooter} from 'react-bootstrap-v5'
import {shallowEqual, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import swal from 'sweetalert'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../../constants/Constants'
import {
  ContentContainer,
  DefaultPrimaryButton,
  DefaultSecondaryButton,
  FormContainer,
  FormGroupContainer,
  FormModal,
  MainContainer,
  NumberTextInput,
} from '../../../../../custom-components'
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims'
import {PlayerConfigCodeListDetailsTypeRequestModel} from '../../../models/PlayerConfigCodeListDetailsTypeRequestModel'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {PlayerStatusModel} from '../../../models/PlayerStatusModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {InfoDataSourceId, PlayerConfigCommons, PlayerConfigTypes, PlayerStatusPlayerConfig, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: PlayerStatusModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  saveConfiguration: () => void
  rowData: Array<any>
  closeModal: () => void
  configList: Array<PlayerStatusModel>
}

interface FormValues {
  id?: number | null
  playerStatusName: string
  iCoreId?: number | null
}

const initialValues: FormValues = {
  id: null,
  playerStatusName: '',
  iCoreId: null,
}

const AddEditPlayerStatusModal: React.FC<ModalProps> = (props: ModalProps) => {
  //  States
  const messagingHub = hubConnection.createHubConnenction()
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const history = useHistory()

  // Effects
  useEffect(() => {
    if (props.isEditMode) {
      loadDetails()
    } else {
      clearData()
    }
  }, [props.modal])

  //  Methods
  const clearData = () => {
    formik.setFieldValue(PlayerStatusPlayerConfig.PlayerStatusId, '')
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, '')
    formik.setFieldValue(PlayerStatusPlayerConfig.PlayerStatusName, '')
  }

  const closeModalForm = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will discard any changes made and return to the Player Status page, please confirm',
      icon: 'warning',
      buttons: ['No', 'Yes'],
      dangerMode: true,
    }).then((onFormSubmit) => {
      if (onFormSubmit) {
        props.closeModal()
      }
    })
  }

  const loadDetails = () => {
    formik.setFieldValue(PlayerStatusPlayerConfig.PlayerStatusId, props.configInfo?.id)
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, props.configInfo?.iCoreId)
    formik.setFieldValue(PlayerStatusPlayerConfig.PlayerStatusName, props.configInfo?.playerStatusName)
  }

  const onSavePlayerStatusDetails = (data: any) => {
    const messagingHub = hubConnection.createHubConnenction()
    formik.setSubmitting(true)

    let upSertPlayerStatusList = Array<PlayerConfigCodeListDetailsTypeRequestModel>()

    const tempOption: PlayerConfigCodeListDetailsTypeRequestModel = {
      playerConfigurationId: data.id != '' ? Number(data.id) : null,
      playerConfigurationCode: '',
      playerConfigurationName: data.playerStatusName,
      isComplete: false,
      dataSourceId: InfoDataSourceId.MLab,
      status: undefined,
      brandId: undefined,
      iCoreId: Number(data.iCoreId),
    }

    upSertPlayerStatusList.push(tempOption)

    const request: UpsertPlayerConfigTypeRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.PlayerStatusTypeId,
      playerConfigCodeListDetailsType: upSertPlayerStatusList,
      userId: userAccessId.toString(),
      queueId: Guid.create().toString(),
    }

    messagingHub.start().then(() => {
      if (messagingHub.state === StatusCode.Connected) {
        saveCodeDetailsList(request).then((response) => {
          if (response.status === StatusCode.OK) {
            messagingHub.on(request.queueId.toString(), (message) => {
              saveCodeDetailsListResult(message.cacheId)
                .then((returnData) => {
                  if (response.status !== StatusCode.OK) {
                    swal('Failed', 'Error Saving Player Status Details', 'error')
                  } else {
                    messagingHub.off(request.queueId.toString())
                    messagingHub.stop()
                    swal('Successful!', 'The data has been submitted', 'success')
                    formik.setSubmitting(false)
                    props.closeModal()
                    props.saveConfiguration()
                  }
                })
                .catch(() => {
                  swal('Failed', 'savePlayerStatusListResult', 'error')
                  formik.setSubmitting(false)
                })
            })
          } else {
            swal('Failed', response.data.message, 'error')
            formik.setSubmitting(false)
          }
        })
      }
    })
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
      let isValid = true
      formik.setSubmitting(false)
      const errorMessage = props.isEditMode
        ? 'Unable to proceed, Player Status Name already exists.'
        : 'Unable to proceed, iCore ID or Player Status Name already exists.'

      const request: PlayerConfigValidatorRequestModel = {
        playerConfigurationTypeId: PlayerConfigTypes.PlayerStatusTypeId,
        playerConfigurationId: formik.values.id != undefined ? Number(formik.values.id) : null,
        playerConfigurationName: props.isEditMode
          ? !Object.is(formik.values.playerStatusName.toUpperCase(), props.configInfo?.playerStatusName?.toUpperCase())
            ? formik.values.playerStatusName
            : null
          : formik.values.playerStatusName,
        playerConfigurationCode: null,
        playerConfigurationICoreId: Number(formik.values.iCoreId),
        playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
      }

      const dataDuplicate = await checkCodeDetailsIfExisting(request)
      if (!(Number(formik.values.iCoreId) >= 0) || !formik.values.playerStatusName || formik.values.iCoreId?.toString() === '') {
        isValid = false

        swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error')
        formik.setSubmitting(false)
      } else if (dataDuplicate && dataDuplicate.data) {
        swal(PROMPT_MESSAGES.FailedValidationTitle, errorMessage, 'error')
        formik.setSubmitting(false)
        isValid = false
      }

      if (isValid) {
        swal({
          title: 'Confirmation',
          text: 'This action will save the changes made. Please confirm',
          icon: 'warning',
          buttons: ['No', 'Yes'],
          dangerMode: true,
        }).then((onFormSubmit) => {
          if (onFormSubmit) {
            onSavePlayerStatusDetails(values)
          }
        })
      }
    },
  })

  return (
    <FormModal customSize={'md'} haveFooter={false} show={props.modal} headerTitle={(props.isEditMode ? 'Edit' : 'Add') + ' Player Status'}>
      <FormContainer onSubmit={formik.handleSubmit}>
        <MainContainer>
          <ContentContainer>
            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-5 col-sm-12'>Player Status Id</label>
              <div className='col-lg-7 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <NumberTextInput
                    ariaLabel={'PlayerStatus Id'}
                    className={'form-control form-control-sm'}
                    disabled={true}
                    {...formik.getFieldProps('id')}
                  />
                </div>
              </div>
            </FormGroupContainer>
            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-5 col-sm-12 required'>iCore Id</label>
              <div className='col-lg-7 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <NumberTextInput
                    ariaLabel={'iCore Id'}
                    min='0'
                    className={'form-control form-control-sm'}
                    disabled={props.isEditMode}
                    {...formik.getFieldProps('iCoreId')}
                  />
                </div>
              </div>
            </FormGroupContainer>
            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-5 col-sm-12 required'>Player Status Name</label>
              <div className='col-lg-7 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    className='form-control form-control-sm'
                    aria-label='PlayerStatus Name'
                    {...formik.getFieldProps('playerStatusName')}
                  />
                </div>
              </div>
            </FormGroupContainer>
          </ContentContainer>
        </MainContainer>
        <ModalFooter style={{border: 0, float: 'right'}}>
          <DefaultPrimaryButton
            title={'Submit'}
            access={userAccess.includes(USER_CLAIMS.PlayerStatusWrite)}
            onClick={formik.submitForm}
            isDisable={formik.isSubmitting}
          />
          <DefaultSecondaryButton
            access={userAccess.includes(USER_CLAIMS.PlayerStatusRead)}
            title={'Close'}
            onClick={closeModalForm}
            isDisable={false}
          />
        </ModalFooter>
      </FormContainer>
    </FormModal>
  )
}

export default AddEditPlayerStatusModal
