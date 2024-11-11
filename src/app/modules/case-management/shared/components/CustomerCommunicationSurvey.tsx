import React, {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import swal from 'sweetalert';
import Select from 'react-select';
import {OptionListModel} from '../../../../common/model';
import {CaseTypeEnum, ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {BasicFieldLabel, MainContainer, MlabButton} from '../../../../custom-components';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {CommunicationSurveyQuestionAnswerResponse, SurveyQuestionAnswerResponse, SurveyQuestionResponse} from '../../../case-communication/models';
import {SelectFilter} from '../../../relationship-management/shared/components';
import {GetCustomerCaseCommSurveyTemplateById, getCustomerCaseSurveyTemplate} from '../../services/CustomerCaseApi';
import {CustomerCaseCommunicationSurveyResponseModel, CustomerCommunicationSurveyQuestionRequestModel} from '../../models';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../setup';

interface Props {
	surveyTemplateId: number | null;
	setSurveyTemplateId: (e: any) => void;
	communicationSurvey: any;
	setCommunicationSurvey: (e: any) => void;
}
interface answerSelectedOption {
	surveyQuestionId: number;
	selectedOption: OptionListModel;
}

const CustomerCommunicationSurvey: React.FC<Props> = (Props) => {

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const {surveyTemplateId, setSurveyTemplateId, communicationSurvey, setCommunicationSurvey} = Props;
	const [surveyTemplate, setSurveyTemplate] = useState<string | any>(undefined);
	const [surveyTemplateList, setSurveyTemplateList] = useState<Array<LookupModel>>([]);

	// Survey
	const [communicationSurveyList, setCommunicationSurveyList] = useState<Array<CustomerCommunicationSurveyQuestionRequestModel>>([]);
	const [selectedSurvey, setSelectedSurvey] = useState<string | any>(undefined);
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionResponse[]>([]);
	const [surveyQuestionAnswer, setSurveyQuestionAnswer] = useState<SurveyQuestionAnswerResponse[]>([]);
	const [answerOptionSelectedList, setAnswerOptionSelectedList] = useState<Array<answerSelectedOption> | any>([]);
	const [surveyTemplateTitle, setSurveyTemplateTitle] = useState<string>('');

	useEffect(() => {
		getAllSurveyTemplate();
	}, []);

	useEffect(() => {
		if (selectedSurvey != undefined && selectedSurvey != '') {
			const templateId = Number(selectedSurvey.value);
			setSurveyTemplateId(templateId);
			getSurveyTemplateById(templateId);
		}
	}, [selectedSurvey]);

	useEffect(() => {
		setCommunicationSurvey(communicationSurveyList);
	}, [communicationSurveyList])

	const getAllSurveyTemplate = () => {
		getCustomerCaseSurveyTemplate(CaseTypeEnum.CustomerService).then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				let data = Object.assign(new Array<LookupModel>(), response.data);
				setSurveyTemplateList(data);
				if (surveyTemplateId) {
					const selectedTemplate = data.find((i) => i.value == surveyTemplateId.toString());
					if (selectedTemplate) {
						setSurveyTemplate(selectedTemplate);
					}
				}
			}
		});
	};

	const getSurveyTemplateById = (surveyTemplateId: number) => {
		GetCustomerCaseCommSurveyTemplateById(surveyTemplateId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setSurveyQuestion(response.data?.surveyQuestions);
					setSurveyQuestionAnswer(response.data.surveyQuestionAnswers);
					setSurveyTemplateTitle(response.data.surveyTemplate.surveyTemplateName);
					const initialSurveyItems = getSurveyItems(response.data?.surveyQuestions);
					setCommunicationSurveyList(initialSurveyItems);
					setCommunicationSurvey(initialSurveyItems);
				} else {
					swal('Failed', 'Problem getting survey template', 'error');
				}
			})
			.catch((err) => {
				console.log('Problem in Survey Questions and Answers' + err);
			});
	};

	const _dispatchSurveyData = (data: CustomerCaseCommunicationSurveyResponseModel) => {
		let storedData = communicationSurvey !== undefined ? communicationSurvey : [];
		const count = storedData.findIndex((x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId === data.surveyQuestionId);

		if (count < 0) {
			let addNewData = storedData.concat(data);
			setCommunicationSurvey(addNewData);
		} else {
			let filteredData = storedData.filter((x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId !== data.surveyQuestionId);
			let UpdatedData = [...filteredData, data];
			setCommunicationSurvey(UpdatedData);
		}
	};

	const getSurveyItems = (questions?: SurveyQuestionResponse[]) => {
		const questionsList = questions ? questions : surveyQuestion;
		const initialSurveyRequest = questionsList.map((questions) => {
			const recordInfo = communicationSurvey.find((i: any) => i.surveyQuestionId == questions.surveyQuestionId && i.surveyTemplateId == surveyTemplateId);
			let surveyItem: CustomerCommunicationSurveyQuestionRequestModel = {
				communicationSurveyQuestionId: recordInfo ? recordInfo.communicationSurveyQuestionId : 0,
				caseCommunicationId: recordInfo ? recordInfo.caseCommunicationId : 0,
				surveyTemplateId: surveyTemplateId != null ? surveyTemplateId : 0,
				surveyQuestionId: questions.surveyQuestionId,
				surveyQuestionAnswersId: recordInfo?.surveyQuestionAnswersId ?? 0,
				surveyAnswer: recordInfo?.surveyAnswerName ?? "",
				createdBy: recordInfo ? Number(recordInfo.createdBy) : userAccessId,
				updatedBy: userAccessId,
				isRequired: questions.isMandatory,
			};
			return surveyItem;
		});
		return initialSurveyRequest;
	}

	const removeSurvey = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmRemoveMessage('Survey Template'),
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((toConfirm) => {
			if (toConfirm) {
				setCommunicationSurvey([]);
				setSelectedSurvey('');
				setSurveyTemplate('');
				setSurveyTemplateId(null);
				setSurveyQuestion([]);
				setSurveyQuestionAnswer([]);
				setSurveyTemplateTitle('');
			}
		});
	};

	const addSurvey = () => {
		if(surveyTemplate == undefined || surveyTemplate == '') {
			swal('Failed', 'Unable to add Survey. Please select Survey Template', 'error');
		} else {
			setSelectedSurvey(surveyTemplate);
		}
	};

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Row>
					<Col sm={12}>
						<h5 className='fw-bolder m-0'>
							{'Survey'} <small>{'(optional)'}</small>
						</h5>
					</Col>
				</Row>

				<Row className='mt-5'>
					<Col sm={3}>
						<SelectFilter
							isMulti={false}
							options={surveyTemplateList}
							label={'Survey Template'}
							onChange={(val: any) => setSurveyTemplate(val)}
							value={surveyTemplate}
							isDisabled={selectedSurvey && selectedSurvey !== undefined && selectedSurvey !== null}
						/>
					</Col>
					{selectedSurvey && selectedSurvey !== undefined && (
						<Col sm={3} style={{display: 'flex', alignItems: 'end', paddingBottom: '3px'}}>
							<MlabButton access={true} label={'Remove'} type={'button'} weight={'solid'} style={ElementStyle.primary} onClick={removeSurvey} />
						</Col>
					)}

					{(selectedSurvey == '' || selectedSurvey == undefined) && (
						<Col sm={3} style={{display: 'flex', alignItems: 'end', paddingBottom: '3px'}}>
							<MlabButton access={true} label={'Add Survey'} type={'button'} weight={'solid'} style={ElementStyle.primary} onClick={addSurvey} />
						</Col>
					)}
				</Row>

				<Row className='mt-5'>
					{surveyQuestion.length > 0 ? (
						<>
							{surveyQuestion.map((questions) => {
								let answersData = Object.assign(new Array<SurveyQuestionAnswerResponse>(), surveyQuestionAnswer).filter(
									(x) => x.surveyQuestionId === questions.surveyQuestionId
								);
								let OptionList = Array<OptionListModel>();

								answersData.forEach((item: SurveyQuestionAnswerResponse) => {
									const tempOption: OptionListModel = {
										value: item.surveyQuestionAnswerId.toString(),
										label: item.surveyQuestionAnswerName,
									};
									OptionList.push(tempOption);
								});

								const onChangeSelectAnswer = (val: any | string) => {
									let request: answerSelectedOption = {
										surveyQuestionId: questions.surveyQuestionId,
										selectedOption: val,
									};

									let requestToStore: CustomerCaseCommunicationSurveyResponseModel = {
										communicationSurveyQuestionId: 0,
										caseCommunicationId: 0,
										surveyTemplateId: surveyTemplateId != null ? surveyTemplateId : 0,
										surveyQuestionId: questions.surveyQuestionId,
										surveyQuestionAnswersId: parseInt(request.selectedOption.value),
										surveyAnswer: request.selectedOption.label,
									};

									const count = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === request.surveyQuestionId);

									if (count < 0) {
										let addRequest = answerOptionSelectedList.concat(request);
										setAnswerOptionSelectedList(addRequest);
									} else {
										let filteredAnswers = answerOptionSelectedList.filter(
											(x: answerSelectedOption) => x.surveyQuestionId !== request.surveyQuestionId
										);
										setAnswerOptionSelectedList([...filteredAnswers, request]);
									}

									_dispatchSurveyData(requestToStore);
								};

								const onChangeSelectMultipleAnswer = (val: any | string) => {
									let surveyQuestionAnswer = Array<CommunicationSurveyQuestionAnswerResponse>();
									let storedData = communicationSurvey !== undefined ? communicationSurvey : [];
									let optionMulti = Array<answerSelectedOption>();
									val.forEach((element: any) => {
										let requestToStore: CommunicationSurveyQuestionAnswerResponse = {
											communicationSurveyQuestionId: 0,
											caseCommunicationId: 0,
											surveyTemplateId: surveyTemplateId != null ? surveyTemplateId : 0,
											surveyQuestionId: questions.surveyQuestionId,
											surveyQuestionAnswersId: parseInt(element.value),
											surveyAnswerName: element.label,
										};
										surveyQuestionAnswer.push(requestToStore);
									});

									const count = storedData.findIndex(
										(x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId === questions.surveyQuestionId
									);

									if (count < 0) {
										let addNewData = storedData.concat(surveyQuestionAnswer);
										//dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(addNewData));
										setCommunicationSurvey(addNewData);
									} else {
										let filteredData = storedData.filter(
											(x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId !== questions.surveyQuestionId
										);
										let UpdatedData = [...filteredData, ...surveyQuestionAnswer];
										//dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(UpdatedData));
										setCommunicationSurvey(UpdatedData);
									}

									val.forEach((x: OptionListModel) => {
										let requests: answerSelectedOption = {
											surveyQuestionId: questions.surveyQuestionId,
											selectedOption: {label: x.label, value: x.value},
										};
										optionMulti.push(requests);
									});

									const counts = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId);

									if (counts < 0) {
										let addRequest = answerOptionSelectedList.concat(optionMulti);
										setAnswerOptionSelectedList(addRequest);
									} else {
										let filteredAnswers = answerOptionSelectedList.filter(
											(x: answerSelectedOption) => x.surveyQuestionId !== questions.surveyQuestionId
										);
										setAnswerOptionSelectedList([...filteredAnswers, ...optionMulti]);
									}
								};

								const onChangeTextAnswer = (surveyAnswerName: string, surveyQuestionId: number) => {
									let requestToStore: CustomerCaseCommunicationSurveyResponseModel = {
										communicationSurveyQuestionId: 0,
										caseCommunicationId: 0,
										surveyTemplateId: surveyTemplateId != null ? surveyTemplateId : 0,
										surveyQuestionId: surveyQuestionId,
										surveyQuestionAnswersId: 0,
										surveyAnswer: surveyAnswerName,
									};

									_dispatchSurveyData(requestToStore);
									let request: answerSelectedOption = {
										surveyQuestionId: surveyQuestionId,
										selectedOption: {label: surveyAnswerName, value: '0'},
									};

									const count = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === surveyQuestionId);

									if (count < 0) {
										let addRequest = answerOptionSelectedList.concat(request);
										setAnswerOptionSelectedList(addRequest);
									} else {
										let filteredAnswers = answerOptionSelectedList.filter((x: answerSelectedOption) => x.surveyQuestionId !== surveyQuestionId);
										setAnswerOptionSelectedList([...filteredAnswers, request]);
									}
								};

								const onChangeRadioAnswer = (surveyAnswerName: string, surveyAnswerId: number, surveyQuestionId: number) => {
									let requestToStore: CustomerCaseCommunicationSurveyResponseModel = {
										communicationSurveyQuestionId: 0,
										caseCommunicationId: 0,
										surveyTemplateId: surveyTemplateId != null ? surveyTemplateId : 0,
										surveyQuestionId: surveyQuestionId,
										surveyQuestionAnswersId: surveyAnswerId,
										surveyAnswer: surveyAnswerName,
									};
									_dispatchSurveyData(requestToStore);
									let request: answerSelectedOption = {
										surveyQuestionId: surveyQuestionId,
										selectedOption: {label: surveyAnswerName, value: surveyAnswerId.toString()},
									};

									const count = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === surveyQuestionId);

									if (count < 0) {
										let addRequest = answerOptionSelectedList.concat(request);
										setAnswerOptionSelectedList(addRequest);
									} else {
										let filteredAnswers = answerOptionSelectedList.filter((x: answerSelectedOption) => x.surveyQuestionId !== surveyQuestionId);
										setAnswerOptionSelectedList([...filteredAnswers, request]);
									}
								};

								return (
									<Col sm={6} key={questions.surveyQuestionId}>
										{(() => {
											switch (questions.fieldTypeName) {
												case 'Dropdown':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}
															<Select
																native
																isSearchable={false}
																size='small'
																style={{width: '100%'}}
																options={OptionList}
																onChange={onChangeSelectAnswer}
																value={
																	answerOptionSelectedList !== undefined
																		? answerOptionSelectedList
																				.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																				.map((x: answerSelectedOption) => x.selectedOption)
																		: []
																}
															/>
														</>
													);
												case 'Dropdown With Search':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}
															<Select
																size='small'
																style={{width: '100%'}}
																options={OptionList}
																onChange={onChangeSelectAnswer}
																value={
																	answerOptionSelectedList !== undefined
																		? answerOptionSelectedList
																				.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																				.map((x: answerSelectedOption) => x.selectedOption)
																		: []
																}
															/>
														</>
													);
												case 'Dropdown Multi Select':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}
															<Select
																isMulti
																size='small'
																style={{width: '100%'}}
																options={OptionList}
																onChange={onChangeSelectMultipleAnswer}
																value={
																	answerOptionSelectedList !== undefined
																		? answerOptionSelectedList
																				.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																				.map((x: answerSelectedOption) => x.selectedOption)
																		: []
																}
															/>
														</>
													);
												case 'Dropdown Multi Select With Search':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}
															<Select
																id={'dropdown-multi-select-with-search-question'}
																isMulti
																size='small'
																style={{width: '100%'}}
																options={OptionList}
																onChange={onChangeSelectMultipleAnswer}
																value={
																	answerOptionSelectedList !== undefined
																		? answerOptionSelectedList
																				.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																				.map((x: answerSelectedOption) => x.selectedOption)
																		: []
																}
															/>
														</>
													);
												case 'Radio Button':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}

															{OptionList.map((r) => {
																return (
																	<div style={{flexDirection: 'row'}}>
																		<input
																			type='radio'
																			checked={
																				answerOptionSelectedList !== undefined
																					? answerOptionSelectedList
																							.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																							.map((x: any) => x.selectedOption.value)
																							.toString() === r.value
																						? true
																						: false
																					: false
																			}
																			value={r.value}
																			onChange={(e) => onChangeRadioAnswer(r.label, parseInt(e.target.defaultValue), questions.surveyQuestionId)}
																			name={r.value}
																			style={{margin: 10}}
																		/>
																		<BasicFieldLabel title={r.label} />
																	</div>
																);
															})}
														</>
													);
												case 'Text Input':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}
															<input
																type='text'
																className='form-control form-control-sm'
																aria-label={questions.surveyQuestionName}
																onChange={(e) => onChangeTextAnswer(e.target.value, questions.surveyQuestionId)}
																value={
																	answerOptionSelectedList !== undefined
																		? answerOptionSelectedList
																				.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																				.map((x: any) => x.selectedOption.label)
																				.toString()
																		: ''
																}
															/>
														</>
													);
												case 'Multiline Text Input':
													return (
														<>
															{questions.isMandatory ? (
																<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
															) : (
																<BasicFieldLabel title={questions.surveyQuestionName} />
															)}
															<textarea
																className='form-control form-control-sm'
																value={
																	answerOptionSelectedList !== undefined
																		? answerOptionSelectedList
																				.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																				.map((x: any) => x.selectedOption.label)
																				.toString()
																		: ''
																}
																onChange={(e) => onChangeTextAnswer(e.target.value, questions.surveyQuestionId)}
															/>
														</>
													);
												default:
													return null;
											}
										})()}
									</Col>
								);
							})}
						</>
					) : null}
				</Row>
			</div>
		</MainContainer>
	);
};

export default CustomerCommunicationSurvey;
