import {Container, Row, Col, ModalFooter} from 'react-bootstrap-v5';
import {FormContainer, FormModal, LoaderButton, MlabButton} from '../../../../custom-components';
import {SwalDetails} from '../constants/CampaignSetting';
import Select from 'react-select';
import swal from 'sweetalert';
import {useEffect, useState} from 'react';
import {useBrands, useMessageTypeOptions} from '../../../../custom-functions';
import {STATUS_OPTIONS} from '../constants/SelectOptions';
import {OptionListModel} from '../../../../common/model';
import {ChannelType, ElementStyle, GenericStringContantsEnum, ModalName, pageMode, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {AddSkillRequestModel} from '../../models/requests/AddSkillRequestModel';
import useConstant from '../../../../constants/useConstant';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {IAuthState} from '../../../auth';
import {RootState} from '../../../../../setup';
import {upsertSkill, validateSkill} from '../../redux/SystemService';
import {ValidateSkillRequestModel} from '../../models/requests/ValidateSkillRequestModel';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useCaseCommOptions from '../../../case-communication/components/shared/hooks/useCaseCommOptions';
import useCustomerCaseHooks from '../../../case-management/shared/hooks/UseCustomerCaseHooks';
import { UseUserManagementHooks } from '../../../user-management/components/shared/hooks';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	modalAction: string;
	skillModelResponse?: any;
	closeModalAndSearch: () => void;
}
const initialValues: AddSkillRequestModel = {
	brandId: 0,
	id: null,
	isActive: false,
	licenseId: '',
	messageTypeId: 0,
	queueId: '',
	skillId: '',
	skillName: '',
	userId: '',
	mlabPlayerId: 0,
	agentUserId: 0,
	teamId: 0,
	topicId: 0,
	subtopicId: 0
};
const FormSchema = Yup.object().shape({
	name: Yup.string(),
});
const AddEditSkillModal: React.FC<Props> = ({showForm, closeModal, modalAction, skillModelResponse, closeModalAndSearch}) => {
	//Redux
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const [brand, setBrand] = useState<OptionListModel | any>(undefined);
	const [licenseID, setLicenseID] = useState<string | any>('');
	const [skillID, setSkillID] = useState<string | any>('');
	const [skillName, setSkillName] = useState<string | any>('');
	const [messageType, setMessageType] = useState<OptionListModel | any>(undefined);
	const [selectedPlayer, setSelectedPlayer] = useState<any>('');
	const [selectedAgentUsername, setSelectedAgentUsername] = useState<any>('');
	const [selectedTeam, setSelectedTeam] = useState<any>('');
	const [selectedTopic, setSelectedTopic] = useState< any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<any>('');
	const [status, setStatus] = useState<OptionListModel | any>(undefined);
	const [skillModelUDT, setSkillModelUDT] = useState<AddSkillRequestModel>(initialValues);
	const [isSubmitting, setIsSubmitting] = useState<boolean | any>(false);
	const [loading, setLoading] = useState<boolean>(false);
	//Constants
	const {SkillMappingMessageType} = useConstant();
	const brandOptions = useBrands();
	const messageTypeOptions = useMessageTypeOptions(ChannelType.ChatIntegrationId);
	const {SwalConfirmMessage, SwalSuccessMessage, successResponse, HubConnected, SwalServerErrorMessage} = useConstant();
	const { getSubtopicOptions, subtopicOptionList} = useCaseCommOptions();
	const { getPlayersByUsernameOptions, usernameOptions} = useCustomerCaseHooks();
	const { getCommProviderUserList, commProviderUserList, getTeamListByUserId, teamsByUserIdList} = UseUserManagementHooks();
	const {getTopicOptionsByBrandId, topicOptionListByBrand} = useSystemHooks();

	//Watchers
	useEffect(() => {
		setLoading(false);
		if (showForm) {
			getCommProviderUserList();
			if (modalAction == pageMode.create) {
				clearFields();
			}
			if (modalAction == pageMode.edit) loadData();
		} else {
			clearFields();
		}
	}, [showForm]);

	//methods
	const clearFields = () => {
		setSkillModelUDT({
			brandId: 0,
			id: null,
			isActive: false,
			licenseId: '',
			messageTypeId: 0,
			queueId: '',
			skillId: '',
			skillName: '',
			userId: '',
			mlabPlayerId: 0,
			agentUserId: 0,
			teamId: 0,
			topicId: 0,
			subtopicId: 0,
		});
		setBrand(null);
		setLicenseID('');
		setSkillID('');
		setSkillName('');
		setMessageType(null);
		setSelectedPlayer('');
		setSelectedAgentUsername('');
		setSelectedTeam('');
		setSelectedTopic('');
		setSelectedSubtopic('');
		setStatus(null);
		setIsSubmitting(false);
	};
	const loadData = () => {
		skillModelUDT.id = skillModelResponse.id;
		if (skillModelResponse?.brandId) onChangeBrand(brandOptions.find((d) => d.value === skillModelResponse?.brandId.toString()));
		if (skillModelResponse?.messageTypeId)
			onChangeMessageType(messageTypeOptions.find((d) => d.value === skillModelResponse?.messageTypeId.toString()));
		onChangeStatus(skillModelResponse.isActive ? STATUS_OPTIONS.find((d) => d.value == true) : STATUS_OPTIONS.find((d) => d.value == false));

		skillModelUDT.licenseId = skillModelResponse.licenseId;
		setLicenseID(skillModelResponse.licenseId);

		skillModelUDT.skillId = skillModelResponse.skillId;
		setSkillID(skillModelResponse.skillId);

		skillModelUDT.skillName = skillModelResponse.skillName;
		setSkillName(skillModelResponse.skillName);

		skillModelUDT.mlabPlayerId = skillModelResponse.mlabPlayerId;
		getPlayersByUsernameOptions(skillModelResponse.playerName, skillModelUDT.brandId, userAccessId);
		setSelectedPlayer({ value: skillModelResponse.mlabPlayerId, label: skillModelResponse.playerName});
		
		skillModelUDT.agentUserId = skillModelResponse.agentUserId;
		getTeamListByUserId(skillModelResponse.agentUserId);
		setSelectedAgentUsername({ value: skillModelResponse.agentUserId, label: skillModelResponse.agentUserName});
		
		skillModelUDT.teamId = skillModelResponse.teamId;
		setSelectedTeam({ value: skillModelResponse.teamId, label: skillModelResponse.teamName});

		skillModelUDT.topicId = skillModelResponse.topicId;
		getTopicOptionsByBrandId(skillModelResponse.brandId);
		setSelectedTopic({ value: skillModelResponse.topicId, label: skillModelResponse.topicName});
		
		skillModelUDT.subtopicId = skillModelResponse.subtopicId;
		getSubtopicOptions(skillModelResponse.topicId);
		setSelectedSubtopic({ value: skillModelResponse.subtopicId, label: skillModelResponse.subtopicName});
	};
	const onSubmit = () => {
		setIsSubmitting(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						skillModelUDT.userId = userId ? userId.toString() : '0';
						skillModelUDT.queueId = Guid.create().toString();
						upsertSkill(skillModelUDT)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(skillModelUDT.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										if (resultData.Status === successResponse) {
											swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
											setIsSubmitting(false);
											closeModalAndSearch();
										} else {
											swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
										}

										messagingHub.off(skillModelUDT.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(SwalServerErrorMessage.title, 'Problem in adding skill details', SwalServerErrorMessage.icon);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const isValid = () => {
		let isValid = true;

		if (!brand || brand.value === '' || brand.value === undefined) {
			return false;
		}
		if (licenseID === '' || licenseID === undefined) {
			return false;
		}
		if (skillID === '' || skillID === undefined) {
			return false;
		}
		if (skillName === '' || skillName === undefined) {
			return false;
		}
		if (!messageType || messageType.value === '' || messageType.value === undefined) {
			return false;
		}
		
		if (!status || status.value === '' || status.value === undefined) {
			return false;
		}
		return isValid;
	};

	const validateAbandonedChatSkillMapping = () => {
		if (!selectedPlayer || selectedPlayer.value === 0 || selectedPlayer.value === undefined) {
			return false;
		}
		if (!selectedAgentUsername || selectedAgentUsername.value === 0 || selectedAgentUsername.value === undefined) {
			return false;
		}
		if (!selectedTeam || selectedTeam.value === 0 || selectedTeam.value === undefined) {
			return false;
		}
		if (!selectedTopic || selectedTopic.value === 0 || selectedTopic.value === undefined) {
			return false;
		}
		if (!selectedSubtopic || selectedSubtopic.value === 0 || selectedSubtopic.value === undefined) {
			return false;
		}
		return true;
	}

	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (!isValid() || (messageType.value === SkillMappingMessageType.LIVE_PERSON && !validateAbandonedChatSkillMapping())) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, SwalDetails.ErrorIcon);
			} else {
				let request: ValidateSkillRequestModel = {
					id: skillModelUDT.id !== null && skillModelUDT.id > 0 ? skillModelUDT.id : null,
					licenseId: skillModelUDT.licenseId,
					skillId: skillModelUDT.skillId,
				};
				setSubmitting(true);
				setLoading(true);
				validateSkill(request)
					.then((response) => {
						if (response.data.status === successResponse) {
							swal({
								title: PROMPT_MESSAGES.ConfirmSubmitTitle,
								text: modalAction == pageMode.create ? PROMPT_MESSAGES.ConfirmSubmitMessageAdd : PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
								icon: SwalConfirmMessage.icon,
								buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
								dangerMode: true,
							}).then((onConfirm) => {
								if (onConfirm) {
									onSubmit();
								} else {
									setSubmitting(false);
									setLoading(false);
								}
							});
						} else {
							swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationSkillDuplicate, SwalDetails.ErrorIcon);
							setLoading(false);
						}
					})
					.catch(() => {
						swal('Failed', 'Connection error Please close the form and try again 2', 'error');
					});
			}
		},
	});
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
	const onChangeBrand = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.brandId = +val.value;
			setSkillModelUDT(skillModelUDT);
		}

		setBrand(val);
		getTopicOptionsByBrandId(val.value);
		setSelectedPlayer('');
		getPlayersByUsernameOptions('', skillModelUDT.brandId, userAccessId);
		setSelectedTopic('');
		setSelectedSubtopic('');
		getSubtopicOptions(0);
	};
	const onChangeMessageType = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.messageTypeId = +val.value;
			setSkillModelUDT(skillModelUDT);
		}
		setMessageType(val);
	};
	const searchUserName = (input: string) => {
		if (input.length > 2 && brand !== '') {
			getPlayersByUsernameOptions(input, brand.value, userAccessId);
		}
	};
	const onChangePlayerUsername = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.mlabPlayerId = +val.value;
		}
		setSelectedPlayer(val);
	};
	const onChangeAgentUsername = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.agentUserId = +val.value;
		}
		setSelectedAgentUsername(val);

		setSelectedTeam('');
		let _agentUserId: number = val.value;
		getTeamListByUserId(_agentUserId);
	};
	const onChangeTeam = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.teamId = +val.value;
		}
		setSelectedTeam(val);
	};
	const onChangeTopic = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.topicId = +val.value;
		}
		setSelectedTopic(val);
		
		setSelectedSubtopic('');
		let _topicId: number = val.value;
		getSubtopicOptions(_topicId);
	};
	const onChangeSubtopic = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.subtopicId = +val.value;
		}
		setSelectedSubtopic(val);
	};
	const onChangeStatus = (val: any) => {
		if (skillModelUDT) {
			skillModelUDT.isActive = val.value ? true : false;
			setSkillModelUDT(skillModelUDT);
		}
		setStatus(val);
	};
	const onChangeLicenseID = (val: string | any) => {
		if (skillModelUDT) {
			skillModelUDT.licenseId = val.target.value;
			setSkillModelUDT(skillModelUDT);
		}

		setLicenseID(val.target.value);
	};
	const onChangeSkillID = (val: string | any) => {
		if (skillModelUDT) {
			skillModelUDT.skillId = val.target.value;
			setSkillModelUDT(skillModelUDT);
		}
		setSkillID(val.target.value);
	};
	const onChangeSkillName = (val: string | any) => {
		if (skillModelUDT) {
			skillModelUDT.skillName = val.target.value;
			setSkillModelUDT(skillModelUDT);
		}
		setSkillName(val.target.value);
	};
	return (
		<FormModal
			headerTitle={
				(modalAction === pageMode.create ? GenericStringContantsEnum.AddLabel : GenericStringContantsEnum.EditLabel) + ' ' + ModalName.Skill
			}
			haveFooter={false}
			show={showForm}
		>
			<FormContainer onSubmit={formik.handleSubmit}>
				<Container>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Brand</label>
							<Select style={{width: '100%'}} options={brandOptions} onChange={onChangeBrand} value={brand} />
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>License ID</label>
							<input type='text' className='form-control form-control-sm' aria-label='License ID' value={licenseID} onChange={onChangeLicenseID} />
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Skill ID</label>
							<input type='text' className='form-control form-control-sm' aria-label='Skill ID' value={skillID} onChange={onChangeSkillID} />
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Skill Name</label>
							<input type='text' className='form-control form-control-sm' aria-label='Skill Name' value={skillName} onChange={onChangeSkillName} />
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Message Type</label>
							<Select style={{width: '100%'}} options={messageTypeOptions} onChange={onChangeMessageType} value={messageType} />
						</Col>
					</Row>
					{
						(messageType?.value === '12') && (
							<div style={{ backgroundColor: '#f6f6f6', padding: '0 10px 10px 10px', borderRadius: '8px' }}>
								<Row style={{marginTop: 10}}>
									<Col sm={12} style={{marginTop: 10}}>
										<label htmlFor='abandonedChat' className='form-label-sm fst-italic'>Pre-defined details for Chat</label>
									</Col>
								</Row>
								<Row id='abandonedChat' style={{marginTop: 10}}>
									<Col sm={12}>
										<label htmlFor='ac-player' className='form-label-sm required'>Player Username </label>
										<Select id="ac-player" style={{width: '100%'}} 
											options={usernameOptions.flatMap((obj) => [
											{
												label: obj.username,
												value: obj.mlabPlayerId,
											},
											])}
											onChange={onChangePlayerUsername} 
											onInputChange={searchUserName} 
											value={selectedPlayer} />
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label htmlFor='ac-agent' className='form-label-sm required'>Agent Username</label>
										<Select id='ac-agent' style={{width: '100%'}} options={commProviderUserList} onChange={onChangeAgentUsername} value={selectedAgentUsername} />
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label htmlFor='ac-team' className='form-label-sm required'>Team Name</label>
										<Select id='ac-team' style={{width: '100%'}} options={teamsByUserIdList} onChange={onChangeTeam} value={selectedTeam} />
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label htmlFor='ac-topic' className='form-label-sm required'>Topic</label>
										<Select id='ac-topic' style={{width: '100%'}} options={topicOptionListByBrand} onChange={onChangeTopic} value={selectedTopic} />
									</Col>
								</Row>
								<Row style={{marginTop: 10}}>
									<Col sm={12}>
										<label htmlFor='ac-subtopic' className='form-label-sm required'>Subtopic</label>
										<Select id='ac-subtopic' style={{width: '100%'}} options={subtopicOptionList} onChange={onChangeSubtopic} value={selectedSubtopic} />
									</Col>
								</Row>
							</div>
						)
					}
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Status</label>
							<Select style={{width: '100%'}} options={STATUS_OPTIONS} onChange={onChangeStatus} value={status} />
						</Col>
					</Row>
				</Container>
				<ModalFooter style={{border: 0}}>
					<LoaderButton
						access={userAccess.includes(USER_CLAIMS.SkillMappingWrite)}
						loading={loading}
						title={'Submit'}
						loadingTitle={' Please wait... '}
						disabled={loading}
					/>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Close'}
						additionalClassStyle={{marginRight: 0}}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={loading}
						loadingTitle={'Please wait...'}
						disabled={loading}
						onClick={() => {
							onCloseModal();
						}}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default AddEditSkillModal;
