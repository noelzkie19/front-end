import {Container, Row, Col, ModalFooter} from 'react-bootstrap-v5';
import Select from 'react-select';
import swal from 'sweetalert';
import {useEffect, useState} from 'react';
import {PostChatSurveyRequestModel} from '../../../models/requests/PostChatSurveyRequestModel';
import {MasterReferenceOptionModel} from '../../../../../common/model';
import {useBrands, useMasterReferenceOption, useMessageTypeOptions} from '../../../../../custom-functions';
import {ChannelType, ElementStyle, PROMPT_MESSAGES} from '../../../../../constants/Constants';
import {DefaultSecondaryButton, FormModal, MlabButton} from '../../../../../custom-components';
import {BOOLEAN_OPTIONS, STATUS_OPTIONS} from '../../constants/SelectOptions';
import {upsertPostChatSurvey, validatePostChatSurveyQuestionID} from '../../../redux/SystemService';
import useConstant from '../../../../../constants/useConstant';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../../setup';
import {SkillsUdtModel} from '../../../models/udt/SkillsUdtModel';
import {SelectFilter} from '../../../../relationship-management/shared/components';
import {useSystemOptionHooks} from '../../../shared';
import {SkillsResponseModel} from '../../../models/response/SkillsResponseModel';
import {LicenseResponseModel} from '../../../models/response/LicenseResponseModel';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	closeModalAndSearch: () => void;
}

