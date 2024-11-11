import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {OptionListModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {DefaultSecondaryButton, FormContainer, FormGroupContainer, FormModal, LoaderButton, RequiredLabel} from '../../../../custom-components';
import {useMasterReferenceOption, useUserOptionList} from '../../../../custom-functions';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {useSystemOptionHooks} from '../../../system/shared';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {BotDetailsByIdRequest} from '../../models/request/BotDetailsByIdRequest';
import {BotDetailsFilterResponse} from '../../models/response/BotDetailsFilterResponse';
import {UpSertBotDetails, UpSertBotDetailsResult, ValidateBotId, ValidateTelegramBot} from '../../redux/ManageBotApi';
interface ModalProps {
	showForm: boolean;
	closeModal: () => void;
	modalAction: string;
	actionTitle?: any;
	modalBotDetailId?: number;
	modalBotDetailByIdData?: BotDetailsFilterResponse;
	setModalBotDetailId?: (e: any) => void;
	setModalBotDetailName: (e: any) => void;
}

interface BotFormValues {
	botDetailById: number;
	botUsername: string;
	botId?: number;
	botToken: string;
	brandId: number;
	botUserId: number;
	statusId: number;
}

const initialValues: BotFormValues = {
	botDetailById: 0,
	botUsername: '',
	botId: 0,
	botToken: '',
	brandId: 0,
	botUserId: 0,
	statusId: 0,
};

const AddEditBotModal: React.FC<ModalProps> = ({
	showForm,
	closeModal,
	modalAction,
	actionTitle,
	modalBotDetailId,
	modalBotDetailByIdData,
	setModalBotDetailId,
	setModalBotDetailName,
}) => {
	// states
	const {getBrandOptions, brandOptionList} = useSystemOptionHooks();
	const {userList} = useUserOptionList();
	const {BotDetailConstants, successResponse, HubConnected} = useConstant();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	usePromptOnUnload(true, 'Are you sure you want to leave?');

	const emptyOption = {value: '', label: ''};
	const emptyBotDetailByIdData = {
		botDetailId: 0,
		botId: 0,
		botMlabUser: '',
		botMlabUserId: 0,
		botToken: '',
		botUsername: '',
		brandId: 0,
		brand: '',
		status: '',
		statusId: 0,
	};

	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const masterReference = useMasterReferenceOption(`${BotDetailConstants.BotStatusMasterReferenceParentId}`);
	const botStatusOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId === parseInt(BotDetailConstants.BotStatusMasterReferenceParentId))
		.map((obj) => obj.options);
	const [selectedBrand, setSelectedBrand] = useState<OptionListModel>(emptyOption);
	const [selectedUser, setSelectedUser] = useState<OptionListModel>(emptyOption);
	const [selectedStatus, setSelectedStatus] = useState<OptionListModel>(emptyOption || modalBotDetailByIdData?.['status']);
	const [botDetailByIdData, setBotDetailByIdData] = useState<BotDetailsFilterResponse>(emptyBotDetailByIdData);
	const [showToken, setShowToken] = useState(false);
	const [botToken, setBotToken] = useState<string>('');
	const [disableForm, setDisableForm] = useState<boolean>(false);
	const [botUsername, setBotUsername] = useState<any>(undefined);

	// effects
	useEffect(() => {
		getBrandOptions();
		onFocusBotToken();
	}, []);

	useEffect(() => {
		if (showForm) {
			clearFields();
			setShowToken(false);
			getAddOrEditDetails(modalAction);
		}
	}, [showForm]);

	useEffect(() => {
		const botTokenInput = document.getElementById('botToken') as HTMLInputElement;

		if (botTokenInput) {
			botTokenInput.type = botToken.length === 0 ? 'text' : determineTokenType();
		}
	}, [botToken]);

	const closeModalBOT = () => {
		swal({
			title: BotDetailConstants.SwalBotDetailMessage.titleConfirmation,
			text: BotDetailConstants.SwalBotDetailMessage.textDiscarded,
			icon: BotDetailConstants.SwalBotDetailMessage.iconWarning,
			buttons: [BotDetailConstants.SwalBotDetailMessage.btnNo, BotDetailConstants.SwalBotDetailMessage.btnYes],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				closeModal();
			}
		});
	};

	const getAddOrEditDetails = (action: string) => {
		if (action === BotDetailConstants.EDIT) {
			getBOTDetails();
			if (modalBotDetailByIdData) {
				setBotDetailByIdData(modalBotDetailByIdData);
			}
		} else {
			setSelectedStatus(BotDetailConstants.BotStatusDefault);
		}
	};

	const handleToggleValues = () => {
		setShowToken((prevState) => !prevState);
	};

	const onFocusBotToken = () => {
		const botTokenInput = document.getElementById('botToken') as HTMLInputElement;

		if (botTokenInput) {
			const tokenType = botToken.length === 0 ? 'text' : determineTokenType();
			botTokenInput.type = tokenType;
		}
	};

	function determineTokenType(): 'text' | 'password' {
		return showToken ? 'text' : 'password';
	}

	const onChangeBotToken = (e: React.ChangeEvent<HTMLInputElement>) => {
		setBotToken(e.target.value);

		const botTokenInput = document.getElementById('botToken') as HTMLInputElement;

		if (botTokenInput) {
			botTokenInput.type = e.target.value.length === 0 ? 'text' : determineTokenType();
		}
	};

	const getBOTDetails = () => {
		if (modalBotDetailByIdData) {
			formik.setFieldValue('botId', modalBotDetailByIdData.botId);
			formik.setFieldValue('botToken', modalBotDetailByIdData.botToken);
			formik.setFieldValue('botUsername', modalBotDetailByIdData.botUsername);

			setBotUsername(modalBotDetailByIdData.botUsername);
			setBotToken(modalBotDetailByIdData.botToken);

			const brand = brandOptionList.find((b) => b.value === modalBotDetailByIdData?.brandId?.toString());
			setSelectedBrand(brand || emptyOption);

			const userOption = userList.find((u) => u.value === modalBotDetailByIdData?.botMlabUserId?.toString());
			setSelectedUser(userOption || emptyOption);

			const status = botStatusOptions.find((u) => u.value === modalBotDetailByIdData?.statusId?.toString());
			setSelectedStatus(status || emptyOption);
		}
	};

	const clearFields = () => {
		formik.setFieldValue('botId', '');
		formik.setFieldValue('botToken', '');
		formik.setFieldValue('botUsername', '');
		setBotUsername('');
		setBotToken('');
		setSelectedBrand(emptyOption);
		setSelectedUser(emptyOption);
		setSelectedStatus(emptyOption);
	};

	const onChangeSelectedBrand = (value: OptionListModel) => {
		setSelectedBrand(value);
	};

	const onChangeSelectedUser = (value: OptionListModel) => {
		setSelectedUser(value);
	};

	const onChangeSelectedStatus = (value: OptionListModel) => {
		setSelectedStatus(value);
	};

	const formik = useFormik({
		initialValues,
		onSubmit: async (values) => {
			formik.setSubmitting(true);
			setDisableForm(true);

			if (!isValidForm(values)) {
				swal(
					BotDetailConstants.SwalBotDetailMessage.titleFailed,
					BotDetailConstants.SwalBotDetailMessage.requiredAllFields,
					BotDetailConstants.SwalBotDetailMessage.iconError
				);
				setDisableForm(false);
				return;
			}
			// validate botDetailId
			const isInValid = await validateBotId(values.botId ?? 0);
			let botToken_ = values.botId + ':' + botToken;

			ValidateTelegramBot(botToken_)
				.then((response) => {
					if (response.status === successResponse) {
						if (!response.data.ok) {
							swal(
								BotDetailConstants.SwalBotDetailMessage.titleFailed,
								BotDetailConstants.SwalBotDetailMessage.textFailedBotNotExist,
								BotDetailConstants.SwalBotDetailMessage.iconError
							);
							setDisableForm(false);
							return;
						}
						// proceed upsert if has no duplicate bot ID
						if (!isInValid || modalAction === BotDetailConstants.EDIT) {
							upSertBotDetailsById(values);
						} else {
							swal(
								BotDetailConstants.SwalBotDetailMessage.titleFailed,
								BotDetailConstants.SwalBotDetailMessage.textErrorDuplicate,
								BotDetailConstants.SwalBotDetailMessage.iconError
							);
							setDisableForm(false);
							return;
						}
					}
				})
				.catch(() => {
					swal(
						BotDetailConstants.SwalBotDetailMessage.titleFailed,
						BotDetailConstants.SwalBotDetailMessage.textFailedBotNotExist,
						BotDetailConstants.SwalBotDetailMessage.iconError
					);
					setDisableForm(false);
				});
		},
	});

	const isValidForm = (values: any) => {
		if (!values.botId || !botToken || !botUsername || selectedBrand?.value === emptyOption.value || selectedUser?.value === emptyOption.value) {
			return false;
		} else return true;
	};

	const upSertBotDetailsById = async (values: any) => {
		const botDetailId = modalAction === BotDetailConstants.EDIT ? botDetailByIdData.botDetailId : 0;

		const newBOTDetailRequest: BotDetailsByIdRequest = {
			botDetailId,
			botUsername: botUsername,
			botId: values.botId,
			botToken,
			brandId: parseInt(selectedBrand.value),
			botMlabUserId: parseInt(selectedUser.value),
			statusId: parseInt(selectedStatus.value),
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		const messagingHub = hubConnection.createHubConnenction();

		const handleResponse = (response: any) => {
			if (response.status === successResponse) {
				messagingHub.on(newBOTDetailRequest.queueId.toString(), handleMessage);
			} else {
				handleFailure(response);
			}
		};

		const handleMessage = (message: any) => {
			UpSertBotDetailsResult(message.cacheId)
				.then((returnData) => {
					const botDetailResult = returnData.data.data;

					if (returnData.status !== successResponse) {
						handleFailure(returnData);
					} else if (!botDetailResult?.botCountValidation) {
						handleMaxBotError();
					} else {
						handleSuccess(botDetailResult);
					}
				})
				.catch((ex) => {
					handleFailure(ex);
				});
		};

		const handleSuccess = (botDetailResult: any) => {
			messagingHub.off(newBOTDetailRequest.queueId.toString());
			messagingHub.stop();

			swal(
				BotDetailConstants.SwalBotDetailMessage.titleSuccessful,
				BotDetailConstants.SwalBotDetailMessage.textSuccess,
				BotDetailConstants.SwalBotDetailMessage.iconSuccess
			);

			if (setModalBotDetailId) {
				setModalBotDetailId(botDetailResult?.botDetailId);
			}

			setModalBotDetailName(newBOTDetailRequest.botUsername);

			clearFields();
			closeModal();
			formik.setSubmitting(false);
			setDisableForm(false);
		};

		const handleMaxBotError = () => {
			formik.setSubmitting(false);
			setDisableForm(false);
			swal(
				BotDetailConstants.SwalBotDetailMessage.titleFailed,
				BotDetailConstants.SwalBotDetailMessage.textMaxActiveBotError,
				BotDetailConstants.SwalBotDetailMessage.iconError
			);
		};

		const handleFailure = (error: any) => {
			formik.setSubmitting(false);
			setDisableForm(false);
			swal(
				BotDetailConstants.SwalBotDetailMessage.textFailed,
				BotDetailConstants.SwalBotDetailMessage.textFailed + ' ' + error.message,
				BotDetailConstants.SwalBotDetailMessage.iconError
			);
		};

		setTimeout(() => {
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) {
					return;
				}

				formik.setSubmitting(true);

				UpSertBotDetails(newBOTDetailRequest).then(handleResponse).catch(handleFailure);
			});
		}, 1000);
	};

	const validateBotId = async (botId: number) => {
		let isValid = true;
		await ValidateBotId(botId).then((response) => {
			if (response.status === successResponse) {
				isValid = response.data;
			} else isValid = false;
		});
		return isValid;
	};

	const onChangeBotUsername = (value: any) => {
		setBotUsername(value.target.value);
	};

	return (
		<FormModal show={showForm} customSize={'md'} headerTitle={actionTitle} haveFooter={false}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<FormGroupContainer>
					<RequiredLabel title={'BOT Username'} />
					<div className='input-group'>
						<input
							type='text'
							aria-autocomplete='none'
							autoComplete='new-password'
							className='form-control form-control-sm'
							aria-label='BOT name'
							id='bot-name'
							value={botUsername}
							onChange={onChangeBotUsername}
						/>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<RequiredLabel title={'BOT ID'} />
					<div className='input-group'>
						<input
							type='number'
							autoComplete='off'
							className='form-control form-control-sm'
							aria-label='BOT ID'
							disabled={modalAction === BotDetailConstants.EDIT}
							{...formik.getFieldProps('botId')}
						/>
					</div>
				</FormGroupContainer>

				<FormGroupContainer>
					<RequiredLabel title={'BOT Token'} />
					<div className='input-group validate-input'>
						<div className='col-lg-12'>
							<input
								type={botToken.length === 0 ? 'text' : determineTokenType()}
								className='form-control form-control-sm'
								aria-label='BOT Token'
								data-lpignore='true'
								name='bottokenvalue'
								id='botToken'
								value={botToken}
								onChange={onChangeBotToken}
								onFocus={onFocusBotToken}
							/>
						</div>

						<div
							className='btn btn-icon w-auto px-0 btn-active-color-primary'
							style={{position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', cursor: 'pointer'}}
						>
							<FontAwesomeIcon icon={showToken ? faEyeSlash : faEye} onClick={handleToggleValues} />
						</div>
					</div>
				</FormGroupContainer>

				<FormGroupContainer>
					<RequiredLabel title={'Assigned Brand'} />
					<div className='col-lg-12'>
						<Select
							autoComplete='off'
							size='small'
							style={{width: '100%'}}
							options={brandOptionList}
							onChange={onChangeSelectedBrand}
							value={selectedBrand}
						/>
					</div>
				</FormGroupContainer>

				<FormGroupContainer>
					<RequiredLabel title={'Assigned MLAB User'} />
					<div className='col-lg-12'>
						<Select autoComplete='off' size='small' style={{width: '100%'}} options={userList} onChange={onChangeSelectedUser} value={selectedUser} />
					</div>
				</FormGroupContainer>

				<FormGroupContainer>
					<RequiredLabel title={'Status'} />
					<div className='col-lg-12'>
						<Select
							autoComplete='off'
							size='small'
							style={{width: '100%'}}
							options={botStatusOptions}
							onChange={onChangeSelectedStatus}
							value={selectedStatus}
						/>
					</div>
				</FormGroupContainer>

				<ModalFooter style={{border: 0, float: 'right', paddingLeft: 0, paddingRight: 0}}>
					<LoaderButton
						access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotWrite)}
						loading={disableForm}
						title={'Submit'}
						loadingTitle={' Please wait...'}
						disabled={formik.isSubmitting || disableForm}
					/>
					<DefaultSecondaryButton
						access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotRead)}
						title={'Close'}
						onClick={closeModalBOT}
						isDisable={false}
						customStyle='btn btn-secondary btn-sm'
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default AddEditBotModal;
