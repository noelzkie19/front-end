import { useState } from "react";
import swal from 'sweetalert';
import useConstant from "../../../../constants/useConstant";
import { getCommunicationReviewEventLogByCommId, GetCommunicationReviewLookups, getCriteriaListByMeasurementId, getCommunicationReviewHistoryList, getCommunicationReviewHistoryListResult } from "../../services/CustomerCaseApi";
import { CommunicationReviewLookupsResponseModel } from "../../models/response/communication-review/CommunicationReviewLookupsResponseModel";
import { QualityReviewMeasurementResponseModel } from "../../models/response/communication-review/QualityReviewMeasurementResponseModel";
import { QualityReviewBenchmarkResponseModel } from "../../models/response/communication-review/QualityReviewBenchmarkResponseModel";
import { LookupModel } from "../../../../shared-models/LookupModel";
import { CommunicationReviewEventLogRequestModel } from "../../models/request/communication-review/CommunicationReviewEventLogRequestModel";
import { CommunicationReviewHistoryResponseModel } from "../../models/response/communication-review/CommunicationReviewHistoryResponseModel"; 
import * as hubConnection from  '../../../../../setup/hub/MessagingHub'
import { HttpStatusCodeEnum } from "../../../../constants/Constants";
import { QualityReviewPeriodResponseModel } from "../../models/response/communication-review/QualityReviewPeriodResponseModel";
import { CommunicationReviewCriteriaListResponseModel } from "../../models/response/communication-review/CommunicationReviewCriteriaListResponseModel";
import { CommunicationReviewCriteriaOptionsModel } from "../../models/CommunicationReviewCriteriaOptionsModel";

