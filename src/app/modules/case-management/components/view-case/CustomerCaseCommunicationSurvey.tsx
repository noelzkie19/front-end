import React, {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import swal from 'sweetalert';
import {OptionListModel} from '../../../../common/model';
import {HttpStatusCodeEnum} from '../../../../constants/Constants';
import {BasicFieldLabel, FormGroupContainerBordered} from '../../../../custom-components';
import {SurveyQuestionAnswerResponse, SurveyQuestionResponse} from '../../../case-communication/models';
import {CustomerCaseCommunicationSurveyModel} from '../../models/CustomerCaseCommunicationSurveyModel';
import {GetCustomerCaseCommSurveyTemplateById} from '../../services/CustomerCaseApi';

interface Props {
	surveyTemplateId: number | null;
	communicationSurvey: Array<CustomerCaseCommunicationSurveyModel>;
}

interface answerSelectedOption {
	surveyQuestionId: number;
	selectedOption: OptionListModel;
}

const CustomerCaseCommunicationSurvey: React.FC<Props> = (Props) => {
	const {surveyTemplateId, communicationSurvey} = Props;

	// Survey
	const [customerCaseCommunicationSurvey, setCustomerCaseCommunicationSurvey] = useState<Array<CustomerCaseCommunicationSurveyModel>>([]);
	const [surveyTemplateTitle, setSurveyTemplateTitle] = useState<string>('');
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionResponse[]>([]);
	const [surveyQuestionAnswer, setSurveyQuestionAnswer] = useState<SurveyQuestionAnswerResponse[]>([]);
	const [answerOptionSelectedList, setAnswerOptionSelectedList] = useState<Array<answerSelectedOption> | undefined>([]);

	useEffect(() => {
		if (communicationSurvey && communicationSurvey.length > 0) {
			setCustomerCaseCommunicationSurvey(communicationSurvey);
		}
	}, [communicationSurvey]);

	useEffect(() => {
		if (surveyTemplateId && surveyTemplateId > 0) {
			getSurveyTemplateById(surveyTemplateId);
		}
	}, [surveyTemplateId])

	useEffect(() => {
		let newSelectionData = Array<answerSelectedOption>();
		communicationSurvey.forEach((item: CustomerCaseCommunicationSurveyModel) => {
			const selectedItemData: answerSelectedOption = {
				surveyQuestionId: item.surveyQuestionId,
				selectedOption: {value: item.surveyQuestionAnswersId.toString(), label: item.surveyAnswerName},
			};
			newSelectionData.push(selectedItemData);
		});
		setAnswerOptionSelectedList(newSelectionData);
	}, [customerCaseCommunicationSurvey])

	const getSurveyTemplateById = (surveyTemplateId: number) => {
		GetCustomerCaseCommSurveyTemplateById(surveyTemplateId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setSurveyQuestion(response.data?.surveyQuestions);
					setSurveyQuestionAnswer(response.data.surveyQuestionAnswers);
					setSurveyTemplateTitle(response.data.surveyTemplate.surveyTemplateName);
				} else {
					swal('Failed', 'Problem getting survey template', 'error');
				}
			})
			.catch((err) => {
				console.log('Problem in Survey Questions and Answers' + err);
			});
	};

	return (
		<FormGroupContainerBordered>
			<Row>
				<Col sm={12}>
					<h5 className='fw-bolder m-0'>{'Survey'}</h5>
				</Col>
			</Row>

			<Row className='mt-5'>
				<Col sm={3}>
					<strong>{surveyTemplateTitle}</strong>
				</Col>
			</Row>
			<Row style={{marginTop: 20, marginBottom: 20}}>
				{surveyQuestion.length > 0
					? surveyQuestion.map((questions) => {
							const answerObj =
								answerOptionSelectedList !== undefined &&
								answerOptionSelectedList.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId);
							let answerName = '';
							
							if (answerObj && answerObj.length == 1) {
								answerName = answerObj[0].selectedOption.label;
							} else if (answerObj && answerObj.length > 1) {
								answerName = answerObj.map((i) => i.selectedOption.label).join(", ");
							}

							return (
								<Col sm={6} key={questions.surveyQuestionId}>
									<Row>
										<Col sm={4}>
											{questions.isMandatory ? (
												<label className='col-form-label col-sm required'>{questions.surveyQuestionName}</label>
											) : (
												<BasicFieldLabel title={questions.surveyQuestionName} />
											)}
										</Col>
										<Col sm={8}>
											<BasicFieldLabel title={answerName} />
										</Col>
									</Row>
								</Col>
							);
					  })
					: null}
			</Row>
		</FormGroupContainerBordered>
	);
};

export default CustomerCaseCommunicationSurvey;
