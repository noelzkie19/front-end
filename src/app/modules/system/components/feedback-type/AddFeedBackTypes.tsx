import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Col, ModalFooter, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import {
	ContentContainer,
	DefaultSecondaryButton,
	ErrorLabel,
	FormContainer,
	FormModal,
	MainContainer,
	SearchTextInput,
	SuccesLoaderButton,
} from '../../../../custom-components';
import {FeedBackTypeResponse} from '../../models';
import * as system from '../../redux/SystemRedux';
import {validateFeedbackTypeName} from '../../redux/SystemService';
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
}

const AddFeedBackTypes: React.FC<Props> = ({showForm, closeModal}) => {
	const dispatch = useDispatch();
	const {successResponse} = useConstant();

	// GET REDUX STORE
	const systemData = useSelector<RootState>(({system}) => system.getFeedbackTypes, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postFeedbackTypes, shallowEqual) as any;

	// STATES
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	// VARIABLES
	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	// WATCHER
	useEffect(() => {
		setLoading(false);
		setHasErrors(false);
		setErrorMessage('');
		setSelectedStatuses('');
		formik.setFieldValue('name', null);
	}, [showForm]);

	// METHODS

	const _dispatchTransaction = (name: string, status: string) => {
		// CHECK IF SYSTEM STORES HAVE DATA
		let storedData = systemData || [];
		let postDatas = postData || [];

		// ----------------------------------- DISPATCH OF DATA FOR TABLE----------------------------------------//

		const request: FeedBackTypeResponse = {
			codeListId: 6,
			codeListName: 'Feedback Type',
			feedbackTypeId: 0,
			feedbackTypeName: name,
			feedbackTypeStatus: status === '1' ? 'true' : 'false',
			position: 0,
			action: 'ADD',
		};

		// CONCAT PASSED DATA TO EXISITING DATA ON TABLE STORE
		const newDataToStore = storedData.concat(request);
		// DISPATCH TOPIC TABLE REDUX
		dispatch(system.actions.getFeedbackTypes(newDataToStore));

		// ----------------------------------- DISPATCH FOR POSTING OF DATA---------------------------------------//

		// CONCAT PASSED DATA TO EXISTING POST DATA STORE
		const newDataToPostStore = postDatas.concat(request);
		// DISPATCH TOPIC TO POST TABLE REDUX
		dispatch(system.actions.postFeedbackTypes(newDataToPostStore));
	};

	function onChangeSelectedStatues(val: string) {
		setSelectedStatuses(val);
	}

	const _validateTransaction = (name: string, status: string) => {
		let storedData = systemData || [];

		let isError: boolean = false;

		if (name === '' || name === undefined || name === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory field');
			isError = true;
		}

		if (status === '' || status === undefined || status === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up all mandatory field');
			isError = true;
		}

		// -- VALIDATE VALUES IF EXISTING ON TABLE -- //
		let searchValue = [storedData][0].find((x: FeedBackTypeResponse) => x.feedbackTypeName === name);

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

			// -- VALIDATE VALUES IF EMPTY OR NULL --//
			let isError = _validateTransaction(values.name, values.status);

			// -- VALIDATION SATISFIED PROCEED TO TRANSACTION --//
			if (isError === false) {
				// -- VALIDATE IF EXIST ON DATABASE --//
				validateFeedbackTypeName(values.name)
					.then((response) => {
						if (response.data.status === successResponse) {
							// IF SUCCESS THEN PROCEED TO TRANSACTION
							_dispatchTransaction(values.name, values.status);
							resetForm();
							setHasErrors(false);
							setErrorMessage('');
						} else {
							isError = true;
							setHasErrors(true);
							setErrorMessage('Value already exists, please use the search filter to find them');
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
		<FormModal headerTitle={'Add Feedback Type'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<Col>
							<Row>
								<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
							</Row>

							<Row>
								<label htmlFor='add-feedback-type-name' className='form-label-sm required'>Feedback Type Name</label>
								<SearchTextInput ariaLabel={'Feedback Type Name'} {...formik.getFieldProps('name')} />
							</Row>
							<Row style={{ marginTop: 20 }}>
								<label htmlFor='add-feedback-type-status' className='form-label-sm required'>Feedback Type Status</label>
								<Select
									id='add-feedback-type-status'
									native
									size='small'
									style={{width: '100%'}}
									options={statusOptions}
									onChange={onChangeSelectedStatues}
									value={selectedStatuses}
								/>
							</Row>
						</Col>
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

export default AddFeedBackTypes;