const useCommunicationReviewHooks = () => { 
    /* Constants */
    const {successResponse, message, SwalTransactionErrorMessage, HubConnected} = useConstant();
    
    /* States */
    const [reviewMeasurementList, setReviewMeasurementList] = useState<Array<QualityReviewMeasurementResponseModel>>([]);
    const [reviewBenchmarkList, setReviewBenchmarkList] = useState<Array<QualityReviewBenchmarkResponseModel>>([]);
    const [reviewPeriodList, setReviewPeriodList] = useState<Array<QualityReviewPeriodResponseModel>>([]);
    const [reviewPeriodOptions, setReviewPeriodOptions] = useState<Array<LookupModel>>([]);
    const [reviewRankingOptions, setReviewRankingOptions] = useState<Array<LookupModel>>([]);
    const [reviewStatus, setReviewStatus] = useState<Array<LookupModel>>([]);
    const [reviewEvent, setReviewEvent] = useState<Array<LookupModel>>([]);
    const [reviewMeasurementType, setReviewMeasurementType] = useState<Array<LookupModel>>([]);
    const [reviewLimit, setReviewLimit] = useState<number>();
    const [criteriaList, setCriteriaList] = useState<Array<CommunicationReviewCriteriaListResponseModel>>([]);
    const [criteriaOptionList, setCriteriaOptionList] = useState<Array<CommunicationReviewCriteriaOptionsModel>>([]); 
    const [commReviewHistoryEventList, setCommReviewHistoryEventList] = useState<Array<CommunicationReviewEventLogRequestModel>>();
    const [reviewHistoryList, setReviewHistoryList] = useState<Array<CommunicationReviewHistoryResponseModel>>([]);
    
    /* Hooks */
    const getCommunicationReviewLookups = () => {
		GetCommunicationReviewLookups()
			.then((response) => {			
                if (response.status === successResponse) {
					const resultData = Object.assign({} as CommunicationReviewLookupsResponseModel, response.data);

                    if (reviewMeasurementList && reviewMeasurementList.length === 0){
                        setReviewMeasurementList(Object.assign(new Array<QualityReviewMeasurementResponseModel>(), resultData.qualityReviewMeasurementList));
                    }
        
                    setReviewBenchmarkList(Object.assign(new Array<QualityReviewBenchmarkResponseModel>(), resultData.qualityReviewBenchmarkList));
                    setReviewPeriodList(Object.assign(new Array<QualityReviewPeriodResponseModel>(), resultData.qualityReviewPeriodList));
                    setReviewRankingOptions(Object.assign(new Array<LookupModel>(), resultData.qualityReviewRankingOptions));
                    setReviewStatus(Object.assign(new Array<LookupModel>(), resultData.communicationReviewStatus));
                    setReviewEvent(Object.assign(new Array<LookupModel>(), resultData.communicationReviewEvent));
                    setReviewMeasurementType(Object.assign(new Array<LookupModel>(), resultData.qualityReviewMeasurementType));
                    setReviewLimit(resultData.qualityReviewLimit);
                    mapReviewPeriodOptions(resultData.qualityReviewPeriodList);
				}
			})
			.catch(() => {
				swal(SwalTransactionErrorMessage.title, message.communicationReview.communicationReviewLookupsError, SwalTransactionErrorMessage.icon);
			});
	};

    const getCriteriaList = (measurementId: number | null) => {
        getCriteriaListByMeasurementId(measurementId)
            .then((response) => {
                if (response.status === successResponse) {
                    const resultData = Object.assign(new Array<CommunicationReviewCriteriaListResponseModel>(), response.data);

                    if(measurementId === null) {
                        createCriteriaOptionList(resultData);
                    }
                    
                    setCriteriaList(resultData);
                }
            })
            .catch(() => {
				swal(SwalTransactionErrorMessage.title, message.communicationReview.communicationReviewCriteriaListError, SwalTransactionErrorMessage.icon);
			});
    };

    const createCriteriaOptionList = (data: Array<CommunicationReviewCriteriaListResponseModel>) => { 
        if (criteriaOptionList && criteriaOptionList.length === 0) {
            if (data && data.length > 0) {
                const newCriteriaOptions = data.map(x => ({
                    ...x,
                    description: `Score - ${x.score} <br /> Ranking - ${x.rankingName} <br /> Description - ${x.code} ${x.criteriaName.replace(/• /g, '<br /> • ')}`,
                }));
                setCriteriaOptionList(newCriteriaOptions);
            }
        }
    };

    const getCommunicationReviewEventLog =(caseCommunicaId : number)=> {
        getCommunicationReviewEventLogByCommId(caseCommunicaId).then((response) => {
            if (response.status === successResponse) {
                setCommReviewHistoryEventList(response.data);
            }
        });
    }

    const getCommunicationReviewHistory = (commId: number, userId: number | string, queueId: string) => {
        const request = {
			communicationId: commId,
			userId: userId,
			queueId: queueId,
		};
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then((response) => {
				getCommunicationReviewHistoryList(request).then((response) => {
					if (response.status !== HttpStatusCodeEnum.Ok) {
						messagingHub.stop();
						return;
					}
					messagingHub.on(request.queueId.toString(), (message) => {
						getCommunicationReviewHistoryListResult(message.cacheId).then(({data}) => {
                           setReviewHistoryList(data)
							messagingHub.off(request.queueId.toString());
							messagingHub.stop();
						});
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 3000);
				});
			});
		}, 1000);
    }


    const mapReviewPeriodOptions =(reviewPeriodList : Array<QualityReviewPeriodResponseModel>) => {
        const reviewOptions: Array<LookupModel> = reviewPeriodList.map(d => {
            return {label: d.qualityReviewPeriodName , value: d.qualityReviewPeriodId.toString() } ; 
        });
        setReviewPeriodOptions(reviewOptions);
    }

    return {
        getCommunicationReviewLookups,
        reviewMeasurementList,
        reviewBenchmarkList,
        reviewPeriodList,
        reviewPeriodOptions,
        reviewRankingOptions,
        reviewStatus,
        reviewEvent,
        reviewMeasurementType,
        reviewLimit,
        getCommunicationReviewHistory,
        reviewHistoryList,
        getCriteriaList,
        criteriaList,
        criteriaOptionList,
        getCommunicationReviewEventLog,
        commReviewHistoryEventList
    };
};

export default useCommunicationReviewHooks;