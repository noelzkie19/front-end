import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import {
	ContentContainer,
	DefaultSecondaryButton,
	ErrorLabel,
	FieldContainer,
	FieldLabel,
	FormContainer,
	FormModal,
	MainContainer,
	RegularTextInput,
	SuccesLoaderButton,
} from '../../../../custom-components';
import {useMessageStatus} from '../../../../custom-functions';
import {MessageResponseList, MessageResponseStatuses, OptionsSelectedModel} from '../../models';
import {MesssageResponseById} from '../../models/requests/MesssageResponseById';
import * as system from '../../redux/SystemRedux';
import {getMesssageResponseById, sendGetMesssageResponseById} from '../../redux/SystemService';
interface Props {
	showForm: boolean;
	closeModal: () => void;
	Id: number;
	messageStatusId: number;
}

// -- INITIAL VALUES OF FORM --//
const initialValues = {
	name: '',
};

const EditMessageResponse: React.FC<Props> = ({showForm, closeModal, Id, messageStatusId}) => {
	// -----------------------------------------------------------------
	// GET REDUX STORE
	// -----------------------------------------------------------------
	const systemData = useSelector<RootState>(({system}) => system.getMessageResponseList, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const dispatch = useDispatch();
	const {SwalFailedMessage, SwalServerErrorMessage, SwalMessageResponseMessage, HubConnected, successResponse} = useConstant();
	const messagingHub = hubConnection.createHubConnenction();

	// -----------------------------------------------------------------
	// STATES
	// -----------------------------------------------------------------
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	// -----------------------------------------------------------------
	// STATES MAP TO INTERFACE
	// -----------------------------------------------------------------
	// -- [LIST OF OPTIONS ON SELECT]  -- //
	const [responseData, setResponseData] = useState<any>([]);

	// -- [SELECTED VALUE ON FORM] -- //
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<any>('');

	let editMessageResponseStatusOption = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	// -----------------------------------------------------------------
	// MOUNTED
	// -----------------------------------------------------------------
	useEffect(() => {
		if (showForm === true) {
			setHasErrors(false);
			setErrorMessage('');
			resetForm();
			getEditMessageReponseById();
		}
	}, [showForm]);

	// -- MOUNT OLD VALUES -- //
	useEffect(() => {
		// TEMP LIST TO PUSH ON STATE

		if (responseData != undefined) {
			let statusData = Object.assign(new Array<MessageResponseStatuses>(), responseData.messageResponseStatuses);
			let OptionList = Array<OptionsSelectedModel>();

			statusData.forEach((item: MessageResponseStatuses) => {
				const tempOption: OptionsSelectedModel = {
					value: item.messageStatusId.toString(),
					label: item.messageStatusName,
				};
				OptionList.push(tempOption);
			});

			setSelectedMessageResponse(OptionList.filter((x) => x.value !== messageStatusId.toString()));

			let status = responseData.messageResponseStatus === true ? {value: '1', label: 'Active'} : {value: '2', label: 'Inactive'};
			setSelectedStatuses(status);

			formik.setFieldValue('name', responseData.messageResponseName);
		}
	}, [responseData]);

	const resetForm = () => {
		formik.setFieldValue('name', '');
		setSelectedStatuses('');
		setSelectedMessageResponse('');
	};
	async function requestFormula() {
		const request: MesssageResponseById = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			messageResponseId: Id,
		};

		return request;
	}

	const getEditMessageReponseById = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						const request = await requestFormula();
						getEditMessageResponseByIdGateway(request);
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			// setSubmitting(true)

			const isError = _validateForm(values.name);

			if (isError === false) {
				_dispatchToStore();
				setSubmitting(false);
			}
			setSubmitting(false);
		},
	});

	const getEditMessageResponseByIdGateway = (_request: MesssageResponseById) => {
		sendGetMesssageResponseById(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getMesssageResponseById(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<MessageResponseList>(), data.data);
								setResponseData(resultData);
							})
							.catch(() => {
								setLoading(false);
							});
						messagingHub.off(_request.queueId.toString());
						messagingHub.stop();
					});
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal(SwalFailedMessage.title, SwalMessageResponseMessage.textErrorMessageResponseList, SwalFailedMessage.icon);
			});
	};

	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};

	const onChangeSelectedMessageResponse = (val: string) => {
		setSelectedMessageResponse(val);
	};

	const _validateForm = (name: string) => {
		let isError: boolean = false;

		// -- VALIDATE EMPTY FIELDS REQUIRED -- /
		if (name === '' || name === undefined || name === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		if (selectedStatuses.value === '' || selectedStatuses === undefined || selectedStatuses === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		let messageStatusIds = Object.assign(Array<OptionsSelectedModel>(), selectedMessageResponse)
			.map((el: any) => el.value)
			.join(',');

		if (messageStatusIds === '' || messageStatusIds === undefined || messageStatusIds === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		return isError;
	};

	const _dispatchToStore = () => {
		// FIRST GET INDEXT OF ITEM
		const postIndex = postData.findIndex((messageResponse: MessageResponseList) => messageResponse.messageResponseId === Id);

		let postMessageStatus = Array<MessageResponseStatuses>();

		selectedMessageResponse.forEach((item: OptionsSelectedModel) => {
			const optionData: MessageResponseStatuses = {
				messageResponseId: Id,
				messageStatusId: parseInt(item.value),
				messageStatusName: item.label,
			};
			postMessageStatus.push(optionData);
		});

		// -- ADD PARENT POST MESSAGE STATUS TO INLUCDE ON INSERT -- //
		if (messageStatusId !== 0) {
			const MessageStatusParentid: MessageResponseStatuses = {messageResponseId: 0, messageStatusId: messageStatusId, messageStatusName: ''};
			postMessageStatus.push(MessageStatusParentid);
		}

		//  -- PARAMETER FOR TABLE STORE -- //

		const request: MessageResponseList = {
			messageResponseId: Id,
			messageResponseName: responseData.messageResponseName,
			messageStatusId: responseData.messageStatusId,
			position: responseData.position,
			messageResponseStatus: selectedStatuses.value.toString() === '1' ? true : false,
			messageResponseStatuses: postMessageStatus,
			messageResponseTypes: responseData?.messageResponseTypes,
			action: 'EDIT',
		};
		// REMOVE DATA FROM TANBLE BEFORE REINSERT ON REDUX STORE
		let filterData = systemData.filter((x: MessageResponseList) => x.messageResponseId != Id);
		// REINSERT UPDATED DATA
		let DataToTable = [...filterData, request];
		//DISPATCH DATA TO TABLE STORE
		dispatch(system.actions.getMessageResponseList(DataToTable));

		// CHECKING ON INSERT OR UPDATE
		if (postIndex < 0) {
			// IF NOT EXIST THEN ADD
			const newDataToStore = postData.concat(request);
			dispatch(system.actions.postMessageResponseList(newDataToStore));
		} else {
			// IF EXISIST THEN REMOVE FIRST
			let filteredData = postData.filter((x: MessageResponseList) => x.messageResponseId != Id);
			let updatedPostData = [...filteredData, request];
			dispatch(system.actions.postMessageResponseList(updatedPostData));
		}
	};

	return (
		<FormModal headerTitle={'Edit Message Response'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
						<FieldContainer>
							<FieldLabel title={'Message Response Name'} />
							<div className='col-sm-12'>
								<RegularTextInput ariaLabel={'Message Response Name'} disabled={true} {...formik.getFieldProps('name')} />
							</div>
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Message Response Status</label>

							<Select
								// isMulti
								size='small'
								style={{width: '100%'}}
								options={editMessageResponseStatusOption}
								onChange={onChangeSelectedStatues}
								value={selectedStatuses}
							/>
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Included to Message Status</label>

							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={useMessageStatus(messageStatusId)}
								onChange={onChangeSelectedMessageResponse}
								value={selectedMessageResponse}
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

export default EditMessageResponse;
