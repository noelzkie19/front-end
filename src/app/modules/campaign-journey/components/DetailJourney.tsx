import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap-v5";
import { ContentContainer, FooterContainer, FormGroupContainer, FormHeader, MainContainer, PaddedContainer } from "../../../custom-components"
import { CAMPAIGN_STATUS_TYPE, JOURNEY_ACTION_MODE, JOURNEY_TAB } from "../constants/Journey";
import { CampaignListJourney } from "./tabs/CampaignListJourney";
import { InformationJourney } from "./tabs/InformationJourney";
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../styles/Journey.css";
import { useHistory } from "react-router-dom";
import swal from 'sweetalert';
import { JourneyDetailsModel } from '../models/JourneyDetailsModel';
import { CampaignDetailsModel } from "../models/CampaignDetailsModel";
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import useConstant from "../../../constants/useConstant";
import { SaveJourneyRequestModel } from "../models/request/SaveJourneyRequestModel";
import { Guid } from "guid-typescript";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../../../setup";
import { GetJourneyDetails, RequestJourneyDetails, SaveJourney } from "../services/CampaignJourneyApi";
import { useParams } from "react-router-dom";
import { JourneyDetailsRequestModel } from "../models/request/JourneyDetailsRequestModel";
import { JourneyDetailsResponseModel } from "../models/response/JourneyDetailsResponseModel";
import moment from "moment";
import { dataType } from "../../../constants/Constants";
import { USER_CLAIMS } from "../../user-management/components/constants/UserClaims";

interface IDetailJourney {
    pageMode: number
}

