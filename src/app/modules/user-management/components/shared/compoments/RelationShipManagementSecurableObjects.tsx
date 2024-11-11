import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPhoneSquare } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const RelationShipManagementSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    // Relationship Management
    const [relationshipManagementRead, setRelationshipManagementRead] = useState(false);
    const [relationshipManagementWrite, setRelationshipManagementWrite] = useState(false);
    const [remDistributionRead, setRemDistributionRead] = useState(false);
    const [remDistributionWrite, setRemDistributionWrite] = useState(false);
    const [remSettingRead, setRemSettingRead] = useState<boolean>(false);
    const [remSettingWrite, setRemSettingWrite] = useState<boolean>(false);
    const [remProfileRead, setRemProfileRead] = useState<boolean>(false);
    const [remProfileWrite, setRemProfileWrite] = useState<boolean>(false);
    const [remAutoDistributionSettingRead, setRemAutoDistributionSettingRead] = useState<boolean>(false);
    const [remAutoDistributionSettingWrite, setRemAutoDistributionSettingWrite] = useState<boolean>(false);


    const relationshipManagementClaimsRead = document.getElementById('relationshipManagementClaimRead') as HTMLInputElement;
    const relationshipManagementClaimsWrite = document.getElementById('relationshipManagementClaimWrite') as HTMLInputElement;
    const relationManagementClaims = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.RelationshipManagement);
    const remDistributionClaimRead = document.getElementById('remDistributionClaimRead') as HTMLInputElement;
    const remDistributionClaimWrite = document.getElementById('remDistributionClaimWrite') as HTMLInputElement;
    const remSettingClaimRead = document.getElementById('remSettingClaimRead') as HTMLInputElement;
    const remSettingClaimWrite = document.getElementById('remSettingClaimWrite') as HTMLInputElement;
    const remProfileClaimRead = document.getElementById('remProfileClaimRead') as HTMLInputElement;
    const remProfileClaimWrite = document.getElementById('remProfileClaimWrite') as HTMLInputElement;
    const remAutoDistributionSettingClaimRead = document.getElementById('remAutoDistributionSettingClaimRead') as HTMLInputElement;
    const remAutoDistributionSettingClaimWrite = document.getElementById('remAutoDistributionSettingClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return

       
        if (!relationManagementClaims) return
        let { read, write, subMainModuleDetails }: any = relationManagementClaims;

        relationshipManagementClaimsRead.checked = read
        setRelationshipManagementRead(read)
        relationshipManagementClaimsWrite.checked = write
        setRelationshipManagementWrite(write)

        if (!subMainModuleDetails) return
        remDistributionClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemDistribution)?.read!;
        remDistributionClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemDistribution)?.write!;
        remSettingClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemSetting)?.read!;
        remSettingClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemSetting)?.write!;
        remProfileClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemProfile)?.read!;
        remProfileClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemProfile)?.write!;

        remSettingSubModules(subMainModuleDetails)
        changeRelationshipManagement();
        changeRemSettings();
        return () => {

        }
    }, [SecurableObjects])

    const remSettingSubModules = (subMainModuleDetails: any) => {
       
		const { read: remSettingRead, write: remSettingWrite, subModuleDetails: remSettingSubModules } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.RemSetting) ?? { read: false, write: false, subModuleDetails: [] };
		remSettingClaimRead.checked = remSettingRead
		remSettingClaimWrite.checked = remSettingWrite

		const { read: remAutoDistributionSettingRead, write: remAutoDistributionSettingWrite } = remSettingSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.RemAutoDistributionSetting) ?? { read: false, write: false };
		remAutoDistributionSettingClaimRead.checked = remAutoDistributionSettingRead;
		remAutoDistributionSettingClaimWrite.checked = remAutoDistributionSettingWrite;
	}


    function changeRelationshipManagement() {
        const relationShipmanagementAllFalse = () => {
			remDistributionClaimRead.disabled = false;
			remDistributionClaimWrite.disabled = false;
			remSettingClaimRead.disabled = false;
			remSettingClaimWrite.disabled = false;
            remProfileClaimRead.disabled = false;
			remProfileClaimWrite.disabled = false;

			setRemDistributionRead(false);
			setRemDistributionWrite(false);
			setRemSettingRead(false);
			setRemSettingWrite(false);
            setRemProfileRead(false);
			setRemProfileWrite(false);
		};

		if (relationshipManagementClaimsRead.checked === true && relationshipManagementClaimsWrite.checked === true) {
			relationShipmanagementAllFalse();
		} else if (relationshipManagementClaimsRead.checked === true && relationshipManagementClaimsWrite.checked === false) {
			
			
			remDistributionClaimRead.disabled = false;
			remDistributionClaimWrite.disabled = true;
			remDistributionClaimWrite.checked = false;

			remSettingClaimRead.disabled = false;
			remSettingClaimWrite.disabled = true;
			remSettingClaimWrite.checked = false;

            remProfileClaimRead.disabled = false;
			remProfileClaimWrite.disabled = true;
			remProfileClaimWrite.checked = false;

			setRemDistributionWrite(false);
			setRemSettingWrite(false);
            setRemProfileWrite(false);
		}

		if (relationshipManagementClaimsRead.checked === false && relationshipManagementClaimsWrite.checked === true) {
			remDistributionClaimRead.disabled = false;
			remDistributionClaimRead.checked = false;
			remDistributionClaimWrite.disabled = false;

			remSettingClaimRead.disabled = false;
			remSettingClaimRead.checked = false;
			remSettingClaimWrite.disabled = false;

            remProfileClaimRead.disabled = false;
			remProfileClaimRead.checked = false;
			remProfileClaimWrite.disabled = false;

			setRemDistributionRead(false);
			setRemSettingRead(false);
            setRemProfileRead(false)

		} else if (relationshipManagementClaimsRead.checked === false && relationshipManagementClaimsWrite.checked === false) {
			remDistributionClaimRead.disabled = true;
			remDistributionClaimWrite.disabled = true;
			remDistributionClaimRead.checked = false;
			remDistributionClaimWrite.checked = false;

			remSettingClaimRead.disabled = true;
			remSettingClaimWrite.disabled = true;
			remSettingClaimRead.checked = false;
			remSettingClaimWrite.checked = false;

            remProfileClaimRead.disabled = true;
			remProfileClaimWrite.disabled = true;
			remProfileClaimRead.checked = false;
			remProfileClaimWrite.checked = false;

			setRemDistributionRead(false);
			setRemDistributionWrite(false);

			setRemSettingRead(false);
			setRemSettingWrite(false);

            setRemProfileRead(false);
			setRemProfileWrite(false);
		}
    }

    function changeRemSettings() {
        const remSettingsAllFalse = () => {
			remAutoDistributionSettingClaimRead.disabled = false;
			remAutoDistributionSettingClaimWrite.disabled = false;
			setRemAutoDistributionSettingRead(false);
			setRemAutoDistributionSettingWrite(false);
		}

		if (remSettingClaimRead.checked === true && remSettingClaimWrite.checked === true) {
			remSettingsAllFalse();			
		} else if (remSettingClaimRead.checked === true && remSettingClaimWrite.checked === false) {
			remAutoDistributionSettingClaimRead.disabled = false;
			remAutoDistributionSettingClaimWrite.disabled = true;
			remAutoDistributionSettingClaimWrite.checked = false;

			setRemAutoDistributionSettingRead(false);
			setRemAutoDistributionSettingWrite(false);

		} else if (remSettingClaimRead.checked === false && remSettingClaimWrite.checked === true) {
			remAutoDistributionSettingClaimRead.disabled = true;
            remAutoDistributionSettingClaimWrite.disabled = false;
            remAutoDistributionSettingClaimRead.checked = false;

            setRemAutoDistributionSettingRead(true);
            setRemAutoDistributionSettingWrite(false);
		} else if (remSettingClaimRead.checked === false && remSettingClaimWrite.checked === false) {
			remAutoDistributionSettingClaimRead.disabled = true;
			remAutoDistributionSettingClaimWrite.disabled = true;
			remAutoDistributionSettingClaimRead.checked = false
			remAutoDistributionSettingClaimWrite.checked = false;
			setRemAutoDistributionSettingRead(false);
			setRemAutoDistributionSettingWrite(false);
		}
	}

    // Relationship Management
    function onChangeRelationshipManagementRead(val: boolean) {
        setRelationshipManagementRead(val);
        changeRelationshipManagement();
        changeRemSettings()
    }

    function onChangeRelationshipManagementWrite(val: boolean) {
        setRelationshipManagementWrite(val);
        changeRelationshipManagement();
        changeRemSettings()
    }

    function onChangeRemDistributionRead(val: boolean) {
        setRemDistributionRead(val);
    }

    function onChangeRemDistributionWrite(val: boolean) {
        setRemDistributionWrite(val);
    }

    function onChangeRemSettingRead(val: boolean) {
        setRemSettingRead(val);
        changeRemSettings()
    }

    function onChangeRemSettingWrite(val: boolean) {
        setRemSettingWrite(val);
        changeRemSettings()
    }

    function onChangeRemProfileRead(val: boolean) {
        setRemProfileRead(val);
    }

    function onChangeRemProfileWrite(val: boolean) {
        setRemProfileWrite(val);
    }

    
	function onChangeRemAutoDistributionSettingRead(val: boolean) {
		setRemAutoDistributionSettingRead(val);
	}

	function onChangeRemAutoDistributionSettingWrite(val: boolean) {
		setRemAutoDistributionSettingWrite(val);
	}

    return (
        <><Card.Header className='accordion-header edit-user-div' style={CardHeaderEditStyles}>
            <Accordion.Toggle as={Button} variant='link' eventKey='8'>
                <FontAwesomeIcon icon={faPhoneSquare} /> {SECURABLE_NAMES.RelationshipManagement}
            </Accordion.Toggle>
            <div className='d-flex align-items-center my-2'>
                <div className='col-sm-7'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                        <ToggleComponent
                            toggleId='relationshipManagementClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeRelationshipManagementRead}
                            toggleDefaultValue={relationshipManagementRead}
                            isDisabled={false}
                        />
                    </div>
                </div>
                <div className='col'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                        <ToggleComponent
                            toggleId='relationshipManagementClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeRelationshipManagementWrite}
                            toggleDefaultValue={relationshipManagementWrite}
                            isDisabled={false}
                        />
                    </div>
                </div>
            </div>
        </Card.Header>
            <Accordion.Collapse eventKey='8'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.RemDistribution}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='remDistributionClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeRemDistributionRead}
                                                toggleDefaultValue={remDistributionRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='remDistributionClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeRemDistributionWrite}
                                                toggleDefaultValue={remDistributionWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        {/* ReM Setting */}
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='2'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.RemSetting}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='remSettingClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeRemSettingRead}
                                                toggleDefaultValue={remSettingRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='remSettingClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeRemSettingWrite}
                                                toggleDefaultValue={remSettingWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                            <Accordion.Collapse eventKey='2'>
								<Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
									{/* Reporter Role */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.RemAutoDistributionSetting}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='remAutoDistributionSettingClaimRead'
														toggleTagging='Read'
														toggleChange={onChangeRemAutoDistributionSettingRead}
														toggleDefaultValue={remAutoDistributionSettingRead}
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='remAutoDistributionSettingClaimWrite'
														toggleTagging='Write'
														toggleChange={onChangeRemAutoDistributionSettingWrite}
														toggleDefaultValue={remAutoDistributionSettingWrite}
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
								</Card.Body>
							</Accordion.Collapse>
                        </Card>
                        {/* End of ReM Setting */}
                        {/* Rem Profile */}
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.RemProfile}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='remProfileClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeRemProfileRead}
                                                toggleDefaultValue={remProfileRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='remProfileClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeRemProfileWrite}
                                                toggleDefaultValue={remProfileWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        {/* End of Rem Profile */}
                    </Accordion>
                </Card.Body>
            </Accordion.Collapse>
        </>
    )
}

export default RelationShipManagementSecurableObjects