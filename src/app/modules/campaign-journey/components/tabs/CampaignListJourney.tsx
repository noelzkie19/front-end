import Select from "react-select";
import { useEffect, useState } from "react";
import { InputGroup } from "react-bootstrap-v5";
import { FieldContainer } from "../../../../custom-components";
import { HttpStatusCodeEnum } from "../../../../constants/Constants";
import { CampaignCards } from "./CampaignCards";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import * as campaign from '../.././/../campaign-management/redux/CampaignManagementRedux';
import { getAllCampaignBySearchFilter, getAllCampaignType, getSearchFilter } from "../../../campaign-management/redux/CampaignManagementService";
import { LookupModel } from '../../../../common/model';
import { RootState } from "../../../../../setup";
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import swal from 'sweetalert';
import { GetJourneyCampaignDetails, GetJourneyCampaignNames } from '../../services/CampaignJourneyApi';
import useConstant from "../../../../constants/useConstant";
import { GetCampaignDetailsResponseModel } from "../../models/response/GetCampaignDetailsResponseModel";
import { CampaignDetailsModel } from "../../models/CampaignDetailsModel";
import { JOURNEY_ACTION_MODE, JOURNEY_CAMPAIGN_LIMIT } from "../../constants/Journey";

interface ICampaignListJourney {
    pageMode: number
	stateData: Array<CampaignDetailsModel>,
	stateChange: any
}

