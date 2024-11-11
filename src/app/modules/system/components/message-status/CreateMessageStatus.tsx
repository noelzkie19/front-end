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
	ContentContainer,
	DefaultSecondaryButton,
	ErrorLabel,
	FieldContainer,
	FormContainer,
	FormModal,
	LoaderButton,
	MainContainer,
	SearchTextInput,
} from '../../../../custom-components';
import {MessageStatusTypesModel, MessageTypeListRequest, MessageTypeListResponse, OptionsSelectedModel} from '../../models';
import {GetMessageStatusListRequest} from '../../models/requests/GetMessageStatusListRequest';
import {GetMessageStatusListResponse} from '../../models/response/GetMessageStatusListResponse';
import * as system from '../../redux/SystemRedux';
import {getMessageTypeList, sendGetMessageTypeList, validateMessageStatus} from '../../redux/SystemService';

const initialValues = {
	name: '',
	status: '',
};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

interface Props {
	showForm: boolean;
	closeModal: () => void;
	messageTypeId: number;
}

const CreateMessageStatus: React.FC<Props> = ({showForm, closeModal, messageTypeId}) => {
	const dispatch = useDispatch();
	const {SwalFailedMessage, SwalServerErrorMessage, SwalMessageTypeMessage, HubConnected, successResponse} = useConstant();

	// -----------------------------------------------------------------
	// GET REDUX STORE
	// -----------------------------------------------------------------
	const systemData = useSelector<RootState>(({system}) => system.getMessageStatusList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const postData = useSelector<RootState>(({system}) => system.postMessageStatusList, shallowEqual) as any;
	const messagingHub = hubConnection.createHubConnenction();

	// -----------------------------------------------------------------
	// STATES
	// -----------------------------------------------------------------
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [messageTypeList, setMessageTypeList] = useState<Array<OptionsSelectedModel>>([]);

	let createMessageStatusOption = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	// -----------------------------------------------------------------
	// WATCHER
	// -----------------------------------------------------------------
	useEffect(() => {
		setLoading(false);
		setHasErrors(false);
		setErrorMessage('');
		setSelectedStatuses('');
		if (showForm === true) {
			formik.resetForm();
			setSelectedMessageType([]);
		}
	}, [showForm]);

	// -----------------------------------------------------------------
	// MOUNTED
	// -----------------------------------------------------------------
	useEffect(() => {
		if (showForm === true) {
			setTimeout(() => {
				messagingHub
					.start()
					.then(() => {
						if (messagingHub.state === HubConnected) {
							getCreateMessageTypeListGateway();
						} else {
							swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
						}
					})
					.catch((err) => console.log('Error while starting connection: ' + err));
			}, 1000);
		}
	}, [showForm]);

	// -----------------------------------------------------------------
	// METHODS
	// -----------------------------------------------------------------

	const getCreateMessageTypeListCallback = (_cacheId: string) => {
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
				setMessageTypeList(
					messageTypeId === undefined
						? messageTypeTempList
						: messageTypeTempList.filter(
								(thing, i, arr) => arr.findIndex((t) => t.value === thing.value && t.value !== messageTypeId.toString()) === i
						  )
				);
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const _dispatchCreateMessageStatusTransaction = (name: string, status: string) => {
		// CHECK IF SYSTEM STORES HAVE DATA
		let storedData = systemData ? systemData : [];
		let postDatas = postData ? postData : [];

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
			const MessageTypeParentid: MessageStatusTypesModel = {messageStatusId: 0, messageTypeId: messageTypeId, messageTypeName: ''};
			postMessageTypes.push(MessageTypeParentid);
		}

		//  -- PARAMETER FOR TABLE STORE -- //
		const request: GetMessageStatusListResponse = {
			messageStatusId: 0,
			messageStatusName: name,
			messageStatusStatus: selectedStatuses.value.toString() === '1' ? true : false,
			messageStatusTypes: postMessageTypes,
			position: 0,
			action: 'ADD',
		};

		// CONCAT PASSED DATA TO EXISITING DATA ON TABLE STORE
		const newDataToStore = storedData.concat(request);

		// CONCAT PASSED DATA TO EXISTING POST DATA STORE
		const newDataToPostStore = postDatas.concat(request);

		// DISPATCH TOPIC TABLE REDUX
		dispatch(system.actions.getMessageStatusList(newDataToStore));
		// DISPATCH TOPIC TO POST TABLE REDUX
		dispatch(system.actions.postMessageStatusList(newDataToPostStore));
	};
	const onChangeSelectedMessageType = (val: string) => {
		setSelectedMessageType(val);
	};
	function onChangeSelectedStatues(val: string) {
		setSelectedStatuses(val);
	}
	const _validateCreateMessageStatusTransaction = (name: string, status: string, includeToTypes: string) => {
		let storedData = systemData ? systemData : [];

		let isError: boolean = false;

		if (name === '' || name === undefined || name === null) {
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

		let searchCreateMessageStatusValue = [storedData][0].find(
			(x: GetMessageStatusListRequest) => x.messageStatusName.toUpperCase() === name.toUpperCase()
		);

		if (searchCreateMessageStatusValue != undefined) {
			setHasErrors(true);
			setErrorMessage('Value already exists, please use the search filter to find them');
			isError = true;
		}

		return isError;
	};
	// -----------------------------------------------------------------
	// FORMIK FORM POST
	// -----------------------------------------------------------------
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
			const isError = _validateCreateMessageStatusTransaction(values.name, values.status, includeToTypes);

			// -- VALIDATION SATISFIED PROCEED TO TRANSACTION --//
			if (isError === false) {
				validateMessageStatus(values.name)
					.then((response) => {
						if (response.status === successResponse) {
							_dispatchCreateMessageStatusTransaction(values.name, values.status);
							resetForm();
							setMessageTypeList([]);
							setHasErrors(false);
							setErrorMessage('');
						} else {
							setHasErrors(true);
							setErrorMessage('Value already exists, please use the search filter to find them');
						}
					})
					.catch(() => {
						setHasErrors(true);
						setErrorMessage('Connection error Please close the form and try again');
					});
			}
			setSubmitting(false);
		},
	});

	const getCreateMessageTypeListGateway = () => {
		const request: MessageTypeListRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			messageTypeName: '',
			messageTypeStatus: '',
		};

		sendGetMessageTypeList(request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(request.queueId.toString(), (message) => {
						getCreateMessageTypeListCallback(message.cacheId);
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
					});
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
			});
	};

	return (
		<FormModal headerTitle={'Add Message status'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
						<FieldContainer>
							<label className='form-label-sm required'>Message Status Name</label>
							<SearchTextInput ariaLabel={'Message Status Name'} {...formik.getFieldProps('name')} />
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Message Status Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={createMessageStatusOption}
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
					<LoaderButton access={true} title={'Submit'} loading={loading} disabled={formik.isSubmitting} loadingTitle={'Please wait ...'} />
					<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default CreateMessageStatus;
