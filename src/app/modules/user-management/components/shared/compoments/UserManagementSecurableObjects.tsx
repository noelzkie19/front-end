import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const UserManagementSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    const [userManagementRead, setUserManagementRead] = useState(false);
    const [userManagementWrite, setUserManagementWrite] = useState(false);
    const [teamsRead, setTeamsRead] = useState(false);
    const [teamsWrite, setTeamsWrite] = useState(false);
    const [rolesRead, setRolesRead] = useState(false);
    const [rolesWrite, setRolesWrite] = useState(false);
    const [usersRead, setUsersRead] = useState(false);
    const [usersWrite, setUsersWrite] = useState(false);

    let teamsClaimRead = document.getElementById('teamsClaimRead') as HTMLInputElement;
    let teamsClaimWrite = document.getElementById('teamsClaimWrite') as HTMLInputElement;
    let rolesClaimRead = document.getElementById('rolesClaimRead') as HTMLInputElement;
    let rolesClaimWrite = document.getElementById('rolesClaimWrite') as HTMLInputElement;
    let usersClaimRead = document.getElementById('usersClaimRead') as HTMLInputElement;
    let usersClaimWrite = document.getElementById('usersClaimWrite') as HTMLInputElement;
    let userManagementClaimRead = document.getElementById('userManagementClaimRead') as HTMLInputElement;
    let userManagementClaimWrite = document.getElementById('userManagementClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return
        let userManagementClaim = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.UserManagement);
        if (!userManagementClaim) return
        let { read, write, subMainModuleDetails }: any = userManagementClaim;

        userManagementClaimRead.checked = read;
        setUserManagementRead(read);
        userManagementClaimWrite.checked = write;
        setUserManagementWrite(write);

        if (!subMainModuleDetails) return
        teamsClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Teams)?.read!;
        teamsClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Teams)?.write!;
        rolesClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Roles)?.read!;
        rolesClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Roles)?.write!;
        usersClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Users)?.read!;
        usersClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Users)?.write!;

        changeUserManagement();
        return () => { }
    }, [SecurableObjects])


    function onChangeUserManagementRead(val: boolean) {
        setUserManagementRead(val);
        changeUserManagement();
    }

    function onChangeUserManagementWrite(val: boolean) {
        setUserManagementWrite(val);
        changeUserManagement();
    }

    function changeUserManagement() {
        const userManagementAllFalse = () => {
            teamsClaimRead.disabled = false;
            teamsClaimWrite.disabled = false;
            rolesClaimRead.disabled = false;
            rolesClaimWrite.disabled = false;
            usersClaimRead.disabled = false;
            usersClaimWrite.disabled = false;

            setTeamsRead(false);
            setTeamsWrite(false);
            setRolesRead(false);
            setRolesWrite(false);
            setUsersRead(false);
            setUsersWrite(false);
        }

        if (userManagementClaimRead.checked === true && userManagementClaimWrite.checked === true) {
            userManagementAllFalse();
        } else if (userManagementClaimRead.checked === true && userManagementClaimWrite.checked === false) {
            teamsClaimRead.disabled = false;
            teamsClaimWrite.disabled = true;
            rolesClaimRead.disabled = false;
            rolesClaimWrite.disabled = true;
            usersClaimRead.disabled = false;
            usersClaimWrite.disabled = true;
            teamsClaimWrite.checked = false;
            rolesClaimWrite.checked = false;
            usersClaimWrite.checked = false;

            setTeamsWrite(false);
            setRolesWrite(false);
            setUsersWrite(false);
        } else if (userManagementClaimRead.checked === false && userManagementClaimWrite.checked === true) {
            userManagementAllFalse();
        } else if (userManagementClaimRead.checked === false && userManagementClaimWrite.checked === false) {
            teamsClaimRead.disabled = true;
            teamsClaimWrite.disabled = true;
            rolesClaimRead.disabled = true;
            rolesClaimWrite.disabled = true;
            usersClaimRead.disabled = true;
            usersClaimWrite.disabled = true;
            teamsClaimRead.checked = false;
            teamsClaimWrite.checked = false;
            rolesClaimRead.checked = false;
            rolesClaimWrite.checked = false;
            usersClaimRead.checked = false;
            usersClaimWrite.checked = false;

            setTeamsRead(false);
            setTeamsWrite(false);
            setRolesRead(false);
            setRolesWrite(false);
            setUsersRead(false);
            setUsersWrite(false);
        }
    }

    function onChangeTeamsRead(val: boolean) {
        setTeamsRead(val);
    }

    function onChangeTeamsWrite(val: boolean) {
        setTeamsWrite(val);
    }

    function onChangeRolesRead(val: boolean) {
        setRolesRead(val);
    }

    function onChangeRolesWrite(val: boolean) {
        setRolesWrite(val);
    }

    function onChangeUsersRead(val: boolean) {
        setUsersRead(val);
    }

    function onChangeUsersWrite(val: boolean) {
        setUsersWrite(val);
    }

    return (
        <>
            <Card.Header className='accordion-header' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='2'>
                    <FontAwesomeIcon icon={faUserCog} /> {SECURABLE_NAMES.UserManagement}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                    <div className='col-sm-7'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='userManagementClaimRead'
                                toggleTagging='Read'
                                toggleChange={onChangeUserManagementRead}
                                toggleDefaultValue={userManagementRead}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='userManagementClaimWrite'
                                toggleTagging='Write'
                                toggleChange={onChangeUserManagementWrite}
                                toggleDefaultValue={userManagementWrite}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='2'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.Teams}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='teamsClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeTeamsRead}
                                                toggleDefaultValue={teamsRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='teamsClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeTeamsWrite}
                                                toggleDefaultValue={teamsWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header form-edit'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.Roles}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2 '>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='rolesClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeRolesRead}
                                                toggleDefaultValue={rolesRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='rolesClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeRolesWrite}
                                                toggleDefaultValue={rolesWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header form-edit'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='2'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.Users}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>                                            
                                            <ToggleComponent
                                                toggleId='usersClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeUsersRead}
                                                toggleDefaultValue={usersRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>                                           
                                            <ToggleComponent
                                                toggleId='usersClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeUsersWrite}
                                                toggleDefaultValue={usersWrite}
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

export default UserManagementSecurableObjects