const AddPostChatSurvey: React.FC<Props> = ({showForm, closeModal, closeModalAndSearch}) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {getPostChatSurveyOptions, postChatSurveyOptions} = useSystemOptionHooks();
	const messageTypeOptions = useMessageTypeOptions(ChannelType.ChatIntegrationId);

	//States
	const {SwalConfirmMessage, SwalFailedMessage, SwalSuccessMessage, successResponse, HubConnected} = useConstant();
	const [brand, setBrand] = useState<any>(undefined);
	const [messageType, setMessageType] = useState<any>(undefined);
	const [selectedLicenseOption, setSelectedLicenseOption] = useState<LicenseResponseModel | null>(null);
	const [selectedSkillsOption, setSelectedSkillsOption] = useState<Array<SkillsResponseModel>>([]);
	const [questionID, setQuestionID] = useState<any>('');
	const [question, setQuestion] = useState<any>('');
	const [questionEN, setQuestionEN] = useState<any>('');
	const [freeText, setFreeText] = useState<any>(undefined);
	const [status, setStatus] = useState<any>(undefined);
	const [surveyID, setSurveyID] = useState<any>('');
	const [selectedCSATTypeIdOption, setSelectedCSATTypeIdOption] = useState<any>(undefined);

	const [licenseListOptions, setLicenseListOptions] = useState<Array<LicenseResponseModel>>([]);
	const [skillListOptions, setSkillListOptions] = useState<Array<SkillsResponseModel>>([]);

	//Options
	const brandOptions = useBrands();
	const CONNECTED: number = 200;
	const CSATReferenceId = 266;

	const defaultSelect = [{value: '0', label: 'Select...'}];
	const csatListOptions = useMasterReferenceOption(CSATReferenceId.toString())
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === CSATReferenceId)
		.map((x: MasterReferenceOptionModel) => x.options);
	const csatOptions = [...defaultSelect, ...csatListOptions];

	//Watchers
	useEffect(() => {
		if (showForm) {
			getPostChatSurveyOptions();
			clearFields();
		}
	}, [showForm]);

	useEffect(() => {
		setSelectedLicenseOption(null);
		const licenses = postChatSurveyOptions.licenseByBrandMessageType.filter(
			(t) => t.messageTypeId == messageType?.value && t.brandId == brand?.value
		);
		setLicenseListOptions(licenses);
	}, [brand, messageType]);

	useEffect(() => {
		setSelectedSkillsOption([]);
		const skills = postChatSurveyOptions.skillsByLicense.filter(
			(t) => t.license === selectedLicenseOption?.label && t.messageTypeId == messageType?.value && t.brandId == brand?.value
		);
		setSkillListOptions(skills);
	}, [selectedLicenseOption]);

	//methods
	const clearFields = () => {
		setBrand(null);
		setMessageType(null);
		setSelectedLicenseOption(null);
		setSelectedSkillsOption([]);
		setQuestionID('');
		setQuestion('');
		setQuestionEN('');
		setFreeText(null);
		setStatus(null);
		setSurveyID('');
		setSelectedCSATTypeIdOption(null);
	};
	const onCloseModal = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((toConfirm) => {
			if (toConfirm) {
				closeModal();
			}
		});
	};
	const submit = () => {
		if (isValid()) {
			savePCS();
		} else {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}
	};

	const _timeoutHandler = (messagingHub: any) => {
		setTimeout(() => {
			if (messagingHub.state === HubConnected) {
				messagingHub.stop();
			}
		}, 30000)
	}

	const processUpsertPostChatSurvey = (messagingHub: HubConnection, request: PostChatSurveyRequestModel, response: AxiosResponse<any>) => {
		if (response.status === CONNECTED) {
			messagingHub.on(request.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);
				if (resultData.Status === CONNECTED) {
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
	};

	const processValidatePostChatSurveyQuestionID = (messagingHub: HubConnection, response: AxiosResponse<any>, skillsUdt: Array<SkillsUdtModel>) => {
		if (response.status === successResponse) {
			let result = response.data;
			if (result) {
				swal('Error', 'Unable to proceed. Question ID already exists on the Skill.', 'error');
			} else {
				swal({
					title: PROMPT_MESSAGES.ConfirmSubmitTitle,
					text: PROMPT_MESSAGES.ConfirmSubmitMessageAdd,
					icon: SwalConfirmMessage.icon,
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						const request: PostChatSurveyRequestModel = {
							brandId: brand.value,
							messageTypeId: messageType.value,
							questionId: questionID,
							questionMessage: question,
							questionMessageEN: questionEN,
							freeText: freeText.value,
							status: status.value,
							licenseId: selectedLicenseOption?.value,
							skillsList: skillsUdt,
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							postChatSurveyId: 0,
							surveyId: surveyID,
							csatTypeId: parseInt(selectedCSATTypeIdOption?.value) > 0 ? parseInt(selectedCSATTypeIdOption?.value) : undefined,
						};
						upsertPostChatSurvey(request)
							.then((response) => {
								//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
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

	const savePCS = () => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						let skillsUdt: Array<SkillsUdtModel> = [];

						selectedSkillsOption.forEach((item) => {
							const skillsUdtModel: SkillsUdtModel = {
								postChatSurveySkillId: 0,
								skillId: item.value,
							};
							skillsUdt.push(skillsUdtModel);
						});
						let skillCommaDelimited = skillsUdt.map((d) => d.skillId).join(',');
						validatePostChatSurveyQuestionID(questionID, 0, skillCommaDelimited)
							.then((response) => {
								processValidatePostChatSurveyQuestionID(messagingHub, response, skillsUdt);
							})
							.catch(() => {
								swal('Failed', 'Connection error Please close the form and try again 2', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const isValid = () => {
		const isValueEmpty = (value:any) => value === '' || value === undefined;

		if (!brand?.value ||
			!messageType?.value ||
			!selectedLicenseOption?.value ||
			!selectedSkillsOption || selectedSkillsOption.length === 0 ||
			isValueEmpty(questionID) ||
			isValueEmpty(question) ||
			isValueEmpty(questionEN) ||
			!status || isValueEmpty(status.value) ||
			!freeText || isValueEmpty(freeText.value) ||
			isValueEmpty(surveyID)) {
			return false;
		}

		return true;
	};

	return (
		<FormModal headerTitle={'Add PCS Question'} haveFooter={false} show={showForm}>
			<Container>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-brand' className='form-label-sm required'>Brand</label>
						<Select id='add-pcs-brand' style={{width: '100%'}} options={brandOptions} onChange={(val: any) => setBrand(val)} value={brand} />
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-message-type' className='form-label-sm required'>Message Type</label>
						<Select id='add-pcs-message-type' style={{width: '100%'}} options={messageTypeOptions} onChange={(val: any) => setMessageType(val)} value={messageType} />
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<SelectFilter
							isRequired={true}
							isMulti={false}
							label='License'
							options={licenseListOptions}
							onChange={(val: any) => setSelectedLicenseOption(val)}
							value={selectedLicenseOption}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<SelectFilter
							isRequired={true}
							isMulti={true}
							label='Skill'
							options={skillListOptions}
							onChange={(val: any) => setSelectedSkillsOption(val)}
							value={selectedSkillsOption}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-survey-id' className='form-label-sm required'>Survey ID</label>
						<input
							id='add-pcs-survey-id'
							type='text'
							className='form-control form-control-sm'
							aria-label='Survey ID'
							value={surveyID}
							onChange={(val: any) => setSurveyID(val.target.value)}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-question-id' className='form-label-sm required'>Question ID</label>
						<input
							id='add-pcs-question-id'
							type='text'
							className='form-control form-control-sm'
							aria-label='Question ID'
							value={questionID}
							onChange={(val: any) => setQuestionID(val.target.value)}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-question-message' className='form-label-sm required'>Question Message</label>
						<textarea
							id='add-pcs-question-message'
							className='form-control form-control-sm'
							aria-label='Question Message'
							value={question}
							onChange={(val: any) => setQuestion(val.target.value)}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-question-message-en' className='form-label-sm required'>Question Message (EN)</label>
						<textarea
							id='add-pcs-question-message-en'
							className='form-control form-control-sm'
							aria-label='Question Message (EN)'
							value={questionEN}
							onChange={(val: any) => setQuestionEN(val.target.value)}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-free-text' className='form-label-sm required'>Free Text</label>
						<Select id='add-pcs-free-text' style={{width: '100%'}} options={BOOLEAN_OPTIONS} onChange={(val: any) => setFreeText(val)} value={freeText} />
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-csat-type' className='form-label-sm'>CSAT Type</label>
						<Select
							id='add-pcs-csat-type'
							style={{width: '100%'}}
							options={csatOptions}
							onChange={(val: any) => setSelectedCSATTypeIdOption(val)}
							value={selectedCSATTypeIdOption}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='add-pcs-status' className='form-label-sm required'>Status</label>
						<Select id='add-pcs-status' style={{width: '100%'}} options={STATUS_OPTIONS} onChange={(val: any) => setStatus(val)} value={status} />
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

export default AddPostChatSurvey;