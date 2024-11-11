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
import {CountryModel} from '../../../models/CountryModel'
import {PlayerConfigCodeListDetailsTypeRequestModel} from '../../../models/PlayerConfigCodeListDetailsTypeRequestModel'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {UpsertPlayerConfigTypeRequestModel} from '../../../models/UpsertPlayerConfigTypeRequestModel'
import {checkCodeDetailsIfExisting, saveCodeDetailsList, saveCodeDetailsListResult} from '../../../redux/SystemService'
import {CountryPlayerConfig, InfoDataSourceId, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: CountryModel | undefined
  modal: boolean
  type?: number
  isEditMode: boolean
  saveConfiguration: () => void
  rowData: Array<any>
  closeModal: () => void
  configList: Array<CountryModel>
}

interface FormValues {
  countryId?: number | null
  iCoreId?: number | null
  countryName: string
  countryCode: string
  isComplete: boolean
}

const initialValues: FormValues = {
  countryId: null,
  iCoreId: null,
  countryName: '',
  countryCode: '',
  isComplete: false,
}

const AddEditCountryModal: React.FC<ModalProps> = (props: ModalProps) => {
  // States
  const messagingHub = hubConnection.createHubConnenction()
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [configBU, setConfigBU] = useState<CountryModel>()

  const playerConfigCountryListState = useSelector<RootState>(({system}) => system.playerConfigCountryList, shallowEqual) as CountryModel[]

  // Effects
  useEffect(() => {
    if (props.isEditMode) {
      loadDetails()
      setConfigBU(props.configInfo)
    } else {
      clearData()
    }
  }, [props.modal])

  // Methods
  const clearData = () => {
    formik.setFieldValue(CountryPlayerConfig.CountryId, '')
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, '')
    formik.setFieldValue(CountryPlayerConfig.CountryName, '')
    formik.setFieldValue(CountryPlayerConfig.CountryCode, '')
    formik.setFieldValue(PlayerConfigCommons.IsComplete, PlayerConfigCommons.No)
  }

  const closeModalForm = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will discard any changes made and return to the Country page, please confirm',
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
    formik.setFieldValue(CountryPlayerConfig.CountryId, props.configInfo?.countryId)
    formik.setFieldValue(PlayerConfigCommons.ICoreIdField, props.configInfo?.iCoreId != null ? props.configInfo?.iCoreId : '')
    formik.setFieldValue(CountryPlayerConfig.CountryName, props.configInfo?.countryName != null ? props.configInfo?.countryName : '')
    formik.setFieldValue(CountryPlayerConfig.CountryCode, props.configInfo?.countryCode)
    formik.setFieldValue(PlayerConfigCommons.IsComplete, props.configInfo?.isComplete ? PlayerConfigCommons.Yes : PlayerConfigCommons.No)
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
      let isValid = true
      formik.setSubmitting(false)
      // 01: Mandatory Validation
      if (!(Number(formik.values.iCoreId) >= 0) || !formik.values.countryCode || formik.values.iCoreId?.toString() === '') {
        isValid = false
        swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up all mandatory fields', 'error')
        formik.setSubmitting(false)
      } else {
        //02: Duplicate Validation
        const request: PlayerConfigValidatorRequestModel = {
          playerConfigurationTypeId: PlayerConfigTypes.CountryTypeId,
          playerConfigurationId: Number(formik.values.countryId),
          playerConfigurationName: formik.values.countryName,
          playerConfigurationCode: formik.values.countryCode,
          playerConfigurationICoreId: Number(formik.values.iCoreId),
          playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
        }
        const hasDuplicate = await checkCodeDetailsIfExisting(request)
        if (hasDuplicate && hasDuplicate.data) {
          isValid = false
          swal(
            PROMPT_MESSAGES.FailedValidationTitle,
            `Unable to proceed, ${props.isEditMode ? '' : 'iCore ID,'} Country Name or Country Code already exists.`,
            'error'
          )
          formik.setSubmitting(false)
        }
      }

      //03: Final Confirmation
      if (isValid) {
        swal({
          title: 'Confirmation',
          text: 'This action will save the changes made. Please confirm',
          icon: 'warning',
          buttons: ['No', 'Yes'],
          dangerMode: true,
        }).then((onFormSubmit) => {
          if (onFormSubmit) {
            formik.setSubmitting(true) //disable button right away
            onSaveCountryDetails(values)
          }
        })
      }
    },
  })

  const onSaveCountryDetails = (data: any) => {
    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction()
      let upSertPlayerStatusList = Array<PlayerConfigCodeListDetailsTypeRequestModel>()

      const tempOption: PlayerConfigCodeListDetailsTypeRequestModel = {
        playerConfigurationId: data.countryId != '' ? data.countryId : null,
        playerConfigurationCode: data.countryCode,
        playerConfigurationName: data.countryName,
        isComplete: data.countryId != undefined && data.countryName != '' ? true : false,
        dataSourceId: InfoDataSourceId.MLab,
        status: props.isEditMode ? configBU?.status : 1,
        brandId: undefined,
        iCoreId: Number(data.iCoreId),
      }

      upSertPlayerStatusList.push(tempOption)

      const request: UpsertPlayerConfigTypeRequestModel = {
        playerConfigurationTypeId: PlayerConfigTypes.CountryTypeId,
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
                      swal('Failed', 'Error Saving Country Details', 'error')
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
                    swal('Failed', 'saveCountryListResult', 'error')
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
    }, 1000)
  }
  return (
    <FormModal customSize={'md'} haveFooter={false} show={props.modal} headerTitle={(props.isEditMode ? 'Edit' : 'Add') + ' Country'}>
      <FormContainer onSubmit={formik.handleSubmit}>
        <MainContainer>
          <ContentContainer>
            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-4 col-sm-12'>Country Id</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <NumberTextInput
                    ariaLabel={'Country Id'}
                    className={'form-control form-control-sm'}
                    disabled={true}
                    {...formik.getFieldProps('countryId')}
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
              <label className='col-form-label text-right col-lg-4 col-sm-12'>Country Name</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    className='form-control form-control-sm'
                    aria-label='Country Name'
                    {...formik.getFieldProps('countryName')}
                  />
                </div>
              </div>
            </FormGroupContainer>

            <FormGroupContainer>
              <label className='col-form-label text-right col-lg-4 col-sm-12 required'>Country Code</label>
              <div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
                <div className='input-group'>
                  <input
                    type='text'
                    autoComplete='off'
                    maxLength={4}
                    className='form-control form-control-sm'
                    aria-label='Country Code'
                    required
                    {...formik.getFieldProps('countryCode')}
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
            access={userAccess.includes(USER_CLAIMS.CountryWrite)}
            onClick={formik.submitForm}
            isDisable={formik.isSubmitting}
          />
          <DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.CountryRead)} title={'Close'} onClick={closeModalForm} isDisable={false} />
        </ModalFooter>
      </FormContainer>
    </FormModal>
  )
}

export default AddEditCountryModal
