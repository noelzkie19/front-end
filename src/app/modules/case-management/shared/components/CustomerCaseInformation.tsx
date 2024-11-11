import React, {useCallback, useEffect} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import Select from 'react-select';
import {BasicTextInput, MainContainer, RequiredLabel} from '../../../../custom-components';
import {LanguageResponseModel} from '../../../system/models/LanguageResponseModel';
import {SubtopicLanguageOptionModelResponse, TopicLanguageOptionModelResponse} from '../../models';
import useCaseManagementConstant from '../../useCaseManagementConstant';

interface Props {
	pageAction: string;
	subject: string;
	setSubject: (e: string) => void;
	topic: any;
	setTopic: (e: any) => void;
	subtopic: any;
	setSubtopic: (e: any) => void;
	language: any;
	setLanguage: (e: any) => void;
	currencyCode: string;
	getLanguage: () => void;
	languageOptions: Array<LanguageResponseModel>;
	getTopicNameByCode: (languageCode: string, currencyCode: string) => Promise<void>;
	topicLanguage: Array<TopicLanguageOptionModelResponse>;
	getSubtopicLanguageNameById: (topicId: number, currencyCode: string, languageId: number) => Promise<void>;
	subtopicLanguage: Array<SubtopicLanguageOptionModelResponse>;
}

const CustomerCaseInformation: React.FC<Props> = (Props) => {
	/**
	 *  ? Hooks
	 */
	const {
		pageAction,
		subject,
		setSubject,
		topic,
		setTopic,
		subtopic,
		setSubtopic,
		language,
		setLanguage,
		currencyCode,
		getLanguage,
		getTopicNameByCode,
		getSubtopicLanguageNameById,
		languageOptions,
		topicLanguage,
		subtopicLanguage,
	} = Props;

	const {pageActions} = useCaseManagementConstant();

	useEffect(() => {
		getLanguage();
	}, []);

	/**
	 *  ? Events
	 */
	const onChangLanguage = useCallback(
		(event: any) => {
			setLanguage(event);
			setTopic([]);
			setSubtopic([]);
			let {label} = event;
			getTopicNameByCode(label, currencyCode);
		},
		[language]
	);

	const onChangTopic = useCallback(
		(event: any) => {
			setTopic(event);
			setSubtopic([]);
			let {value} = event;
			getSubtopicLanguageNameById(parseInt(value), currencyCode, language.value);
		},
		[topic]
	);

	const onChangSubTopic = useCallback(
		(event: any) => {
			setSubtopic(event);
		},
		[subtopic]
	);

	const checkCustomerServicePage = () => {
		let isDisabled: boolean = true;

		if (pageAction === pageActions.createCase.toString()) isDisabled = false;
		if (pageAction === pageActions.editCase.toString()) isDisabled = false;

		return isDisabled;
	};

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Row>
					<Col sm='12'>
						<h5 className='fw-bolder m-0'>{'Case Information'}</h5>
					</Col>
				</Row>
				<Row>
					<Col>
						<RequiredLabel title={'Subject'} />
						<BasicTextInput
							ariaLabel={'currency'}
							colWidth={'col-sm-8'}
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							disabled={checkCustomerServicePage()}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<RequiredLabel title={'Language'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={languageOptions.flatMap((obj: any) => [
								{
									label: obj.languageCode,
									value: obj.id,
								},
							])}
							onChange={onChangLanguage}
							value={language}
							isDisabled={checkCustomerServicePage()}
						/>
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'Topic'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={topicLanguage.flatMap((obj) => [
								{
									label: obj.topicLanguageTranslation,
									value: obj.topicLanguageId,
								},
							])}
							onChange={onChangTopic}
							value={topic}
							isDisabled={checkCustomerServicePage()}
						/>
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'Subtopic'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={subtopicLanguage.flatMap((obj) => [
								{
									label: obj.subtopicLanguageTranslation,
									value: obj.subtopicLanguageId,
								},
							])}
							onChange={onChangSubTopic}
							value={subtopic}
							isDisabled={checkCustomerServicePage()}
						/>
					</Col>
				</Row>
			</div>
		</MainContainer>
	);
};

export default CustomerCaseInformation;
