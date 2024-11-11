import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const CaseManagementSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    //Case Management
    const [addCaseCommunicationRead, setAddCaseCommunicationRead] = useState(false);
    const [addCaseCommunicationWrite, setAddCaseCommunicationWrite] = useState(false);
    const [caseManagementLeaderAccessRead, setCaseManagementLeaderAccessRead] = useState(false);
    const [caseManagementLeaderAccessWrite, setCaseManagementLeaderAccessWrite] = useState(false);
    const [caseManagementRead, setCaseManagementRead] = useState(false);
    const [caseManagementWrite, setCaseManagementWrite] = useState(false);
    const [createCustomerCaseRead, setCreateCustomerCaseRead] = useState(false);
    const [createCustomerCaseWrite, setCreateCustomerCaseWrite] = useState(false);
    const [createCaseOnBehalfRead, setCreateCaseOnBehalfRead] = useState(false);
    const [createCaseOnBehalfWrite, setCreateCaseOnBehalfWrite] = useState(false);
    const [editCustomerCaseRead, setEditCustomerCaseRead] = useState(false);
    const [editCustomerCaseWrite, setEditCustomerCaseWrite] = useState(false);
    const [viewCustomerCaseRead, setViewCustomerCaseRead] = useState(false);
    const [viewCustomerCaseWrite, setViewCustomerCaseWrite] = useState(false);
    const [reopenCaseRead, setReopenCaseRead] = useState(false);
    const [reopenCaseWrite, setReopenCaseWrite] = useState(false);
    const [searchCustomerCaseRead, setSearchCustomerCaseRead] = useState(false);
    const [searchCustomerCaseWrite, setSearchCustomerCaseWrite] = useState(false);
    const [pcsQuestionnairesRead, setPCSQuestionnairesRead] = useState(false);
    const [pcsQuestionnairesWrite, setPCSQuestionnairesWrite] = useState(false);

    let caseManagementClaimsRead = document.getElementById('caseManagementClaimRead') as HTMLInputElement;
    let caseManagementClaimsWrite = document.getElementById('caseManagementClaimWrite') as HTMLInputElement;
    let createCustomerCaseClaimsRead = document.getElementById('createCustomerCaseClaimRead') as HTMLInputElement;
    let createCustomerCaseClaimsWrite = document.getElementById('createCustomerCaseClaimWrite') as HTMLInputElement;
    let editCustomerCaseClaimsRead = document.getElementById('editCustomerCaseClaimRead') as HTMLInputElement;
    let editCustomerCaseClaimsWrite = document.getElementById('editCustomerCaseClaimWrite') as HTMLInputElement;
    let searchCustomerCaseClaimsRead = document.getElementById('searchCustomerCaseClaimRead') as HTMLInputElement;
    let searchCustomerCaseClaimsWrite = document.getElementById('searchCustomerCaseClaimWrite') as HTMLInputElement;
    let viewCustomerCaseClaimsRead = document.getElementById('viewCustomerCaseClaimRead') as HTMLInputElement;
    let viewCustomerCaseClaimsWrite = document.getElementById('viewCustomerCaseClaimWrite') as HTMLInputElement;
    let addCaseCommunicationClaimsRead = document.getElementById('addCaseCommunicationClaimRead') as HTMLInputElement;
    let addCaseCommunicationClaimsWrite = document.getElementById('addCaseCommunicationClaimWrite') as HTMLInputElement;
    let caseManagementLeaderAccessClaimsRead = document.getElementById('caseManagementLeaderAccessClaimRead') as HTMLInputElement;
    let caseManagementLeaderAccessClaimsWrite = document.getElementById('caseManagementLeaderAccessClaimWrite') as HTMLInputElement;
    let pcsQuestionnairesClaimsRead = document.getElementById('pcsQuestionnairesClaimRead') as HTMLInputElement;
    let pcsQuestionnairesClaimsWrite = document.getElementById('pcsQuestionnairesClaimWrite') as HTMLInputElement;

    let createCaseOnBehalfClaimsRead = document.getElementById('createCaseOnBehalfClaimRead') as HTMLInputElement;
    let createCaseOnBehalfClaimsWrite = document.getElementById('createCaseOnBehalfClaimWrite') as HTMLInputElement;
    let reopenCaseClaimsWrite = document.getElementById('reopenCaseClaimWrite') as HTMLInputElement;
    let reopenCaseClaimsRead = document.getElementById('reopenCaseClaimRead') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return

        let caseManagementClaims = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.CaseManagement);

        if (!caseManagementClaims) return
        let { read, write, subMainModuleDetails }: any = caseManagementClaims;

        caseManagementClaimsRead.checked = read;
        setAddCaseCommunicationRead(read)
        caseManagementClaimsWrite.checked = write;
        setAddCaseCommunicationWrite(write)

        createCustomerCaseClaimsRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateCase)?.read!;
        createCustomerCaseClaimsWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateCase)?.write!;
        editCustomerCaseClaimsRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.EditCustomerCase)?.read!;
        editCustomerCaseClaimsWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.EditCustomerCase)?.write!;
        addCaseCommunicationClaimsRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.AddCaseCommunication)?.read!;
        addCaseCommunicationClaimsWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.AddCaseCommunication)?.write!;
        searchCustomerCaseClaimsRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchCaseCommunication)?.read!;
        searchCustomerCaseClaimsWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchCaseCommunication)?.write!;
        viewCustomerCaseClaimsRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCase)?.read!;
        viewCustomerCaseClaimsWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCase)?.write!;
        pcsQuestionnairesClaimsRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PCSQuestionnaires)?.read!;
        pcsQuestionnairesClaimsWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PCSQuestionnaires)?.write!;


        leaderAccess(subMainModuleDetails)
        changeCaseManagementStatus();
        return () => { }
    }, [SecurableObjects])

    const leaderAccess = (subMainModuleDetails: any) => {
        const { read: leaderAccessRead, write: leaderAccessWrite, subModuleDetails: leaderAccessSubmodules } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CaseManagementLeaderAccess) ?? { read: false, write: false, subModuleDetails: [] };
        caseManagementLeaderAccessClaimsRead.checked = leaderAccessRead;
        caseManagementLeaderAccessClaimsWrite.checked = leaderAccessWrite;

        const { read: caseOnBehalfRead, write: caseOnBehalfWrite } = leaderAccessSubmodules?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateCaseOnBehalf) ?? { read: false, write: false };
        createCaseOnBehalfClaimsRead.checked = caseOnBehalfRead;
        createCaseOnBehalfClaimsWrite.checked = caseOnBehalfWrite;

        const { read: reOpenCaseRead, write: reOpenCaseWrite } = leaderAccessSubmodules?.find((obj: any) => obj.description === SECURABLE_NAMES.ReopenCase) ?? { read: false, write: false };
        reopenCaseClaimsRead.checked = reOpenCaseRead;
        reopenCaseClaimsWrite.checked = reOpenCaseWrite;
    }



    function changeCaseManagementStatus() {
        if (caseManagementClaimsRead.checked === true && caseManagementClaimsWrite.checked === true) {
            createCustomerCaseClaimsRead.disabled = false;
            createCustomerCaseClaimsWrite.disabled = false;
            editCustomerCaseClaimsRead.disabled = false;
            editCustomerCaseClaimsWrite.disabled = false;
            searchCustomerCaseClaimsRead.disabled = false;
            searchCustomerCaseClaimsWrite.disabled = false;
            viewCustomerCaseClaimsRead.disabled = false;
            viewCustomerCaseClaimsWrite.disabled = false;
            addCaseCommunicationClaimsRead.disabled = false;
            addCaseCommunicationClaimsWrite.disabled = false;
            caseManagementLeaderAccessClaimsRead.disabled = false;
            caseManagementLeaderAccessClaimsWrite.disabled = false;
            pcsQuestionnairesClaimsRead.disabled = false;
            pcsQuestionnairesClaimsWrite.disabled = false;

            setCreateCustomerCaseRead(false);
            setCreateCustomerCaseWrite(false);
            setEditCustomerCaseRead(false);
            setEditCustomerCaseWrite(false);
            setSearchCustomerCaseRead(false);
            setSearchCustomerCaseWrite(false);
            setViewCustomerCaseRead(false);
            setViewCustomerCaseWrite(false);
            setAddCaseCommunicationRead(false);
            setAddCaseCommunicationWrite(false);
            setCaseManagementLeaderAccessRead(false);
            setCaseManagementLeaderAccessWrite(false);
            setPCSQuestionnairesRead(false);
            setPCSQuestionnairesWrite(false);
        } else if (caseManagementClaimsRead.checked === true && caseManagementClaimsWrite.checked === false) {
            createCustomerCaseClaimsRead.disabled = false;
            createCustomerCaseClaimsWrite.disabled = true;
            editCustomerCaseClaimsRead.disabled = false;
            editCustomerCaseClaimsWrite.disabled = true;
            searchCustomerCaseClaimsRead.disabled = false;
            searchCustomerCaseClaimsWrite.disabled = true;
            viewCustomerCaseClaimsRead.disabled = false;
            viewCustomerCaseClaimsWrite.disabled = true;
            addCaseCommunicationClaimsRead.disabled = false;
            addCaseCommunicationClaimsWrite.disabled = true;
            caseManagementLeaderAccessClaimsRead.disabled = false;
            caseManagementLeaderAccessClaimsWrite.disabled = true;
            pcsQuestionnairesClaimsRead.disabled = false;
            pcsQuestionnairesClaimsWrite.disabled = true;
            createCustomerCaseClaimsWrite.checked = false;
            editCustomerCaseClaimsWrite.checked = false;
            searchCustomerCaseClaimsWrite.checked = false;
            viewCustomerCaseClaimsWrite.checked = false;
            addCaseCommunicationClaimsWrite.checked = false;
            caseManagementLeaderAccessClaimsWrite.checked = false;
            pcsQuestionnairesClaimsWrite.checked = false;

            setAddCaseCommunicationRead(false);
            setAddCaseCommunicationWrite(true);
            setCreateCustomerCaseRead(false);
            setCreateCustomerCaseWrite(true);
            setEditCustomerCaseRead(false);
            setEditCustomerCaseWrite(true);
            setCaseManagementLeaderAccessRead(false);
            setCaseManagementLeaderAccessWrite(true);
            setPCSQuestionnairesRead(false);
            setPCSQuestionnairesWrite(true);
            setSearchCustomerCaseRead(false);
            setSearchCustomerCaseWrite(true);
            setViewCustomerCaseRead(false);
            setViewCustomerCaseWrite(true);
        } else if (caseManagementClaimsRead.checked === false && caseManagementClaimsWrite.checked === true) {
            createCustomerCaseClaimsRead.disabled = false;
            createCustomerCaseClaimsWrite.disabled = false;
            editCustomerCaseClaimsRead.disabled = false;
            editCustomerCaseClaimsWrite.disabled = false;
            searchCustomerCaseClaimsRead.disabled = false;
            searchCustomerCaseClaimsWrite.disabled = false;
            viewCustomerCaseClaimsRead.disabled = false;
            viewCustomerCaseClaimsWrite.disabled = false;
            addCaseCommunicationClaimsRead.disabled = false;
            addCaseCommunicationClaimsWrite.disabled = false;
            caseManagementLeaderAccessClaimsRead.disabled = false;
            caseManagementLeaderAccessClaimsWrite.disabled = false;
            pcsQuestionnairesClaimsRead.disabled = false;
            pcsQuestionnairesClaimsWrite.disabled = false;
            createCustomerCaseClaimsRead.checked = false;
            editCustomerCaseClaimsRead.checked = false;
            searchCustomerCaseClaimsRead.checked = false;
            viewCustomerCaseClaimsRead.checked = false;
            addCaseCommunicationClaimsRead.checked = false;
            caseManagementLeaderAccessClaimsRead.checked = false;
            pcsQuestionnairesClaimsRead.checked = false;

            setCreateCustomerCaseRead(false);
            setCreateCustomerCaseWrite(false);
            setEditCustomerCaseRead(false);
            setEditCustomerCaseWrite(false);
            setSearchCustomerCaseRead(false);
            setSearchCustomerCaseWrite(false);
            setViewCustomerCaseRead(false);
            setViewCustomerCaseWrite(false);
            setAddCaseCommunicationRead(false);
            setAddCaseCommunicationWrite(false);
            setCaseManagementLeaderAccessRead(false);
            setCaseManagementLeaderAccessWrite(false);
            setPCSQuestionnairesRead(false);
            setPCSQuestionnairesWrite(false);
        } else if (caseManagementClaimsRead.checked === false && caseManagementClaimsWrite.checked === false) {
            createCustomerCaseClaimsRead.disabled = true;
            createCustomerCaseClaimsWrite.disabled = true;
            editCustomerCaseClaimsRead.disabled = true;
            editCustomerCaseClaimsWrite.disabled = true;
            searchCustomerCaseClaimsRead.disabled = true;
            searchCustomerCaseClaimsWrite.disabled = true;
            viewCustomerCaseClaimsRead.disabled = true;
            viewCustomerCaseClaimsWrite.disabled = true;
            addCaseCommunicationClaimsRead.disabled = true;
            addCaseCommunicationClaimsWrite.disabled = true;
            caseManagementLeaderAccessClaimsRead.disabled = true;
            caseManagementLeaderAccessClaimsWrite.disabled = true;
            pcsQuestionnairesClaimsRead.disabled = true;
            pcsQuestionnairesClaimsWrite.disabled = true;
            createCustomerCaseClaimsWrite.checked = false;
            editCustomerCaseClaimsWrite.checked = false;
            searchCustomerCaseClaimsWrite.checked = false;
            viewCustomerCaseClaimsWrite.checked = false;
            addCaseCommunicationClaimsWrite.checked = false;
            caseManagementLeaderAccessClaimsWrite.checked = false;
            pcsQuestionnairesClaimsWrite.checked = false;
            createCustomerCaseClaimsRead.checked = false;
            editCustomerCaseClaimsRead.checked = false;
            searchCustomerCaseClaimsRead.checked = false;
            viewCustomerCaseClaimsRead.checked = false;
            addCaseCommunicationClaimsRead.checked = false;
            caseManagementLeaderAccessClaimsRead.checked = false;
            pcsQuestionnairesClaimsRead.checked = false;

            setCreateCustomerCaseRead(true);
            setCreateCustomerCaseWrite(true);
            setEditCustomerCaseRead(true);
            setEditCustomerCaseWrite(true);
            setSearchCustomerCaseRead(true);
            setSearchCustomerCaseWrite(true);
            setViewCustomerCaseRead(true);
            setViewCustomerCaseWrite(true);
            setAddCaseCommunicationRead(true);
            setAddCaseCommunicationWrite(true);
            setCaseManagementLeaderAccessRead(true);
            setCaseManagementLeaderAccessWrite(true);
            setPCSQuestionnairesRead(true);
            setPCSQuestionnairesWrite(true);
        }

        changeCaseManagementLeaderAccess();
    }

    function changeCaseManagementLeaderAccess() {
        if (caseManagementLeaderAccessClaimsRead.checked === true && caseManagementLeaderAccessClaimsWrite.checked === true) {
            createCaseOnBehalfClaimsRead.disabled = false;
            createCaseOnBehalfClaimsWrite.disabled = false;
            reopenCaseClaimsWrite.disabled = false;
            reopenCaseClaimsRead.disabled = false;

            setCreateCaseOnBehalfRead(false);
            setCreateCaseOnBehalfWrite(false);
            setReopenCaseRead(false);
            setReopenCaseWrite(false);
        } else if (caseManagementLeaderAccessClaimsRead.checked === true && caseManagementLeaderAccessClaimsWrite.checked === false) {
            createCaseOnBehalfClaimsRead.disabled = false;
            createCaseOnBehalfClaimsWrite.disabled = true;
            createCaseOnBehalfClaimsWrite.checked = false;
            reopenCaseClaimsRead.disabled = false;
            reopenCaseClaimsWrite.disabled = true;
            reopenCaseClaimsWrite.checked = false;

            setCreateCaseOnBehalfRead(false);
            setCreateCaseOnBehalfWrite(true);
            setReopenCaseRead(false);
            setReopenCaseWrite(true);
        } else if (caseManagementLeaderAccessClaimsRead.checked === false && caseManagementLeaderAccessClaimsWrite.checked === true) {
            createCaseOnBehalfClaimsRead.disabled = true;
            createCaseOnBehalfClaimsWrite.disabled = false;
            reopenCaseClaimsRead.disabled = true;
            reopenCaseClaimsWrite.disabled = false;
            reopenCaseClaimsRead.checked = false;
            createCaseOnBehalfClaimsRead.checked = false;

            setCreateCaseOnBehalfRead(true);
            setCreateCaseOnBehalfWrite(false);
            setReopenCaseRead(true);
            setReopenCaseWrite(false);
        } else if (caseManagementLeaderAccessClaimsRead.checked === false && caseManagementLeaderAccessClaimsWrite.checked === false) {
            createCaseOnBehalfClaimsRead.disabled = true;
            createCaseOnBehalfClaimsWrite.disabled = true;
            reopenCaseClaimsRead.disabled = true;
            reopenCaseClaimsWrite.disabled = true;
            createCaseOnBehalfClaimsRead.checked = false;
            reopenCaseClaimsRead.checked = false;
            createCaseOnBehalfClaimsWrite.checked = false;
            reopenCaseClaimsWrite.checked = false;

            setCreateCaseOnBehalfRead(true);
            setCreateCaseOnBehalfWrite(true);
            setReopenCaseWrite(true);
            setReopenCaseRead(true);
        }
    }

    //Case Management
    function onChangeCaseManagementRead(val: boolean) {
        setCaseManagementRead(val);
        changeCaseManagementStatus();
    }

    function onChangeCaseManagementWrite(val: boolean) {
        setCaseManagementWrite(val);
        changeCaseManagementStatus();
    }

    function onChangeCreateCustomerCaseRead(val: boolean) {
        setCreateCustomerCaseRead(val);
    }

    function onChangeCreateCustomerCaseWrite(val: boolean) {
        setCreateCustomerCaseWrite(val);
    }

    function onChangeEditCustomerCaseRead(val: boolean) {
        setEditCustomerCaseRead(val);
    }

    function onChangeEditCustomerCaseWrite(val: boolean) {
        setEditCustomerCaseWrite(val);
    }

    function onChangeSearchCustomerCaseRead(val: boolean) {
        setSearchCustomerCaseRead(val);
    }

    function onChangeSearchCustomerCaseWrite(val: boolean) {
        setSearchCustomerCaseWrite(val);
    }

    function onChangeViewCustomerCaseRead(val: boolean) {
        setViewCustomerCaseRead(val);
    }

    function onChangeViewCustomerCaseWrite(val: boolean) {
        setViewCustomerCaseWrite(val);
    }

    function onChangeAddCaseCommunicationRead(val: boolean) {
        setAddCaseCommunicationRead(val);
    }

    function onChangeAddCaseCommunicationWrite(val: boolean) {
        setAddCaseCommunicationWrite(val);
    }

    function onChangeCaseManagementLeaderAccessRead(val: boolean) {
        setCaseManagementLeaderAccessRead(val);
        changeCaseManagementLeaderAccess();
    }

    function onChangeCaseManagementLeaderAccessWrite(val: boolean) {
        setCaseManagementLeaderAccessWrite(val);
        changeCaseManagementLeaderAccess();
    }

    function onChangeCreateCaseOnBehalfRead(val: boolean) {
        setCreateCaseOnBehalfRead(val);
    }

    function onChangeCreateCaseOnBehalfWrite(val: boolean) {
        setCreateCaseOnBehalfWrite(val);
    }

    function onChangeReopenCaseRead(val: boolean) {
        setReopenCaseRead(val);
    }

    function onChangeReopenCaseWrite(val: boolean) {
        setReopenCaseWrite(val);
    }

    function onChangePCSQuestionnairesRead(val: boolean) {
        setPCSQuestionnairesRead(val);
    }

    function onChangePCSQuestionnairesWrite(val: boolean) {
        setPCSQuestionnairesWrite(val);
    }


    return (
        <>
            <Card.Header className='accordion-header edit-user-div' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='10'>
                    <FontAwesomeIcon icon={faBriefcase} /> {SECURABLE_NAMES.CaseManagement}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                    <div className='col-sm-7'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='caseManagementClaimRead'
                                toggleChange={onChangeCaseManagementRead}
                                toggleDefaultValue={caseManagementRead}
                                toggleTagging='Read'
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='caseManagementClaimWrite'
                                toggleChange={onChangeCaseManagementWrite}
                                toggleDefaultValue={caseManagementWrite}
                                toggleTagging='Write'
                                isDisabled={false}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='10'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='5' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CreateCustomerCase}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='createCustomerCaseClaimRead'
                                                toggleChange={onChangeCreateCustomerCaseRead}
                                                toggleDefaultValue={createCustomerCaseRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='createCustomerCaseClaimWrite'
                                                toggleChange={onChangeCreateCustomerCaseWrite}
                                                toggleDefaultValue={createCustomerCaseWrite}
                                                toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.EditCustomerCase}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='editCustomerCaseClaimRead'
                                                toggleChange={onChangeEditCustomerCaseRead}
                                                toggleDefaultValue={editCustomerCaseRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='editCustomerCaseClaimWrite'
                                                toggleChange={onChangeEditCustomerCaseWrite}
                                                toggleDefaultValue={editCustomerCaseWrite}
                                                toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.AddCaseCommunication}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='addCaseCommunicationClaimRead'
                                                toggleChange={onChangeAddCaseCommunicationRead}
                                                toggleDefaultValue={addCaseCommunicationRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='addCaseCommunicationClaimWrite'
                                                toggleChange={onChangeAddCaseCommunicationWrite}
                                                toggleDefaultValue={addCaseCommunicationWrite}
                                                toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.SearchCaseCommunication}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='searchCustomerCaseClaimRead'
                                                toggleChange={onChangeSearchCustomerCaseRead}
                                                toggleDefaultValue={searchCustomerCaseRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='searchCustomerCaseClaimWrite'
                                                toggleChange={onChangeSearchCustomerCaseWrite}
                                                toggleDefaultValue={searchCustomerCaseWrite}
                                                toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ViewCustomerCase}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='viewCustomerCaseClaimRead'
                                                toggleChange={onChangeViewCustomerCaseRead}
                                                toggleDefaultValue={viewCustomerCaseRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='viewCustomerCaseClaimWrite'
                                                toggleChange={onChangeViewCustomerCaseWrite}
                                                toggleDefaultValue={viewCustomerCaseWrite}
                                                toggleTagging='Write'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='5'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CaseManagementLeaderAccess}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='caseManagementLeaderAccessClaimRead'
                                                toggleChange={onChangeCaseManagementLeaderAccessRead}
                                                toggleDefaultValue={caseManagementLeaderAccessRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='caseManagementLeaderAccessClaimWrite'
                                                toggleChange={onChangeCaseManagementLeaderAccessWrite}
                                                toggleDefaultValue={caseManagementLeaderAccessWrite}
                                                toggleTagging='Write'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                            <Accordion.Collapse eventKey='5'>
                                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.CreateCaseOnBehalf}</div>
                                            </div>
                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='createCaseOnBehalfClaimRead'
                                                        toggleChange={onChangeCreateCaseOnBehalfRead}
                                                        toggleDefaultValue={createCaseOnBehalfRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='createCaseOnBehalfClaimWrite'
                                                        toggleChange={onChangeCreateCaseOnBehalfWrite}
                                                        toggleDefaultValue={createCaseOnBehalfWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.ReopenCase}</div>
                                            </div>
                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='reopenCaseClaimRead'
                                                        toggleChange={onChangeReopenCaseRead}
                                                        toggleDefaultValue={reopenCaseRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='reopenCaseClaimWrite'
                                                        toggleChange={onChangeReopenCaseWrite}
                                                        toggleDefaultValue={reopenCaseWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='6'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.PCSQuestionnaires}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='pcsQuestionnairesClaimRead'
                                                toggleChange={onChangePCSQuestionnairesRead}
                                                toggleDefaultValue={pcsQuestionnairesRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='pcsQuestionnairesClaimWrite'
                                                toggleChange={onChangePCSQuestionnairesWrite}
                                                toggleDefaultValue={pcsQuestionnairesWrite}
                                                toggleTagging='Write'
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

export default CaseManagementSecurableObjects