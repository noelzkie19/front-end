import {Guid} from 'guid-typescript'
import {useEffect, useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import * as Yup from 'yup'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../../constants/Constants'
import {FieldContainer, NumberTextInput} from '../../../../../custom-components'
import {disableSplashScreen, enableSplashScreen} from '../../../../../utils/helper'
import {BrandResponseModel} from '../../../models'
import {ConfigBrandModel} from '../../../models/ConfigBrandModel'
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel'
import {RiskLevelModel} from '../../../models/RiskLevelModel'
import {checkCodeDetailsIfExisting, saveRiskLevel, saveRiskLevelResult, updateRiskLevel, updateRiskLevelResult} from '../../../redux/SystemService'
import {PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums'

type ModalProps = {
  title: string
  configInfo: RiskLevelModel | undefined
  modal: boolean
  isEditMode: boolean
  toggle: () => void
  handleSave: () => void
  rowData: Array<any>
  brandData: Array<BrandResponseModel>
  configList: Array<RiskLevelModel>
}

interface BrandOption {
  value: string
  label: string
}

const AddEditRiskLevelModal: React.FC<ModalProps> = (props: ModalProps) => {
  //  States
  const messagingHub = hubConnection.createHubConnenction()
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const [idField, setIdField] = useState('')
  const [iCoreIdField, setICoreIdField] = useState('')
  const [nameField, setNameField] = useState('')
  const [brand, setBrand] = useState<any | string>([])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const configValidationSchema = Yup.object().shape({
    id: Yup.number(),
    name: Yup.string(),
    code: Yup.string(),
    brand: Yup.string(),
  })

  //  Effects
  useEffect(() => {
    if (props.modal) {
      setIdField('')
      setICoreIdField('')
      setNameField('')
      setBrand([])
      if (props.isEditMode && props.configInfo !== undefined) {
        if (props.configInfo?.riskLevelId != null) setIdField(props.configInfo.riskLevelId?.toString())
        setICoreIdField(props.configInfo.iCoreId != null ? props.configInfo.iCoreId?.toString() : '')
        setNameField(props.configInfo.riskLevelName)
        const newBrands = props.configInfo.brands.map((item) => ({
          label: item.brandName,
          value: item.brandId,
        }))
        setBrand(newBrands)
      }
    }
  }, [props.modal])

  // Methods
  const handleClose = () => {
    alertRiskLevel()
  }

  const handleSaveChanges = async () => {
    //Validate
    let isValid: boolean = true
    if (Number.isInteger(parseInt(idField)) === false && idField !== '') {
      swal('Failed', 'Risk Level Id should be a number', 'error')
      isValid = false
      return
    }

    if (iCoreIdField === undefined || iCoreIdField === '') {
      swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      isValid = false
      return
    }

    if (nameField === undefined || nameField.toString().trim() == '') {
      swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
      isValid = false
      return
    }

    //MLAB-259: Duplicate Validation
    const request: PlayerConfigValidatorRequestModel = {
      playerConfigurationTypeId: PlayerConfigTypes.RiskLevelTypeId,
      playerConfigurationId: idField != '' ? Number(idField) : null,
      playerConfigurationName: props.isEditMode
        ? !Object.is(nameField.toUpperCase(), props.configInfo?.riskLevelName.toUpperCase())
          ? nameField
          : null
        : nameField,
      playerConfigurationCode: null,
      playerConfigurationICoreId: Number(iCoreIdField),
      playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
    }

    //New SP Validation, same implementation as other modules
    const dataDuplicate = await checkCodeDetailsIfExisting(request)

    if (dataDuplicate && dataDuplicate.data) {
      isValid = false
      const errorMessage = props.isEditMode
        ? 'Unable to proceed, Risk Level Name already exists.'
        : 'Unable to proceed, iCore ID or Risk Level Name already exists.'
      swal(PROMPT_MESSAGES.FailedValidationTitle, errorMessage, 'error')
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
          // saving starts
          setSubmitting(true)
          enableSplashScreen()
          const riskLevelRequest: RiskLevelModel = {
            riskLevelId: idField != '' ? Number(idField) : null,
            iCoreId: iCoreIdField != '' ? Number(iCoreIdField) : null,
            riskLevelName: nameField,
            brands: brand.map((i: any) => {
              let parentId = 0
              if (props.isEditMode) {
                const brandRecord = props.configInfo?.brands.find((b) => b.brandId === +i.value)
                parentId = brandRecord !== undefined ? brandRecord.riskLevelBrandId : 0
              }
              const bm: ConfigBrandModel = {
                brandId: i.value,
                brandName: i.label,
                riskLevelBrandId: parentId,
                riskLevelId: +idField,
                riskLevelName: nameField,
              }
              return bm
            }),
            userId: userAccessId.toString(),
            queueId: Guid.create().toString(),
          }

          messagingHub.start().then(() => {
            if (!props.isEditMode) {
              saveRiskLevel(riskLevelRequest).then((response) => {
                if (response.status === StatusCode.OK) {
                  messagingHub.on(riskLevelRequest.queueId.toString(), (message) => {
                    saveRiskLevelResult(message.cacheId)
                      .then((returnData) => {
                        if (returnData.status !== StatusCode.OK) {
                          swal('ERROR', 'Error Saving Risk Level Configuration', 'error')
                        } else {
                          disableSplashScreen()
                          messagingHub.off(riskLevelRequest.queueId.toString())
                          messagingHub.stop()
                          swal('Successful!', 'The data has been submitted', 'success')
                          setSubmitting(false)
                          props.handleSave()
                        }
                      })
                      .catch(() => {
                        swal('Failed', 'getRiskLevelList', 'error')
                        setSubmitting(false)
                        disableSplashScreen()
                      })
                  })
                } else {
                  swal('Failed', response.data.message, 'error')
                }
              })
            } else {
              updateRiskLevel(riskLevelRequest).then((response) => {
                if (response.status === StatusCode.OK) {
                  messagingHub.on(riskLevelRequest.queueId.toString(), (message) => {
                    updateRiskLevelResult(message.cacheId)
                      .then((returnData) => {
                        if (returnData.status !== StatusCode.OK) {
                          swal('ERROR', 'Error Updating Risk Level Configuration', 'error')
                        } else {
                          disableSplashScreen()
                          messagingHub.off(riskLevelRequest.queueId.toString())
                          messagingHub.stop()
                          swal('Successful!', 'The data has been submitted', 'success')
                          setSubmitting(false)
                          props.handleSave()
                        }
                      })
                      .catch(() => {
                        swal('Failed', 'getRiskLevelList', 'error')
                        setSubmitting(false)
                        disableSplashScreen()
                      })
                  })
                } else {
                  swal('Failed', response.data.message, 'error')
                  setSubmitting(false)
                }
              })
            }
          })

          //  saving ends
        }
      })
    }
  }

  const handleIdField = (event: any) => {
    setIdField(event.target.value)
  }

  const handleICoreIdField = (event: any) => {
    setICoreIdField(event.target.value)
  }

  const handleNameField = (event: any) => {
    setNameField(event.target.value)
  }
  const alertRiskLevel = () => {
    swal({
      title: 'Confirmation',
      text: 'This action will discard any changes made and return to the Risk Level page, please confirm',
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
        <FieldContainer>
          <FieldContainer>
            <div className='col-sm-4'>
              <label className='form-label-sm'>{props.title} Id</label>
            </div>
            <div className='col'>
              <NumberTextInput
                ariaLabel={'Id'}
                className={'form-control form-control-sm'}
                disabled={true}
                {...{value: idField, onChange: handleIdField}}
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
                {...{value: iCoreIdField, onChange: handleICoreIdField, disabled: props.isEditMode}}
              />
            </div>
          </FieldContainer>
          <FieldContainer>
            <div className='col-sm-4'>
              <label className='form-label-sm required'>{props.title} Name</label>
            </div>
            <div className='col'>
              <input type='text' className='form-control form-control-sm' aria-label='Name' value={nameField} onChange={handleNameField} />
            </div>
          </FieldContainer>
        </FieldContainer>
      </Modal.Body>
      <Modal.Footer className='d-flex'>
        <Button variant='primary' className='btn btn-primary btn-sm me-2' onClick={handleSaveChanges} disabled={submitting}>
          Submit
        </Button>
        <Button variant='secondary' className='btn btn-primary btn-sm me-2' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddEditRiskLevelModal
