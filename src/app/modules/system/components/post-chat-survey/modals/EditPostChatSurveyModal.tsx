import {Container, Row, Col, ModalFooter} from 'react-bootstrap-v5';
import Select from 'react-select';
import swal from 'sweetalert';
import {useEffect, useState} from 'react';
import {PostChatSurveyRequestModel} from '../../../models/requests/PostChatSurveyRequestModel';
import {MasterReferenceOptionModel} from '../../../../../common/model';
import {useBrands, useMasterReferenceOption, useMessageTypeOptions} from '../../../../../custom-functions';
import {ChannelType, ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../../constants/Constants';
import {DefaultSecondaryButton, FormModal, MlabButton} from '../../../../../custom-components';
import {BOOLEAN_OPTIONS, STATUS_OPTIONS} from '../../constants/SelectOptions';
import {getPostChatSurveyById, upsertPostChatSurvey, validatePostChatSurveyQuestionID} from '../../../redux/SystemService';
import useConstant from '../../../../../constants/useConstant';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../../setup';
import {SkillsUdtModel} from '../../../models/udt/SkillsUdtModel';
import {SelectFilter} from '../../../../relationship-management/shared/components';
import {useSystemOptionHooks} from '../../../shared';
import {PostChatSurveyResponseModel} from '../../../models';
import {PostChatSurveyIdRequestModel} from '../../../models/requests/PostChatSurveyIdRequestModel';
import {SkillsResponseModel} from '../../../models/response/SkillsResponseModel';
import {LicenseResponseModel} from '../../../models/response/LicenseResponseModel';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	postChatSurveyId: number;
	closeModalAndSearch: () => void;
}

