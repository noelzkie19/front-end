import { useContext, useState } from "react";
import useConstant from "../../../../constants/useConstant";
import { PCSCommunicationSummaryActionResponseModel } from "../../models";
import { GetAllActiveCampaignByUsername, GetEditCustomerServiceCaseCampainNameByUsername, sendGetPCSCommunicationSummaryAction } from "../../services/CustomerCaseApi";
import { getAllCampaign } from "../../../campaign-management/redux/CampaignManagementService";
import { LookupModel } from "../../../../common/model";
import useCaseManagementConstant from "../../useCaseManagementConstant";
import { GetGridColumnDisplayRequestModel } from "../../models/request/GetGridColumnDisplayRequestModel";
import { CaseCommunicationContext } from "../../context/CaseCommunicationContext";

export const useCaseManagementHooks = () => {
    /**
     * Add your hooks here for case management hooks only
     */
    const [communicationProviderOptions, setCommunicationProviderOptions] = useState<Array<any>>([]);
	const [skillOptions, setSkillOptions] = useState<Array<any>>([]);
	const [actionOptions, setActionOptions] = useState<Array<PCSCommunicationSummaryActionResponseModel>>([]);
	const [campaignOptions, setCampaignOptions] = useState<Array<LookupModel>>([]);

	const {successResponse} = useConstant();
	const {hooksMessages} = useCaseManagementConstant();
	const { getGridColumnDisplayAsync } = useContext(CaseCommunicationContext)
	
	
    
    /**
	 *  ? Methods
	 */
	const getCommunicationProviders = () => {
		const communicationProviderResponse = [{
			label : 'Communication Provider 1',
			value : '1'
		},{
			label : 'Communication Provider 2',
			value : '2'
		}]
		setCommunicationProviderOptions(communicationProviderResponse)
	}

	const getSkillOptions = () => {
		const skillResponse = [{
			label : 'skill 1',
			value : '1'
		},{
			label : 'skill 2',
			value : '2'
		}]
		setSkillOptions(skillResponse)
	}

	const getActionOptions = () => {
		sendGetPCSCommunicationSummaryAction().then((response) => {
            if (response.status === successResponse) {
                setActionOptions(response.data)
            } else {
                console.log(hooksMessages.getActionOptionsErrorMessage);
            }
        })
        .catch(() => {
            console.log(hooksMessages.getActionOptionsErrorMessage);
        });
	}

	const getAllCampaignOptions = () => {
		getAllCampaign().then(response => {
			if (response.status === successResponse) {
                setCampaignOptions(response.data);
            } else {
                console.log(hooksMessages.getAllCampaignErrorMessage);
            }
		}).catch(() => {
            console.log(hooksMessages.problemConnectingToServerErrorMessage);
        });
	}

	const getAllActiveCampaignByUsername = (username: string) => {
		GetAllActiveCampaignByUsername(username)
		.then((response: any) => {
			if(response.status === successResponse) {
				let tempList = Array<LookupModel>();
				response.data.forEach((item: any) => {
					const OptionValue: LookupModel = {
						value: item.campaignId,
						label: item.campaignName,
					};
					tempList.push(OptionValue);
				});
				setCampaignOptions(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
			} else {
				console.log(hooksMessages.getAllActiveCampaignErrorMessage);
			}
		})
		.catch(() => {
			console.log(hooksMessages.problemConnectingToServerErrorMessage);
		});
	}

	const getEditServiceCaseCampaignByUsername = (username: string, brandId: number) => {
		GetEditCustomerServiceCaseCampainNameByUsername(username, brandId)
		.then((response: any) => {
			if(response.status === successResponse) {
				let tempList = Array<LookupModel>();
				response.data.forEach((item: any) => {
					const OptionValue: LookupModel = {
						value: item.campaignId.toString(),
						label: item.campaignName,
					};
					tempList.push(OptionValue);
				});
				setCampaignOptions(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
			} else {
				console.log(hooksMessages.getAllActiveCampaignErrorMessage);
			}
		})
		.catch(() => {
			console.log(hooksMessages.problemConnectingToServerErrorMessage);
		});
	}

	const getGridAndFilterDisplay = (defaultFilter: any, defaultColumns: any, userId: any) => {
		const gridColumnRequest: GetGridColumnDisplayRequestModel = {
			defaultColumns: defaultColumns,
			userId: userId,
			defaultFields: defaultFilter
		}
		getGridColumnDisplayAsync(gridColumnRequest)
	}

  return {getCommunicationProviders, communicationProviderOptions,getSkillOptions,skillOptions,getActionOptions, actionOptions, getAllCampaignOptions, campaignOptions, getAllActiveCampaignByUsername, getEditServiceCaseCampaignByUsername , getGridAndFilterDisplay};
};
