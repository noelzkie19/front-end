import React from 'react'
import { Col, Row, Toast } from 'react-bootstrap-v5'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'

interface Props {
    show: boolean
    onClose: () => void
    toastHeader: string
    toastBody: JSX.Element 
}

const DismissibleToast: React.FC<Props> = ({ show, onClose, toastBody, toastHeader }) => {
    return (
        <Row>
            <Col className="mb-2">
            <Toast show={show} onClose={onClose}>
                <Toast.Header>
                    <strong className="me-auto">{toastHeader}</strong>
                </Toast.Header>
                <Toast.Body>{toastBody}</Toast.Body>
            </Toast>
            </Col>
        </Row>
    )
}

export default DismissibleToast