export const CampaignListJourney: React.FC<ICampaignListJourney> = ({pageMode, stateData, stateChange}) => {
    
    const dispatch = useDispatch();
    const {HubConnected, successResponse} = useConstant();

    const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

    const [createMode, setCreateMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<boolean>(false);

    const [addLoading, setAddLoading] = useState<boolean>(false);
    const [disableAdd, setDisableAdd] = useState<boolean>(true);
    const [disableRemove, setDisableRemove] = useState<boolean>(true);

    const campaignType = useSelector<RootState>(({campaign}) => campaign.getCampaignType,shallowEqual) as LookupModel[];
    const preCampaignType = useSelector<RootState>(({ campaign }) => campaign.getSearchFilter, shallowEqual) as Array<LookupModel>;

    const [filterCampaignType, setFilterCampaignType] = useState<LookupModel | null>();
    const [filterPreCampaignName, setFilterPreCampaignName] = useState<LookupModel | null>();
    const [filterCampaignName, setFilterCampaignName] = useState<Array<LookupModel>>([]);

    const [optionsCampaignType, setOptionsCampaignType] = useState<Array<LookupModel>>([]);
    const [optionsCampaignName, setOptionsCampaignName] = useState<Array<LookupModel>>([]);
    const [loadingCampaignName, setLoadingCampaignName] = useState<boolean>(false);

    useEffect(() => {
        switch (pageMode) {
            case JOURNEY_ACTION_MODE.Create:
                setCreateMode(true);
                setEditMode(false);
                setViewMode(false);
                loadCampaignTypeOptions();
                loadPreCampaignNameOptions();   
                break;
            case JOURNEY_ACTION_MODE.Edit:
                setCreateMode(false);
                setEditMode(true);
                setViewMode(false);
                loadCampaignTypeOptions();
                loadPreCampaignNameOptions();
                break;
            case JOURNEY_ACTION_MODE.View:
                setCreateMode(false);
                setEditMode(false);
                setViewMode(true);
                break
        };
    }, [pageMode]);

    useEffect(() => {
        if (filterPreCampaignName != undefined || filterCampaignType != undefined) {
            setOptionsCampaignName([]);
            setFilterCampaignName([]);
            setDisableAdd(true);
            loadCampaignNameOptions();
        }
    }, [filterCampaignType, filterPreCampaignName])

    // Functions
    const loadCampaignTypeOptions = () => {
        if (campaignType != undefined && campaignType.length == 0) {
          getAllCampaignType().then((response) => {
            if (response.status === successResponse) {
              setOptionsCampaignType(response.data);
              dispatch(campaign.actions.getCampaignType(response.data))
            } 
          })
        }
        else {
            setOptionsCampaignType(campaignType);
        }
    };

    const loadPreCampaignNameOptions = () => {
        getSearchFilter().then((response) => {
            if (response.status === successResponse) {
              dispatch(campaign.actions.getSearchFilter([...response.data]))
              let options = response.data.find(a => a.label == "All");
              setFilterPreCampaignName(options);
            }
        });
    };

    const loadCampaignNameOptions = () => {
        let campaignTypeFilter = filterCampaignType?.value != undefined ? parseInt(filterCampaignType?.value.toString()) : 0;
        let preCampaignNameFilter = (filterPreCampaignName?.value != undefined ? parseInt(filterPreCampaignName?.value) : null);
        
        if (campaignTypeFilter == 0 || preCampaignNameFilter == null) {
            return false;
        } else {
            setLoadingCampaignName(true);
            GetJourneyCampaignNames('CampaignName', preCampaignNameFilter, campaignTypeFilter).then((response) => {
                if (response.status === successResponse) {
                    setLoadingCampaignName(false);
                    let resultData = Object.assign(new Array<LookupModel>(), response.data);
                    setOptionsCampaignName(resultData);
                    dispatch(campaign.actions.getCampaignName([...resultData]));
                }
            });
        }   
    };

    const getAddCampaignList = async (newCampaignIds: string) => {
        const messagingHub = hubConnection.createHubConnenction();
            messagingHub
                .start()
                .then(() => {
                    //Checking state connection
                    if (messagingHub.state == HubConnected) { 
                        GetJourneyCampaignDetails(newCampaignIds).then((response) => {
                            if (response.status === successResponse) {

                                let campaignDetails = Object.assign(new Array<GetCampaignDetailsResponseModel>(), response.data);

                                campaignDetails.forEach(item => {
                                    const details: CampaignDetailsModel = {
                                        campaignId: item.campaignId,
                                        campaignName: item.campaignName,
                                        campaignStatus: item.campaignStatus,
                                        campaignPlayerCount: item.campaignPlayerCount,
                                        campaignEligibility: item.campaignEligibility,
                                        campaignPrimaryGoalCount: item.campaignPrimaryGoalCount,
                                        campaignCallListCount: item.campaignCallListCount,
                                        cardSelected: false
                                    }
                                    stateData.push(details);
                                });

                                stateChange([...stateData]);

                                setAddLoading(false);
                                resetFilterValues();

                            } else {
                                setAddLoading(false);
								swal('Failed', 'Request journey campaign list' + response, 'error');
							}
                        })
                        .catch((error) => {
                            setAddLoading(false);
                            swal("Failed", "Problem in requesting journey campaign list", "error");
                        });
                    }
                })
                .catch((error) => {
                    setAddLoading(false);
                    console.log('Error while starting connection: ' + error);
                })
    };

    const handleFilterCampaignType = (val: LookupModel) => {
        if (val != undefined) {
            setFilterCampaignType(val);
          } 
          else{
            setFilterCampaignType(val);
            setFilterCampaignName([]);
            setDisableAdd(true);
          }
    };

    const handleFilterPreCampaignName = (val: LookupModel) => {
        setFilterPreCampaignName(val);
    };

    const handleFilterCampaignName = (val: Array<LookupModel>) => {
        setFilterCampaignName(val);
        const disabler: boolean = val.length != 0 ? false : true;
        setDisableAdd(disabler);
    };

    const resetFilterValues = () => {
        setFilterCampaignType(null);
        setFilterPreCampaignName(preCampaignType[0]);
        setFilterCampaignName([]);

        //Reset card selection
        stateData.forEach(item => item.cardSelected = false );
        stateChange([...stateData]);
    };

    const handleAdd = () => {
        //create validation of existing mapping of campaign not allowed
        let campaignExists: boolean = false;
        filterCampaignName.map((item: any) => {
            const campaignCheck = stateData.find(x => x.campaignId === item.value);
            if (campaignCheck) {
                campaignExists = true;
            }
        });

        if (!campaignExists) {
            const campaignCount = stateData.length + filterCampaignName.length;
            if (campaignCount <= JOURNEY_CAMPAIGN_LIMIT.MaxCampaignCards) {
                const newCampaignIds = filterCampaignName.map((item: any) => item.value).join(',');
                getAddCampaignList(newCampaignIds);
                setAddLoading(true);
            } else {
                swal('Failed', 'Exceeded the 25 max limit per journey', 'error');
            }
            
        } else {
            swal('Failed', 'Campaign name/s added already exists', 'error');
        }
    };

    const handleRemove = () => {
        let newCards: any = [];
            stateData.filter((item: any, i: number) => {
                if (item.cardSelected !== true)
                    newCards.push(item);
            });
            stateChange([...newCards]);
            setDisableRemove(true);
    };

    const handlePress = (index: number) => {
        if (createMode || editMode) {
            stateData.find((item: any, i: number) => {
                item.cardSelected = (index === i ? !item.cardSelected : item.cardSelected);
            })
            stateChange([...stateData]);

            const checker = stateData.filter((item) => item.cardSelected);
            const disabler = checker.length != 0 ? false : true;
            setDisableRemove(disabler);
        }
    };

    return (
        <FieldContainer>
            <FieldContainer>
                <div className="col-lg-3 mt-6">
				    <label>Campaign Type</label>
				    <Select isClearable={true}
				    	size='small'
				    	options={optionsCampaignType}
				    	style={{width: '100%'}}
                        isDisabled={viewMode}
				    	onChange={handleFilterCampaignType}
				    	value={filterCampaignType} />
                </div>
                <div className='col-lg-6 mt-6'>
				    <label>Campaign Name</label>
				    <InputGroup>
				    	<div className='col-sm-3'>
				    		<Select isClearable={true}
				    			size='small'
				    			options={preCampaignType}
                                isDisabled={viewMode}
				    			onChange={handleFilterPreCampaignName}
				    			value={filterPreCampaignName}
				    		/>
				    	</div>
				    	<div className='col-sm-9'>
				    		<Select isClearable={true}
				    			isLoading={loadingCampaignName}
				    			isMulti
				    			size='small'
				    			options={optionsCampaignName}
                                isDisabled={viewMode}
				    			onChange={handleFilterCampaignName}
				    			value={filterCampaignName}
				    		/>
				    	</div>
				    </InputGroup>
                </div>
            </FieldContainer>
            <FieldContainer>
                <div className="col-lg-12 mt-3">
                    <button className='btn btn-primary btn-sm me-2'
                        type='button' 
                        disabled={viewMode || disableAdd || addLoading}
                        onClick={handleAdd}>
                        {
                            !addLoading && (
                            <span className='indicator-label'> 
                                Add Campaign
                            </span>
                        )}
                        {
                            addLoading && (
                                <span className='indicator-progress' style={{display: 'block'}}>
								    Please wait...
								<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
							</span>
                        )}
                    </button>
                    <button className='btn btn-primary btn-sm me-2'
                        aria-label="handleRemove"
                        type='button' 
                        disabled={viewMode || disableRemove}
                        onClick={handleRemove}>
                        Remove Campaign
                    </button>
                </div>
                <div className="col-lg-12 mt-3"></div>
            </FieldContainer>
            <FieldContainer>
                <CampaignCards campaignList={stateData} onPress={handlePress}/>
            </FieldContainer>
        </FieldContainer>
    )
};