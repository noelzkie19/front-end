import FormSection from "./sections/FormSection";
import SummarySection from "./sections/SummarySection";
import ReviewHistorySection from "./sections/ReviewHistorySection";
import MainContainer from "../../../../custom-components/containers/MainContainer";
import MlabButton from "../../../../custom-components/buttons/MlabButton";
import { ElementStyle, HttpStatusCodeEnum } from "../../../../constants/Constants";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../../../setup";
import { USER_CLAIMS } from "../../../user-management/components/constants/UserClaims";
import { COMMUNICATION_REVIEW_DEFAULT } from "../../constants/CommunicationReviewDefault";
import swal from 'sweetalert';
import * as hubConnection from "../../../../../setup/hub/MessagingHub";
import useConstant from "../../../../constants/useConstant";
import { SaveCommunicationReviewRequestModel } from "../../models/request/communication-review/SaveCommunicationReviewRequestModel";
import { CommunicationReviewModel } from "../../models/CommunicationReviewModel";
import { getCommunicationReviewById, getCommunicationReviewByIdResult, SaveCommunicationReview } from "../../services/CustomerCaseApi";
import { useEffect, useState } from "react";
import { Guid } from "guid-typescript";
import { IAuthState } from "../../../auth";
import useCommunicationReviewConstant from "../../constants/CommunicationReviewConstant";
import { CommunicationReviewHistoryResponseModel } from "../../models/response/communication-review/CommunicationReviewHistoryResponseModel";
import useCommunicationReviewHooks from "../../shared/hooks/useCommunicationReviewHooks";
import { COMMUNICATION_REVIEW_HISTORY_DEFAULT } from "../../constants/CommunicationReviewHistoryDefault";
import { CommunicationReviewAssessmentModel } from "../../models/CommunicationReviewAssessmentModel";
import { CommunicationReviewAssessmentListModel } from "../../models/CommunicationReviewAssessmentListModel";
import { CommunicationReviewAssessmentRequestModel } from "../../models/request/communication-review/CommunicationReviewAssessmentRequestModel";
import MainCategorySection from "./sections/MainCategorySection";
import MiscellaneousSection from "./sections/MiscellaneousSection";
import DrawerSplashscreen from "../../shared/components/DrawerSplashscreen";
import { disableSplashScreenDrawer, enableSplashScreenDrawer } from "../../../../utils/helper";
interface Props {
  communicationReview: CommunicationReviewModel,
  communicationReviewRef: any,
  stateChange: any
}

