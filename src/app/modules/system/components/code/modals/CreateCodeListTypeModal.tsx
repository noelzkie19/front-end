import {HubConnection} from '@microsoft/signalr'
import {AxiosResponse} from 'axios'
import {useFormik} from 'formik'
import {Guid} from 'guid-typescript'
import React, {useEffect, useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import * as Yup from 'yup'
import {RootState} from '../../../../../../setup'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import {PROMPT_MESSAGES} from '../../../../../constants/Constants'
import useConstant from '../../../../../constants/useConstant'
import {FieldContainer, FormContainer, FormGroupContainer} from '../../../../../custom-components'
import {CodeListTypeInfoModel} from '../../../models/CodeListTypeInfoModel'
import {SelectOptionModel} from '../../../models/SelectOptionModel'
import {addCodeListType, addCodeListTypeResult} from '../../../redux/SystemService'

type ModalProps = {
  modal: boolean
  codeListTypes: Array<SelectOptionModel>
  toggle: () => void
  saveCodeListType: () => void
}

const createCodeListTypeSchema = Yup.object().shape({
  name: Yup.string(),
  status: Yup.boolean(),
})

const initialValues = {
  id: 0,
  name: '',
}

const CreateCodeListTypeModal: React.FC<ModalProps> = (props: ModalProps) => {
  // States
  const messagingHub = hubConnection.createHubConnenction()
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const [loading, setLoading] = useState(false)
  const {successResponse, HubConnected, SwalConfirmMessage} = useConstant();

  const processAddCodeListTypeReturn = (messagingHub: HubConnection, response: AxiosResponse<any>, newCodeListType: CodeListTypeInfoModel) => {
    if (response.status === successResponse) {
      messagingHub.on(newCodeListType?.queueId.toString(), (message) => {
        addCodeListTypeResult(message.cacheId).then((response) => {
          if (response.status !== successResponse) {
            swal('Failed', { icon: 'error' })
            setLoading(false)
          } else {
            formik.resetForm()
          }
          messagingHub.off(newCodeListType.queueId.toString())
          messagingHub.stop()
          props.saveCodeListType()
        })
      })
    } else {
      swal('Failed', response.data.message, 'error')
      setLoading(false)
    }
  }

  // Formik
  const formik = useFormik({
    initialValues,
    validationSchema: createCodeListTypeSchema,
    onSubmit: (values, {setSubmitting, resetForm}) => {

      if (_validateCodeListTypeModal() === true) {
        const newCodeListType: CodeListTypeInfoModel = {
          id: 0,
          codeListTypeName: values.name,
          userId: userAccessId.toString(),
          queueId: Guid.create().toString(),
        }
        setLoading(true)
        setTimeout(() => {
          messagingHub
            .start()
            .then(() => {
              if (messagingHub.state === HubConnected) {
                // Get Code List
                addCodeListType(newCodeListType).then((response) => {
                  processAddCodeListTypeReturn(messagingHub, response, newCodeListType);
                })
              } else {
                swal('Failed', 'Problem connecting to the server, Please refresh', 'error')
                setLoading(false)
              }
            })
            .catch((err) => console.log('Error while starting connection: ' + err))
            .finally(() => {
              setLoading(false)
            })
        }, 1000)
        setLoading(false)
        formik.resetForm()
        props.saveCodeListType()
      }
      setSubmitting(false)
    },
  })

  // Formik
  useEffect(() => {
    if (!props.modal) {
      formik.resetForm()
    }
  }, [props.modal])

  // Methods
  const handleClose = () => {
    swal({
      title: PROMPT_MESSAGES.ConfirmCloseTitle,
      text: PROMPT_MESSAGES.ConfirmCloseMessage,
      icon: 'warning',
      buttons: {
       
        cancel: {
          text: SwalConfirmMessage.btnNo,
          value: null,
          visible: true,
        }, confirm: {
          text: SwalConfirmMessage.btnYes,
          value: true,
          visible: true,
        },
      },
      dangerMode: true,
    }).then((willCreate) => {
      if (willCreate) {
        formik.resetForm()
        props.toggle()
      }
    })
  }
  const handleSaveChanges = () => {
    formik.submitForm()
  }

  const _validateCodeListTypeModal = () => {
    //Validate
    let isValid: boolean = true
    if (formik.values.name === '') {
      swal(
        PROMPT_MESSAGES.FailedValidationTitle,
        PROMPT_MESSAGES.FailedValidationMandatoryMessage,
        'error'
      )
      isValid = false
    }

    if (props.codeListTypes.find((i) => i.label.toLowerCase() === formik.values.name.toLowerCase()) !== undefined) {
      swal(
        PROMPT_MESSAGES.FailedValidationTitle,
        PROMPT_MESSAGES.FailedValidationDuplicateMessageCustom('Code List Type'),
        'error'
      )
      isValid = false
    }
    return isValid;
  }


  return (
    <Modal show={props.modal} size={'lg'} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Add Code List Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer onSubmit={formik.handleSubmit}>
          <FieldContainer>
            <FormGroupContainer>
              <div className='col-sm-4'>
                <label htmlFor='codelist-type' className='form-label-sm'>Code List Type Name</label>
              </div>
              <div className='col'>
                <input
                  id='codelist-type'
                  type='text'
                  className='form-control form-control-sm'
                  aria-label='Question Name'
                  {...formik.getFieldProps('name')}
                />
              </div>
            </FormGroupContainer>
          </FieldContainer>
        </FormContainer>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-start'>
        <Button disabled={formik.isSubmitting || loading} variant='primary' onClick={handleSaveChanges}>
          Submit
        </Button>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CreateCodeListTypeModal