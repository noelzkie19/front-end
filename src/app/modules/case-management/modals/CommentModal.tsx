import { Modal, ModalFooter } from "react-bootstrap-v5";
import { BasicFieldLabel, FieldContainer, FormGroupContainer, MlabButton } from "../../../custom-components";
import MultilineTextArea from "../shared/components/MultilineTextArea";
import { ReviewAssestmentCommentViewModel } from "../models/viewModels/ReviewAssestmentCommentViewModel";
import { ElementStyle } from "../../../constants/Constants";
import useCommunicationReviewConstant from "../constants/CommunicationReviewConstant";


interface Props {
    showModal: boolean;
    isCommentDisable: boolean;
    modalTitle: string;
    selectedComment: ReviewAssestmentCommentViewModel | undefined;
    stateChange: any;
    qualityReviewMeasurementId: number;
    isAutoFail: boolean | undefined;
    handleSaveComment: () => void;
    _close: () => void;
}

export const CommentModal: React.FC<Props> = ({showModal, isCommentDisable, modalTitle , selectedComment , stateChange , qualityReviewMeasurementId ,isAutoFail ,handleSaveComment, _close}) => {
    const { ACTION_LABELS } = useCommunicationReviewConstant();
    const remarksStyle = {
        fontStyle: 'italic',
        color: '#818181',
        fontSize: '12px',
      };

    const handleRemarkChange = (e: any) => {
        let newData: ReviewAssestmentCommentViewModel = {
          qualityReviewMeasurementId: qualityReviewMeasurementId,
          remarks: e.slice(0, 4000),
          suggestions: selectedComment ? selectedComment?.suggestions : ''
        }
        stateChange(newData);
    };

    const handleSuggestionChange = (e: any) => {
        let newData: ReviewAssestmentCommentViewModel = {
          qualityReviewMeasurementId: qualityReviewMeasurementId,
          remarks: selectedComment ? selectedComment?.remarks : '' ,
          suggestions: e.slice(0, 4000)
        }
        stateChange(newData);
    };
    
    return (
        <FormGroupContainer>
          <Modal show={showModal} aria-labelledby='contained-modal-title-vcenter' centered>
            <Modal.Header>
              <Modal.Title id='contained-modal-title-vcenter'>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>
                  <FieldContainer>
                    <BasicFieldLabel title={'Additional Remark'} />
                        <div className='col-sm-12'>
                            <MultilineTextArea label={'Additional Remark'} onChange={(handleRemarkChange)} value={selectedComment ? selectedComment.remarks : ''} disabled={isCommentDisable}/>                   
                            <div style={remarksStyle} className='mt-7 mb-4'>
                                <span className='text-danger'>*Additional Remark is required for Auto-failed = Yes Criteria.</span>
                            </div>
                        </div>
				    </FieldContainer>
              </div>
              <div>
                  <FieldContainer>
                    <BasicFieldLabel title={'Suggestion'} />
                    <div className='col-sm-12'>
					 <MultilineTextArea label={'Suggestion'} onChange={handleSuggestionChange} value={selectedComment ? selectedComment.suggestions : ''} disabled={isCommentDisable}/>
                    </div>
				 </FieldContainer>
              </div>
            </Modal.Body>
            <ModalFooter style={{border: 0}}>
              {!isCommentDisable && (
                 <MlabButton
                 access={true}
                 size={'sm'}
                 label={ACTION_LABELS.Submit}
                 style={ElementStyle.primary}
                 type={'button'}
                 weight={'solid'}
                 loading={false}
                 loadingTitle={ACTION_LABELS.Loading}
                 disabled={isCommentDisable || (selectedComment?.remarks === '' && isAutoFail)}
                 onClick={handleSaveComment}
               />
              )}
              <MlabButton
                access={true}
                size={'sm'}
                label={'Close'}
                style={ElementStyle.secondary}
                type={'submit'}
                weight={'solid'}
                onClick={() => _close()}
              />
            </ModalFooter>
          </Modal>
        </FormGroupContainer>
    );
}

export default CommentModal;