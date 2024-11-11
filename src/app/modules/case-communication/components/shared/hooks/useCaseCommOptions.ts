import { useState } from "react";
import { CaseTypeOptionModel, FeedbackAnswerOptionModel, FeedbackAnswerOptionRequestModel, FeedbackCategoryOptionModel, MessageResponseOptionModel, MessageStatusOptionModel, MessageTypeOptionModel, OptionListModel, SubtopicOptionModel } from "../../../../../common/model";
import { GetCaseTypeOptionList, GetFeedbackAnswerOptionById, GetFeedbackCategoryOptionById, GetFeedbackTypeOptionList, GetMessageResponseOptionById, GetMessageStatusOptionById, GetMessageTypeOptionList, GetSubtopicOptionById, GetTopicOptionList } from "../../../../../common/services";
import useConstant from "../../../../../constants/useConstant";

const useCaseCommOptions = () => {

    /**
     *  ? Constants
     */
    const { successResponse } = useConstant()
    

    /**
     * ? States
     */
     const [topicOptionList, setTopicOptionList] = useState<Array<OptionListModel>>([])
     const [subtopicOptionList, setSubTopicOptionList] = useState<Array<OptionListModel>>([])
     const [feedbackAnswerOptionList, setFeedbackAnswerOptionList] = useState<Array<FeedbackAnswerOptionModel>>([]);
     const [feedbackAnswerLoading, setFeedbackAnswerLoading] = useState<boolean>(false);
     const [caseTypeOptionsList, setCaseTypeOptionsList] = useState<Array<OptionListModel>>([])
     const [messageTypeOptionList, setMessageTypeOptionList] = useState<Array<OptionListModel>>([])
     const [messageStatusOptionList, setMessageStatusOptionList] = useState<Array<OptionListModel>>([])
     const [messageResponseOptionList, setMessageResponseOptionList] = useState<Array<OptionListModel>>([])
     const [feedbackTypeOptionList, setFeedbackTypeOptionList] = useState<Array<OptionListModel>>([])
     const [feedbackCategoryOptionList, setFeedbackCategoryOptionList] = useState<Array<OptionListModel>>([])
     
     
    /**
     * ? Methods
     */
    const getTopicOptions  = () => {
          GetTopicOptionList().then((response) => {
            if (response.status === successResponse) {     
                let tempList = Array<OptionListModel>();
                response.data.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.topicId,
                        label: item.topicName,
                    };
                    tempList.push(OptionValue)
                })
                setTopicOptionList(tempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ))
                
            }
            else {
                console.log("Problem in Topic list")
            }
        })
        .catch(() => {
            console.log("Problem in Topic list")
        })
    }

    const getSubtopicOptions = (topicId : number) => {

        GetSubtopicOptionById(topicId).then((response) => {
            if (response.status === successResponse) {
                let subTopicsOpt = Object.assign(new Array<SubtopicOptionModel>(), response.data);
                
                let tempSubtopicList = Array<OptionListModel>();
    
                subTopicsOpt.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.subtopicId,
                        label: item.subtopicName,
                    };
                    tempSubtopicList.push(OptionValue)
                })

                setSubTopicOptionList(tempSubtopicList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));

            }
            else {
                console.log("Problem in currency brand list")
            }
        })
        .catch(() => {
            console.log("Problem in currency brand list")
        })
    }

    const getFeedbackAnserOptions = (_feedbackTypeId: string,_feedbackCategoryId : string, _feedbackFilter: string) => {

        const request : FeedbackAnswerOptionRequestModel = {
            feedbackTypeId : _feedbackTypeId,
            feedbackCategoryId: _feedbackCategoryId,
            feedbackFilter: _feedbackFilter
        }
        setFeedbackAnswerLoading(true)
        GetFeedbackAnswerOptionById(request)
				.then((response) => {
					if (response.status === successResponse) {
                        setFeedbackAnswerOptionList(response.data)
                        setFeedbackAnswerLoading(false)
					} else {
                        setFeedbackAnswerLoading(false)
					}
				})
				.catch(() => {
					//disableSplashScreen()
					console.log('Problem in category answer list');
                    setFeedbackAnswerLoading(false)
				});
    }

    const getCaseTypeOptionList = () => {
        
        GetCaseTypeOptionList().then((response) => {
            if (response.status === successResponse) {
                let topics = Object.assign(new Array<CaseTypeOptionModel>(), response.data);
                
                let tempCaseList = Array<OptionListModel>();
    
                topics.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.caseTypeId,
                        label: item.caseTypeName,
                    };
                    tempCaseList.push(OptionValue)
                })

                setCaseTypeOptionsList(tempCaseList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));

            }
            else {
                console.log("Problem in Case type list")
            }
        })
        .catch(() => {
            console.log("Problem in Case type list")
        })
    }

    const getMessageTypeOptionList = () => {

        GetMessageTypeOptionList()
        .then((response) => {
            if (response.status === successResponse) {
                let messageTypes = Object.assign(new Array<MessageTypeOptionModel>(), response.data);    
                let tempList = Array<OptionListModel>();
    
                messageTypes.forEach((item) => {
                    const OptionValue: OptionListModel = {
                        value: item.messageTypeId,
                        label: item.messageTypeName,
                    };
                    tempList.push(OptionValue);
                });
    
                setMessageTypeOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
            } else {
                console.log('Problem in message type list');
            }
        })
        .catch(() => {
            console.log('Problem in message type brand list');
        });

    }

    const getMessageStatusOptionById = (messageTypeId: number) => {
        GetMessageStatusOptionById(messageTypeId).then((response) => {
            if (response.status === successResponse) {
             
                let messageStatus = Object.assign(new Array<MessageStatusOptionModel>(), response.data);
                let tempStatusList = Array<OptionListModel>();
                messageStatus.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.messageStatusId,
                        label: item.messageStatusName,
                    };
                    tempStatusList.push(OptionValue)
                })

                setMessageStatusOptionList(tempStatusList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));
            }
            else {
                console.log("Problem in message status list")
            }
        })
        .catch(() => {
            console.log("Problem in message status list")
        })
    }

    const getMessageResponseOptionById = (messageStatusId: number) => {
        GetMessageResponseOptionById(messageStatusId)
        .then((response) => {
            if (response.status === successResponse) {
                let messageResponse = Object.assign(new Array<MessageResponseOptionModel>(), response.data);
                let tempRespList = Array<OptionListModel>();
                messageResponse.forEach((item) => {
                    const OptionValue: OptionListModel = {
                        value: item.messageResponseId,
                        label: item.messageResponseName,
                    };
                    tempRespList.push(OptionValue);
                });

                setMessageResponseOptionList(tempRespList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
            } else {
                console.log('Problem in message response list');
            }
        })
        .catch(() => {
            console.log('Problem in message response list');
        });
    }

    const getFeedbackTypeOptionList = () => {
        GetFeedbackTypeOptionList().then((response) => {
            if (response.status === successResponse) {            
                let tempList = Array<OptionListModel>();
                response.data.forEach((item : any) => {
                    const OptionValue: OptionListModel = {
                        value: item.feedbackTypeId,
                        label: item.feedbackTypeName,
                    };
                    tempList.push(OptionValue)
                })

                setFeedbackTypeOptionList(tempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));
            }
            else {
                // disableSplashScreen()
                console.log("Problem in message type list")
            }
        })
        .catch(() => {
            //disableSplashScreen()
            console.log("Problem in message type brand list")
        })
    }

    const getFeedbackCategoryOptionById = (feedbackTypeId : number) => {
        GetFeedbackCategoryOptionById(feedbackTypeId).then((response) => {
            if (response.status === successResponse) {
                let feedCategory = Object.assign(new Array<FeedbackCategoryOptionModel>(), response.data);
                let tempCategoryList = Array<OptionListModel>();
                feedCategory.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.feedbackCategoryId,
                        label: item.feedbackCategoryName,
                    };
                    tempCategoryList.push(OptionValue)
                })

                setFeedbackCategoryOptionList(tempCategoryList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));

            }
            else {
                console.log("Problem in feedback category list")
            }
        })
        .catch(() => {
            console.log("Problem in feedback category list")
        })
    }

    return {
        getTopicOptions,
        topicOptionList,
        getSubtopicOptions,
        subtopicOptionList,
        getFeedbackAnserOptions,
        feedbackAnswerOptionList,
        feedbackAnswerLoading,
        getCaseTypeOptionList,
        caseTypeOptionsList,
        getMessageTypeOptionList,
        messageTypeOptionList,
        getMessageStatusOptionById,
        messageStatusOptionList,
        getMessageResponseOptionById,
        messageResponseOptionList,
        getFeedbackTypeOptionList,
        feedbackTypeOptionList,
        getFeedbackCategoryOptionById,
        feedbackCategoryOptionList
    }
};

export default useCaseCommOptions;
