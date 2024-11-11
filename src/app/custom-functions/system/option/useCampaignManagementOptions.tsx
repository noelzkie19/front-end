import { useState } from "react";
import { MasterReferenceOptionListModel, MasterReferenceOptionModel } from "../../../common/model";
import { LookupModel } from "../../../common/model/LookupModel";
import { GetMasterReferenceList } from "../../../common/services";
import { HttpStatusCodeEnum } from "../../../constants/Constants";
import { CampaignGoalSettingListModel } from "../../../modules/campaign-management/models/response/CampaignGoalSettingListModel";
import { getCampaignGoalSettingList, getCampaignLookUp } from "../../../modules/campaign-management/redux/CampaignManagementService";
import { getTaggingUsers } from "../../../modules/campaign-setting/redux/AutoTaggingService";
import { UserSelectionModel } from "../../../modules/campaign-setting/setting-auto-tagging/models/UserSelectionModel";

const useCampaignManagementOptions = () => {
    const [campaignAutotaggingOptions, setCampaignAutotaggingOptions] = useState<Array<LookupModel>>([]);
    const [campaignGoalParameterPointOptions, setcampaignGoalParameterPointOptions] = useState<Array<LookupModel>>([]);
    const [campaignGoalParamaterValueOptions, setCampaignGoalParamaterValueOptions] = useState<Array<LookupModel>>([]);
    const [campaignTagginUserOptions, setCampaignTaggingUserOptions] = useState<Array<UserSelectionModel>>([]);
    const [campaignGoalOptions, setCampaignGoalOptions] = useState<Array<CampaignGoalSettingListModel>>([]);
    const [masterReferenceOptions, setMasterReferenceOptions] = useState<Array<MasterReferenceOptionModel>>([]);

    const USERS_SUB_MODULE_ID = 21;
    const getCampaignAutotaggingOptions = () => {
        getCampaignLookUp().then((response) => {
            if (response.status === HttpStatusCodeEnum.Ok) {
                setCampaignAutotaggingOptions(response.data.autoTaggingSettting);
            }
        })
    }
    const getCampaignGoalParameterPointOptions = () => {
        getCampaignLookUp().then((goalParam) => {
            if (goalParam.status === HttpStatusCodeEnum.Ok) {
                setcampaignGoalParameterPointOptions(goalParam.data.goalParameterPointSetting);
            }
        })
    }
    const getCampaignGoalParameterValueOptions = () => {
        getCampaignLookUp().then((goalParam) => {
            if (goalParam.status === HttpStatusCodeEnum.Ok) {
                setCampaignGoalParamaterValueOptions(goalParam.data.goalParameterValueSetting);
            }
        })
    }
    const getCampaignTaggingUserOptions = () => {
        getTaggingUsers(USERS_SUB_MODULE_ID).then((user) => {
            if (user.status === HttpStatusCodeEnum.Ok) {
              let resultData = Object.assign(new Array<UserSelectionModel>(), user.data);
              setCampaignTaggingUserOptions(resultData);
            }
          });
    }
	const getCampaignGoalSettingOptions = () => {
		getCampaignGoalSettingList().then((campaignGoal) => {
			if (campaignGoal.status === HttpStatusCodeEnum.Ok) {
				setCampaignGoalOptions(campaignGoal.data);
			}
		});
	};
    const getMasterReferenceOptions = (masterReferenceIdRequest: string) => {
        GetMasterReferenceList(masterReferenceIdRequest)
            .then((masterRef) => {
                if (masterRef.status !== HttpStatusCodeEnum.Ok) { return }
                let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), masterRef.data);
                let tempMasterList = Array<MasterReferenceOptionModel>();
                masterReferenceList
                    .filter((x: MasterReferenceOptionListModel) => x.isParent === false)
                    .forEach((item) => {
                        const OptionValue: MasterReferenceOptionModel = {
                            masterReferenceParentId: item.masterReferenceParentId,
                            options: { label: item.masterReferenceChildName, value: item.masterReferenceId.toString() },
                        };
                        tempMasterList.push(OptionValue);
                    });

                setMasterReferenceOptions(tempMasterList);
            })
    }
    return {
          getCampaignAutotaggingOptions,campaignAutotaggingOptions
        , getCampaignGoalParameterPointOptions,campaignGoalParameterPointOptions
        , getCampaignGoalParameterValueOptions,campaignGoalParamaterValueOptions
        , getCampaignTaggingUserOptions,campaignTagginUserOptions
        , getCampaignGoalSettingOptions,campaignGoalOptions
        , getMasterReferenceOptions, masterReferenceOptions
    };

};

export default useCampaignManagementOptions;
