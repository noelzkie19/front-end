import {ColDef, ColGroupDef} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {DefaultPrimaryButton, DefaultTableButton, ErrorLabel} from '../../../../custom-components';
import MainContainer from '../../../../custom-components/containers/MainContainer';
import {IAuthState} from '../../../auth';
import {useCaseCommOptions} from '../../../case-communication/components/shared/hooks';
import {SelectFilter, TextAreaFilter} from '../../../relationship-management/shared/components';
import {CustomerCommunicationFeedBackTypeRequestModel} from '../../models';
import {CustomerCaseCommunicationFeedbackModel} from '../../models/CustomerCaseCommunicationFeedbackModel';
import useCustomerCaseCommHooks from '../../shared/hooks/useCustomerCaseCommHooks';

interface Props {
	communicationId: number;
	setCommunicationFeedback: (e: Array<CustomerCommunicationFeedBackTypeRequestModel>) => void;
}
const CustomerServiceEditCommunicationFeedback: React.FC<Props> = (Props) => {
	const {communicationId, setCommunicationFeedback} = Props;
	const {
		getFeedbackTypeOptionList,
		feedbackTypeOptionList,
		getFeedbackCategoryOptionById,
		feedbackCategoryOptionList,
		getFeedbackAnserOptions,
		feedbackAnswerLoading,
		feedbackAnswerOptionList,
	} = useCaseCommOptions();

	const {caseCommunicationFeedback, getCaseCommunicationFeedback} = useCustomerCaseCommHooks();

	const {message} = useConstant();
	const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	// Feedback
	const [customerCaseCommunicationFeedbackList, setCustomerCaseCommunicationFeedbackList] = useState<Array<CustomerCaseCommunicationFeedbackModel>>(
		[]
	);
	const [selectedFeedbackType, setSelectedFeedbackType] = useState<string | any>('');
	const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState<string | any>('');
	const [selectedFeedbackAnswer, setSelectedFeedbackAnswer] = useState<string | any>('');
	const [feedbackDetails, setFeedbackDetails] = useState<string | any>('');
	const [solutionProvided, setSolutionProvided] = useState<string | any>('');
	const [hasFeedbackErrors, setHasFeedbackErrors] = useState<boolean>(false);
	const [errorFeedbackMessage, setErrorFeedbackMessage] = useState<string>('');
	const [convertedContent, setConvertedContent] = useState<string>();

	// Side Effects
	useEffect(() => {
		getFeedbackTypeOptionList();
	}, []);

	useEffect(() => {
		// Get Communication Feedback
		getCaseCommunicationFeedback(communicationId);
	}, [communicationId]);

	useEffect(() => {
		if (caseCommunicationFeedback && caseCommunicationFeedback.length > 0) {
			setCustomerCaseCommunicationFeedbackList(caseCommunicationFeedback);
			setCommunicationFeedback(requestModelMapper(caseCommunicationFeedback));
		}
	}, [caseCommunicationFeedback]);

	useEffect(() => {
		if (feedbackTypeOptionList.length === 1) setSelectedFeedbackType(feedbackTypeOptionList.find((x) => x.label !== ''));
	}, [feedbackTypeOptionList]);

	useEffect(() => {
		if (feedbackCategoryOptionList.length === 1) setSelectedFeedbackCategory(feedbackCategoryOptionList.find((x) => x.label !== ''));
	}, [feedbackCategoryOptionList]);

	useEffect(() => {
		if (feedbackAnswerOptionList.length === 1) {
			const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryName, feedbackTypeName} = feedbackAnswerOptionList[0];
			setSelectedFeedbackAnswer({label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName, value: feedbackAnswerId});
		}
	}, [feedbackAnswerOptionList]);

	useEffect(() => {
		if (selectedFeedbackType !== undefined) {
			const {value} = selectedFeedbackType;
			getFeedbackCategoryOptionById(value);
		}
	}, [selectedFeedbackType]);

	useEffect(() => {
		if (selectedFeedbackCategory !== undefined) {
			getFeedbackAnserOptions(selectedFeedbackType.value, selectedFeedbackCategory.value, '');
		}
	}, [selectedFeedbackCategory]);

	// Functions

	const onChangeSelectFeedbackType = (val: string | any) => {
		setSelectedFeedbackCategory('');
		setSelectedFeedbackAnswer('');
		setSelectedFeedbackType(val);
	};

	const onChangeSelectFeedbackCategory = (val: string | any) => {
		setSelectedFeedbackCategory(val);
		setSelectedFeedbackAnswer('');
	};

	const onChangeSelectFeedbackAnswer = (val: any) => {
		const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryId, feedbackCategoryName, feedbackTypeId, feedbackTypeName} = val.value;
		setSelectedFeedbackAnswer({label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName, value: feedbackAnswerId});
		setSelectedFeedbackCategory({label: feedbackCategoryName, value: feedbackCategoryId});
		setSelectedFeedbackType({label: feedbackTypeName, value: feedbackTypeId});
	};

	const AddFeedback = () => {
		let isError: boolean = false;

		if (selectedFeedbackType.value === undefined || selectedFeedbackType.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedFeedbackCategory.value === undefined || selectedFeedbackCategory.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedFeedbackAnswer.value === undefined || selectedFeedbackAnswer.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (feedbackDetails === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (solutionProvided === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (caseCommunicationFeedback !== undefined) {
			const requestToValidate: CustomerCaseCommunicationFeedbackModel = {
				communicationFeedbackId: 0,
				caseCommunicationId: 0,
				communicationFeedbackNo: 0,
				feedbackTypeId: parseInt(selectedFeedbackType.value),
				feedbackTypeName: selectedFeedbackType.label,
				feedbackCategoryId: parseInt(selectedFeedbackCategory.value),
				feedbackCategoryName: selectedFeedbackCategory.label,
				feedbackAnswerId: parseInt(selectedFeedbackAnswer.value),
				feedbackAnswerName: feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedFeedbackAnswer.value)?.feedbackAnswerName || '',
				communicationFeedbackDetails: feedbackDetails,
				communicationSolutionProvided: solutionProvided,
			};

			let searchFeedbackData = customerCaseCommunicationFeedbackList.find(
				(x: CustomerCaseCommunicationFeedbackModel) =>
					x.feedbackTypeId === requestToValidate.feedbackTypeId &&
					x.feedbackCategoryId === requestToValidate.feedbackCategoryId &&
					x.feedbackAnswerId === requestToValidate.feedbackAnswerId &&
					x.communicationFeedbackDetails.toLocaleUpperCase() === requestToValidate.communicationFeedbackDetails.toLocaleUpperCase() &&
					x.communicationSolutionProvided.toLocaleUpperCase() === requestToValidate.communicationSolutionProvided.toUpperCase()
			);

			if (searchFeedbackData !== undefined) {
				setHasFeedbackErrors(true);
				setErrorFeedbackMessage('Value already exists, please check the table to find them');
				isError = true;
			}

			if (isError === false) {
				let storedData = customerCaseCommunicationFeedbackList ? customerCaseCommunicationFeedbackList : [];
				const newDataToStore = requestModelMapper(storedData.concat(requestToValidate));
				setCustomerCaseCommunicationFeedbackList(storedData.concat(requestToValidate));
				setCommunicationFeedback(newDataToStore);
				setHasFeedbackErrors(false);
				setErrorFeedbackMessage('');
				resetFeedbackForm();
			}
		}
	};

	const RemoveFeedback = (data: CustomerCaseCommunicationFeedbackModel) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmRemoveMessage('Feedback'),
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((toConfirm) => {
			if (toConfirm) {
				let filteredFeedback = customerCaseCommunicationFeedbackList.filter((x: CustomerCaseCommunicationFeedbackModel) => x !== data);
				setCustomerCaseCommunicationFeedbackList(filteredFeedback);
				setCommunicationFeedback(requestModelMapper(filteredFeedback));
			}
		});
	};

	const requestModelMapper = (caseCommViewModels: Array<CustomerCaseCommunicationFeedbackModel>) => {
		const requestData = caseCommViewModels.map((item) => {
			const feedbackRequest: CustomerCommunicationFeedBackTypeRequestModel = {
				communicationFeedbackId: item.communicationFeedbackId,
				caseCommunicationId: item.caseCommunicationId,
				communicationFeedbackNo: item.communicationFeedbackNo,
				feedbackTypeId: item.feedbackTypeId,
				feedbackCategoryId: item.feedbackCategoryId,
				feedbackAnswerId: item.feedbackAnswerId,
				feedbackAnswer: item.feedbackAnswerName,
				communicationFeedbackDetails: item.communicationFeedbackDetails,
				communicationSolutionProvided: item.communicationSolutionProvided,
				createdBy: userAccessId,
				updatedBy: userAccessId,
			};
			return feedbackRequest;
		});

		return requestData;
	};

	const resetFeedbackForm = () => {
		setSelectedFeedbackType('');
		setSelectedFeedbackCategory('');
		setSelectedFeedbackAnswer('');
		setFeedbackDetails('');
		setSolutionProvided('');
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	// Table Content and Header
	const columnDefs: (ColDef<CustomerCaseCommunicationFeedbackModel> | ColGroupDef<CustomerCaseCommunicationFeedbackModel>)[] = [
		{headerName: 'No', field: 'feedbackTypeName', cellRenderer: (params: any) => <>{params ? <div>{params.rowIndex + 1}</div> : null}</>},
		{headerName: 'Feedback Type', field: 'feedbackTypeName'},
		{headerName: 'Feedback Category', field: 'feedbackCategoryName'},
		{headerName: 'Feedback Answer', field: 'feedbackAnswerName'},
		{headerName: 'Feedback Details', field: 'communicationFeedbackDetails'},
		{headerName: 'Solution Provided', field: 'communicationSolutionProvided'},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					{params.data.messageTypeId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<DefaultTableButton access={true} title={'remove'} onClick={() => RemoveFeedback(params.data)} />
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Row>
					<Col sm={12}>
						<h5 className='fw-bolder m-0'>
							{'Feedback'} <small>{'(optional)'}</small>
						</h5>
					</Col>
				</Row>

				<Row className='mt-5'>
					<Col sm={3}>
						<SelectFilter
							isMulti={false}
							options={feedbackTypeOptionList}
							label={'Feedback Type'}
							onChange={onChangeSelectFeedbackType}
							value={selectedFeedbackType}
						/>
					</Col>
					<Col sm={3}>
						<SelectFilter
							isMulti={false}
							options={feedbackCategoryOptionList}
							label={'Feedback Category'}
							onChange={onChangeSelectFeedbackCategory}
							value={selectedFeedbackCategory}
						/>
					</Col>
					<Col sm={6}>
						<p className={`p-0 m-0 my-1 filter-label`}>{'Feedback Answer'}</p>
						<Select
							options={feedbackAnswerOptionList.flatMap((x) => [
								{label: x.feedbackTypeName + ' - ' + x.feedbackCategoryName + ' - ' + x.feedbackAnswerName, value: x},
							])}
							onChange={onChangeSelectFeedbackAnswer}
							value={selectedFeedbackAnswer}
							isSearchable={true}
							isLoading={feedbackAnswerLoading}
							onInputChange={(e: any) => {
								if (e.length >= 3) {
									getFeedbackAnserOptions('', '', e);
								}
							}}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 20, marginBottom: 20}}>
					<Col sm={6}>
						<TextAreaFilter label='Feedback Details' value={feedbackDetails} onChange={(val: any) => setFeedbackDetails(val)} />
					</Col>
					<Col sm={6}>
						<TextAreaFilter label='Solution Provided' value={solutionProvided} onChange={(val: any) => setSolutionProvided(val)} />
					</Col>
				</Row>

				<Row>
					<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
						<Row style={{marginTop: 10, marginBottom: 20, marginLeft: 5}}>
							<DefaultPrimaryButton isDisable={false} access={true} title={'Add'} onClick={AddFeedback} />
						</Row>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<ErrorLabel hasErrors={hasFeedbackErrors} errorMessage={errorFeedbackMessage} />
					</Col>
				</Row>
				<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: 20}}>
					<AgGridReact
						rowData={customerCaseCommunicationFeedbackList}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						rowSelection={'multiple'}
						pagination={true}
						paginationPageSize={10}
						columnDefs={columnDefs}
					/>
				</div>
			</div>
		</MainContainer>
	);
};

export default CustomerServiceEditCommunicationFeedback;
