import {useEffect, useState } from "react";
import swal from 'sweetalert';
import {Col, Row, Toast} from 'react-bootstrap';
import MainContainer from "../../../../../custom-components/containers/MainContainer";
import BasicFieldLabel from "../../../../../custom-components/labels/BasicFieldLabel";
import BasicTextInput from "../../../../../custom-components/text-fields/BasicTextInput";
import RequiredLabel from "../../../../../custom-components/labels/RequiredLabel";
import Select from 'react-select';
import MlabButton from "../../../../../custom-components/buttons/MlabButton";
import { ElementStyle } from "../../../../../constants/Constants";
import { right } from "@popperjs/core";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../../../../setup";
import { USER_CLAIMS } from "../../../../user-management/components/constants/UserClaims";
import useCommunicationReviewHooks from "../../../shared/hooks/useCommunicationReviewHooks";
import { CommunicationReviewModel } from "../../../models/CommunicationReviewModel";
import useUserOptionList from "../../../../../custom-functions/user/useUserOptionList";
import { LookupModel } from "../../../../../common/model/LookupModel";
import { IAuthState } from "../../../../auth";
import useConstant from "../../../../../constants/useConstant";
import * as hubConnection from "../../../../../../setup/hub/MessagingHub";
import { InsertCommunicationReviewEventLog, ValidateCommunicationReviewLimit } from "../../../services/CustomerCaseApi";
import { CommunicationReviewEventLogRequestModel } from "../../../models/request/communication-review/CommunicationReviewEventLogRequestModel";
import useCommunicationReviewConstant from "../../../constants/CommunicationReviewConstant";
import { CommunicationReviewLimitRequestModel } from "../../../models/request/communication-review/CommunicationReviewLimitRequestModel";
import { QualityReviewBenchmarkResponseModel } from "../../../models/response/communication-review/QualityReviewBenchmarkResponseModel";
import '../../../css/CommunicationReview.css'
import { CommunicationReviewHistoryResponseModel } from "../../../models/response/communication-review/CommunicationReviewHistoryResponseModel";

interface Props {
	pageMode: number,
	stateData: CommunicationReviewModel, //Model
	stateChange: any,
  caseId: number,
  communicationId: number,
  reviewScore: number,
  reviewStarted: boolean,
  setReviewStarted: any,
  dirtyAssessmentForm: boolean,
  reviewHistoryList: Array<CommunicationReviewHistoryResponseModel>,
  withTableScore: boolean
}

