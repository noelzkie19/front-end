import {useFormik} from 'formik'
import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {ModalFooter} from 'react-bootstrap-v5'
import {shallowEqual, useSelector} from 'react-redux'
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
import {PortalModel} from '../../../models/PortalModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {InfoDataSourceId, PlayerConfigCommons, PlayerConfigTypes, PortalPlayerConfig, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title?: string
  configInfo: PortalModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  saveConfiguration: () => void
  rowData: Array<any>
  closeModal: () => void
  configList: Array<PortalModel>
}
interface FormValues {
  id?: number | null
  iCoreId?: number | null
  signUpPortalName: string
}

const initialValues: FormValues = {
  id: null,
  iCoreId: null,
  signUpPortalName: '',
}

const AddEditPortalModal: React.FC<ModalProps> = (props: ModalProps) => {
  // States
  const messagingHub = hubConnection.createHubConnenction()
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const [loading, setLoading] = useState<Boolean>(false)

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
    formik.setFieldValue(PortalPlayerConfig.PortalId, null)
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, '')
    formik.setFieldValue(PortalPlayerConfig.SignUpPortalName, '')
  }

  const closeModalForm = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will discard any changes made and return to the Portal page, please confirm',
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
    formik.setFieldValue(PortalPlayerConfig.PortalId, props.configInfo?.id)
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, props.configInfo?.iCoreId)
    formik.setFieldValue(PortalPlayerConfig.SignUpPortalName, props.configInfo?.signUpPortalName)
  }

  const onSavePortalDetails = (data: any) => {
    const messagingHub = hubConnection.createHubConnenction()
    formik.setSubmitting(true)

    let upSertPortalList = Array<PlayerConfigCodeListDetailsTypeRequestModel>()

    const tempOption: PlayerConfigCodeListDetailsTypeRequestModel = {
      playerConfigurationId: data.id != '' ? Number(data.id) : null,
      playerConfigurationCode: null,
      playerConfigurationName: data.signUpPortalName,
      isComplete: false,
      dataSourceId: InfoDataSourceId.MLab,
      status: undefined,
      brandId: undefined,
      iCoreId: Number(data.iCoreId),
    }

    upSertPortalList.push(tempOption)

    const request: UpsertPlayerConfigTypeRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.PortalTypeId,
      playerConfigCodeListDetailsType: upSertPortalList,
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
                  swal('Failed', 'savePortalListResult', 'error')
                })
            })
          } else {
            swal('Failed', response.data.message, 'error')
          }
        })
      }
    })
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
      let isValid = true
      setSubmitting(false)
      //Duplicate Validation
      const request: PlayerConfigValidatorRequestModel = {
        playerConfigurationTypeId: PlayerConfigTypes.PortalTypeId,
        playerConfigurationId: formik.values.id,
        playerConfigurationName: props.isEditMode
          ? !Object.is(formik.values.signUpPortalName.toUpperCase(), props.configInfo?.signUpPortalName?.toUpperCase())
            ? formik.values.signUpPortalName
            : null
          : formik.values.signUpPortalName,
        playerConfigurationCode: null,
        playerConfigurationICoreId: Number(formik.values.iCoreId),
        playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
      }

      const isDuplicate = await checkCodeDetailsIfExisting(request)

      if (!(Number(formik.values.iCoreId) >= 0) || !formik.values.signUpPortalName || formik.values.iCoreId?.toString() === '') {
        isValid = false
        swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up all mandatory fields', 'error')
        formik.setSubmitting(false)
      } else if (isDuplicate && isDuplicate.data) {
        const errorMessage = props.isEditMode
          ? 'Unable to proceed, Portal Name already exists.'
          : 'Unable to proceed, iCore ID or Portal Name already exists.'
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
            onSavePortalDetails(values)
          }
        })
      }
    },
  })

  return (
    <FormModal customSize={'md'} haveFooter={false} show={props.modal} headerTitle={(props.isEditMode ? 'Edit' : 'Add') + ' Portal'}>
      <FormContainer onSubmit={formik.handleSubmit}>
        <MainContainer>
          <ContentContainer>
            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-5 col-sm-12'>Portal Id</label>
              <div className='col-lg-7 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <NumberTextInput
                    ariaLabel={'Portal Id'}
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
              <label className='col-form-label text-right col-lg-5 col-sm-12 required'>Portal Name</label>
              <div className='col-lg-7 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    className='form-control form-control-sm'
                    aria-label='Portal Name'
                    {...formik.getFieldProps('signUpPortalName')}
                  />
                </div>
              </div>
            </FormGroupContainer>
          </ContentContainer>
        </MainContainer>
        <ModalFooter style={{border: 0, float: 'right'}}>
          <DefaultPrimaryButton
            title={'Submit'}
            access={userAccess.includes(USER_CLAIMS.SignUpPortalWrite)}
            onClick={formik.submitForm}
            isDisable={formik.isSubmitting}
          />
          <DefaultSecondaryButton
            access={userAccess.includes(USER_CLAIMS.SignUpPortalRead)}
            title={'Close'}
            onClick={closeModalForm}
            isDisable={false}
          />
        </ModalFooter>
      </FormContainer>
    </FormModal>
  )
}

export default AddEditPortalModal