const CreateCommunicationReview: React.FC<Props> = ({ communicationReview , communicationReviewRef , stateChange }) => {
  const { access, userId } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
  const { HubConnected, successResponse, SwalCommunicationReviewConfirmMessage, SwalSuccessRecordMessage, SwalServerErrorMessage, SwalFailedMessage } = useConstant();
  const { ACTION_MODE, MEASUREMENT_TYPE, ACTION_LABELS, REVIEW_STATUS } = useCommunicationReviewConstant();
  const PaddedDiv = <div style={{ margin: 20 }} />;
  const currentRefData = communicationReviewRef.current;

  /* States */
  const [pageMode, setPageMode] = useState<number>(ACTION_MODE.Create);

  const [communicationReviewInfo, setCommunicationReviewInfo] = useState<CommunicationReviewModel>(COMMUNICATION_REVIEW_DEFAULT);
  const [communicationReviewAssessment, setCommunicationReviewAssessment] = useState<CommunicationReviewAssessmentModel>({
    reviewAssessmentList: [],
    mainCategoryTotalScore: 0,
    mainCategoryTotalHighestCriteriaScore: 0,
    miscellaneousTotalScore: 0
  });
  const [communicationReviewSummary, setCommunicationReviewSummary] = useState<string>('');
  const [commReviewHistoryList, setCommReviewHistoryList] = useState<Array<CommunicationReviewHistoryResponseModel>>([COMMUNICATION_REVIEW_HISTORY_DEFAULT]);

  const [reviewStarted, setReviewStarted] = useState<boolean>(false);
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [dirtyAssessmentForm, setDirtyAssessmentForm] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [withTableScore, setWithTableScore] = useState<boolean>(false);
 
  /* Hooks */
  const {getCommunicationReviewLookups, reviewMeasurementList, getCommunicationReviewHistory, reviewHistoryList} = useCommunicationReviewHooks();

  useEffect(() => {
    if (reviewMeasurementList && reviewMeasurementList.length > 0 && communicationReviewAssessment.reviewAssessmentList.length === 0 && (currentRefData.communicationId == 0 || !currentRefData.reviewStarted)) {
      communicationReviewAssessmentDefaults();
    }
  }, [reviewMeasurementList]);

  /* Mount */
  useEffect(() => {
    getCommunicationReviewLookups();
    getCommunicationReviewHistory(communicationReviewInfo.communicationId, userId?.toString() ?? '0', Guid.create().toString());

    if (communicationReviewRef && communicationReviewRef.current.communicationId === communicationReview.communicationId && communicationReviewRef.current.reviewStarted) {
      applyPreviousStateOnExpand();
    }
    disableSplashScreenDrawer();
  }, []);

  /* Effects */
  useEffect(() => {
    if(communicationReview.communicationId !== 0) {
      communicationReviewRef.current.communicationReviewInfo = communicationReviewInfo;
    }
  }, [communicationReviewInfo]);

  useEffect(() => {
    validateDirtyForm();
    //Don't recalculate when view mode - stick for review score in DB
    if(pageMode !== ACTION_MODE.View && (communicationReviewAssessment.mainCategoryTotalScore !== 0 || communicationReviewAssessment.miscellaneousTotalScore !== 0)) {
      setWithTableScore(true);
      if(communicationReviewAssessment.reviewAssessmentList.filter(d=> d.isAutoFail).length > 0) {
        setReviewScore(0) 
      }else {
        calculateReviewScore(communicationReviewAssessment.mainCategoryTotalScore, communicationReviewAssessment.miscellaneousTotalScore, communicationReviewAssessment.mainCategoryTotalHighestCriteriaScore);
      }
      
    }else if(pageMode !== ACTION_MODE.View && (communicationReviewAssessment.mainCategoryTotalScore === 0 && communicationReviewAssessment.miscellaneousTotalScore === 0)){
      setReviewScore(0)
    }

    if(communicationReview.communicationId !== 0 && communicationReviewAssessment.reviewAssessmentList.length > 0) { 
      communicationReviewRef.current.communicationReviewAssessment = communicationReviewAssessment;
    }
  }, [communicationReviewAssessment]);

  useEffect(() => {
    if(communicationReviewSummary.length > 0 && communicationReview.communicationId !== 0 && currentRefData.reviewStarted) {
      communicationReviewRef.current.summary = communicationReviewSummary;
    }
  }, [communicationReviewSummary]);

  useEffect(() => {
    if(communicationReview.communicationId !== 0) {
      communicationReviewRef.current.reviewStarted = reviewStarted;
    }

    //Cancel Review Behavior
    if((!reviewStarted && dirtyAssessmentForm) || (reviewStarted && pageMode === ACTION_MODE.View)) {
      setPageMode(pageMode === ACTION_MODE.View ? ACTION_MODE.Create : pageMode);
      clearForms();
    }
  }, [reviewStarted])

  useEffect(() => {
    setCommReviewHistoryList(reviewHistoryList);
      return () => {}
  }, [reviewHistoryList])

  /* Functions */
  const calculateReviewScore = (categoryTotalScore: number, miscTotalScore: number, categoryTotalCriteriaScore: number) => {
    const calculateScore = ((categoryTotalScore + miscTotalScore) / categoryTotalCriteriaScore) * 10;
    let newCalculateScore = calculateScore >= 10 ? 10 : calculateScore;
    const score = (newCalculateScore > 0 && categoryTotalCriteriaScore !== 0) ? parseFloat(newCalculateScore.toString()).toFixed(2) : 0;
    setTimeout(() => { setReviewScore(score as number); }, 100);
  };

  const applyPreviousStateOnExpand = () => {
    setReviewStarted(communicationReviewRef.current.reviewStarted);
    setCommunicationReviewSummary(communicationReviewRef.current.summary);
    setCommunicationReviewInfo(communicationReviewRef.current.communicationReviewInfo);
    setTimeout(() => {setCommunicationReviewAssessment(communicationReviewRef.current.communicationReviewAssessment);}, 1000);
  };

  const validateDirtyForm = () => {
    if (communicationReviewAssessment.mainCategoryTotalScore !== 0 || communicationReviewAssessment.miscellaneousTotalScore !== 0 || communicationReviewSummary !== '') {
      setDirtyAssessmentForm(true);
      stateChange(true)
    } else {
      setDirtyAssessmentForm(false);
      stateChange(true)
    }
  };

  const clearForms = () => {
    communicationReviewAssessmentDefaults();
    setCommunicationReviewSummary('');
    setReviewScore(0);
    setDirtyAssessmentForm(false);
    setWithTableScore(false);
  };

  const communicationReviewAssessmentDefaults = () => {
    const initialAssessment: Array<CommunicationReviewAssessmentListModel> = reviewMeasurementList.map((x) => ({
      communicationReviewAssessmentId: 0,
      qualityReviewMeasurementId: x.qualityReviewMeasurementId,
      qualityReviewMeasurementName: x.qualityReviewMeasurementName,
      qualityReviewMeasurementTypeId: x.qualityReviewMeasurementTypeId,
      qualityReviewMeasurementCriteriaId: 0,
      qualityReviewMeasurementScore: 0,
      remarks: '',
      suggestions: '',
      isAutoFail: false
    }));
    const initialModel: CommunicationReviewAssessmentModel = {
      reviewAssessmentList: initialAssessment ?? [],
      mainCategoryTotalScore: 0,
      mainCategoryTotalHighestCriteriaScore: 0,
      miscellaneousTotalScore: 0
    }
    setCommunicationReviewAssessment(initialModel)
  };

  const handleSave = async() => {
    setSaveLoading(true);
    const isRequiredFilled = await validateRequiredAssessmentFormFields();
    if (isRequiredFilled) {
      swal({
        title: SwalCommunicationReviewConfirmMessage.title,
        text: SwalCommunicationReviewConfirmMessage.textSaveConfirm,
        icon: SwalCommunicationReviewConfirmMessage.icon,
        buttons: [SwalCommunicationReviewConfirmMessage.btnNo, SwalCommunicationReviewConfirmMessage.btnYes],
        dangerMode: true,
      }).then((response) => {
        if (response) {
          saveCommunicationReview();
        }
        setSaveLoading(false);
      });
    } else {
      setSaveLoading(false);
    }
  };

  const validateRequiredAssessmentFormFields = async() => {
    let isValid: boolean = false;
    const isCategoryFormFilled = communicationReviewAssessment.reviewAssessmentList
      .filter(x => x.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.main)
      .every(x => x.qualityReviewMeasurementCriteriaId !== 0 && (!x.isAutoFail || (x.isAutoFail && x.remarks !== '')));
    if (isCategoryFormFilled && communicationReviewSummary.length > 0) {
      isValid = true;
    } else {
      swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
    }
    return isValid;
  };

  const saveCommunicationReview = async () => {
    const reviewAssessments: Array<CommunicationReviewAssessmentRequestModel> = communicationReviewAssessment.reviewAssessmentList.map(x => ({
      communicationReviewAssessmentId: x.communicationReviewAssessmentId,
      qualityReviewMeasurementId: x.qualityReviewMeasurementId,
      qualityReviewCriteriaId: x.qualityReviewMeasurementCriteriaId,
      assessmentScore: x.qualityReviewMeasurementScore,
      remarks: x.remarks,
      suggestions: x.suggestions,
    }));
    const request: SaveCommunicationReviewRequestModel = {
      queueId: Guid.create().toString(),
      communicationReviewId: communicationReviewInfo.communicationReviewId,
      caseCommunicationId: communicationReviewInfo.communicationId,
      qualityReviewPeriodId: communicationReviewInfo.reviewPeriodId,
      communicationReviewStatusId: REVIEW_STATUS.reviewed.id,
      communicationRevieweeId: communicationReviewInfo.revieweeId,
      communicationReviewerId: communicationReviewInfo.reviewerId,
      communicationReviewSummary: communicationReviewSummary,
      communicationReviewScore: reviewScore,
      communicationReviewAssessments: reviewAssessments,
      userId: userId?.toString() ?? '0',
    }

    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction();
      messagingHub
        .start()
        .then(() => {
          if (messagingHub.state === HubConnected) {
            SaveCommunicationReview(request).then((response: any) => {
              if (response.status === successResponse) {
                SaveCommunicationReviewPostAction(messagingHub, request);
              }
              else {
                setSaveLoading(false);
                swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
              }
            })
          }
        })
        .catch((error) => {
          setSaveLoading(false);
          swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection, SwalServerErrorMessage.icon);
          console.log('Error while starting connection: ' + error);
        })
    }, 1000);
  };

  const SaveCommunicationReviewPostAction = async (messagingHub: any, request: any) => {
    messagingHub.on(request.queueId, (message: any) => {
      let resultData = JSON.parse(message.remarks);
      if (resultData.Status === successResponse) {
        setReviewStarted(false);
        swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon);
        getCommunicationReviewHistory(communicationReviewInfo.communicationId, (userId ? userId?.toString() : ''),  Guid.create().toString());
      } else {
        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
      }
      setSaveLoading(false);
      messagingHub.off(request.queueId);
      messagingHub.stop();
    });
  };

  const handViewCommunicationHistoryById = (commReviewId: string) => {
    if(commReviewId !== undefined && !communicationReviewRef.current.reviewStarted){
      enableSplashScreenDrawer();
      setPageMode(ACTION_MODE.View);
      viewCommunicationReviewHistory(commReviewId)
    }
  };

  const handleFailedAPIRequest = (response: any, messagingHub: any) => {
    if (response.data.status !== HttpStatusCodeEnum.Ok) {
      messagingHub.stop();
      swal('Failed', response.data.message, 'error');
    }
  };
  const commReviewIdRequest = (id: string) => {
    return {
      queueId: Guid.create().toString(),
      userId : userId ? userId?.toString() : '',
      communicationReviewId: Number(id),
    }
  }
  const viewCommunicationReviewHistory = (id: string) => {
    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction();
      messagingHub
        .start()
        .then(() => {
          // CHECKING STATE CONNECTION
          if (messagingHub.state !== HubConnected) {
            swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
            return;
          }
          // PARAMETER TO PASS ON API GATEWAY //
          const request =  commReviewIdRequest(id);
          // REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
          getCommunicationReviewById(request)
            .then((response) => {
              // IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
              if (response.status != HttpStatusCodeEnum.Ok) {
                handleFailedAPIRequest(response, messagingHub);
                return
              }
              messagingHub.on(request.queueId.toString(), (message) => {
                // CALLBACK API
                getCommunicationReviewByIdResult(message.cacheId)
                  .then((result) => {
                    const resultData = result.data;
                    const reviewDetails : CommunicationReviewModel = {
                      communicationReviewId: resultData.communicationReviewId,
                      caseId: communicationReviewInfo.caseId,
                      communicationId: communicationReviewInfo.communicationId,
                      reviewStatusId: resultData.reviewStatusId,
                      reviewStatus: resultData.reviewStatus,
                      reviewPeriodId: resultData.reviewPeriodId,
                      reviewId: resultData.communicationReviewId,
                      revieweeId: resultData.revieweeId,
                      reviewerId: resultData.reviewerId,
                      reviewer: resultData.reviewer,
                      isRead: resultData.isRead,
                      isPrimary: resultData.isPrimary,
                      reviewSummary: resultData.reviewSummary,
                      totalScore: resultData.totalScore,
                      reviewee: resultData.reviewee,
                      startCommunicationDate: ''
                    };
                    const assessmentList: Array<CommunicationReviewAssessmentListModel> = resultData?.communicationReviewAssessments.map(item => {
                      const selectedMeasurement = reviewMeasurementList.find(x => x.qualityReviewMeasurementId === item.qualityReviewMeasurementId)
                      return {
                        communicationReviewAssessmentId: item.communicationReviewAssessmentId,
                        qualityReviewMeasurementId: item.qualityReviewMeasurementId,
                        qualityReviewMeasurementName: selectedMeasurement?.qualityReviewMeasurementName ?? '',
                        qualityReviewMeasurementTypeId: selectedMeasurement?.qualityReviewMeasurementTypeId ?? 0,
                        qualityReviewMeasurementCriteriaId: item.qualityReviewCriteriaId,
                        qualityReviewMeasurementScore: item.assessmentScore,
                        remarks: item.remarks,
                        suggestions: item.suggestions,
                        isAutoFail: item.isAutoFail
                      }
                    });
                    const reviewAssessment: CommunicationReviewAssessmentModel = {
                      reviewAssessmentList: assessmentList,
                      mainCategoryTotalScore: 0,
                      mainCategoryTotalHighestCriteriaScore: 0, 
                      miscellaneousTotalScore: 0,
                    };
                    disableSplashScreenDrawer();
                    setCommunicationReviewAssessment(reviewAssessment);
                    setCommunicationReviewInfo(reviewDetails);
                    setCommunicationReviewSummary(reviewDetails.reviewSummary ?? "");
                    setReviewScore(resultData.totalScore);
                  })
                  .catch(() => {
                  });
                messagingHub.off(request.queueId.toString());
                messagingHub.stop();
              });

              setTimeout(() => {
                if (messagingHub.state === HubConnected) {
                  messagingHub.stop();
                }
              }, 5000);
            })
            .catch(() => {
              messagingHub.stop();
              swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection,  SwalServerErrorMessage.icon);
            });
        })
        .catch((err) => swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection + err, SwalServerErrorMessage.icon));
    }, 1000);
  };
  
  return (
    <div>
      {/* Splashscren of the drawer */}
      <DrawerSplashscreen />
      <FormSection pageMode={pageMode} 
        stateData={communicationReviewInfo} 
        stateChange={setCommunicationReviewInfo} 
        caseId={communicationReview.caseId} 
        communicationId={communicationReview.communicationId}
        reviewScore={reviewScore}
        reviewStarted={reviewStarted}
        setReviewStarted={setReviewStarted}
        dirtyAssessmentForm={dirtyAssessmentForm}
        reviewHistoryList={reviewHistoryList}
        withTableScore={withTableScore}
      />
      {PaddedDiv}
      <MainCategorySection pageMode={pageMode} stateData={communicationReviewAssessment} stateChange={setCommunicationReviewAssessment} reviewStarted={reviewStarted}/>
      <MiscellaneousSection pageMode={pageMode} stateData={communicationReviewAssessment} stateChange={setCommunicationReviewAssessment} reviewStarted={reviewStarted}/> 
      <SummarySection stateData={communicationReviewSummary} stateChange={setCommunicationReviewSummary} reviewStarted={reviewStarted}/>
      {(access?.includes(USER_CLAIMS.CommunicationReviewerWrite) === true || access?.includes(USER_CLAIMS.CommunicationReviewerRead) === true) && (
        <MainContainer>
          <div style={{ margin: 20 }}>
            <MlabButton
              access={true}
              size={'sm'}
              label={ACTION_LABELS.Submit}
              style={ElementStyle.primary}
              type={'button'}
              weight={'solid'}
              loading={saveLoading}
              loadingTitle={ACTION_LABELS.Loading}
              disabled={!reviewStarted}
              onClick={handleSave}
            />
          </div>
        </MainContainer>
      )}
      {PaddedDiv}
			<ReviewHistorySection  pageMode={1} stateData={commReviewHistoryList} reviewStarted={reviewStarted} viewReviewHistory={handViewCommunicationHistoryById}/>
		</div>
	);
};

export default CreateCommunicationReview;
