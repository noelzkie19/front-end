import {useFormik} from 'formik'
import {useState} from 'react'
import {Button, Modal} from 'react-bootstrap'
import Select from 'react-select'
import * as Yup from 'yup'
import {FieldContainer, FormContainer, PaddedContainer} from '../../../../../custom-components'
import {ConfigurationBaseModel} from '../../../models/ConfigurationBaseModel'
import {BrandsMock} from '../../../_mocks_/BrandsMock'

type ModalProps = {
  title: string
  configInfo: ConfigurationBaseModel
  modal: boolean
  type: number
  isEditMode: boolean
  toggle: () => void
  saveConfiguration: () => void
}

interface BrandOption {
  value: string
  label: string
}

const AddEditPlayerConfigModal: React.FC<ModalProps> = (props: ModalProps) => {
  // States
  const [brand, setBrand] = useState<Array<BrandOption>>([])
  const [brandOptions, setBrandOptions] = useState<Array<any>>(
    BrandsMock.table.map((item) => {
      const option = {
        value: item.id,
        label: item.name,
      }
      return option
    })
  )

  const configValidationSchema = Yup.object().shape({
    id: Yup.number(),
    name: Yup.string(),
    code: Yup.string(),
    brand: Yup.string(),
  })

  const formik = useFormik({
    initialValues: props.configInfo,
    validationSchema: configValidationSchema,
    onSubmit: () => {},
  })

  //  Methods
  const handleBrandOnChange = (val: any) => {
    setBrand(val)
  }
  const handleClose = () => {
    props.toggle()
  }

  const handleSaveChanges = () => {
    formik.submitForm()
  }
  return (
    <Modal show={props.modal} size={'lg'} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>
          {props.isEditMode ? 'Edit' : 'Add'}
          {' ' + props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer onSubmit={formik.handleSubmit}>
          <PaddedContainer>
            <FieldContainer>
              <FieldContainer>
                <div className='col-sm-4'>
                  <label className='form-label-sm'>{props.title} Id</label>
                </div>
                <div className='col'>
                  <input
                    type='text'
                    className='form-control'
                    aria-label='Question Name'
                    {...formik.getFieldProps('id')}
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
                    className='form-control'
                    aria-label='Question Name'
                    {...formik.getFieldProps('name')}
                  />
                </div>
              </FieldContainer>
              {props.type === 2 && (
                <FieldContainer>
                  <div className='col-sm-4'>
                    <label className='form-label-sm'>{props.title} Code</label>
                  </div>
                  <div className='col'>
                    <input
                      type='text'
                      className='form-control'
                      aria-label='Code Name'
                      {...formik.getFieldProps('code')}
                    />
                  </div>
                </FieldContainer>
              )}
              <FieldContainer>
                <div className='col-sm-4'>
                  <label className='form-label-sm'>Brand</label>
                </div>
                <div className='col'>
                  <Select
                    {...formik.getFieldProps('brand')}
                    isMulti
                    options={brandOptions}
                    onChange={handleBrandOnChange}
                    value={brand}
                  />
                </div>
              </FieldContainer>
            </FieldContainer>
          </PaddedContainer>
        </FormContainer>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-start'>
        <Button disabled={formik.isSubmitting} variant='primary' onClick={handleSaveChanges}>
          Submit
        </Button>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddEditPlayerConfigModal
