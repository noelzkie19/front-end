import { useState } from "react";
import { LookupModel, MasterReferenceOptionListModel, MasterReferenceOptionModel } from "../../common/model";
import { GetMasterReferenceList, GetTopicOptionByBrandId, GetTopicOptions } from "../../common/services";
import useConstant from "../../constants/useConstant";
import { SubtopicLanguageOptionModelResponse, TopicLanguageOptionModelResponse } from "../../modules/case-management/models";
import { GetSubtopicLanguageNameById, GetTopicNameByCode } from "../../modules/case-management/services/CustomerCaseApi";
import { LanguageResponseModel } from "../../modules/system/models/LanguageResponseModel";
import { GetTopicOptionsReponse } from "../../modules/system/models/topic/response/GetTopicOptionsReponse";
import { GetLanguageOptionList, getFeedbackCategoryList, getFeedbackCategoryListResult, getFeedbackTypeList, getFeedbackTypeListResult } from "../../modules/system/redux/SystemService";
import { FeedBackTypeResponse, FeedbackCategoryFilterModel, FeedbackCategoryModel, FeedbackTypeFilterModel } from "../../modules/system/models";
import * as hubConnection from '../../../setup/hub/MessagingHub';
import swal from 'sweetalert';
import { useDispatch } from "react-redux";
import * as systemManagement from '../../modules/system/redux/SystemRedux';

const useSystemHooks = () => {

    /**
     *  ? States
     */
    const messagingHub = hubConnection.createHubConnenction();
    
    const [topicOptions, setTopicOptions] = useState<Array<GetTopicOptionsReponse>>([]);
    const [masterReferenceOptions, setMasterReferenceOptions] = useState<Array<MasterReferenceOptionModel>>([]);
    const [languageOptions, setLanguageOptions] = useState<Array<LanguageResponseModel>>([]);
    const [topicLanguage, setTopicLanguage] = useState<Array<TopicLanguageOptionModelResponse>>([]);
    const [subtopicLanguage, setSubtopicLanguage] = useState<Array<SubtopicLanguageOptionModelResponse>>([]);
    const [topicOptionListByBrand, setTopicOptionListByBrand] = useState<Array<LookupModel>>([]);

    /**
     *  ? Constant
     */
    const { successResponse, SwalFailedMessage, SwalFeedbackMessage, SwalServerErrorMessage, HubConnected} = useConstant();
	const dispatch = useDispatch();

    const setFeedbackTypeDispatch = (resultData: any, page: string ) => {
        if (page==='edit'){
            dispatch(systemManagement.actions.getFeedbackTypeList(resultData));
        } else {
            dispatch(systemManagement.actions.getFeedbackTypes(resultData));
        }
    };
    
    const getTopicOptions  = () => {

        GetTopicOptions().then((response) => {
            if (response.status === successResponse) {      
                console.log(response.data)          
                setTopicOptions(response.data)
            }
            else {
                console.log("Problem in Topic list")
            }
        })
        .catch(() => {
            console.log("Problem in Topic list")
        })
    }

    const getMasterReference = (_masterReferenceIdRequest: string) => {
        
        GetMasterReferenceList(_masterReferenceIdRequest)
        .then((response) => {
            if (response.status === successResponse) {
                let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
                let tempList = Array<MasterReferenceOptionModel>();

                masterReferenceList
                    .filter((x: MasterReferenceOptionListModel) => x.isParent === false)
                    .forEach((item) => {
                        const OptionValue: MasterReferenceOptionModel = {
                            masterReferenceParentId: item.masterReferenceParentId,
                            options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()},
                        };
                        tempList.push(OptionValue);
                    });

                setMasterReferenceOptions(tempList);
            } else {
                // disableSplashScreen()
                console.log('Problem in  master reference list');
            }
        })
        .catch(() => {
            //disableSplashScreen()
            console.log('Problem in master reference list');
        });

    }

    const getLanguage = () => {
        GetLanguageOptionList()
        .then((response) => {
            if (response.status === successResponse) {
                let data = Object.assign(new Array<LanguageResponseModel>(), response.data);
                setLanguageOptions(data);
            } else {
                console.log('Problem in getting language List');
            }
        })
        .catch(() => {
            //disableSplashScreen()
            console.log('Problem in message type brand list');
        });
    }

    const getTopicNameByCode = async (languageCode: string, currencyCode: string) =>{
        await GetTopicNameByCode(languageCode, currencyCode)
			.then((response) => {
				if (response.status === successResponse) {
                    setTopicLanguage(response.data)
				} else {
					console.log('Problem in Topic list');
				}
			})
			.catch(() => {
				console.log('Problem in Topic list');
			});
    }

    const getSubtopicLanguageNameById = async (topicId: number, currencyCode: string, languageId: number) => {
        await GetSubtopicLanguageNameById(topicId, currencyCode, languageId)
        .then((response) => {
            if (response.status === successResponse) {
                setSubtopicLanguage(response.data)

            } else {
                console.log('Problem in Subtopic list');
            }
        })
        .catch(() => {
            console.log('Problem in Subtopic list');
        });
    }

    // -- GET FEEDBACK CATEGORY TO BE USED ON DROPDOWN -- //
	const getFeedbackCategoryListInfo = (searchRequest: FeedbackCategoryFilterModel, callback?: any) => {
		messagingHub.start().then(() => {
			getFeedbackCategoryList(searchRequest).then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(searchRequest.queueId.toString(), (message) => {
						getFeedbackCategoryListResult(message.cacheId)
							.then((returnData) => {
                                let feedbackCategoryData = Object.assign(new Array<FeedbackCategoryModel>(), returnData.data);
								dispatch(systemManagement.actions.getFeedbackCategoryList(feedbackCategoryData));
								messagingHub.off(searchRequest.queueId.toString());
								if (callback) {
									callback();
								}
							})
							.catch(() => {
								swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback category'), SwalFailedMessage.icon);
							});
					});
				} else {
					swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
				}
			});
		});
	};

    const getFeedbackTypeListInfo = (request: FeedbackTypeFilterModel, page: string) => {
        setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
						getFeedbackTypeList(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getFeedbackTypeListResult(message.cacheId)
											.then((data) => {
												let resultData = Object.assign(new Array<FeedBackTypeResponse>(), data.data);
                                                setFeedbackTypeDispatch(resultData, page);
											})
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback type'), SwalFailedMessage.icon);
							});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);    
    }

    const getTopicOptionsByBrandId = (_brandId: number) => {
        GetTopicOptionByBrandId(_brandId).then((response) => {
            if (response.status === successResponse) {
                setTopicOptionListByBrand(response.data);
            }
        }).catch((ex) => console.log('problem in fetching topic list' + ex));
    }

  return {getTopicOptions,topicOptions, getMasterReference, masterReferenceOptions, getLanguage, languageOptions,getTopicNameByCode,topicLanguage, getSubtopicLanguageNameById, subtopicLanguage,
    getFeedbackCategoryListInfo, getFeedbackTypeListInfo, getTopicOptionsByBrandId, topicOptionListByBrand};
};

export default useSystemHooks;
