import { useState, useEffect, useContext, useRef } from 'react'
import { MlabButton, FormModal, FieldContainer, DefaultDateRangePicker, DefaultDatePicker } from '../../../../../custom-components'
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../constants/Constants'
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap-v5'
import Select from 'react-select'
import { StatusOptions, ValidateUpsertReviewPeriodRequestModel, ReviewPeriodRequestBuilder } from '../utils/helpers'
import useStaffPerformanceConstant from '../constant/useStaffPerformanceConstant'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { StaffPerformanceContext } from '../context/StaffPerformanceContext'
import { useStaffPerformanceHooks } from '../hooks/useStaffPerformanceHooks'
import { convertDateIntoISO } from '../../../../../utils/converter'
import useConstant from '../../../../../constants/useConstant'
import swal from 'sweetalert'
import { ReviewPeriodListModel, REVIEW_PERIOD_LIST_DEFAULT } from '../../../models/staffperformance/response/ReviewPeriodListResponseModel'
import { RootState } from '../../../../../../setup'
import { IAuthState } from '../../../../auth'
import { shallowEqual, useSelector } from 'react-redux'

interface ModalProps {
  handleShowModal: () => void
  showModal: boolean
  handleUpsertSuccess: () => void
}
const ReviewPeriodModal = ({ handleShowModal, showModal = false, handleUpsertSuccess }: ModalProps) => {
  const { userId } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
  const { upsertReviewPeriodData, getReviewPeriodList, reviewPeriodList, successfullUpsert } = useStaffPerformanceHooks()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [isValidated, setIsValidated] = useState<boolean>(false)
  const [upsertAfterValidation, setUpsertAfterValidation] = useState<boolean>(false)
  const [hasDuplicate, setHasDuplicate] = useState<boolean | null>(null)
  const [selectedStartEndPeriod, setSelectedStartEndPeriod] = useState<any>();
  const [selectMinimumDatePeriod, setSelectMinimumDatePeriod] = useState<any>()
  const { MODAL_HEADERS, STAFF_PERFORMANCE_MODULE } = useStaffPerformanceConstant()
  const { selectedReviewPeriod } = useContext(StaffPerformanceContext)
  const { SwalFailedMessage, SwalConfirmMessage } = useConstant()
  const [reviewPeriodRequest, setReviewPeriodRequest] = useState<ReviewPeriodListModel>(REVIEW_PERIOD_LIST_DEFAULT)
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsValidating(false)
    setIsValidated(false)
    setUpsertAfterValidation(false)
    showModal && nameRef?.current?.focus?.();
    return () => { }
  }, [showModal])

  useEffect(() => {
    if (successfullUpsert) {
      setIsValidated(false)
      handleUpsertSuccess()
      setReviewPeriodRequest(REVIEW_PERIOD_LIST_DEFAULT)
      setSelectedStartEndPeriod([REVIEW_PERIOD_LIST_DEFAULT.rangeStart, REVIEW_PERIOD_LIST_DEFAULT.rangeEnd])
    }
    setTimeout(() => setIsSubmitting(false), 3000)
    return () => { }
  }, [successfullUpsert])


  useEffect(() => {
    if (!selectedReviewPeriod) return
    setReviewPeriodRequest({
      ...reviewPeriodRequest,
      communicationReviewPeriodId: selectedReviewPeriod.communicationReviewPeriodId,
      communicationReviewPeriodName: selectedReviewPeriod.communicationReviewPeriodName,
      rangeStart: selectedReviewPeriod.rangeStart,
      rangeEnd: selectedReviewPeriod.rangeEnd,
      validationPeriod: selectedReviewPeriod.validationPeriod,
      status: selectedReviewPeriod.status
    })
    setSelectedStartEndPeriod([(selectedReviewPeriod.rangeStart ? new Date(selectedReviewPeriod.rangeStart ?? '') : null), (selectedReviewPeriod.rangeEnd ? new Date(selectedReviewPeriod.rangeEnd ?? '') : null)])
    return () => { }
  }, [selectedReviewPeriod])

  useEffect(() => {
    if (!reviewPeriodList) return
    if (!showModal) return
    if (reviewPeriodRequest.communicationReviewPeriodName.trim() === '') {
      setIsValidated(false)
      return
    }
    setIsValidating(false)
    const getList = reviewPeriodList?.reviewPeriodList ?? []
    if (getList.length === 0) {
      setHasDuplicate(false)
    } else {
      setHasDuplicate(getList.some((data: ReviewPeriodListModel) => data.communicationReviewPeriodId !== reviewPeriodRequest.communicationReviewPeriodId))
    }

    setIsValidated(true)
    return () => { }
  }, [reviewPeriodList])

  useEffect(() => {
    if (hasDuplicate === null) return
    upsertAfterValidation && handleUpsertReviewPeriod()
    return () => { }
  }, [hasDuplicate])

  const handleBlurPeriodName = () => {
    if (reviewPeriodRequest.communicationReviewPeriodName.trim() === '') return
    setIsValidating(true)
    const request = ReviewPeriodRequestBuilder(userId, reviewPeriodRequest.communicationReviewPeriodName, null, {
      pageSize: 10,
      currentPage: 1,
      recordCount: 1,
      sortOrder: STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder,
      sortColumn: STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortColumn,
    })
    getReviewPeriodList(request)
  }

  const handleCloseModal = () => {
    swal({
      title: PROMPT_MESSAGES.ConfirmCloseTitle,
      text: SwalConfirmMessage.textDiscard,
      icon: SwalConfirmMessage.icon,
      buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
      dangerMode: true,
    })
      .then(async (handleAction) => {
        if (handleAction) {
          setIsValidated(false)
          setIsValidating(false)
          setReviewPeriodRequest(REVIEW_PERIOD_LIST_DEFAULT)
          setSelectedStartEndPeriod([REVIEW_PERIOD_LIST_DEFAULT.rangeStart, REVIEW_PERIOD_LIST_DEFAULT.rangeEnd])
          setSelectMinimumDatePeriod(null)
          handleShowModal()
        }
      })
      .catch(() => { });
  }

  const handleSubmitUpsert = async () => {
    const unfilledRequiredFIelds = await ValidateUpsertReviewPeriodRequestModel(reviewPeriodRequest)
    if (unfilledRequiredFIelds) {
      swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
      setIsSubmitting(false)
      return
    }

    swal({
      title: PROMPT_MESSAGES.ConfirmCloseTitle,
      text: selectedReviewPeriod?.communicationReviewPeriodId > REVIEW_PERIOD_LIST_DEFAULT.communicationReviewPeriodId ? PROMPT_MESSAGES.ConfirmSubmitMessageEdit : PROMPT_MESSAGES.ConfirmSubmitMessageAdd,
      icon: SwalConfirmMessage.icon,
      buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
      dangerMode: true,
    })
      .then(async (handleAction) => {
        if (handleAction) {
          setIsSubmitting(true)
          setHasDuplicate(null)
          setUpsertAfterValidation(true)
          !isValidating && handleBlurPeriodName()
        }
      })
      .catch(() => { });
  }

  const handleUpsertReviewPeriod = async () => {
    if (hasDuplicate) {
      swal(SwalFailedMessage.title, SwalFailedMessage.textReviewPeriodNameExists, SwalFailedMessage.icon);
      setIsSubmitting(false)
      return
    }

    const upsertRequest = {
      ...reviewPeriodRequest,
      status: Number(reviewPeriodRequest?.status),
      rangeStart: convertDateIntoISO(reviewPeriodRequest.rangeStart),
      rangeEnd: convertDateIntoISO(reviewPeriodRequest.rangeEnd),
      validationPeriod: convertDateIntoISO(reviewPeriodRequest.validationPeriod),
      userId: userId?.toString() ?? '0'
    }
    upsertReviewPeriodData(upsertRequest)
    setUpsertAfterValidation(false);
  }

  const handleChangeDateRange = (event: any) => {
    setSelectedStartEndPeriod(event);
    setSelectMinimumDatePeriod(event[1])
    setReviewPeriodRequest({ ...reviewPeriodRequest, rangeStart: event[0], rangeEnd: event[1], validationPeriod: (event[1] > new Date(reviewPeriodRequest?.validationPeriod ?? '')) ? null : reviewPeriodRequest?.validationPeriod })
  }

  const settingMinimumDate = (date: any) => {
    if (!selectMinimumDatePeriod) return
    return date < selectMinimumDatePeriod;
  };

  return (
    <FormModal headerTitle={selectedReviewPeriod?.communicationReviewPeriodId > REVIEW_PERIOD_LIST_DEFAULT.communicationReviewPeriodId ? MODAL_HEADERS.ReviewPeriod.Edit : MODAL_HEADERS.ReviewPeriod.Add} haveFooter={false} show={showModal} onHide={handleShowModal}>
      <FieldContainer>
        <Row className="m-1">
          <Col>
            <FieldContainer>
              <div className='col-form-label col-sm required'>Period Name</div>
              <div className='d-flex align-items-center'>
                <input
                  type='text'
                  className={'form-control form-control-sm '}
                  ref={nameRef}
                  onChange={(e: any) => {
                    setIsValidated(false)
                    setUpsertAfterValidation(false)
                    setHasDuplicate(null)
                    setReviewPeriodRequest({ ...reviewPeriodRequest, communicationReviewPeriodName: e.currentTarget.value ?? '' })
                  }}
                  onBlur={handleBlurPeriodName}
                  value={reviewPeriodRequest?.communicationReviewPeriodName}
                  aria-label='Period Name'
                />
                {isValidating && <div className='spinner-border spinner-border-sm align-middle ms-2'></div>}
                {!isValidating && isValidated && (hasDuplicate ?
                  <OverlayTrigger placement='right' delay={{ show: 250, hide: 400 }} overlay={<Tooltip id='button-tooltip-2'>Period Name Already Exists</Tooltip>}>
                    <div className='align-middle ms-2'><FontAwesomeIcon color='red' icon={faExclamationCircle} /> </div>
                  </OverlayTrigger>
                  :
                  <OverlayTrigger placement='right' delay={{ show: 250, hide: 400 }} overlay={<Tooltip id='button-tooltip-2'>Period Name Available</Tooltip>}>
                    <div className='align-middle ms-2'><FontAwesomeIcon color='green' icon={faCheckCircle} /> </div>
                  </OverlayTrigger>)
                }
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-form-label col-sm required'>Communication Start From - Start To</div>
              <div className={'col-sm-12'}>
                <DefaultDateRangePicker
                  format='dd/MM/yyyy HH:mm:ss'
                  onChange={handleChangeDateRange}
                  value={selectedStartEndPeriod ?? null}
                  maxDays={180}
                  isDisabled={selectedReviewPeriod?.communicationReviewPeriodId > REVIEW_PERIOD_LIST_DEFAULT.communicationReviewPeriodId}
                  customPlaceHolder='DD/mm/yyyy HH:mm:ss ~ DD/mm/yyyy HH:mm:ss'
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-form-label col-sm required'>Validation Period</div>
              <div className={'col-sm-12'}>
                <DefaultDatePicker
                  format='dd/MM/yyyy HH:mm:ss'
                  showTime
                  onChange={(e: any) => {
                    setReviewPeriodRequest({ ...reviewPeriodRequest, validationPeriod: e?.toString() ?? '' })
                  }}
                  minDate={settingMinimumDate}
                  value={reviewPeriodRequest.validationPeriod ? new Date(reviewPeriodRequest.validationPeriod) : null}
                  disabled={selectedReviewPeriod?.communicationReviewPeriodId > REVIEW_PERIOD_LIST_DEFAULT.communicationReviewPeriodId}
                />
              </div>
            </FieldContainer>
            <FieldContainer>
              <div className='col-form-label col-sm required'>Status</div>
              <div className='col-lg-12'>
                <Select
                  menuPlacement='auto'
                  menuPosition='fixed'
                  isMulti={false}
                  size='small'
                  style={{ width: '100%' }}
                  options={StatusOptions}
                  onChange={(e: any) => {
                    setReviewPeriodRequest({ ...reviewPeriodRequest, status: e.value.toString() ?? '0' })
                  }}
                  value={StatusOptions.find((status: any) => status.value == reviewPeriodRequest?.status)}
                />
              </div>
            </FieldContainer>
          </Col>
        </Row>
      </FieldContainer>
      <div className='d-flex justify-content-end'>
        <MlabButton
          access={true}
          label='Submit'
          style={ElementStyle.primary}
          type={'button'}
          weight={'solid'}
          size={'sm'}
          loading={isSubmitting}
          loadingTitle={'Please wait...'}
          disabled={isSubmitting}
          onClick={handleSubmitUpsert}
        />
        <MlabButton
          access={true}
          label='Close'
          style={ElementStyle.secondary}
          type={'button'}
          weight={'solid'}
          size={'sm'}
          loading={false}
          loadingTitle={'Please wait...'}
          disabled={false}
          onClick={handleCloseModal}
        />
      </div>
    </FormModal>
  )
}

export default ReviewPeriodModal