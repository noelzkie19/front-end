import { useCallback, useContext, useEffect, useState } from 'react';
import { Guid } from 'guid-typescript';
import swal from 'sweetalert';
import useConstant from '../../../../../../../../constants/useConstant';
import {MainContainer, MlabButton} from '../../../../../../../../custom-components';
import {usePromptOnUnload} from '../../../../../../../../custom-helpers';
import {IAuthState} from '../../../../../../../auth';
import {DeleteTicketCommentRequestModel} from '../../../../../../models/request/DeleteTicketCommentRequestModel';
import {GetTicketCommentsRequestModel} from '../../../../../../models/request/GetTicketCommentsRequestModel';
import {TicketCommentRequestModel} from '../../../../../../models/request/TicketCommentRequestModel';
import {TicketCommentModel} from '../../../../../../models/response/TicketCommentModel';
import {UpsertTicketComment, deleteTicketComment} from '../../../../../../services/TicketManagementApi';
import {useTicketManagementHooks} from '../../../../../hooks/useTicketManagementHooks';
import EditorField from '../../../../EditorField';
import EditComment from './EditComment';
import { ElementStyle } from '../../../../../../../../constants/Constants';
import { USER_CLAIMS } from '../../../../../../../user-management/components/constants/UserClaims';
import { AddUserCollaboratorRequestModel } from '../../../../../../models/request/AddUserCollaboratorRequestModel';
import { TicketContext } from '../../../../../../context/TicketContext';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../../../setup';

interface CommentProps {
    setComment?: any,
    isFromModal: boolean
    refreshComment?: boolean
    refreshTicketComment?: any
}

