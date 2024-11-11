import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCircle } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const HomeSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    const [homeRead, setHomeRead] = useState<boolean>(false)
    const [homeWrite, setHomeWrite] = useState<boolean>(false)
    const [playerEngagementRead, setPlayerEngagementRead] = useState(false);
    const [playerEngagementWrite, setPlayerEngagementWrite] = useState(false);
    const [marketingRead, setMarketingRead] = useState(false);
    const [marketingWrite, setMarketingWrite] = useState(false);

    const homeReadChkBox = document.getElementById('homeClaimRead') as HTMLInputElement;
    const homeWriteChkBox = document.getElementById('homeClaimWrite') as HTMLInputElement;

    const playerEngagementReadChkBox = document.getElementById('playerEngagementClaimRead') as HTMLInputElement;
    const playerEngagementWriteChkBox = document.getElementById('playerEngagementClaimWrite') as HTMLInputElement;
    const marketingReadChkBox = document.getElementById('marketingClaimRead') as HTMLInputElement;
    const marketingWriteChkBox = document.getElementById('marketingClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return

        let homeClaim = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.Home);
        if (!homeClaim) return
        let { read, write, subMainModuleDetails }: any = homeClaim;

        homeReadChkBox.checked = read;
        setHomeRead(read);
        homeWriteChkBox.checked = write;
        setHomeWrite(write);

        if (!subMainModuleDetails) return
        playerEngagementReadChkBox.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerEngagement)?.read!;
        playerEngagementWriteChkBox.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerEngagement)?.write!;
        marketingReadChkBox.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Marketing)?.read!;
        marketingWriteChkBox.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Marketing)?.write!;
        changeHomeRuleStatus();

        return () => { }
    }, [SecurableObjects])

    function onChangeHomeRead(val: boolean) {
        setHomeRead(val);
        changeHomeRuleStatus();
    }

    function onChangeHomeWrite(val: boolean) {
        setHomeWrite(val);
        changeHomeRuleStatus();
    }

    function onChangePlayerEngagementRead(val: boolean) {
        setPlayerEngagementRead(val);
    }

    function onChangePlayerEngagementWrite(val: boolean) {
        setPlayerEngagementWrite(val);
    }

    function onChangeMarketingRead(val: boolean) {
        setMarketingRead(val);
    }

    function onChangeMarketingWrite(val: boolean) {
        setMarketingWrite(val);
    }

    function changeHomeRuleStatus() {
        const homeAllFalse = () => {
            playerEngagementReadChkBox.disabled = false;
            playerEngagementWriteChkBox.disabled = false;
            marketingReadChkBox.disabled = false;
            marketingWriteChkBox.disabled = false;

            setPlayerEngagementRead(false);
            setPlayerEngagementWrite(false);
            setMarketingRead(false);
            setMarketingWrite(false);
        }

        if (homeReadChkBox.checked === true && homeWriteChkBox.checked === true) {
            homeAllFalse();
        } else if (homeReadChkBox.checked === true && homeWriteChkBox.checked === false) {
            playerEngagementReadChkBox.disabled = false;
            playerEngagementWriteChkBox.disabled = true;
            marketingReadChkBox.disabled = false;
            marketingWriteChkBox.disabled = true;
            playerEngagementWriteChkBox.checked = false;
            marketingWriteChkBox.checked = false;

            setPlayerEngagementWrite(false);
            setMarketingWrite(false);
        } else if (homeReadChkBox.checked === false && homeWriteChkBox.checked === true) {
            homeAllFalse();
        } else if (homeReadChkBox.checked === false && homeWriteChkBox.checked === false) {
            playerEngagementReadChkBox.disabled = true;
            playerEngagementWriteChkBox.disabled = true;
            marketingReadChkBox.disabled = true;
            marketingWriteChkBox.disabled = true;
            playerEngagementWriteChkBox.checked = false;
            marketingWriteChkBox.checked = false;
            playerEngagementReadChkBox.checked = false;
            marketingReadChkBox.checked = false;

            setPlayerEngagementRead(false);
            setPlayerEngagementWrite(false);
            setMarketingRead(false);
            setMarketingWrite(false);
        }
    }

    return (
        <>
            <Card.Header className='accordion-header' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                    <FontAwesomeIcon icon={faHome} /> {SECURABLE_NAMES.Home}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2 acc-read'>
                    <div className='col-sm-7'>
                        <ToggleComponent
                            toggleId='homeClaimRead'
                            toggleChange={onChangeHomeRead}
                            toggleDefaultValue={homeRead}
                            toggleTagging='Read'
                            isDisabled={false}
                        />
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid acc-read'>
                            <ToggleComponent
                                toggleId='homeClaimWrite'
                                toggleChange={onChangeHomeWrite}
                                toggleDefaultValue={homeWrite}
                                toggleTagging='Write'
                                isDisabled={false}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='0'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.PlayerEngagement}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
                                            <ToggleComponent
                                                toggleId='playerEngagementClaimRead'
                                                toggleChange={onChangePlayerEngagementRead}
                                                toggleDefaultValue={playerEngagementRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
                                            <ToggleComponent
                                                toggleId='playerEngagementClaimWrite'
                                                toggleChange={onChangePlayerEngagementWrite}
                                                toggleDefaultValue={playerEngagementWrite}
                                                toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.Marketing}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='marketingClaimRead'
                                                toggleChange={onChangeMarketingRead}
                                                toggleDefaultValue={marketingRead}
                                                toggleTagging='Read'
                                                isDisabled={true}

                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='marketingClaimWrite'
                                                toggleChange={onChangeMarketingWrite}
                                                toggleDefaultValue={marketingWrite}
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

export default HomeSecurableObjects