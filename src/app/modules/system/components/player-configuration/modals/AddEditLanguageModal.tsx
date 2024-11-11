import {useFormik} from 'formik'
import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {ModalFooter} from 'react-bootstrap-v5'
import {shallowEqual, useDispatch, useSelector} from 'react-redux'
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
import {LanguageModel} from '../../../models/LanguageModel'
import {PlayerConfigCodeListDetailsTypeRequestModel} from '../../../models/PlayerConfigCodeListDetailsTypeRequestModel'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {InfoDataSourceId, LanguagePlayerConfig, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: LanguageModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  saveConfiguration: () => void
  rowData: Array<any>
  closeModal: () => void
  configList: Array<LanguageModel>
}

interface FormValues {
  id?: number | null
  iCoreId?: number | null
  languageName: string
  languageCode: string
  isComplete: boolean
}

const initialValues: FormValues = {
  id: null,
  iCoreId: null,
  languageName: '',
  languageCode: '',
  isComplete: false,
}

const AddEditLanguageModal: React.FC<ModalProps> = (props: ModalProps) => {
  // State
  const messagingHub = hubConnection.createHubConnenction()
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

  const dispatch = useDispatch()
  const [loading, setLoading] = useState<Boolean>(false)

  const playerConfigLanguageListState = useSelector<RootState>(({system}) => system.playerConfigLanguageList, shallowEqual) as LanguageModel[]

  // Effects
  useEffect(() => {
    if (props.isEditMode) {
      loadDetails()
    } else {
      clearData()
    }
  }, [props.modal])

  // Methods
  const clearData = () => {
    formik.setFieldValue(LanguagePlayerConfig.LanguageId, null)
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, '')
    formik.setFieldValue(LanguagePlayerConfig.LanguageName, '')
    formik.setFieldValue(LanguagePlayerConfig.LanguageCode, '')
    formik.setFieldValue(PlayerConfigCommons.IsComplete, PlayerConfigCommons.No)
  }

  const closeModalForm = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will discard any changes made and return to the Language page, please confirm',
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
    formik.setFieldValue(LanguagePlayerConfig.LanguageId, props.configInfo?.id)
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, props.configInfo?.iCoreId != null ? props.configInfo?.iCoreId : '')
    formik.setFieldValue(LanguagePlayerConfig.LanguageName, props.configInfo?.languageName != null ? props.configInfo?.languageName : '')
    formik.setFieldValue(LanguagePlayerConfig.LanguageCode, props.configInfo?.languageCode)
    formik.setFieldValue(PlayerConfigCommons.IsComplete, props.configInfo?.isComplete ? PlayerConfigCommons.Yes : PlayerConfigCommons.No)
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
      formik.setSubmitting(false)
      let isValid = true

      //New: Duplicate Validation Fixes
      const request: PlayerConfigValidatorRequestModel = {
        playerConfigurationTypeId: PlayerConfigTypes.LanguageTypeId,
        playerConfigurationId: formik.values.id,

        playerConfigurationName: props.isEditMode
          ? !Object.is(formik.values.languageName.toUpperCase(), props.configInfo?.languageName?.toUpperCase())
            ? formik.values.languageName
            : null
          : formik.values.languageName,
        playerConfigurationCode: props.isEditMode
          ? !Object.is(formik.values.languageCode.toUpperCase(), props.configInfo?.languageCode?.toUpperCase())
            ? formik.values.languageCode
            : null
          : formik.values.languageCode,
        playerConfigurationICoreId: Number(formik.values.iCoreId),
        playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
      }

      const isExisting = await checkCodeDetailsIfExisting(request)

      if (!(Number(formik.values.iCoreId) >= 0) || !formik.values.languageCode || formik.values.iCoreId?.toString() === '') {
        isValid = false
        swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      } else if (isExisting && isExisting.data) {
        const errorMessage = props.isEditMode
          ? 'Unable to proceed, Language Name or Language Code already exists.'
          : 'Unable to proceed, iCore ID, Language Name or Language Code already exists.'
        swal(PROMPT_MESSAGES.FailedValidationTitle, errorMessage, 'error')
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
            onSaveLanguageDetails(values)
          }
        })
      }
    },
  })

  const onSaveLanguageDetails = (data: any) => {
    const messagingHub = hubConnection.createHubConnenction()

    let upSertPlayerStatusList = Array<PlayerConfigCodeListDetailsTypeRequestModel>()

    const tempOption: PlayerConfigCodeListDetailsTypeRequestModel = {
      playerConfigurationId: data.id ? data.id : null,
      playerConfigurationCode: data.languageCode,
      playerConfigurationName: data.languageName,
      isComplete: data.iCoreId != undefined && data.languageName != '' ? true : false,
      
      dataSourceId: InfoDataSourceId.MLab,
      status: undefined,
      brandId: undefined,
      iCoreId: data.iCoreId,
    }

    upSertPlayerStatusList.push(tempOption)

    const request: UpsertPlayerConfigTypeRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.LanguageTypeId,
      playerConfigCodeListDetailsType: upSertPlayerStatusList,
      userId: userAccessId.toString(),
      queueId: Guid.create().toString(),
    }

    messagingHub.start().then(() => {
      if (messagingHub.state === StatusCode.Connected) {
        saveCodeDetailsList(request).then((response) => {
          formik.setSubmitting(true)
          if (response.status === StatusCode.OK) {
            messagingHub.on(request.queueId.toString(), (message) => {
              saveCodeDetailsListResult(message.cacheId)
                .then((returnData) => {
                  if (response.status !== StatusCode.OK) {
                    swal('Failed', 'Error Saving Language Details', 'error')
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
                  swal('Failed', 'saveLanguageListResult', 'error')
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
  
  return (
    <FormModal customSize={'md'} haveFooter={false} show={props.modal} headerTitle={(props.isEditMode ? 'Edit' : 'Add') + ' Language'}>
      <FormContainer onSubmit={formik.handleSubmit}>
        <MainContainer>
          <ContentContainer>
            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-4 col-sm-12'>Language Id</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <NumberTextInput
                    ariaLabel={'Language Id'}
                    className={'form-control form-control-sm'}
                    disabled={true}
                    {...formik.getFieldProps('id')}
                  />
                </div>
              </div>
            </FormGroupContainer>

            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-4 col-sm-12 required'>iCore Id</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
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
              <label className='col-form-label text-right col-lg-4 col-sm-12'>Language Name</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    className='form-control form-control-sm'
                    aria-label='Language Name'
                    {...formik.getFieldProps('languageName')}
                  />
                </div>
              </div>
            </FormGroupContainer>

            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-4 col-sm-12 required'>Language Code</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    maxLength={5}
                    className='form-control form-control-sm'
                    aria-label='Language Code'
                    required
                    {...formik.getFieldProps('languageCode')}
                  />
                </div>
              </div>
            </FormGroupContainer>

            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-4 col-sm-12'>Complete</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    className='form-control form-control-sm'
                    aria-label='Complete'
                    disabled={true}
                    {...formik.getFieldProps('isComplete')}
                  />
                </div>
              </div>
            </FormGroupContainer>
          </ContentContainer>
        </MainContainer>
        <ModalFooter style={{border: 0, float: 'right'}}>
          <DefaultPrimaryButton
            title={'Submit'}
            access={userAccess.includes(USER_CLAIMS.LanguageWrite)}
            onClick={formik.submitForm}
            isDisable={formik.isSubmitting}
          />
          <DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.LanguageRead)} title={'Close'} onClick={closeModalForm} isDisable={false} />
        </ModalFooter>
      </FormContainer>
    </FormModal>
  )
}

export default AddEditLanguageModal