const AddComment: React.FC<CommentProps> = ({ setComment, isFromModal, refreshComment, refreshTicketComment }) => {
    const { ticketInformation, historyFilter, ticketHistoryAsync} = useContext(TicketContext);
    const { tinyMCEKey, successResponse, SwalServerErrorMessage } = useConstant();
    const { getTicketComment, commentList, remainingCommentCount, validateAddUserAsCollaborator } = useTicketManagementHooks();

	const [editorKey, setEditorKey] = useState<number>(4);

	const [convertedContent, setConvertedContent] = useState<string>();

	const [isSubmitClicked, setIsSubmitClicked] = useState<boolean>(false);
	const [isViewOldCommentClicked, setIsViewOldCommentClicked] = useState<boolean>(false);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [prevList, setPrevList] = useState<Array<TicketCommentModel>>([]);
	const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

	const {userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	const isValidString = (data: any) => {
		return [0, undefined, null, '', '', ' ', ' '].indexOf(data) === -1;
	};

	const isWhiteSpaceOnly = (data: any) => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(data, 'text/html');
		const textContent = doc.body.textContent ?? '';
		let result = textContent.replace(/&nbsp;/gi, ' ');
		return /^[\s\u00A0]*$/.test(result);
	};

	usePromptOnUnload(isValidString(convertedContent), '');

    useEffect(() => {
        if (!isFromModal && ticketInformation.ticketId > 0) {
            getTicketCommentByTicketCommentId(isViewOldCommentClicked);
        }
    }, [ticketInformation]);

    useEffect(() => {
        if (refreshComment) {
            getTicketCommentByTicketCommentId(false);
            refreshTicketComment()
        }
    }, [refreshComment])

    const handleAddCommentChange = useCallback((_content: string) => {
        setDisableSubmit(isWhiteSpaceOnly(_content));
        setConvertedContent(_content);
        if (ticketInformation && isFromModal) {
            setComment(_content)
        }
    }, []);

	const clearStorage = () => {
		setEditorKey(editorKey * 43);
	};

	const clearEditor = () => {
		setConvertedContent('');
	};

    const handleSubmit = () => {
        if (isValidString(convertedContent)) {
            setIsSubmitClicked(true);
            const requestObj: TicketCommentRequestModel = {
                ticketId: ticketInformation?.ticketId ?? 0,
                ticketTypeId: ticketInformation?.ticketTypeId ?? 0,
                comment: convertedContent ?? "",
                ticketCommentId: 0,
                queueId: Guid.create().toString(),
                userId: userId?.toString() ?? "0"
            };
            // Upsert logic here
            upsertTicketComment(requestObj);
            clearEditor();
            clearStorage();
        }
    }

	const upsertTicketComment = async (request: TicketCommentRequestModel) => {
		setPrevList(commentList);
		const result = await UpsertTicketComment(request);

        if (result.status === successResponse) {
            validateUserInCommentAsCollaborator(request.ticketId, request.ticketTypeId);
            getTicketCommentByTicketCommentId(isViewOldCommentClicked);
            setIsSubmitClicked(false);
            setDisableSubmit(true);
        } else {
            setIsSubmitClicked(false);
            swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
        }
    };

    const getTicketCommentByTicketCommentId = (viewOldComment: boolean) => {
        if (ticketInformation && ticketInformation?.ticketId > 0 && ticketInformation.ticketTypeId > 0) {
            const getRequest: GetTicketCommentsRequestModel = {
                ticketId: ticketInformation?.ticketId ?? 0,
                ticketTypeId: ticketInformation?.ticketTypeId ?? 0,
                viewOldComment: viewOldComment,
                queueId: Guid.create().toString(),
                userId: userId?.toString() ?? "0"
            }
            getTicketComment(getRequest);
        }

    }

    const handleCancel = () => {
        clearEditor();
        setIsSubmitClicked(false);
        if (isEdit) {
            setIsEdit(false);
        }
    }

    const handleDelete = (ticketCommentId: any) => {
        const request: DeleteTicketCommentRequestModel = {
            ticketTypeId: ticketInformation?.ticketTypeId ?? 0,
            ticketCommentId: ticketCommentId,
            queueId: Guid.create().toString(),
            userId: userId?.toString() ?? "0"
        }
        deleteTicketCommentById(request);
    }

	const deleteTicketCommentById = async (request: DeleteTicketCommentRequestModel) => {
		const result = await deleteTicketComment(request);
		if (result.status === successResponse) {
			getTicketCommentByTicketCommentId(isViewOldCommentClicked);
            ticketHistoryAsync(historyFilter);
		} else {
			swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
		}
	};

    const handleEditCommentSubmit = (data: TicketCommentModel) => {
        if (isValidString(data.Comment)) {
            const requestObj: TicketCommentRequestModel = {
                ticketId: ticketInformation?.ticketId ?? 0,
                ticketTypeId: ticketInformation?.ticketTypeId ?? 0,
                comment: data.Comment ?? "",
                ticketCommentId: data.TicketCommentId,
                queueId: Guid.create().toString(),
                userId: userId?.toString() ?? "0"
            };
            // Upsert logic here
            upsertTicketComment(requestObj);
        }
    }

    const handleViewOlderComments = () => {

        if (!isFromModal) {
            setIsViewOldCommentClicked(true);
            getTicketCommentByTicketCommentId(true);
        }
    }

    const validateUserInCommentAsCollaborator = (ticketId: any, ticketTypeId: any) => {
        const requestObj: AddUserCollaboratorRequestModel = {
            userId: parseInt(userId ?? "0"),
            username: fullName ?? "",
            ticketId: ticketId,
            tIcketTypeId: ticketTypeId,
            createdBy: parseInt(userId ?? "0")
        }

        validateAddUserAsCollaborator(requestObj);
    }
    const hasAddEditAccessComment = () => userAccess.includes(USER_CLAIMS.ManageTicketsRead) === true 
    || userAccess.includes(USER_CLAIMS.ManageTicketsWrite) === true
    || userAccess.includes(USER_CLAIMS.MissingDepositeRead) 
    || userAccess.includes(USER_CLAIMS.MissingDepositWrite)
    || userAccess.includes(USER_CLAIMS.ReporterRoleRead) 
    || userAccess.includes(USER_CLAIMS.ReporterRoleWrite)
    || userAccess.includes(USER_CLAIMS.MissingWithdrawalRead)
    || userAccess.includes(USER_CLAIMS.TaskRead)
    || userAccess.includes(USER_CLAIMS.TaskWrite)
    || userAccess.includes(USER_CLAIMS.IssueRead)
    || userAccess.includes(USER_CLAIMS.IssueWrite)
    || userAccess.includes(USER_CLAIMS.MissingWithdrawalReporterRead)
    || userAccess.includes(USER_CLAIMS.MissingWithdrawalReporterWrite)
    
    return (
        <div style={{ marginLeft: 13, marginRight: 13 }}>
            <MainContainer>
                <div style={{ marginBottom: isFromModal ? 0 : 40 }}>
                    <EditorField
                        editorKey={editorKey}
                        tinyMCEKey={tinyMCEKey}
                        handleOnChange={handleAddCommentChange}
                        editorValue={convertedContent}
                        handleSubmit={handleSubmit}
                        isSubmitClicked={isSubmitClicked}
                        handleCancel={handleCancel}
                        cancelClearBtnLabel="Clear"
                        isFromModal={isFromModal}
                        disableSubmit={disableSubmit}
                        hasAccess={hasAddEditAccessComment()}
                    />
                </div>
            </MainContainer>
            {!isFromModal &&
                <MainContainer>
                    {
                        commentList?.map((data: any) =>
                            <EditComment
                                key={data.TicketCommentId}
                                commentDetails={data}
                                editorKey={editorKey}
                                tinyMCEKey={tinyMCEKey}
                                handleEditCommentSubmit={handleEditCommentSubmit}
                                handleDelete={handleDelete}
                                username={fullName}
                                isNewComment={!prevList.some(d => d.TicketCommentId === data.TicketCommentId)}
                                hasAccess={hasAddEditAccessComment()}
                            />
                        )
                    }
                    {
                        remainingCommentCount > 0 &&
                        <MlabButton
                            access={true}
                            size={'sm'}
                            label={"View " + remainingCommentCount + " remaining older Comments"}
                            style={ElementStyle.secondary}
                            type={'button'}
                            weight={'solid'}
                            onClick={handleViewOlderComments}
                            loading={isViewOldCommentClicked && remainingCommentCount > 0}
                            loadingTitle={'Please wait ...'}
                            disabled={isViewOldCommentClicked}
                            additionalClassStyle="view-old-comment"
                        />
                    }
                </MainContainer>}
        </div>
    );
};

export default AddComment;