const FormSection: React.FC<Props> = ({pageMode, stateData, stateChange, caseId , communicationId, reviewScore, reviewStarted, setReviewStarted, dirtyAssessmentForm , reviewHistoryList , withTableScore}) => {

  const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
  const {HubConnected, successResponse, SwalCommunicationReviewConfirmMessage, SwalCommunicationReviewFailedMessage, SwalServerErrorMessage, SwalFailedMessage} = useConstant();
  const {ACTION_MODE, EVENT_TYPES, ACTION_LABELS, TOOLTIPS} = useCommunicationReviewConstant();

  /* States */
  const [reviewPeriod, setReviewPeriod] = useState<LookupModel | null>(null);
  const [reviewee, setReviewee] = useState<LookupModel | null>(null);
  const [finalReviewScore, setFinalReviewScore] = useState<string>('');
  const [reviewScoreBenchmark, setReviewScoreBenchmark] = useState<string>('-');
  const [benchmarkLegends, setBenchmarkLegends] = useState<string>('');
  
  const [reviewMarkLoading, setReviewMarkLoading] = useState<boolean>(false);

  const [reviewMarkedReadCounter, setReviewMarkedReadCounter] = useState<number>(0);
  const [counterTooltipVisible, setCounterTooltipVisible] = useState<boolean>(false);
  const [reviewMarkedRead, setReviewMarkedRead] = useState<boolean>(false);
  
  const [reviewStartLoading, setReviewStartLoading] = useState<boolean>(false);
  const [reviewCancelLoading, setReviewCancelLoading] = useState<boolean>(false);

  /* Hooks */
  const {getCommunicationReviewLookups, reviewPeriodOptions , reviewPeriodList, reviewBenchmarkList,reviewStatus ,commReviewHistoryEventList, getCommunicationReviewEventLog} = useCommunicationReviewHooks();
  const {userList} = useUserOptionList();
  const { REVIEW_STATUS } = useCommunicationReviewConstant();
  
  /* Mount */
  useEffect(() => {
    getCommunicationReviewLookups();
    getCommunicationReviewEventLog(stateData.communicationId);
  }, []);

  /* Effects */
  useEffect(() => {
    if(stateData) {
      setReviewee(getReviewee() ?? null);
      setFinalReviewScore(stateData.totalScore.toString());
      stateData.reviewStatusId = reviewHistoryList.length > 0 ? REVIEW_STATUS.reviewed.id : REVIEW_STATUS.notReviewed.id;
      stateData.reviewStatus = reviewHistoryList.length > 0 ? REVIEW_STATUS.reviewed.description : REVIEW_STATUS.notReviewed.description;
      getReviewStatus();
      getReviewer();
      setReviewPeriod(getReviewPeriod() ?? null);
      stateData.reviewee =  userList.find(user => user.value === stateData.revieweeId.toString())?.label ?? ""
      getScoreBenchmark();
      if(commReviewHistoryEventList && commReviewHistoryEventList?.length > 0){
        setReviewMarkedReadCounter(commReviewHistoryEventList.length ?? 0);
        const isUserInReviewList = commReviewHistoryEventList.some(event => event.userId.toString() === userId?.toString());
        setReviewMarkedRead(isUserInReviewList);
      }
    }
  }, [stateData]);

  useEffect(() => {
    if(reviewHistoryList.length > 0) {
      stateData.reviewStatusId = REVIEW_STATUS.reviewed.id;
      stateData.reviewStatus = REVIEW_STATUS.reviewed.description;
      if(reviewScore === 0 && stateData.reviewId === 0) {
        setReviewScoreBenchmark('-');
        setFinalReviewScore('0');
      }
    }
  }, [reviewHistoryList])

  useEffect(() => {
    if (userList && userList.length > 0) {
      if (reviewee === null) {
        const filteredUser: LookupModel | undefined = userList.find(user => {
          return user.value === stateData.revieweeId.toString(); 
        });
        const convertedValue: LookupModel | null = filteredUser ?? null;
        setReviewee(convertedValue); 
        stateData.reviewee = convertedValue?.label ?? '';
      }
      getReviewer();
    }
  }, [userList])
  useEffect(() => {
    if(reviewPeriodOptions && reviewPeriodOptions.length > 0){
      setReviewPeriod(getReviewPeriod() ?? null);
    }
  }, [reviewPeriodOptions])
  useEffect(() => {
    //Don't recalculate when view mode - stick for review score in DB
    getScoreBenchmark();
  }, [reviewScore , withTableScore])

  useEffect(() => {
    if(reviewBenchmarkList.length > 0) {
      const concatenatedStrings = reviewBenchmarkList.map((row: QualityReviewBenchmarkResponseModel) => {
        const minRange = parseFloat(row.qualityReviewBenchmarkMinRange.toString()).toFixed(2);
        const maxRange = parseFloat(row.qualityReviewBenchmarkMaxRange.toString()).toFixed(2);
        return `${row.qualityReviewBenchmarkName} (${minRange} - ${maxRange})`;
      }).join("\n"); 
      setBenchmarkLegends(concatenatedStrings);
      getScoreBenchmark();
    }
  }, [reviewBenchmarkList])

  useEffect(() => {
    if(reviewStatus.length > 0) {
      getReviewStatus()
    }
  }, [reviewStatus])

  useEffect(() => {
    if(reviewPeriodList.length > 0 && stateData.startCommunicationDate.length > 0) {
      const currentDate = new Date(stateData.startCommunicationDate);
      //Set the hours to zero
      currentDate.setHours(0,0,0,0); 
      const defaultPeriod = reviewPeriodList.filter(period => {
        const startDate = new Date(period.qualityReviewPeriodStart);
        const endDate = new Date(period.qualityReviewPeriodEnd);
        return startDate <= currentDate && endDate >= currentDate;
      });

      if(defaultPeriod && defaultPeriod.length > 1) {
        stateData.reviewPeriodId = 0;
      }else {
        stateData.reviewPeriodId = defaultPeriod 
        && stateData.reviewPeriodId === 0 
        && defaultPeriod.length === 1 ? defaultPeriod[0].qualityReviewPeriodId 
        : stateData.reviewPeriodId;
      }

      setReviewPeriod(getReviewPeriod() ?? null);
    }
  }, [reviewPeriodList]);
  
  useEffect(() => {
    if(commReviewHistoryEventList && commReviewHistoryEventList?.length > 0){
      setReviewMarkedReadCounter(commReviewHistoryEventList.length ?? 0);
      const isUserInReviewList = commReviewHistoryEventList.some(event => event.userId.toString() == userId?.toString());
      setReviewMarkedRead(isUserInReviewList);
    }
  }, [commReviewHistoryEventList])

  /* Functions */
  const getReviewee = () => userList.find(user => user.value === stateData.revieweeId.toString())
  const getReviewer = () => userList.find(user => user.value === stateData.reviewerId.toString())
  const getReviewPeriod = () => reviewPeriodOptions.find(reviewPeriod => reviewPeriod.value === stateData.reviewPeriodId.toString())
  const getReviewStatus = () => {
      const reviewStatusName = reviewStatus.find(status => status.value == stateData.reviewStatusId.toString())?.label;
      if(reviewStatusName !==  stateData.reviewStatus)
        stateData.reviewStatus = reviewStatusName ?? "";
  }
  
  const handleChangeReviewPeriod = (data: LookupModel) => {
    if (data) {
      setReviewPeriod(data);
      stateData.reviewPeriodId = parseInt(data.value ?? "0", 10);
      stateChange(stateData);
    }
  };

  const handleChangeReviewee = (data: LookupModel) => {
    if (data) {
      setReviewee(data);
      stateData.revieweeId = parseInt(data.value ?? "0", 10);
      stateData.reviewee = data.label ?? '';
      stateChange(stateData);
    }
  };

  const handleMarkAsReadEvent = () => {
    setReviewMarkLoading(true);
    swal({
      title: SwalCommunicationReviewConfirmMessage.title,
      text: SwalCommunicationReviewConfirmMessage.textMarkAsReadConfirm,
      icon: SwalCommunicationReviewConfirmMessage.icon,
      buttons: [SwalCommunicationReviewConfirmMessage.btnNo, SwalCommunicationReviewConfirmMessage.btnYes],
      dangerMode: true,
    }).then((response) => {
      if (response) {
        insertEventLog(stateData.communicationId, EVENT_TYPES.ClickMarkAsRead, Number(userId));
      }
      setReviewMarkLoading(false);
    });
  };

  const insertEventLog = (caseCommunicationId: number, eventTypeId: number, userId: number) => {
    const request: CommunicationReviewEventLogRequestModel = {
      caseCommunicationId: caseCommunicationId,
      eventTypeId: eventTypeId,
      userId: userId,
    };

    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction();
      messagingHub
          .start()
          .then(() => {
            if (messagingHub.state === HubConnected) { 
              InsertCommunicationReviewEventLog(request).then((response: any) => {
                if (response.status === successResponse) {
                  setReviewMarkedReadCounter(reviewMarkedReadCounter + 1);
                  setReviewMarkLoading(false);
                  setReviewMarkedRead(true);
                } else {
                  setReviewMarkLoading(false);
                  setReviewMarkedRead(false);
                  swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
                }
              });
            }
          })
          .catch((error) => {
              setReviewMarkLoading(false);
              setReviewMarkedRead(false);
              swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection, SwalServerErrorMessage.icon);
              console.log('Error while starting connection: ' + error);
          })
    }, 1000);
  };
 
  const handleStartReview = async() => {
    setReviewStartLoading(true);
    const isRequiredFilled = await validateRequiredFields();
    if (isRequiredFilled) {
      const isLimitReached = await validateCommunicationReviewLimit(stateData.communicationId, stateData.reviewPeriodId, stateData.revieweeId, stateData.reviewerId);
      
      if (!isLimitReached) {
        startReviewAction();
      } else {
        setReviewStartLoading(false);
      }
    } else {
      setReviewStartLoading(false);
    }
  };
  
  const startReviewAction =() => {
    const reviewPeriodName = reviewPeriodOptions.find(x => x.value == stateData.reviewPeriodId.toString()) ?? null;
        const textConfirm = pageMode === ACTION_MODE.View ? SwalCommunicationReviewConfirmMessage.textReviewStartFromViewConfirm : SwalCommunicationReviewConfirmMessage.textReviewStartConfirm;
        swal({
          title: SwalCommunicationReviewConfirmMessage.title,
          text: textConfirm + `\n\n Reviewee = ${stateData.reviewee} \n Review Period = ${reviewPeriodName?.label ?? ''} \n\n Please confirm.`,
          icon: SwalCommunicationReviewConfirmMessage.icon,
          buttons: [SwalCommunicationReviewConfirmMessage.btnNo, SwalCommunicationReviewConfirmMessage.btnYes],
          dangerMode: true,
        }).then((response) => {
        
          if (response) {
            if(stateData.communicationReviewId !== 0){
              resetStateDataFormSection();
            }
            setReviewStarted(true);
          }
          setReviewStartLoading(false);
        });
  }

  const validateRequiredFields = async() => {
    let isValid: boolean = false;
    if (stateData && stateData.caseId !== 0 && stateData.communicationId !== 0 && stateData.reviewPeriodId !== 0 && stateData.revieweeId !== 0 && stateData.reviewerId !== 0) {
      isValid = true;
    } else {
      swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
    }
    return isValid;
  };

  const validateCommunicationReviewLimit = async(caseCommunicationId: number, qualityReviewPeriodId: number, revieweeId: number, reviewerId: number) => {
    let isLimitReached: boolean = false;

    const request: CommunicationReviewLimitRequestModel = {
      caseCommunicationId: caseCommunicationId,
      qualityReviewPeriodId: qualityReviewPeriodId,
      revieweeId: revieweeId,
      reviewerId: reviewerId,
      userId: parseInt((userId ?? '0'), 10)
    }

    const response = await ValidateCommunicationReviewLimit(request)
    if (response.status === successResponse) {
      if(response.data) {
        isLimitReached = response.data;
        swal(SwalCommunicationReviewFailedMessage.title,SwalCommunicationReviewFailedMessage.textReviewLimitError,SwalCommunicationReviewFailedMessage.icon);
      }
    } else {
      swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
    }
    return isLimitReached;
  };

  const handleCancelReview = () => {
    setReviewCancelLoading(true);

    if (dirtyAssessmentForm) {
      swal({
        title: SwalCommunicationReviewConfirmMessage.title,
        text: SwalCommunicationReviewConfirmMessage.textCancelConfirm,
        icon: SwalCommunicationReviewConfirmMessage.icon,
        buttons: [SwalCommunicationReviewConfirmMessage.btnNo, SwalCommunicationReviewConfirmMessage.btnYes],
        dangerMode: true,
      }).then((response) => {
        if (response) {
          setReviewStarted(false);
          setReviewScoreBenchmark('-');
          setFinalReviewScore('0');
        }
        setReviewCancelLoading(false);
      });
    } else {
      setReviewStarted(false);
      setReviewCancelLoading(false);
    }
  };

  const resetStateDataFormSection = () => {
    stateData.reviewerId = parseInt((userId ?? '0'), 10);
    stateData.reviewer = fullName ?? '';
    stateData.caseId = caseId;
    stateData.communicationId = communicationId;
    stateData.reviewStatusId = reviewHistoryList.length > 0 ? REVIEW_STATUS.reviewed.id : REVIEW_STATUS.notReviewed.id;
    stateData.reviewStatus = reviewHistoryList.length > 0 ? REVIEW_STATUS.reviewed.description : REVIEW_STATUS.notReviewed.description;
    stateData.totalScore = reviewScore;
    stateData.reviewId = 0;
    stateData.communicationReviewId = 0;
  }

  const getScoreBenchmark = () => {
    if(reviewBenchmarkList.length > 0){
      const filteredBenchMark: QualityReviewBenchmarkResponseModel | undefined = reviewBenchmarkList.find(d => {
        return reviewScore >= d.qualityReviewBenchmarkMinRange && reviewScore <= d.qualityReviewBenchmarkMaxRange;
      });

      let benchMarkName = filteredBenchMark === undefined ? '' : filteredBenchMark.qualityReviewBenchmarkName;
      const isInitialLoad = (stateData.reviewId === 0 && !withTableScore);
      const isInitialWithHistory = (reviewHistoryList.length > 0 && stateData.reviewId === 0 && !withTableScore);
      const isNotReviewed = (!reviewStarted && stateData.reviewId === 0);

      if (reviewScore === 0 && (isInitialLoad || isInitialWithHistory) || isNotReviewed) {
        benchMarkName = '-';
      } 

      let finalScore = getFinalScore(reviewScore, reviewStarted,withTableScore, reviewHistoryList.length);
      setReviewScoreBenchmark(benchMarkName);
      setFinalReviewScore(finalScore);
    }
  }

  const getFinalScore = (reviewScore: number , reviewStarted: boolean , withTableScore: boolean, historyLength: number) => {
 
    const isNotReviewed = reviewScore === 0 && !reviewStarted && !withTableScore && stateData.reviewId === 0;
    const isZeroScore = reviewScore === 0 && (withTableScore || historyLength > 0);
    const newReviewScore = isZeroScore ? '0' : reviewScore.toString();
    
    const finalScore = isNotReviewed ? 'Not Reviewed' : newReviewScore ;
    return finalScore
  }

  return (
    <MainContainer>
      <div className="communication-info">
        <Row>
          <Col sm={12}>
            <Row>
              <Col sm={4}>
                <RequiredLabel title={'Review Period'} />
                <Select
                  size='small'
                  style={{width: '100%'}}
                  options={reviewPeriodOptions}
                  onChange={handleChangeReviewPeriod}
                  value={reviewPeriod}
                  isDisabled={(access?.includes(USER_CLAIMS.CommunicationReviewerWrite) === false && access?.includes(USER_CLAIMS.CommunicationReviewerRead) === false ) || !reviewMarkedRead || reviewStarted}
                />
              </Col>
              <Col sm={8}>
                <div>
                  <Row>
                    <Col sm={12}>
                      <Row>
                        <Col sm={6}>
                          <div style={{float: right, marginRight: 20}}>
                            <Row>
                                <div className="review-benchmark">
                                  <label aria-label='reviewScoreBenchmarkLabel' className='col-form-label col-sm' style={{color:"white"}}>{reviewScoreBenchmark}</label>
                                </div>
                            </Row>
                            <Row>
                              <div className="review-score">
                                  <label aria-label='reviewScoreLabel' className='col-form-label col-sm' style={{whiteSpace:"nowrap", padding:"5px"}}>{finalReviewScore}</label>
                                </div>
                            </Row>
                          </div>
                        </Col>
                        <Col sm={6}>     
                          <div className="review-legends">
                            <label aria-label='reviewBenchmarkLegendsLabel' className='col-sm' style={{fontWeight: "bold"}}> Review Benchmark Table </label>
                            <div style={{whiteSpace: 'pre', lineHeight: '1.1', paddingTop: '5px'}}>{benchmarkLegends}</div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm={4}>
                <BasicFieldLabel title={'Case ID'} />
                <BasicTextInput ariaLabel={'caseId'} colWidth={'col-sm-12'} 
                value={stateData.caseId.toString()} onChange={(e) => {}} disabled={true} />
              </Col>
              <Col sm={4}>
                <BasicFieldLabel title={'Review ID'} />
                <BasicTextInput ariaLabel={'reviewId'} colWidth={'col-sm-12'} value={stateData.reviewId === 0 ? '' : stateData.reviewId.toString()} onChange={(e) => {}} disabled={true} />
              </Col>
              <Col sm={4}>
                  <RequiredLabel title={'Reviewee'} />
                  <Select
                    size='small'
                    style={{width: '100%'}}
                    options={userList}
                    value={reviewee}
                    onChange={handleChangeReviewee}
                    isDisabled={(access?.includes(USER_CLAIMS.CommunicationReviewerWrite) === false && access?.includes(USER_CLAIMS.CommunicationReviewerRead) === false) || !reviewMarkedRead || reviewStarted}
                  />
              </Col>
            </Row>
            <Row>
              <Col sm={4}>
                <BasicFieldLabel title={'Communication ID'} />
                <BasicTextInput ariaLabel={'communicationId'} colWidth={'col-sm-12'} value={stateData.communicationId.toString()} onChange={(e) => {}} disabled={true} />
              </Col>
              <Col sm={4}>
                <BasicFieldLabel title={'Review Status'} />
                <BasicTextInput ariaLabel={'reviewStatus'} colWidth={'col-sm-12'} value={stateData.reviewStatus} onChange={(e) => {}} disabled={true} />
              </Col>
              <Col sm={4}>
                <BasicFieldLabel title={'Reviewer'} />
                <BasicTextInput ariaLabel={'reviewer'} colWidth={'col-sm-12'} value={stateData.reviewer} onChange={(e) => {}} disabled={true} />
              </Col>
            </Row>
            <Row>
            {(access?.includes(USER_CLAIMS.CommunicationReviewerWrite) === true || access?.includes(USER_CLAIMS.CommunicationReviewerRead) === true) && (
              <MainContainer>
                <div style={{ marginTop: 40 }}>
                  <MlabButton
                    access={true}
                    size={'sm'}
                    label={reviewMarkedRead ? ACTION_LABELS.Read : ACTION_LABELS.MarkAsRead}
                    style={reviewMarkedRead ? ElementStyle.secondary : ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    onClick={handleMarkAsReadEvent}
                    loading={reviewMarkLoading}
                    loadingTitle={ACTION_LABELS.Loading}
                    disabled={reviewMarkedRead}
                  />
                  <span style={{ paddingRight: '8px' }}>
                    <div className="info-counter" 
                      onMouseEnter={() => {setCounterTooltipVisible(true)}} 
                      onMouseLeave={() => {setCounterTooltipVisible(false)}}
                    > {reviewMarkedReadCounter} 
                    </div> 
                    <Toast show={counterTooltipVisible}
                      onClose={() => {setCounterTooltipVisible(false)}}
                      onMouseOut={() => {setCounterTooltipVisible(false)}}
                      style={{color: "#3a3a3a", textAlign: "center", position: 'absolute', top: '-10%', left: '10%', transform: 'translateX(-10%)', width:'150px'}}
                    >
                      <Toast.Body>{TOOLTIPS.MarkAsReadText}</Toast.Body>
                    </Toast>
                  </span>

                  {!reviewStarted && (
                    <MlabButton
                      access={true}
                      size={'sm'}
                      label={ACTION_LABELS.StartReview}
                      style={!reviewMarkedRead || reviewStarted ? ElementStyle.secondary : ElementStyle.primary}
                      type={'button'}
                      weight={'solid'}
                      onClick={handleStartReview}
                      loading={reviewStartLoading}
                      loadingTitle={ACTION_LABELS.Loading}
                      disabled={!reviewMarkedRead || reviewStarted}
                    />
                  )}

                  {reviewStarted && (
                    <MlabButton
                      access={true}
                      size={'sm'}
                      label={ACTION_LABELS.CancelReview}
                      style={!reviewStarted ? ElementStyle.secondary : ElementStyle.primary}
                      type={'button'}
                      weight={'solid'}
                      onClick={handleCancelReview}
                      loading={reviewCancelLoading}
                      loadingTitle={ACTION_LABELS.Loading}
                      disabled={!reviewStarted}
                    />
                  )}
                  
                  <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Review Later'}
                    style={ElementStyle.secondary}
                    type={'button'}
                    weight={'solid'}
                    disabled={true}
                  />
                </div>
              </MainContainer>
            )}
          </Row>
          </Col>
         
        </Row>
      </div>
    </MainContainer>
  );
}

export default FormSection;
