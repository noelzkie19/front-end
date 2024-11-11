import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import {
	ContentContainer,
	DefaultSecondaryButton,
	ErrorLabel,
	FieldContainer,
	FormContainer,
	FormModal,
	MainContainer,
	SearchTextInput,
	SuccesLoaderButton,
} from '../../../../custom-components';
import {useMessageStatus} from '../../../../custom-functions';
import {MessageResponseList, MessageResponseStatuses, OptionsSelectedModel} from '../../models';
import * as system from '../../redux/SystemRedux';
import {validateMessageResponseName} from '../../redux/SystemService';
import useConstant from '../../../../constants/useConstant';

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
	messageStatusId: number;
}

interface MessageTypeOption {
	messageTypeId: string;
	messageTypeName: string;
}

const CreateMessageResponse: React.FC<Props> = ({showForm, closeModal, messageStatusId}) => {
	const dispatch = useDispatch();

	const {successResponse} = useConstant();

	// GET REDUX STORE
	const systemData = useSelector<RootState>(({system}) => system.getMessageResponseList, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;

	// STATES
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [selectedMessageResponseStatus, setSelectedMessageResponseStatus] = useState<any>('');

	// WATCHER
	useEffect(() => {
		setLoading(false);
		setHasErrors(false);

		if (showForm === true) {
			formik.resetForm();
			setSelectedStatuses('');
			setSelectedMessageResponseStatus('');
		}
	}, [showForm]);

	// METHODS
	const _dispatchTransaction = (name: string, status: string) => {
		// CHECK IF SYSTEM STORES HAVE DATA
		let storedData = systemData ? systemData : [];
		let postDatas = postData ? postData : [];
		let postMessageStatuses = Array<MessageResponseStatuses>();

		selectedMessageResponseStatus.forEach((item: OptionsSelectedModel) => {
			const optionData: MessageResponseStatuses = {
				messageResponseId: 0,
				messageStatusId: parseInt(item.value),
				messageStatusName: item.label,
			};
			postMessageStatuses.push(optionData);
		});

		// ADD PARENT POST MESSAGE STATUS TO INLUCDE ON INSERT
		if (messageStatusId !== 0) {
			const MessageStatusParentid: MessageResponseStatuses = {messageResponseId: 0, messageStatusId: messageStatusId, messageStatusName: ''};
			postMessageStatuses.push(MessageStatusParentid);
		}

		// CHILD PARAMTER TO PASS
		const request: MessageResponseList = {
			messageResponseId: 0,
			messageResponseName: name,
			messageStatusId: messageStatusId,
			position: 0,
			messageResponseStatus: status === '1' ? true : false,
			messageResponseStatuses: postMessageStatuses,
			action: 'ADD',
		};

		// CONCAT PASSED DATA TO EXISITING DATA ON TABLE STORE
		const newDataToStore = storedData.concat(request);

		// CONCAT PASSED DATA TO EXISTING POST DATA STORE
		const newDataToPostStore = postDatas.concat(request);

		// DISPATCH TOPIC TABLE REDUX
		dispatch(system.actions.getMessageResponseList(newDataToStore));
		// DISPATCH TOPIC TO POST TABLE REDUX
		dispatch(system.actions.postMessageResponseList(newDataToPostStore));
	};
	const onChangeSelectedMessageResponseStatus = (val: string) => {
		setSelectedMessageResponseStatus(val);
	};
	function onChangeSelectedStatues(val: string) {
		setSelectedStatuses(val);
	}
	const _validateTransaction = (name: string, status: string, includedStatus: string) => {
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

		if (includedStatus === '' || includedStatus === undefined || includedStatus === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			isError = true;
		}

		// -- VALIDATE VALUES IF EXISTING ON TABLE -- //
		let searchValue = [storedData][0].find((x: MessageResponseList) => x.messageResponseName.toUpperCase() === name.toUpperCase());

		if (searchValue != undefined) {
			setHasErrors(true);
			setErrorMessage('Value already exists, please use the search filter to find them');
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
			let includeToStatus: string = Object.assign(Array<MessageTypeOption>(), selectedMessageResponseStatus)
				.map((el: any) => el.value)
				.join(',');

			// -- VALIDATE VALUES IF EMPTY OR NULL --//
			let isError = _validateTransaction(values.name, values.status, includeToStatus);

			// -- VALIDATION SATISFIED PROCEED TO TRANSACTION --//
			if (isError === false) {
				// -- VALIDATE IF EXIST ON DATABASE --//
				validateMessageResponseName(values.name)
					.then((response) => {
						if (response.data.status === successResponse) {
							// IF SUCCESS THEN PROCEED TO TRANSACTION
							_dispatchTransaction(values.name, values.status);
							resetForm();
							setHasErrors(false);
							setErrorMessage('');
							resetForm();
						} else {
							isError = true;
							setHasErrors(true);
							setErrorMessage(response.data.message);
						}
					})
					.catch(() => {
						isError = true;
						setHasErrors(true);
						setErrorMessage('Connection error Please close the form and try again');
					});
			}
			setSubmitting(false);
		},
	});

	// RETURN ELEMENT
	return (
		<FormModal headerTitle={'Add Message Response'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
						<FieldContainer>
							<label className='form-label-sm required'>Message Response Name</label>

							<SearchTextInput ariaLabel={'Message Response Name'} {...formik.getFieldProps('name')} />
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Message Response Status</label>
							<Select
								// isMulti
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
							<label className='form-label-sm required'>Included to Message Status</label>
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={useMessageStatus(messageStatusId)}
								onChange={onChangeSelectedMessageResponseStatus}
								value={selectedMessageResponseStatus}
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

export default CreateMessageResponse;
