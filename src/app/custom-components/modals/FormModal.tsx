import React from 'react'
import { Modal } from 'react-bootstrap-v5'
import {
  ButtonsContainer,
  DangerButton,
  SuccessButton
} from '..'

interface Props {
  onHide?: () => void
	onSubmmit?: (() => void) | undefined
	haveFooter: boolean
	show: boolean
  headerTitle: string
  customSize?: any
  isDisabled?: boolean
}

const FormModal: React.FC<Props> = ({ isDisabled, headerTitle, haveFooter, onHide, onSubmmit, show, customSize, ...props }) => {
  
    return (
    <Modal
        {...props}
        show={show}
        onHide={onHide}
        size=  {customSize ?? 'lg'}
        aria-labelledby="contained-modal-title-vcenter"
        centered
    >
      
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {headerTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.children}
        </Modal.Body>

		{ haveFooter ?
				<Modal.Footer>
				<ButtonsContainer>
					{ onSubmmit ? <SuccessButton access={true} title={'Submit'} onClick={onSubmmit} isDisable={isDisabled}/> : null }
					{ onHide ?<DangerButton access={true} title={'Close'} onClick={onHide}/> : null }
				</ButtonsContainer>
				</Modal.Footer>
			: null
		}
      </Modal>
    )
}

export default FormModal
