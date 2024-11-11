import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faComments } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const CaseCommunicationSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {

    const [caseAndCommunicationRead, setCaseAndCommunicationRead] = useState(false);
    const [caseAndCommunicationWrite, setCaseAndCommunicationWrite] = useState(false);
    const [createCaseRead, setCreateCaseRead] = useState(false);
    const [createCaseWrite, setCreateCaseWrite] = useState(false);
    const [viewCaseRead, setViewCaseRead] = useState(false);
    const [viewCaseWrite, setViewCaseWrite] = useState(false);
    const [viewCommunicationRead, setViewCommunicationRead] = useState(false);
    const [viewCommunicationWrite, setViewCommunicationWrite] = useState(false);
    const [addCommunicationRead, setAddCommunicationRead] = useState(false);
    const [addCommunicationWrite, setAddCommunicationWrite] = useState(false);
    const [editCommunicationRead, setEditCommunicationRead] = useState(false);
    const [editCommunicationWrite, setEditCommunicationWrite] = useState(false);

    let caseAndCommunicationClaimRead = document.getElementById('caseAndCommunicationClaimRead') as HTMLInputElement;
    let caseAndCommunicationClaimWrite = document.getElementById('caseAndCommunicationClaimWrite') as HTMLInputElement;
    let createCaseClaimRead = document.getElementById('createCaseClaimRead') as HTMLInputElement;
    let createCaseClaimWrite = document.getElementById('createCaseClaimWrite') as HTMLInputElement;
    let viewCaseClaimRead = document.getElementById('viewCaseClaimRead') as HTMLInputElement;
    let viewCaseClaimWrite = document.getElementById('viewCaseClaimWrite') as HTMLInputElement;
    let addCommunicationClaimRead = document.getElementById('addCommunicationClaimRead') as HTMLInputElement;
    let addCommunicationClaimWrite = document.getElementById('addCommunicationClaimWrite') as HTMLInputElement;
    let viewCommunicationClaimRead = document.getElementById('viewCommunicationClaimRead') as HTMLInputElement;
    let viewCommunicationClaimWrite = document.getElementById('viewCommunicationClaimWrite') as HTMLInputElement;
    let editCommunicationClaimRead = document.getElementById('editCommunicationClaimRead') as HTMLInputElement;
    let editCommunicationClaimWrite = document.getElementById('editCommunicationClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return
        let caseCommClaims = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.CaseAndCommunication);

        if (!caseCommClaims) return
        let { read, write, subMainModuleDetails }: any = caseCommClaims;
        caseAndCommunicationClaimRead.checked = read
        setCaseAndCommunicationRead(read)
        caseAndCommunicationClaimWrite.checked = write
        setCaseAndCommunicationWrite(write)

        if (!subMainModuleDetails) return
        createCaseClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateCase)?.read!;
        createCaseClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateCase)?.write!;
        viewCaseClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCase)?.read!;
        viewCaseClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCase)?.write!;
        addCommunicationClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.AddCommunication)?.read!;
        addCommunicationClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.AddCommunication)?.write!;
        viewCommunicationClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCommunication)?.read!;
        viewCommunicationClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCommunication)?.write!;
        editCommunicationClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.EditCommunication)?.read!;
        editCommunicationClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.EditCommunication)?.write!;

        changeCaseAndCommunicationStatus();
        return () => { }
    }, [SecurableObjects])

    function changeCaseAndCommunicationStatus() {
        if (caseAndCommunicationClaimRead.checked === true && caseAndCommunicationClaimWrite.checked === true) {
            addCommunicationClaimRead.disabled = false;
            addCommunicationClaimWrite.disabled = false;
            createCaseClaimRead.disabled = false;
            createCaseClaimWrite.disabled = false;
            editCommunicationClaimRead.disabled = false;
            editCommunicationClaimWrite.disabled = false;
            viewCommunicationClaimRead.disabled = false;
            viewCommunicationClaimWrite.disabled = false;
            viewCaseClaimRead.disabled = false;
            viewCaseClaimWrite.disabled = false;

            setCreateCaseRead(false);
            setCreateCaseWrite(false);
            setViewCaseRead(false);
            setViewCaseWrite(false);
            setAddCommunicationRead(false);
            setAddCommunicationWrite(false);
            setViewCommunicationRead(false);
            setViewCommunicationWrite(false);
            setEditCommunicationRead(false);
            setEditCommunicationWrite(false);
        } else if (caseAndCommunicationClaimRead.checked === true && caseAndCommunicationClaimWrite.checked === false) {
            createCaseClaimRead.disabled = false;
            createCaseClaimWrite.disabled = true;
            viewCaseClaimRead.disabled = false;
            viewCaseClaimWrite.disabled = true;
            addCommunicationClaimRead.disabled = false;
            addCommunicationClaimWrite.disabled = true;
            viewCommunicationClaimRead.disabled = false;
            viewCommunicationClaimWrite.disabled = true;
            editCommunicationClaimRead.disabled = false;
            editCommunicationClaimWrite.disabled = true;
            createCaseClaimWrite.checked = false;
            viewCaseClaimWrite.checked = false;
            addCommunicationClaimWrite.checked = false;
            viewCommunicationClaimWrite.checked = false;
            editCommunicationClaimWrite.checked = false;

            setCreateCaseWrite(false);
            setViewCaseWrite(false);
            setAddCommunicationWrite(false);
            setViewCommunicationWrite(false);
            setEditCommunicationWrite(false);
        } else if (caseAndCommunicationClaimRead.checked === false && caseAndCommunicationClaimWrite.checked === true) {
            addCommunicationClaimRead.disabled = false;
            addCommunicationClaimWrite.disabled = false;
            createCaseClaimRead.disabled = false;
            createCaseClaimWrite.disabled = false;
            viewCaseClaimRead.disabled = false;
            viewCaseClaimWrite.disabled = false;
            viewCommunicationClaimRead.disabled = false;
            viewCommunicationClaimWrite.disabled = false;
            editCommunicationClaimRead.disabled = false;
            editCommunicationClaimWrite.disabled = false;

            setCreateCaseRead(false);
            setCreateCaseWrite(false);
            setViewCaseRead(false);
            setViewCaseWrite(false);
            setAddCommunicationRead(false);
            setAddCommunicationWrite(false);
            setViewCommunicationRead(false);
            setViewCommunicationWrite(false);
            setEditCommunicationRead(false);
            setEditCommunicationWrite(false);
        } else if (caseAndCommunicationClaimRead.checked === false && caseAndCommunicationClaimWrite.checked === false) {
            createCaseClaimRead.disabled = true;
            createCaseClaimWrite.disabled = true;
            viewCaseClaimRead.disabled = true;
            viewCaseClaimWrite.disabled = true;
            addCommunicationClaimRead.disabled = true;
            addCommunicationClaimWrite.disabled = true;
            viewCommunicationClaimRead.disabled = true;
            viewCommunicationClaimWrite.disabled = true;
            editCommunicationClaimRead.disabled = true;
            editCommunicationClaimWrite.disabled = true;
            createCaseClaimRead.checked = false;
            createCaseClaimWrite.checked = false;
            viewCaseClaimRead.checked = false;
            viewCaseClaimWrite.checked = false;
            addCommunicationClaimRead.checked = false;
            addCommunicationClaimWrite.checked = false;
            viewCommunicationClaimRead.checked = false;
            viewCommunicationClaimWrite.checked = false;
            editCommunicationClaimRead.checked = false;
            editCommunicationClaimWrite.checked = false;

            setCreateCaseRead(false);
            setCreateCaseWrite(false);
            setViewCaseRead(false);
            setViewCaseWrite(false);
            setAddCommunicationRead(false);
            setAddCommunicationWrite(false);
            setViewCommunicationRead(false);
            setViewCommunicationWrite(false);
            setEditCommunicationRead(false);
            setEditCommunicationWrite(false);
        }
    }

    function onChangecaseAndCommunicationWrite(val: boolean) {
        setCaseAndCommunicationWrite(val);
        changeCaseAndCommunicationStatus();
    }

    function onChangeCaseAndCommunicatioRead(val: boolean) {
        setCaseAndCommunicationRead(val);
        changeCaseAndCommunicationStatus();
    }

    function onChangeCreateCaseRead(val: boolean) {
        setCreateCaseRead(val);
    }

    function onChangeCreateCaseWrite(val: boolean) {
        setCreateCaseWrite(val);
    }

    function onChangeViewCaseRead(val: boolean) {
        setViewCaseRead(val);
    }

    function onChangeViewCaseWrite(val: boolean) {
        setViewCaseWrite(val);
    }

    function onChangeAddCommunicationRead(val: boolean) {
        setAddCommunicationRead(val);
    }

    function onChangeAddCommunicationWrite(val: boolean) {
        setAddCommunicationWrite(val);
    }

    function onChangeViewCommunicationRead(val: boolean) {
        setViewCommunicationRead(val);
    }

    function onChangeViewCommunicationWrite(val: boolean) {
        setViewCommunicationWrite(val);
    }

    function onChangeEditCommunicationRead(val: boolean) {
        setEditCommunicationRead(val);
    }

    function onChangeEditCommunicationWrite(val: boolean) {
        setEditCommunicationRead(val);
    }

    return (
        <>
            <Card.Header className='accordion-header' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='4'>
                    <FontAwesomeIcon icon={faComments} /> {SECURABLE_NAMES.CaseAndCommunication}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                    <div className='col-sm-7'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='caseAndCommunicationClaimRead'
                                toggleTagging='Read'
                                toggleChange={onChangeCaseAndCommunicatioRead}
                                toggleDefaultValue={caseAndCommunicationRead}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='caseAndCommunicationClaimWrite'
                                toggleTagging='Write'
                                toggleChange={onChangecaseAndCommunicationWrite}
                                toggleDefaultValue={caseAndCommunicationWrite}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='4'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CreateCase}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='createCaseClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeCreateCaseRead}
                                                toggleDefaultValue={createCaseRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='createCaseClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeCreateCaseWrite}
                                                toggleDefaultValue={createCaseWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ViewCase}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='viewCaseClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeViewCaseRead}
                                                toggleDefaultValue={viewCaseRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='viewCaseClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeViewCaseWrite}
                                                toggleDefaultValue={viewCaseWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='2'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.AddCommunication}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='addCommunicationClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeAddCommunicationRead}
                                                toggleDefaultValue={addCommunicationRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='addCommunicationClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeAddCommunicationWrite}
                                                toggleDefaultValue={addCommunicationWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='3'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ViewCommunication}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='viewCommunicationClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeViewCommunicationRead}
                                                toggleDefaultValue={viewCommunicationRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='viewCommunicationClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeViewCommunicationWrite}
                                                toggleDefaultValue={viewCommunicationWrite}
                                                isDisabled={true}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='4'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.EditCommunication}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='editCommunicationClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeEditCommunicationRead}
                                                toggleDefaultValue={editCommunicationRead}
                                                isDisabled={true}
                                            />

                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='editCommunicationClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeEditCommunicationWrite}
                                                toggleDefaultValue={editCommunicationWrite}
                                                isDisabled={true}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                    </Accordion>
                </Card.Body>
            </Accordion.Collapse>
        </>
    )
}

export default CaseCommunicationSecurableObjects