const EditPostChatSurvey: React.FC<Props> = ({showForm, closeModal, postChatSurveyId, closeModalAndSearch}) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {getPostChatSurveyOptions, postChatSurveyOptions} = useSystemOptionHooks();
	//States
	const {SwalConfirmMessage, SwalFailedMessage, SwalSuccessMessage, successResponse, HubConnected} = useConstant();
	const [updatedBrand, setUpdatedBrand] = useState<any>(undefined);
	const [updatedMessageType, setUpdatedMessageType] = useState<any>(undefined);
	const [selectedUpdatedLicenseOption, setSelectedUpdatedLicenseOption] = useState<LicenseResponseModel | undefined>(undefined);
	const [selectedUpdatedSkillsOption, setSelectedUpdatedSkillsOption] = useState<Array<SkillsResponseModel>>([]);
	const [updatedQuestionID, setUpdatedQuestionID] = useState<any>('');
	const [updatedQuestion, setUpdatedQuestion] = useState<any>('');
	const [updatedQuestionEN, setUpdatedQuestionEN] = useState<any>('');
	const [updatedFreeText, setUpdatedFreeText] = useState<any>(undefined);
	const [updatedStatus, setUpdatedStatus] = useState<any>(undefined);
	const [updatedSurveyID, setUpdatedSurveyID] = useState<any>('');
	const [selectedUpdatedCSATTypeIdOption, setSelectedUpdatedCSATTypeIdOption] = useState<any>(undefined);

	const [updatedLicenseListOptions, setUpdatedLicenseListOptions] = useState<Array<LicenseResponseModel>>([]);
	const [updatedSkillListOptions, setUpdatedSkillListOptions] = useState<Array<SkillsResponseModel>>([]);

	const [rowData, setRowData] = useState<any>(undefined);

	//Options
	const brandOptions = useBrands();
	const messageTypeOptions = useMessageTypeOptions(ChannelType.ChatIntegrationId);
	const CSATReferenceId = 266;
	const defaultSelect = [{value: '0', label: 'Select...'}];
	const csatListOptions = useMasterReferenceOption(CSATReferenceId.toString())
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === CSATReferenceId)
		.map((x: MasterReferenceOptionModel) => x.options);
	const csatOptions = [...defaultSelect, ...csatListOptions];

	//Watchers
	useEffect(() => {
		clearFields();
		if (showForm && postChatSurveyId > 0) {
			getPostChatSurveyRecord(postChatSurveyId);
		}
	}, [showForm]);

	useEffect(() => {
		setSelectedUpdatedLicenseOption(undefined);
		const licenses = postChatSurveyOptions.licenseByBrandMessageType.filter(
			(t) => t.messageTypeId == updatedMessageType?.value && t.brandId == updatedBrand?.value
		);
		setUpdatedLicenseListOptions(licenses);

		let selectedLicenseText = licenses.find((t) => t.value == rowData.license);
		setSelectedUpdatedLicenseOption(selectedLicenseText);
	}, [updatedBrand, updatedMessageType]);

	const onChangeLicense = (val: any) => {
		setSelectedUpdatedLicenseOption(val);
		setSelectedUpdatedSkillsOption([]);

		const skills = postChatSurveyOptions.skillsByLicense.filter(
			(t) => t.license === val.label && t.messageTypeId == updatedMessageType?.value && t.brandId == updatedBrand?.value
		);
		setUpdatedSkillListOptions(skills);
	};

	// Side Effects
	useEffect(() => {
		getPostChatSurveyOptions();
	}, []);

	//methods
	const clearFields = () => {
		setUpdatedBrand(null);
		setUpdatedMessageType(null);
		setSelectedUpdatedLicenseOption(undefined);
		setSelectedUpdatedSkillsOption([]);
		setUpdatedQuestionID('');
		setUpdatedQuestion('');
		setUpdatedQuestionEN('');
		setUpdatedFreeText(null);
		setUpdatedStatus(null);
		setUpdatedSurveyID('');
		setSelectedUpdatedCSATTypeIdOption(null);
	};
	const onCloseModal = () => {
		swal({
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			icon: SwalConfirmMessage.icon,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			dangerMode: true,
		}).then((toConfirm) => {
			if (toConfirm) {
				closeModal();
			}
		});
	};

	const getPostChatSurveyRecord = (pcsId: number) => {
		const request: PostChatSurveyIdRequestModel = {
			postChatSurveyId: pcsId,
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getPostChatSurveyById(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						let resultData = response.data as PostChatSurveyResponseModel;
						setRowData(resultData);

						let getSelectedBrandText = brandOptions.find((b) => b.value == resultData.brandId.toString());
						let getSelectedMessageTypeText = messageTypeOptions.find((b) => b.value == resultData.messageTypeId.toString());
						let getSelectedLicenseText = postChatSurveyOptions.licenseByBrandMessageType.find((t) => t.value == resultData.license);
						let getSkillsOption: Array<SkillsResponseModel> = [];
						resultData.skillsList?.forEach((item) => {
							let option = postChatSurveyOptions.skillsByLicense.find((c) => c.value == item.skillId)!;
							getSkillsOption.push(option);
						});
						
						setUpdatedBrand(getSelectedBrandText);
						setUpdatedMessageType(getSelectedMessageTypeText);
						setSelectedUpdatedLicenseOption(getSelectedLicenseText);
						setSelectedUpdatedSkillsOption(getSkillsOption);
						setUpdatedQuestionID(resultData.questionId);
						setUpdatedQuestion(resultData.questionMessage);
						setUpdatedQuestionEN(resultData.questionMessageEN);

						setUpdatedSurveyID(resultData.surveyId);
						setSelectedUpdatedCSATTypeIdOption(csatOptions.find((csat) => csat.value === resultData.csatTypeId?.toString()));
						setUpdatedFreeText(BOOLEAN_OPTIONS.find((c) => c.value == resultData.freeText));
						setUpdatedStatus(STATUS_OPTIONS.find((c) => c.value == resultData.status));

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};

	const _timeoutHandler = (messagingHub: any) => {
		setTimeout(() => {
			if (messagingHub.state === HubConnected) {
				messagingHub.stop();
			}
		}, 30000)
	}

	const processUpsertPostChatSurvey = (messagingHub: HubConnection, request:PostChatSurveyRequestModel, response: AxiosResponse<any>) => {
		//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
		if (response.status === 200) {
			messagingHub.on(request.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);
				if (resultData.Status === 200) {
					swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
					closeModalAndSearch();
				} else {
					swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
				}
				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
			});
			_timeoutHandler(messagingHub);
		} else {
			messagingHub.stop();
			swal('Failed', response.data.message, 'error');
		}
	}

	const processValidatePostChatSurveyQuestionID = (messagingHub: HubConnection, response: AxiosResponse<any>, skillsUdt: Array<SkillsUdtModel>) => {
		if (response.status === successResponse) {
			let result = response.data;

			if (result) {
				swal('Error', 'Unable to proceed. Question ID already exists on the Skill.', 'error');
			} else {
				swal({
					title: PROMPT_MESSAGES.ConfirmSubmitTitle,
					text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
					icon: SwalConfirmMessage.icon,
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						const request: PostChatSurveyRequestModel = {
							brandId: updatedBrand.value,
							messageTypeId: updatedMessageType.value,
							questionId: updatedQuestionID,
							questionMessage: updatedQuestion,
							questionMessageEN: updatedQuestionEN,
							freeText: updatedFreeText.value,
							status: updatedStatus.value,
							licenseId: selectedUpdatedLicenseOption?.value,
							skillsList: skillsUdt,
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							postChatSurveyId: postChatSurveyId,
							surveyId: updatedSurveyID,
							csatTypeId: parseInt(selectedUpdatedCSATTypeIdOption?.value) > 0 ? parseInt(selectedUpdatedCSATTypeIdOption?.value) : undefined,
						};
						upsertPostChatSurvey(request)
							.then((response) => {
								processUpsertPostChatSurvey(messagingHub, request, response);
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in Saving Post Chat Survey', 'error');
							});
					}
				});
			}
		} else {
			swal('Failed', 'Connection error Please close the form and try again 1', 'error');
		}
	}
	
	const submit = () => {
		if (isValid()) {
			savePCS();
		} else {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}
	};

	const savePCS = () => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						let updatedSkillsUdt: Array<SkillsUdtModel> = [];

						selectedUpdatedSkillsOption.forEach((item) => {
							const updatedSkillsUdtModel: SkillsUdtModel = {
								postChatSurveySkillId: 0,
								skillId: item.value,
							};
							updatedSkillsUdt.push(updatedSkillsUdtModel);
						});
						let updatedSkillCommaDelimited = updatedSkillsUdt.map((d) => d.skillId).join(',');
						
						validatePostChatSurveyQuestionID(updatedQuestionID, postChatSurveyId, updatedSkillCommaDelimited)
							.then((response) => {
								processValidatePostChatSurveyQuestionID(messagingHub, response, updatedSkillsUdt);
							})
							.catch(() => {
								swal(SwalFailedMessage.title, 'Connection error Please close the form and try again 2', SwalFailedMessage.icon);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const isValid = () => {
		const isValueEmpty = (value:any) => value === '' || value === undefined;

		if (!updatedBrand?.value ||
			!updatedMessageType?.value ||
			!selectedUpdatedLicenseOption?.value ||
			!selectedUpdatedSkillsOption || selectedUpdatedSkillsOption.length === 0 ||
			isValueEmpty(updatedQuestionID) ||
			isValueEmpty(updatedQuestion) ||
			isValueEmpty(updatedQuestionEN) ||
			!updatedStatus || isValueEmpty(updatedStatus.value) ||
			!updatedFreeText || isValueEmpty(updatedFreeText.value) ||
			isValueEmpty(updatedSurveyID)) {
			return false;
		}

    	return true;
	};

	return (
		<FormModal headerTitle={'Edit PCS Question'} haveFooter={false} show={showForm}>
			<Container>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-brand' className='form-label-sm required'>Brand</label>
						<Select id='edit-pcs-brand' style={{width: '100%'}} options={brandOptions} onChange={(val: any) => setUpdatedBrand(val)} value={updatedBrand} />
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-message-type' className='form-label-sm required'>Message Type</label>
						<Select id='edit-pcs-message-type' style={{width: '100%'}} options={messageTypeOptions} onChange={(val: any) => setUpdatedMessageType(val)} value={updatedMessageType} />
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<SelectFilter
							isRequired={true}
							isMulti={false}
							label='License'
							options={updatedLicenseListOptions}
							onChange={onChangeLicense}
							value={selectedUpdatedLicenseOption}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<SelectFilter
							isRequired={true}
							isMulti={true}
							label='Skill'
							options={updatedSkillListOptions}
							onChange={(val: any) => setSelectedUpdatedSkillsOption(val)}
							value={selectedUpdatedSkillsOption}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-survey-id' className='form-label-sm required'>Survey ID</label>
						<input
							id='edit-pcs-survey-id'
							type='text'
							className='form-control form-control-sm'
							aria-label='Survey ID'
							value={updatedSurveyID}
							onChange={(val: any) => setUpdatedSurveyID(val.target.value)}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-question-id' className='form-label-sm required'>Question ID</label>
						<input
							id='edit-pcs-question-id'
							type='text'
							className='form-control form-control-sm'
							aria-label='Question ID'
							value={updatedQuestionID}
							onChange={(val: any) => setUpdatedQuestionID(val.target.value)}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-question-message' className='form-label-sm required'>Question Message</label>
						<textarea 
							id='edit-pcs-question-message'
							className='form-control form-control-sm'
							aria-label='Question'
							value={updatedQuestion}
							onChange={(val: any) => setUpdatedQuestion(val.target.value)}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-question-message-en' className='form-label-sm required'>Question Message (EN)</label>
						<textarea
							id='edit-pcs-question-message-en'
							className='form-control form-control-sm'
							aria-label='Question EN'
							value={updatedQuestionEN}
							onChange={(val: any) => setUpdatedQuestionEN(val.target.value)}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-free-text' className='form-label-sm required'>Free Text</label>
						<Select id='edit-pcs-free-text' style={{width: '100%'}} options={BOOLEAN_OPTIONS} onChange={(val: any) => setUpdatedFreeText(val)} value={updatedFreeText} />
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-csat-type' className='form-label-sm'>CSAT Type</label>
						<Select
							id='edit-pcs-csat-type'
							style={{width: '100%'}}
							options={csatOptions}
							placeholder={<div>Select...</div>}
							onChange={(val: any) => setSelectedUpdatedCSATTypeIdOption(val)}
							value={selectedUpdatedCSATTypeIdOption}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='edit-pcs-status' className='form-label-sm required'>Status</label>
						<Select id='edit-pcs-status' style={{width: '100%'}} options={STATUS_OPTIONS} onChange={(val: any) => setUpdatedStatus(val)} value={updatedStatus} />
					</Col>
				</Row>
			</Container>
			<ModalFooter style={{border: 0}}>
				<MlabButton
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loadingTitle={' Please wait...'}
					onClick={() => {
						submit();
					}}
					access={true}
				></MlabButton>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={onCloseModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default EditPostChatSurvey;