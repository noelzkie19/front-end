import React, {useEffect} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import Select from 'react-select';
import {OptionListModel} from '../../../../../common/model';
import {BasicFieldLabel, FormHeader, MainContainer} from '../../../../../custom-components';
import {AddCommunicationSurveyRequest, SurveyQuestionAnswerResponse, SurveyQuestionResponse} from '../../../models';

interface Props {
	campaignSurveyQuestion: SurveyQuestionResponse[];
	campaignSurveyQuestionAnswer: SurveyQuestionAnswerResponse[];
	campaignSurveyTemplateTitle: string;
	campaignSurveyRequest: AddCommunicationSurveyRequest[];
	setCampaignSurveyRequest: (e: AddCommunicationSurveyRequest[]) => void;
	campaignSurveyTemplateId: number;
	campaignSurveyUserIdCreated: string;
	isCampaignCaseCommSurveyReadOnly: boolean;
	campaignSurveyCommunicationId: number;
	campaignSurveyPreSelectOnlyOneAnswer: boolean;
}

const CampaignCaseCommSurvey: React.FC<Props> = (Props) => {
	/**
	 *  Props
	 */
	const {
		campaignSurveyTemplateTitle,
		campaignSurveyQuestion,
		campaignSurveyQuestionAnswer,
		campaignSurveyTemplateId,
		campaignSurveyUserIdCreated,
		campaignSurveyRequest,
		setCampaignSurveyRequest,
		isCampaignCaseCommSurveyReadOnly,
		campaignSurveyCommunicationId,
		campaignSurveyPreSelectOnlyOneAnswer,
	} = Props;

	/**
	 *  ? Methods
	 */

	useEffect(() => {
		if (campaignSurveyPreSelectOnlyOneAnswer) return campaignSurveyPopualteSelectedAnswers();
	}, [campaignSurveyQuestion]);

	const campaignSurveyPopualteSelectedAnswers = () => {
		let preSelectedSurveyAnswerObjArray: AddCommunicationSurveyRequest[] = [];

		campaignSurveyQuestion
			.filter(
				(preSurveyAnswersObj) =>
					preSurveyAnswersObj.fieldTypeName === 'Dropdown' ||
					preSurveyAnswersObj.fieldTypeName === 'Dropdown With Search' ||
					preSurveyAnswersObj.fieldTypeName === 'Dropdown Multi Select' ||
					preSurveyAnswersObj.fieldTypeName === 'Dropdown Multi Select With Search'
			)
			.forEach((questionAnswerItem) => {
				let filteredCampaignSurveyObj = campaignSurveyQuestionAnswer.filter(
					(v, i) => campaignSurveyQuestionAnswer.indexOf(v) == i && v.surveyQuestionId === questionAnswerItem.surveyQuestionId
				);

				if (filteredCampaignSurveyObj.length === 1) {
					filteredCampaignSurveyObj.forEach((answerObj) => {
						let preSelectedSurveyAnswerRequest: AddCommunicationSurveyRequest = {
							caseCommunicationId: campaignSurveyCommunicationId,
							communicationSurveyQuestionId: 0,
							surveyAnswer: answerObj.surveyQuestionAnswerName,
							surveyQuestionAnswersId: answerObj.surveyQuestionAnswerId,
							surveyQuestionId: answerObj.surveyQuestionId,
							surveyTemplateId: campaignSurveyTemplateId,
							createdBy: parseInt(campaignSurveyUserIdCreated),
							updatedBy: parseInt(campaignSurveyUserIdCreated),
						};
						preSelectedSurveyAnswerObjArray.push(preSelectedSurveyAnswerRequest);
					});
				}
			});

		setCampaignSurveyRequest(preSelectedSurveyAnswerObjArray);
	};

	const campaignSurveyLabel = (_isMandatory: boolean, _surveyQuestionName: string) => {
		if (_isMandatory) {
			return <label className='col-form-label col-sm required'>{_surveyQuestionName}</label>;
		} else {
			return <BasicFieldLabel title={_surveyQuestionName} />;
		}
	};

	const campaignAnswerOptionSelectedListValue = (_surveyQuestionId: number) => {
		let selectedOptionAnswerValue = campaignSurveyRequest
			.filter((x: AddCommunicationSurveyRequest) => x.surveyQuestionId === _surveyQuestionId)
			.flatMap((x: AddCommunicationSurveyRequest) => [{label: x.surveyAnswer, value: x.surveyQuestionAnswersId.toString()}]);
		return selectedOptionAnswerValue;
	};

	const campaignSurveyTextValue = (_surveyQuestionId: number) => {
		let campaignSurveyTextValueResponse =
			campaignSurveyRequest !== undefined
				? campaignSurveyRequest
						.filter((x: AddCommunicationSurveyRequest) => x.surveyQuestionId === _surveyQuestionId)
						.map((x) => x.surveyAnswer)
						.toString()
				: '';
		return campaignSurveyTextValueResponse;
	};

	const campaignSurveyRadionValue = (_answerValue: string, _surveyQuestionId: number) => {
		let answerOptionValue = campaignSurveyRequest.some(
			(x: AddCommunicationSurveyRequest) => x.surveyQuestionId === _surveyQuestionId && x.surveyQuestionAnswersId.toString() === _answerValue
		);
		return answerOptionValue;
	};

	const campaignSurveyOptions = (_surveyQuestionId: number) => {
		let campaignSurveyAnswersObj = Object.assign(new Array<SurveyQuestionAnswerResponse>(), campaignSurveyQuestionAnswer).filter(
			(x) => x.surveyQuestionId === _surveyQuestionId
		);
		let surveryOptionListResponse = Array<OptionListModel>();

		campaignSurveyAnswersObj.forEach((item: SurveyQuestionAnswerResponse) => {
			const tempOption: OptionListModel = {
				label: item.surveyQuestionAnswerName,
				value: item.surveyQuestionAnswerId.toString(),
			};
			surveryOptionListResponse.push(tempOption);
		});
		return surveryOptionListResponse;
	};

	const onChangeCampaignSurveySelectAnswer = (_val: any, _surveyQuestionId: number) => {
		let surveyCampaignRequestValue: AddCommunicationSurveyRequest = {
			communicationSurveyQuestionId: 0,
			caseCommunicationId: campaignSurveyCommunicationId,
			surveyTemplateId: campaignSurveyTemplateId,
			surveyQuestionId: _surveyQuestionId,
			surveyQuestionAnswersId: parseInt(_val.value),
			surveyAnswer: _val.label,
			createdBy: parseInt(campaignSurveyUserIdCreated),
			updatedBy: parseInt(campaignSurveyUserIdCreated),
		};

		setCampaignSurveyRequest([surveyCampaignRequestValue, ...campaignSurveyRequest.filter((obj) => obj.surveyQuestionId !== _surveyQuestionId)]);
	};

	const onChangeSelectMultipleAnswer = async (_val: any, _surveyQuestionId: number) => {
		let campaignSurveyQuestionAnswerObj = Array<AddCommunicationSurveyRequest>();

		// Set Value to post request
		_val.forEach((multiElementVal: any) => {
			let surveyCampaignRequestValue: AddCommunicationSurveyRequest = {
				communicationSurveyQuestionId: 0,
				caseCommunicationId: campaignSurveyCommunicationId,
				surveyTemplateId: campaignSurveyTemplateId,
				surveyQuestionId: _surveyQuestionId,
				surveyQuestionAnswersId: parseInt(multiElementVal.value),
				surveyAnswer: multiElementVal.label,
				createdBy: parseInt(campaignSurveyUserIdCreated),
				updatedBy: parseInt(campaignSurveyUserIdCreated),
			};
			campaignSurveyQuestionAnswerObj.push(surveyCampaignRequestValue);
		});
		setCampaignSurveyRequest([
			...campaignSurveyQuestionAnswerObj,
			...campaignSurveyRequest.filter((obj) => obj.surveyQuestionId !== _surveyQuestionId),
		]);
	};

	const onChangeTextAnswer = (_surveyAnswerName: string, _surveyQuestionId: number) => {
		let surveyCampaignRequestValue: AddCommunicationSurveyRequest = {
			communicationSurveyQuestionId: 0,
			caseCommunicationId: campaignSurveyCommunicationId,
			surveyTemplateId: campaignSurveyTemplateId,
			surveyQuestionId: _surveyQuestionId,
			surveyQuestionAnswersId: 0,
			surveyAnswer: _surveyAnswerName,
			createdBy: parseInt(campaignSurveyUserIdCreated),
			updatedBy: parseInt(campaignSurveyUserIdCreated),
		};

		setCampaignSurveyRequest([surveyCampaignRequestValue, ...campaignSurveyRequest.filter((obj) => obj.surveyQuestionId !== _surveyQuestionId)]);
	};

	const onChangeRadioAnswer = (_surveyAnswerName: string, _surveyAnswerId: number, _surveyQuestionId: number) => {
		let surveyCampaignRequestValue: AddCommunicationSurveyRequest = {
			communicationSurveyQuestionId: 0,
			caseCommunicationId: campaignSurveyCommunicationId,
			surveyTemplateId: campaignSurveyTemplateId,
			surveyQuestionId: _surveyQuestionId,
			surveyQuestionAnswersId: _surveyAnswerId,
			surveyAnswer: _surveyAnswerName,
			createdBy: parseInt(campaignSurveyUserIdCreated),
			updatedBy: parseInt(campaignSurveyUserIdCreated),
		};

		setCampaignSurveyRequest([surveyCampaignRequestValue, ...campaignSurveyRequest.filter((obj) => obj.surveyQuestionId !== _surveyQuestionId)]);
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={campaignSurveyTemplateTitle} />
			<div style={{marginLeft: 40, marginBottom: 40}}>
				{campaignSurveyQuestion.map((campaignSurveyQuestionObj) => {
					return (
						<Col key={campaignSurveyQuestionObj.surveyQuestionId}>
							{(() => {
								switch (campaignSurveyQuestionObj.fieldTypeName) {
									case 'Dropdown':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}} key={campaignSurveyQuestionObj.surveyQuestionId}>
												<Col sm={6} key={campaignSurveyQuestionObj.surveyQuestionId}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}
													<Select
														native
														id={'dropdown-question'}
														size='small'
														isSearchable={false}
														style={{width: '100%'}}
														options={campaignSurveyOptions(campaignSurveyQuestionObj.surveyQuestionId)}
														onChange={(e: any) => onChangeCampaignSurveySelectAnswer(e, campaignSurveyQuestionObj.surveyQuestionId)}
														value={campaignAnswerOptionSelectedListValue(campaignSurveyQuestionObj.surveyQuestionId)}
														isDisabled={isCampaignCaseCommSurveyReadOnly}
													/>
												</Col>
											</Row>
										);
									case 'Dropdown With Search':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}} key={campaignSurveyQuestionObj.surveyQuestionId}>
												<Col sm={6} key={campaignSurveyQuestionObj.surveyQuestionId}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}
													<Select
														isMulti={false}
														isSearchable={true}
														size='small'
														style={{width: '100%'}}
														id={'dropdown-with-search-question'}
														options={campaignSurveyOptions(campaignSurveyQuestionObj.surveyQuestionId)}
														onChange={(e: any) => onChangeCampaignSurveySelectAnswer(e, campaignSurveyQuestionObj.surveyQuestionId)}
														value={campaignAnswerOptionSelectedListValue(campaignSurveyQuestionObj.surveyQuestionId)}
														isDisabled={isCampaignCaseCommSurveyReadOnly}
													/>
												</Col>
											</Row>
										);
									case 'Dropdown Multi Select':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}} key={campaignSurveyQuestionObj.surveyQuestionId}>
												<Col sm={6} key={campaignSurveyQuestionObj.surveyQuestionId}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}
													<Select
														id={'dropdown-multi-select-question'}
														isMulti={true}
														isSearchable={false}
														size='small'
														style={{width: '100%'}}
														options={campaignSurveyOptions(campaignSurveyQuestionObj.surveyQuestionId)}
														onChange={(e: any) => onChangeSelectMultipleAnswer(e, campaignSurveyQuestionObj.surveyQuestionId)}
														value={campaignAnswerOptionSelectedListValue(campaignSurveyQuestionObj.surveyQuestionId)}
														isDisabled={isCampaignCaseCommSurveyReadOnly}
													/>
												</Col>
											</Row>
										);
									case 'Dropdown Multi Select With Search':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}} key={campaignSurveyQuestionObj.surveyQuestionId}>
												<Col sm={6} key={campaignSurveyQuestionObj.surveyQuestionId}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}
													<Select
														size='small'
														style={{width: '100%'}}
														id={'dropdown-multi-select-with-search-question'}
														isMulti={true}
														isSearchable={true}
														options={campaignSurveyOptions(campaignSurveyQuestionObj.surveyQuestionId)}
														onChange={(e: any) => onChangeSelectMultipleAnswer(e, campaignSurveyQuestionObj.surveyQuestionId)}
														value={campaignAnswerOptionSelectedListValue(campaignSurveyQuestionObj.surveyQuestionId)}
														isDisabled={isCampaignCaseCommSurveyReadOnly}
													/>
												</Col>
											</Row>
										);
									case 'Radio Button':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}}>
												<Col sm={6}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}

													{campaignSurveyOptions(campaignSurveyQuestionObj.surveyQuestionId).map((r) => {
														return (
															<div key={r.label.toString() + '-question'} style={{flexDirection: 'row'}}>
																<input
																	type='radio'
																	id={r.label.toString() + '-question'}
																	checked={campaignSurveyRadionValue(r.value.toString(), campaignSurveyQuestionObj.surveyQuestionId)}
																	value={r.value}
																	onChange={(e) => onChangeRadioAnswer(r.label, parseInt(e.target.value), campaignSurveyQuestionObj.surveyQuestionId)}
																	name={r.value}
																	style={{margin: 10}}
																	disabled={isCampaignCaseCommSurveyReadOnly}
																/>
																<BasicFieldLabel title={r.label} />
															</div>
														);
													})}
												</Col>
											</Row>
										);
									case 'Text Input':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}}>
												<Col sm={6}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}
													<input
														type='text'
														className='form-control form-control-sm'
														aria-label={campaignSurveyQuestionObj.surveyQuestionName}
														onChange={(e) => onChangeTextAnswer(e.target.value, campaignSurveyQuestionObj.surveyQuestionId)}
														value={campaignSurveyTextValue(campaignSurveyQuestionObj.surveyQuestionId)}
														disabled={isCampaignCaseCommSurveyReadOnly}
													/>
												</Col>
											</Row>
										);
									case 'Multiline Text Input':
										return (
											<Row style={{marginTop: 20, marginBottom: 20}}>
												<Col sm={6}>
													{campaignSurveyLabel(campaignSurveyQuestionObj.isMandatory, campaignSurveyQuestionObj.surveyQuestionName)}
													<textarea
														className='form-control form-control-sm'
														value={campaignSurveyTextValue(campaignSurveyQuestionObj.surveyQuestionId)}
														onChange={(e) => onChangeTextAnswer(e.target.value, campaignSurveyQuestionObj.surveyQuestionId)}
														disabled={isCampaignCaseCommSurveyReadOnly}
													/>
												</Col>
											</Row>
										);
									default:
										return null;
								}
							})()}
						</Col>
					);
				})}
			</div>
		</MainContainer>
	);
};

export {CampaignCaseCommSurvey};