export const DetailJourney: React.FC<IDetailJourney> = ({pageMode}) => {

    const history = useHistory();
    const {HubConnected, successResponse} = useConstant();
    const handleNext='handleNext';  
    const handlePrev='handlePrev';
    const [createMode, setCreateMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<boolean>(false);
    
    const {id}: {id: number} = useParams();
    const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;;
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [getLoading, setGetLoading] = useState<boolean>(false);
    const [badgeStyle, setBadgeStyle] = useState<string>('');
    
    const [currentTab, setCurrentTab] = useState<string>(JOURNEY_TAB.infoEventKey);
    const [disabledNextAction, setDisabledNextAction] = useState<boolean>(false);
    const [disabledPrevAction, setDisabledPrevAction] = useState<boolean>(false);

    //Fields
    const [journeyDetails, setJourneyDetails] = useState<JourneyDetailsModel>({});
    const [campaignDetails, setCampaignDetails] = useState<Array<CampaignDetailsModel>>([]);
    const [cloneJourneyName, setCloneJourneyName] = useState<string>('');

    const [showWarningModal, setShowWarningModal] = useState<boolean>(true);

    //Leave site modal
    window.onbeforeunload = confirmExit;
	function confirmExit() {
		if (pageMode !== JOURNEY_ACTION_MODE.View) return true;
		else return;
	}

    //On init
    useEffect(() => {
        switch (pageMode) {
            case JOURNEY_ACTION_MODE.Create:
                if (!userAccess.includes(USER_CLAIMS.CreateJourneyWrite)) history.push('/error/401');
                setCreateMode(true);
                setEditMode(false);
                setViewMode(false);
                break;

            case JOURNEY_ACTION_MODE.Edit:
                if(!userAccess.includes(USER_CLAIMS.EditJourneyWrite)) history.push("/error/401");
                if (!viewMode) {
                    loadJourneyDetails(id);
                    setGetLoading(true);
                }
                setShowWarningModal(true);
                setCreateMode(false);
                setEditMode(true);
                setViewMode(false);
                break;

            case JOURNEY_ACTION_MODE.View:
                if(!userAccess.includes(USER_CLAIMS.ViewJourneyRead)) history.push("/error/401");
                setCreateMode(false);
                setEditMode(false);
                setViewMode(true);
                setGetLoading(true);
                loadJourneyDetails(id);
                break;
        };
    }, [pageMode]);

    //Navigate away
    useEffect(() => {
        if (history && pageMode !== JOURNEY_ACTION_MODE.View) {
			history.block((prompt: any) => {
				if (showWarningModal) {
					alertNavigateAway(prompt.pathname);
					return false;
				}
			});
		} else {
			history.block(() => { /* TODO document why this arrow function is empty */ });
		}
		return () => {
			history.block(() => {/* TODO document why this arrow function is empty */});
		};
    }, [history, showWarningModal]);

    //Page tab changes
    useEffect(() => {   
        switch(currentTab) {
            case JOURNEY_TAB.infoEventKey:
                setDisabledPrevAction(true)
                setDisabledNextAction(false)
                break;
            case JOURNEY_TAB.campaignListEventKey:
                setDisabledPrevAction(false);
                setDisabledNextAction(true);
                break;
        };
    }, [currentTab]);

    //Functions
    const loadJourneyDetails = async (journeyId: number) => {
        setTimeout(() => {
            const messagingHub = hubConnection.createHubConnenction();
            messagingHub
                .start()
                .then(() => { 
                    const request: JourneyDetailsRequestModel = {
                        journeyId: journeyId,
                        userId: userAccessId.toString(),
                        queueId: Guid.create().toString(),
                    };

                    //Checking state connection
                    if (messagingHub.state === HubConnected) { 
                        RequestJourneyDetails(request).then((response) => {
                            if (response.status === successResponse) {
                                messagingHub.on(request.queueId, message => {
                                    GetJourneyDetails(message.cacheId).then((returnData) => {
                                        let resultData = Object.assign({}, returnData.data as JourneyDetailsResponseModel);

                                        let tempCampaignDetails: Array<CampaignDetailsModel> = [];
                                        if (resultData.journeyCampaignDetailsModel[0].campaignId !== 0) { 
                                            resultData.journeyCampaignDetailsModel.forEach((item) => {
                                                item.cardSelected = false;
                                            });
                                            tempCampaignDetails = resultData.journeyCampaignDetailsModel;
                                        }

                                        const tempJourneyName = resultData.journeyDetailsModel.journeyName ? resultData.journeyDetailsModel.journeyName : '';
                                        setJourneyDetails(resultData.journeyDetailsModel);
                                        setCampaignDetails(tempCampaignDetails);
                                        setCloneJourneyName(tempJourneyName);

                                        const tempJourneyStatus = resultData.journeyDetailsModel.journeyStatus ? resultData.journeyDetailsModel.journeyStatus : '';
                                        customizeStatusBadge(tempJourneyStatus);

                                        setGetLoading(false);
                                        messagingHub.off(request.queueId);
                                        messagingHub.stop();
                                    })
                                    .catch((_error) => {
                                        swal("Failed", "Problem in getting journey details", "error");
                                    })
                                });
                                setTimeout(() => {
                                    if (messagingHub.state === HubConnected) {
                                        setGetLoading(false);
                                        messagingHub.stop();
                                    }
                                }, 30000)
                            }
                        })
                        .catch((_error) => {
                            setGetLoading(false);
                            swal("Failed", "Problem in getting journey details", "error");
                        })
                    }
                })
                .catch((error) => {
                    setGetLoading(false);
                    console.log('Error while starting connection: ' + error);
                })
        }, 1000);
    };

    const customizeStatusBadge = (status: string) => {
        switch (status) {
            case (CAMPAIGN_STATUS_TYPE.Draft):
				setBadgeStyle('badge badge-light-primary');
				break;
            case (CAMPAIGN_STATUS_TYPE.Completed):
                setBadgeStyle('badge badge-light-primary');
                break;
            case CAMPAIGN_STATUS_TYPE.Active:
                setBadgeStyle('badge badge-light-success');
                break;
            case (CAMPAIGN_STATUS_TYPE.Inactive):
                setBadgeStyle('badge badge-light-dark');
                break;
            case CAMPAIGN_STATUS_TYPE.Ended:
                setBadgeStyle('badge badge-light-danger');
                break
            default:
                setBadgeStyle('badge badge-light-dark');
				break;
        }
    };

    const alertNavigateAway = (promptNamePath: any) => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				history.block(() => {/* TODO document why this arrow function is empty */});
				history.push(promptNamePath);
			}
		});
	};

    const handleTabNavigation = (eventKey: any) => {
        setCurrentTab(eventKey);
    };

    const handleAction = (e: any) => {
        const actionType = e.target.ariaLabel;
        if (actionType === handleNext) {
            let nextTab = 0;
            if (currentTab) 
                nextTab =+ currentTab + 1;
            setCurrentTab(nextTab.toString());
            
        } else if (actionType === handlePrev) {
            let prevTab = 0;
		    if (currentTab) 
                prevTab =+ currentTab - 1;
		    setCurrentTab(prevTab.toString());

        }
    };

    const isEmpty = (value: any) => {
		const whatType = typeof value;
		switch (whatType) {
			case dataType.string.toString():
				return Boolean(value.trim() === '' || value === null || value === undefined);
			case dataType.number.toString():
			case dataType.undefined.toString():
			case dataType.object.toString():
				return Boolean(value === 0 || value === null || value === undefined);
			default:
				break;
		}
	};

    const validateFields = () => {
		let isError: boolean = false;
        if (isEmpty(journeyDetails.journeyName)) return (isError = true);
		if (isEmpty(journeyDetails.journeyDescription)) return (isError = true);
        return isError;
	};

    const handleSave = () => {
        if (validateFields()) {
			return swal('Failed', 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		}

        const confirmMsg = 'This action will ' + (createMode ? 'create' : 'update') + ' the Journey Record, please confirm';
        swal({
			title: 'Confirmation',
			text: confirmMsg ,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				setSaveLoading(true);
				setShowWarningModal(false);
				saveJourneyDetails();
			}
		});
    };

    const handleEdit = () => {
        setShowWarningModal(false);
        history.push(`/campaign-management/journey/edit/${journeyDetails.journeyId}`);
    };

    const saveJourneyDetails = async () => {
        setTimeout(() => {
            const messagingHub = hubConnection.createHubConnenction();
            messagingHub
                .start()
                .then(() => {
                    //Checking state connection
                    if (messagingHub.state === HubConnected) { 
                        const campaignIds = campaignDetails ? campaignDetails.map(item => item.campaignId).join(',') : '';
                        const request: SaveJourneyRequestModel = {
                            journeyId: journeyDetails.journeyId !== undefined ? journeyDetails.journeyId : 0,
                            journeyName: journeyDetails.journeyName ? journeyDetails.journeyName : '',
                            journeyDescription: journeyDetails.journeyDescription ? journeyDetails.journeyDescription : '',
                            journeyCampaignIds: campaignIds,
                            queueId: Guid.create().toString(),
                            userId: userAccessId.toString(),
                        };

                        SaveJourney(request).then((response) => {
                            if (response.status === successResponse) {
                               messagingHub.on(request.queueId, (message) => {
                                    let resultData = JSON.parse(message.remarks);

                                    if (resultData && !resultData.Data.IsExists) {
                                        setShowWarningModal(false);

                                        if (resultData.Status === successResponse) {
                                            swal('Success', 'Transaction successfully submitted', 'success');
                                            const savedJourneyId = resultData.Data.JourneyId;
                                            history.push(`/campaign-management/journey/view/${savedJourneyId}`);
                                        } else {
                                            swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
                                        }
                                    } else {
                                        
                                        swal('Failed', 'Unable to record, the Journey Name is already exist', 'error');
                                    }

                                    setSaveLoading(false);

                                    messagingHub.off(request.queueId);
                                    messagingHub.stop();
                                });
                                setTimeout(() => {
                                    if (messagingHub.state === HubConnected) {
                                        setSaveLoading(false);
                                        messagingHub.stop();
                                    }
                                }, 30000);
                            } else {
                                setSaveLoading(false);
								swal('Failed', 'Save journey ' + response, 'error');
							}
                        })
                        .catch((error) => {
                            setSaveLoading(false);
                            swal("Failed", "Problem in saving journey" + error, "error");
                        });
                    }
                })
                .catch((error) => {
                    setSaveLoading(false);
                    console.log('Error while starting connection: ' + error);
                })
        }, 1000);
    }

    return (
        <MainContainer>
            <FormHeader headerLabel={createMode ? 'Create Journey' : (editMode ? 'Edit Journey' : 'View Journey')}></FormHeader>
            <ContentContainer>
                <FormGroupContainer>
                    <div className='col-lg-4 align-items-center'>
						<label className='fw-bolder me-5'>Journey Id: </label>
						<span className='journey-info-field ml-5'>
                            { (viewMode || editMode) && (journeyDetails.journeyId) }
						</span>
					</div>
                    <div className='col-lg-4 align-items-center'>
						<label className='fw-bolder me-5'>Journey Name: </label>
						<span className='journey-info-field ml-5'>
							{ viewMode && (journeyDetails.journeyName) }
                            { editMode && (cloneJourneyName) }
						</span>
					</div>
					<div className='col-lg-4 align-items-center'>
						<label className='fw-bolder me-5'>Journey Status: </label>
						<span className='journey-info-field ml-5'>
                            { (viewMode || editMode) && (
                                <span className={'' + badgeStyle == '' ? '' : badgeStyle} style={{marginLeft: 10}}>
                                    {journeyDetails.journeyStatus} 
                                </span>
                            )}
						</span>
					</div>

                    { (viewMode || editMode) && (
                        <>
                            <div className='col-lg-12 mt-6'></div>
                            <div className='col-lg-3'>
                                <label className='fw-bolder'>Created Date: </label>
                                <div className='col-sm-10'>
                                    <span> {journeyDetails.createdDate == null ? '' : moment(new Date(journeyDetails.createdDate)).format('DD/MM/YYYY HH:mm:ss')} </span>
                                </div>
                            </div>
                            <div className='col-lg-3'>
                                <label className='fw-bolder'>Created By: </label>
                                <div className='col-sm-10'>
                                    <span> {journeyDetails.createdBy == null ? '' : journeyDetails.createdBy} </span>
                                </div>
                            </div>
                            <div className='col-lg-3'>
                                <label className='fw-bolder'>Last Modified Date: </label>
                                <div className='col-sm-10'>
                                    <span> {journeyDetails.updatedDate == null ? '' : moment(new Date(journeyDetails.updatedDate)).format('DD/MM/YYYY HH:mm:ss')} </span>
                                </div>
                            </div>
                            <div className='col-lg-3'>
                                <label className='fw-bolder'>Modified By: </label>
                                <div className='col-sm-10'>
                                    <span> {journeyDetails.updatedBy == null ? '' : journeyDetails.updatedBy} </span>
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div className='col-lg-12 mt-9'></div>
                    <Tabs className='mb-3 journey' id='journey-tab' defaultActiveKey={currentTab} 
                        activeKey={currentTab} onSelect={handleTabNavigation}>
                        <Tab tabClassName='journey-tabitem' eventKey={JOURNEY_TAB.infoEventKey} 
                            title='Information'>
                            <InformationJourney pageMode={pageMode} stateData={journeyDetails} stateChange={setJourneyDetails}/>
						</Tab>
						<Tab tabClassName='journey-tabitem' eventKey={JOURNEY_TAB.campaignListEventKey} 
                            title='Campaign List'>
							<CampaignListJourney pageMode={pageMode} stateData={campaignDetails} stateChange={setCampaignDetails}/>
						</Tab>
                    </Tabs>
                </FormGroupContainer>
            </ContentContainer>
            <FooterContainer>
                <PaddedContainer>
                    <div className='col-lg-12'>
                        {
                            createMode && 
                            (userAccess.includes(USER_CLAIMS.CreateJourneyRead) === true || userAccess.includes(USER_CLAIMS.CreateJourneyWrite) === true) && (
                            <button className="btn btn-primary btn-sm me-2" 
                                type='submit'
                                disabled={saveLoading || getLoading}
                                onClick={handleSave}>
                                {
                                    !saveLoading && (
                                    <span className='indicator-label'> 
                                        {'Save as Draft'}
                                    </span>
                                )}
                                {
                                    saveLoading && (
                                        <span className='indicator-progress' style={{display: 'block'}}>
										    Please wait...
										<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
									</span>
                                )}
                            </button>
                            )
                        }
                        {
                            editMode && 
                            (userAccess.includes(USER_CLAIMS.EditJourneyRead) === true || userAccess.includes(USER_CLAIMS.EditJourneyWrite) === true) && (
                            <button className="btn btn-primary btn-sm me-2" 
                                type='submit'
                                disabled={saveLoading || getLoading}
                                onClick={handleSave}>
                                {
                                    !saveLoading && (
                                    <span className='indicator-label'> 
                                        {'Update Journey'}
                                    </span>
                                )}
                                {
                                    saveLoading && (
                                        <span className='indicator-progress' style={{display: 'block'}}>
										    Please wait...
										<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
									</span>
                                )}
                            </button>
                            )
                        }
                        {
                            viewMode && (
                            <button className="btn btn-primary btn-sm me-2" 
                                type='submit'
                                disabled={getLoading}
                                onClick={handleEdit}>
                                <span className='indicator-label'>Edit Journey</span>
                            </button>
                            )
                        }

                        <button className='btn btn-primary btn-sm me-2 float-end'
                            aria-label="handleNext"
							type='button'
                            onClick={handleAction}
                            disabled={disabledNextAction}>
							Next <FontAwesomeIcon className="nav-next" icon={faChevronRight} />
						</button>
                        <button className='btn btn-primary btn-sm me-2 float-end'
                            aria-label="handlePrev"
							type='button'
                            onClick={handleAction}
                            disabled={disabledPrevAction}>
							<FontAwesomeIcon className="nav-prev" icon={faChevronLeft} /> Previous
						</button>
                    </div>
                </PaddedContainer>
            </FooterContainer>
        </MainContainer>
    )
};