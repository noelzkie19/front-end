import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import {
	BasicTextInput,
	ContentContainer,
	DefaultSecondaryButton,
	ErrorLabel,
	FieldContainer,
	FieldLabel,
	FormContainer,
	FormModal,
	MainContainer,
	SuccesLoaderButton,
} from '../../../../custom-components';
import {
	GetMesssageStatusByIdRequest,
	MessageStatusTypesModel,
	MessageTypeListRequest,
	MessageTypeListResponse,
	OptionsSelectedModel,
} from '../../models';
import {GetMessageStatusListResponse} from '../../models/response/GetMessageStatusListResponse';
import * as system from '../../redux/SystemRedux';
import {getGetMesssageStatusById, getMessageTypeList, sendGetMessageTypeList, sendGetMesssageStatusById} from '../../redux/SystemService';

const initialValues = {
	name: '',
	status: '',
};

const FormSchema = Yup.object().shape({
	topicName: Yup.string(),
});

interface Props {
	showForm: boolean;
	closeModal: () => void;
	Id: number;
	messageTypeId: number;
}

const EditMessageStatus: React.FC<Props> = ({showForm, closeModal, Id, messageTypeId}) => {
	/**
	 *  ? Redux
	 */
	const dispatch = useDispatch();
	const systemData = useSelector<RootState>(({system}) => system.getMessageStatusList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const postData = useSelector<RootState>(({system}) => system.postMessageStatusList, shallowEqual) as any;
	const messagingHub = hubConnection.createHubConnenction();
	/**
	 * ? Constants
	 */
	const {HubConnected, successResponse, SwalFailedMessage, SwalMessageTypeMessage, SwalServerErrorMessage} = useConstant();

	/**
	 *  ? States
	 */
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [messageTypeList, setmessageTypeList] = useState<Array<OptionsSelectedModel>>([]);
	const [removedMessageType, setRemovedMessageType] = useState<any>('');
	const [editMessageStatusNameText, setEditMessageStatusNameText] = useState<string>('');
	const [editMessageStatusPosition, setEditMessageStatusPosition] = useState<number>(0);

	useEffect(() => {
		setLoading(false);
		setHasErrors(false);
		setErrorMessage('');
		if (showForm === true) {
			getEditMessageStatusData();
		}
	}, [showForm]);

	useEffect(() => {
		getEditMessageStatusList();
	}, []);

	// -----------------------------------------------------------------
	// METHODS
	// -----------------------------------------------------------------
	const getCallBackMessageTypeList = (_cacheId: string) => {
		getMessageTypeList(_cacheId)
			.then((data) => {
				let resultData = Object.assign(new Array<MessageTypeListResponse>(), data.data);
				let messageTypeTempList = Array<OptionsSelectedModel>();

				resultData.forEach((item) => {
					const messageTypeOption: OptionsSelectedModel = {
						value: item.messageTypeId !== undefined ? item.messageTypeId.toString() : '0',
						label: item.messageTypeName,
					};
					messageTypeTempList.push(messageTypeOption);
				});
				if (messageTypeId !== undefined) {
					setmessageTypeList(
						messageTypeTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value && t.value !== messageTypeId.toString()) === i)
					);
				} else {
					setmessageTypeList(messageTypeTempList);
				}
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const getEditMessageStatusListGateway = (_request: MessageTypeListRequest) => {
		sendGetMessageTypeList(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getCallBackMessageTypeList(message.cacheId);
						messagingHub.off(_request.queueId.toString());
						messagingHub.stop();
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							setLoading(false);
						}
					}, 30000);
				} else {
					swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon);
				}
			})
			.catch(() => {
				swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
			});
	};

	const getEditMessageStatusList = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: MessageTypeListRequest = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageTypeName: '',
							messageTypeStatus: '',
						};
						getEditMessageStatusListGateway(request);
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const getEditMessageStatusGateway = (_request: GetMesssageStatusByIdRequest) => {
		sendGetMesssageStatusById(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getGetMesssageStatusById(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<GetMessageStatusListResponse>(), data.data);
								let OptionList = Array<OptionsSelectedModel>();
								setEditMessageStatusNameText(resultData?.messageStatusName ?? '');
								let status = resultData.messageStatusStatus === true ? {value: '1', label: 'Active'} : {value: '2', label: 'Inactive'};
								setSelectedStatuses(status);

								resultData.messageStatusTypes.forEach((item: MessageStatusTypesModel) => {
									const tempOption: OptionsSelectedModel = {
										value: item.messageTypeId.toString(),
										label: item.messageTypeName,
									};
									OptionList.push(tempOption);
								});
								updateMessageTypeSelections(messageTypeId, OptionList);
								setEditMessageStatusPosition(resultData.position);
							})
							.catch(() => {
								setLoading(false);
							});
						messagingHub.off(_request.queueId.toString());
						messagingHub.stop();
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				} else {
					messagingHub.stop();
					swal('Failed', response.data.message, 'error');
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal('Failed', 'Problem in getting message type list', 'error');
			});
	};

	const updateMessageTypeSelections = (messageTypeId: number | undefined, optionList: Array<OptionsSelectedModel>) => {
		if (messageTypeId !== undefined) {
			setSelectedMessageType(optionList.filter((x) => x.value !== messageTypeId.toString()));
			setRemovedMessageType(optionList.filter((x) => x.value === messageTypeId.toString()));
		} else {
			setSelectedMessageType(optionList);
			setRemovedMessageType(optionList);
		}
	};

	const getEditMessageStatusData = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: GetMesssageStatusByIdRequest = {
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
							messageStatusId: Id,
						};

						getEditMessageStatusGateway(request);
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _dispatchEditMessageStatusTransaction = () => {
		// CHECK IF SYSTEM STORES HAVE DATA
		const postIndex = postData.findIndex((messageType: GetMessageStatusListResponse) => messageType.messageStatusId === Id);

		let postMessageTypes = Array<MessageStatusTypesModel>();

		selectedMessageType.forEach((item: OptionsSelectedModel) => {
			const optionData: MessageStatusTypesModel = {
				messageStatusId: 0,
				messageTypeId: parseInt(item.value),
				messageTypeName: item.label,
			};
			postMessageTypes.push(optionData);
		});

		if (messageTypeId !== undefined) {
			// -- ADDED REMOVED PARENT DATA DISPLAYED ON OPTION -- //
			removedMessageType.forEach((item: OptionsSelectedModel) => {
				const removedOptionData: MessageStatusTypesModel = {
					messageStatusId: 0,
					messageTypeId: parseInt(item.value),
					messageTypeName: item.label,
				};
				postMessageTypes.push(removedOptionData);
			});
		}

		//  -- PARAMETER FOR TABLE STORE -- //
		const request: GetMessageStatusListResponse = {
			messageStatusId: Id,
			messageStatusName: editMessageStatusNameText,
			position: editMessageStatusPosition,
			messageStatusTypes: postMessageTypes,
			messageStatusStatus: selectedStatuses.value.toString() === '1' ? true : false,
			action: 'EDIT',
		};

		// REMOVE DATA FROM TANBLE BEFORE REINSERT ON REDUX STORE
		let filterData = systemData.filter((x: GetMessageStatusListResponse) => x.messageStatusId != Id);
		// REINSERT UPDATED DATA
		let DataToTable = [...filterData, request];
		//DISPATCH DATA TO TABLE STORE
		dispatch(system.actions.getMessageStatusList(DataToTable));

		// -- DISPATCH FOR POSTING OF DATA
		// CHECKING ON INSERT OR UPDATE
		if (postIndex < 0) {
			// IF NOT EXIST THEN ADD
			const newDataToStore = postData.concat(request);
			dispatch(system.actions.postMessageStatusList(newDataToStore));
		} else {
			// IF EXISIST THEN REMOVE FIRST
			let filteredData = postData.filter((x: GetMessageStatusListResponse) => x.messageStatusId != Id);
			let updatedPostData = [...filteredData, request];
			dispatch(system.actions.postMessageStatusList(updatedPostData));
		}
	};

	const onChangeSelectedMessageType = (val: string) => {
		setSelectedMessageType(val);
	};

	function onChangeSelectedStatues(val: string) {
		setSelectedStatuses(val);
	}

	const _validateMessageStatusTransaction = (status: string, includeToTypes: string) => {
		let isError: boolean = false;

		if (editMessageStatusNameText === '' || editMessageStatusNameText === undefined || editMessageStatusNameText === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		if (status === '' || status === undefined || status === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		if (includeToTypes === '' || includeToTypes === undefined || includeToTypes === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		return isError;
	};

	// FORMIK FORM POST
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);

			// -- SET TOPIC STATUS ON -- //
			values.status = selectedStatuses.value;

			let includeToTypes: string = Object.assign(Array<OptionsSelectedModel>(), selectedMessageType)
				.map((el: any) => el.value)
				.join(',');

			// -- VALIDATE VALUES IF EMPTY OR NULL --//
			const isError = _validateMessageStatusTransaction(values.status, includeToTypes);

			// -- VALIDATION SATISFIED PROCEED TO TRANSACTION --//
			if (isError === false) {
				_dispatchEditMessageStatusTransaction();
				resetForm();
				setHasErrors(false);
				setErrorMessage('');
			}
			setSubmitting(false);
		},
	});

	// RETURN ELEMENT
	return (
		<FormModal headerTitle={'Edit Message Status'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
						<FieldContainer>
							<FieldLabel title={'Message Status Name'} />
							<div className='col-lg-12'>
								<BasicTextInput ariaLabel={'Message Status Name'} disabled={true} onChange={() => {}} value={editMessageStatusNameText} />
							</div>
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Message Status Status</label>

							<Select
								size='small'
								style={{width: '100%'}}
								options={[
									{value: '1', label: 'Active'},
									{value: '2', label: 'Inactive'},
								]}
								onChange={onChangeSelectedStatues}
								value={selectedStatuses}
							/>
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Included to Message Type</label>
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={messageTypeList}
								onChange={onChangeSelectedMessageType}
								value={selectedMessageType}
							/>
						</FieldContainer>
					</ContentContainer>
				</MainContainer>
				<ModalFooter style={{border: 0}}>
					<SuccesLoaderButton title={'Submit'} loading={loading} disabled={formik.isSubmitting} loadingTitle={'Please wait ...'} />
					<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default EditMessageStatus;
