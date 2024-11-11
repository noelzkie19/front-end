import {Container, Row, Col, ModalFooter} from 'react-bootstrap-v5';
import {
	BasicDateTimePicker,
	DefaultDatePicker,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	FormContainer,
	FormModal,
	LoaderButton,
	MlabButton,
} from '../../../../custom-components';
import Select from 'react-select';
import swal from 'sweetalert';
import {useEffect, useState} from 'react';
import {useBrands, useMessageTypeOptions} from '../../../../custom-functions';
import {OptionListModel} from '../../../../common/model';
import {
	AppConfigSettingDataType,
	ChannelType,
	ElementStyle,
	GenericStringContantsEnum,
	ModalName,
	pageMode,
	PROMPT_MESSAGES,
} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {IAuthState} from '../../../auth';
import {RootState} from '../../../../../setup';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {AppConfigSettingRequestModel} from '../../models/request/AppConfigSettingRequestModel';
import {upsertAppConfigSetting} from '../../redux/AdministratorService';
import {SwalDetails} from '../../../system/components/constants/CampaignSetting';
import {AppConfigSettingResponseModel} from '../../models/response/AppConfigSettingResponseModel';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {format} from 'path';
import moment from 'moment';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	modalAction: string;
	appConfigSettingResponseModel: AppConfigSettingResponseModel;
	closeModalAndSearch: () => void;
}
const initialValues: AppConfigSettingRequestModel = {
	appConfigSettingId: 0,
	applicationId: 0,
	dataType: '',
	key: '',
	value: '',
	userId: '',
	queueId: '',
};
const FormSchema = Yup.object().shape({
	name: Yup.string(),
});
const EditAppConfigSettingModal: React.FC<Props> = ({showForm, closeModal, modalAction, appConfigSettingResponseModel, closeModalAndSearch}) => {
	//Redux
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	//States
	const [application, setApplication] = useState<OptionListModel | any>(undefined);
	const [skillName, setSkillName] = useState<string | any>('');
	const [key, setKey] = useState<string | any>('');
	const [value, setValue] = useState<string | any>('');
	const [dataType, setDataType] = useState<string | any>('');
	const [boolValue, setBoolValue] = useState<boolean | any>(false);
	const [dateTimeValue, setDateTimeValue] = useState<string | any>(null);
	const [openDateTimeValue, setOpenDateTimeValue] = useState<boolean>(false);
	const [appConfigSettingModelUDT, setAppConfigSettingModelUDT] = useState<AppConfigSettingRequestModel>(initialValues);
	const [isSubmitting, setIsSubmitting] = useState<boolean | any>(false);
	const [loading, setLoading] = useState<boolean>(false);
	//Constants

	const {SwalConfirmMessage, SwalFailedMessage, SwalSuccessMessage, successResponse, HubConnected, SwalServerErrorMessage} = useConstant();

	//Watchers
	useEffect(() => {
		setLoading(false);
		if (showForm) {
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
		setAppConfigSettingModelUDT({
			appConfigSettingId: 0,
			applicationId: 0,
			dataType: '',
			key: '',
			value: '',
			userId: '',
			queueId: '',
		});
	};
	const loadData = () => {
		appConfigSettingModelUDT.appConfigSettingId = appConfigSettingResponseModel?.appConfigSettingId;
		appConfigSettingModelUDT.applicationId = appConfigSettingResponseModel?.applicationId;
		appConfigSettingModelUDT.dataType = appConfigSettingResponseModel?.dataType;
		appConfigSettingModelUDT.appConfigSettingId = appConfigSettingResponseModel?.appConfigSettingId;
		appConfigSettingModelUDT.key = appConfigSettingResponseModel?.key;
		appConfigSettingModelUDT.value = appConfigSettingResponseModel?.value;

		if (appConfigSettingResponseModel.dataType == AppConfigSettingDataType.Bool)
			setBoolValue(appConfigSettingResponseModel?.value == 'true' ? true : false);

		if (appConfigSettingResponseModel.dataType == AppConfigSettingDataType.DateTime) setDateTimeValue(new Date(appConfigSettingResponseModel?.value));

		setKey(appConfigSettingResponseModel?.key);
		setValue(appConfigSettingResponseModel?.value);

		setAppConfigSettingModelUDT(appConfigSettingModelUDT);
	};
	const onSubmit = () => {
		setIsSubmitting(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						appConfigSettingModelUDT.userId = userId ? userId.toString() : '0';
						appConfigSettingModelUDT.queueId = Guid.create().toString();
						upsertAppConfigSetting(appConfigSettingModelUDT)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(appConfigSettingModelUDT.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										if (resultData.Status === successResponse) {
											swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
											setIsSubmitting(false);
											closeModalAndSearch();
										} else {
											swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
										}

										messagingHub.off(appConfigSettingModelUDT.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in adding subtopic details', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const isValid = () => {
		let isValid = true;

		return isValid;
	};
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (!isValid()) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, SwalDetails.ErrorIcon);
			} else {
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
	const onChangeApplication = (val: any) => {
		if (appConfigSettingModelUDT) {
			appConfigSettingModelUDT.applicationId = +val.value;
			setAppConfigSettingModelUDT(appConfigSettingModelUDT);
		}

		setApplication(val);
	};
	const onChangeValue = (val: string | any) => {
		if (appConfigSettingModelUDT) {
			if (appConfigSettingModelUDT.dataType == AppConfigSettingDataType.Bool) {
				appConfigSettingModelUDT.value = appConfigSettingModelUDT.value == 'true' ? 'false' : 'true';
				setBoolValue(!boolValue);
			} else if (appConfigSettingModelUDT.dataType == AppConfigSettingDataType.DateTime) {
				appConfigSettingModelUDT.value = moment(val).format('MM/DD/yyyy HH:mm:ss');
				setOpenDateTimeValue(!openDateTimeValue);

				setDateTimeValue(val);
			} else {
				appConfigSettingModelUDT.value = val.target.value;
				setValue(val.target.value);
			}
			setAppConfigSettingModelUDT(appConfigSettingModelUDT);
		}
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
							<label className='form-label-sm required'>Key</label>
							<input type='text' className='form-control form-control-sm' aria-label='Skill Name' value={key} disabled={true} />
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Value</label>
							{appConfigSettingModelUDT && appConfigSettingModelUDT.dataType == AppConfigSettingDataType.String && (
								<input type='text' className='form-control form-control-sm' aria-label='Value' value={value} onChange={onChangeValue} />
							)}
							{appConfigSettingModelUDT && appConfigSettingModelUDT.dataType == AppConfigSettingDataType.Int && (
								<input type='number' className='form-control form-control-sm' aria-label='Value' value={value} onChange={onChangeValue} />
							)}
							{appConfigSettingModelUDT && appConfigSettingModelUDT.dataType == AppConfigSettingDataType.Bool && (
								<div className='form-check form-switch form-check-custom form-check-solid d-flex'>
									<input
										className='form-check-input'
										type='checkbox'
										value={boolValue}
										id=''
										defaultChecked={appConfigSettingModelUDT.value == 'true' ? true : false}
										onClick={(event) => onChangeValue(event)}
										disabled={false}
									/>
								</div>
							)}
							{appConfigSettingModelUDT && appConfigSettingModelUDT.dataType == AppConfigSettingDataType.DateTime && (
								<BasicDateTimePicker
									format={'dd/MM/yyyy HH:mm'}
									onChange={onChangeValue}
									value={dateTimeValue}
									onOpenCalendar={() => setOpenDateTimeValue(!openDateTimeValue)}
									onBlur={() => setOpenDateTimeValue(!openDateTimeValue)}
									onInputClick={() => setOpenDateTimeValue(!openDateTimeValue)}
									open={openDateTimeValue}
								/>
							)}
						</Col>
					</Row>
				</Container>
				<ModalFooter style={{border: 0}}>
					<LoaderButton
						access={userAccess.includes(USER_CLAIMS.AdminWrite)}
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

export default EditAppConfigSettingModal;
