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

const CampaignDashBoardSecurableObject = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    //Campaign Dashboard
    const [surveyAndFeedbackRead, setSurveyAndFeedbackRead] = useState(false);
    const [surveyAndFeedbackWrite, setSurveyAndFeedbackWrite] = useState(false);
    const [campaignDashboardRead, setCampaignDashboardRead] = useState(false);
    const [campaignDashboardWrite, setCampaignDashboardWrite] = useState(false);
    const [campaignPerformanceRead, setCampaignPerformanceRead] = useState(false);
    const [campaignPerformanceWrite, setCampaignPerformanceWrite] = useState(false);


    let campaignDashboardClaimRead = document.getElementById('campaignDashboardClaimRead') as HTMLInputElement;
    let campaignDashboardClaimWrite = document.getElementById('campaignDashboardClaimWrite') as HTMLInputElement;
    let surveyAndFeedbackClaimRead = document.getElementById('surveyAndFeedbackClaimRead') as HTMLInputElement;
    let surveyAndFeedbackClaimWrite = document.getElementById('surveyAndFeedbackClaimWrite') as HTMLInputElement;
    let campaignPerformanceClaimRead = document.getElementById('campaignPerformanceClaimRead') as HTMLInputElement;
    let campaignPerformanceClaimWrite = document.getElementById('campaignPerformanceClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return
        let campaignDashboardClaim = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.CampaignDashboard);
        if (!campaignDashboardClaim) return
        let { read, write, subMainModuleDetails }: any = campaignDashboardClaim;

        campaignDashboardClaimRead.checked = read
        setCampaignDashboardRead(read)
        campaignDashboardClaimWrite.checked = write
        setCampaignDashboardWrite(write)


        if (!subMainModuleDetails) return
        surveyAndFeedbackClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SurveyAndFeedback)?.read!;
        surveyAndFeedbackClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SurveyAndFeedback)?.write!;
        campaignPerformanceClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CampaignPerformance)?.read!;
        campaignPerformanceClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CampaignPerformance)?.write!;


        changeCampaignDashboard();
        return () => {

        }
    }, [SecurableObjects])


    // CampaignDashboard
    function onChangeCampaignDashboardRead(val: boolean) {
        setCampaignDashboardRead(val);
        changeCampaignDashboard();
    }

    function onChangeCampaignDashboardWrite(val: boolean) {
        setCampaignDashboardWrite(val);
        changeCampaignDashboard();
    }

    function changeCampaignDashboard() {
        const campaginDashBoardAllFalse = () => {
            surveyAndFeedbackClaimRead.disabled = false;
            surveyAndFeedbackClaimWrite.disabled = false;
            campaignPerformanceClaimRead.disabled = false;
            campaignPerformanceClaimWrite.disabled = false;

            setSurveyAndFeedbackRead(false);
            setSurveyAndFeedbackWrite(false);
            setCampaignPerformanceRead(false);
            setCampaignPerformanceWrite(false);
        }

        if (campaignDashboardClaimRead.checked === true && campaignDashboardClaimWrite.checked === true) {
            campaginDashBoardAllFalse();
        } else if (campaignDashboardClaimRead.checked === true && campaignDashboardClaimWrite.checked === false) {
            surveyAndFeedbackClaimRead.disabled = false;
            surveyAndFeedbackClaimWrite.disabled = true;
            campaignPerformanceClaimRead.disabled = false;
            campaignPerformanceClaimWrite.disabled = true;
            surveyAndFeedbackClaimWrite.checked = false;
            campaignPerformanceClaimWrite.checked = false;

            setSurveyAndFeedbackWrite(false);
            setCampaignPerformanceWrite(false);
        } else if (campaignDashboardClaimRead.checked === false && campaignDashboardClaimWrite.checked === true) {
            campaginDashBoardAllFalse();
        } else if (campaignDashboardClaimRead.checked === false && campaignDashboardClaimWrite.checked === false) {
            surveyAndFeedbackClaimRead.disabled = true;
            surveyAndFeedbackClaimWrite.disabled = true;
            campaignPerformanceClaimRead.disabled = true;
            campaignPerformanceClaimWrite.disabled = true;
            surveyAndFeedbackClaimRead.checked = false;
            surveyAndFeedbackClaimWrite.checked = false;
            campaignPerformanceClaimRead.checked = false;
            campaignPerformanceClaimWrite.checked = false;

            setSurveyAndFeedbackRead(false);
            setSurveyAndFeedbackWrite(false);
            setCampaignPerformanceRead(false);
            setCampaignPerformanceWrite(false);
        }
    }

    function onChangeSurveyAndFeedbackRead(val: boolean) {
        setSurveyAndFeedbackRead(val);
    }

    function onChangeSurveyAndFeedbackWrite(val: boolean) {
        setSurveyAndFeedbackRead(val);
    }

    function onChangeCampaignPerformanceRead(val: boolean) {
        setCampaignPerformanceRead(val);
    }

    function onChangeCampaignPerformanceWrite(val: boolean) {
        setCampaignPerformanceRead(val);
    }
    return (
        <>
            <Card.Header className='accordion-header edit-user-div' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='7'>
                    <FontAwesomeIcon icon={faPhoneSquare} /> {SECURABLE_NAMES.CampaignDashboard}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                    <div className='col-sm-7'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='campaignDashboardClaimRead'
                                toggleTagging='Read'
                                toggleChange={onChangeCampaignDashboardRead}
                                toggleDefaultValue={campaignDashboardRead}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='campaignDashboardClaimWrite'
                                toggleTagging='Write'
                                toggleChange={onChangeCampaignDashboardWrite}
                                toggleDefaultValue={campaignDashboardWrite}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='7'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.SurveyAndFeedback}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='surveyAndFeedbackClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeSurveyAndFeedbackRead}
                                                toggleDefaultValue={surveyAndFeedbackRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='surveyAndFeedbackClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeSurveyAndFeedbackWrite}
                                                toggleDefaultValue={surveyAndFeedbackWrite}
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CampaignPerformance}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='campaignPerformanceClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeCampaignPerformanceRead}
                                                toggleDefaultValue={campaignPerformanceRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='campaignPerformanceClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeCampaignPerformanceWrite}
                                                toggleDefaultValue={campaignPerformanceWrite}
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

export default CampaignDashBoardSecurableObject