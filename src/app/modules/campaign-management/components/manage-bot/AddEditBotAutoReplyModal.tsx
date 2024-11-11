import {HubConnection} from '@microsoft/signalr';
import {AxiosResponse} from 'axios';
import DOMPurify from 'dompurify';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import {htmlDecode} from 'js-htmlencode';
import React, {useCallback, useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {AutoReplyTypeEnum, TelegramBotEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicFieldLabel,
	DefaultSecondaryButton,
	FormContainer,
	FormGroupContainer,
	FormModal,
	LoaderButton,
	MLabQuillEditor,
	MainContainer,
	RequiredLabel,
} from '../../../../custom-components';
import {getInvalidHtmlTags} from '../../../../custom-functions/helper/validationHelper';
import {BotDetailAutoreplyModel} from '../../models/request/BotDetailAutoreplyModel';
import {BotAutoReplyModel} from '../../models/response/BotAutoReplyModel';
import {UpSertBotDetailAutoReply} from '../../redux/ManageBotApi';
import '../Campaign.css';

interface ModalProps {
	showBoAutoReplyForm: boolean;
	setShowBoAutoReplyForm: (e: any) => void;
	closeModal: () => void;
	selectedBotAutoReply: BotAutoReplyModel;
}

interface Upload {
	base64textString: string;
	imageName: string;
	showImage: boolean;
}

const initialValues: BotDetailAutoreplyModel = {
	attachment: '',
	botDetailId: 0,
	message: '',
	queueId: '',
	userId: '',
	chatValue: '',
	trigger: '',
	type: '',
	botDetailsAutoReplyId: 0,
	telegramBotAutoReplyTriggerId: 0,
};

const AddEditBotAutoReplyModal: React.FC<ModalProps> = ({showBoAutoReplyForm, setShowBoAutoReplyForm, closeModal, selectedBotAutoReply}) => {
	// states
	const editorKey: number = 4;

	const {UpsertBroadcastConstants, successResponse, HubConnected, tinyMCEKey, AttachmentConstants, SwalFailedMessage} = useConstant();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [convertedContent, setConvertedContent] = useState<string>('');
	const [convertedValue, setConvertedValue] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [imageData, setImageData] = useState<Upload>({
		base64textString: '',
		imageName: '',
		showImage: false,
	});
	// effects
	useEffect(() => {
		if (showBoAutoReplyForm) {
			console.log(selectedBotAutoReply);
			setImageData({base64textString: selectedBotAutoReply.attachment, imageName: '', showImage: true});
			setConvertedContent(selectedBotAutoReply.message);
			setConvertedValue(selectedBotAutoReply.chatValue);
		}
	}, [showBoAutoReplyForm]);

	const closeModalBOT = () => {
		closeModal();
	};
	const setConvertValueName = (param: any) => {
		setConvertedValue(param);
	};
	const convertToBase64 = (event: any) => {
		const file = event.target.files[0];
		const fileSizeInMB = file.size / (1024 * 1024);
		if (fileSizeInMB > TelegramBotEnum.PhotoMaxFileSize) {
			swal({
				title: AttachmentConstants.title,
				text: AttachmentConstants.ImageSizeExceedMessage + TelegramBotEnum.PhotoMaxFileSize + 'MB',
				icon: AttachmentConstants.iconWarning,
				dangerMode: true,
			});
			return;
		}
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				setImageData({
					base64textString: reader.result,
					imageName: file.name,
					showImage: true,
				});
			} else {
				// Handle the case where reader.result is not a string (possibly an object)
				console.error('Error: Unexpected reader.result type:', typeof reader.result);
			}
		};
	};
	const showErrorAlert = (message: any) => {
		swal(UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed, message, UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError);
	};
	const validateImageSubmit = () => {
		if (imageData.imageName === '') return false;

		if (!UpsertBroadcastConstants.AllowedAttachment.test(imageData.imageName)) {
			showErrorAlert(UpsertBroadcastConstants.SwalUpsertBroadcastMessage.attachmentValidation);
			return true;
		}
		return false;
	};
	const validateAllowedHtmlTags = () => {
		const invalidTags = getInvalidHtmlTags(convertedContent, UpsertBroadcastConstants.AllowedHtmlTags);
		if (invalidTags.length > 0) {
			showErrorAlert(UpsertBroadcastConstants.SwalUpsertBroadcastMessage.htmlTagsValidation);
			return true;
		}
		return false;
	};
	const validateRequiredFields = () => {
		if (convertedValue === '' || convertedValue === undefined) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
			return true;
		}
	};
	const formik = useFormik({
		initialValues,
		onSubmit: async () => {
			setIsSubmitting(true);
			if (validateImageSubmit() || validateAllowedHtmlTags() || validateRequiredFields()) {
				setIsSubmitting(false);
				return;
			}
			swal({
				title: 'Confirmation',
				text: 'This action will update the setting data and configuration, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					upsertBotDetailAutoReply(imageData.base64textString, convertedContent);
				} else {
					setIsSubmitting(false);
				}
			});
		},
	});

	const upsertBotDetailAutoReply = async (attachment: string, message: string) => {
		const newBOTDetailAutoReplyRequest: BotDetailAutoreplyModel = {
			botDetailId: selectedBotAutoReply.botDetailId,
			telegramBotAutoReplyTriggerId: selectedBotAutoReply.telegramBotAutoReplyTriggerId,
			botDetailsAutoReplyId: selectedBotAutoReply.botDetailsAutoReplyId,
			attachment: attachment,
			trigger: selectedBotAutoReply.trigger,
			type: selectedBotAutoReply.type,
			chatValue: convertedValue,
			message: htmlDecode(message),
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) {
					setIsSubmitting(false);
					return;
				}
				UpSertBotDetailAutoReply(newBOTDetailAutoReplyRequest)
					.then((response) => {
						processUpSertBotDetailAutoReplyResponse(response, messagingHub, newBOTDetailAutoReplyRequest);
					})
					.catch((ex) => {
						swal('Failed', 'Problem saving bot details', 'error');
						setIsSubmitting(false);
					});
			});
		}, 1000);
	};
	const processUpSertBotDetailAutoReplyResponse = (
		response: AxiosResponse<any>,
		messagingHub: HubConnection,
		newBOTDetailAutoReplyRequest: BotDetailAutoreplyModel
	) => {
		if (response.status === successResponse) {
			messagingHub.on(newBOTDetailAutoReplyRequest.queueId.toString(), (message) => {
				setShowBoAutoReplyForm(false);
				setIsSubmitting(false);
			});
		} else {
			swal('Failed', 'Problem saving bot details', 'error');
			setIsSubmitting(false);
		}
	};
	const handleMessageEditorChange = useCallback((_content: string) => {
		const cleanHtml = DOMPurify.sanitize(_content, {ALLOWED_TAGS: UpsertBroadcastConstants.AllowedHtmlTags});
		setConvertedContent(cleanHtml);
	}, []);

	const toolbarOptions = [['bold', 'italic', 'underline', 'strike'], ['blockquote'], ['emoji'], ['link']];

	return (
		<FormModal show={showBoAutoReplyForm} headerTitle={'Edit Auto Reply'} haveFooter={false}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<FormGroupContainer>
						<div className='row'>
							<div className='col-lg-4 mt-1'>
								<BasicFieldLabel title={'Trigger'} />
								<input
									type='textbox'
									className='form-control form-control-sm'
									disabled
									aria-label='Trigger'
									value={selectedBotAutoReply['trigger']}
								/>
							</div>
							<div className='col-lg-4 mt-1'>
								<RequiredLabel title={'Chat Value'} />
								<input
									type='textbox'
									className='form-control form-control-sm'
									aria-label='Chat Value'
									value={convertedValue}
									disabled={selectedBotAutoReply['type'] === AutoReplyTypeEnum.Default}
									onChange={(e: any) => setConvertValueName(e.target.value)}
								/>
							</div>
							<div className='col-lg-4 mt-1'>
								<BasicFieldLabel title={'Type'} />
								<input type='textbox' className='form-control form-control-sm' disabled aria-label='Type' value={selectedBotAutoReply['type']} />
							</div>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='row'>
							<div className='col-lg-12 mt-1'>
								<BasicFieldLabel title={'Attachment'} />
							</div>
							<div className='col-lg-12 mt-1'>
								<input className='mb-3' type='file' onChange={convertToBase64} accept='image/*' />
								<br />
								<img src={imageData.base64textString} alt={imageData.imageName} width='50%' />
							</div>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						{/* <div className='row'>
							<div className='col-lg-12 mt-1'>
								<BasicFieldLabel title={'Message'} />
							</div>
						</div> */}
						{/* <div className='row'> */}
						<MLabQuillEditor
							isUploadToMlabStorage={false}
							uploadToMlabStorage={undefined}
							isReadOnly={false}
							quillValue={convertedContent}
							setQuillValue={(content: string) => {
								handleMessageEditorChange(content);
							}}
							hasImageToEditor={false}
							toolbarPropsOptions={toolbarOptions}
							formatProps={['bold', 'italic', 'underline', 'strike', 'blockquote', 'emoji', 'link']}
						/>
						{/* </div> */}
					</FormGroupContainer>
				</MainContainer>
				<ModalFooter style={{border: 0, float: 'right', paddingLeft: 0, paddingRight: 0}}>
					<LoaderButton
						access={true}
						loading={isSubmitting}
						title={'Submit'}
						loadingTitle={' Please wait...'}
						disabled={formik.isSubmitting || isSubmitting}
					/>
					<DefaultSecondaryButton
						access={true}
						title={'Close'}
						onClick={closeModalBOT}
						isDisable={isSubmitting}
						customStyle='btn btn-secondary btn-sm'
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default AddEditBotAutoReplyModal;
