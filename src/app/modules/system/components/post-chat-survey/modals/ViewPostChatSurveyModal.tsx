import {Container, Row, Col, ModalFooter} from 'react-bootstrap-v5';

import {useEffect, useState} from 'react';
import {LookupModel, MasterReferenceOptionModel} from '../../../../../common/model';
import {PostChatSurveyResponseModel} from '../../../models';
import {useBrands, useMasterReferenceOption, useMessageTypeOptions} from '../../../../../custom-functions';
import {HttpStatusCodeEnum, StatusTypeEnum} from '../../../../../constants/Constants';
import { DefaultSecondaryButton, FormModal} from '../../../../../custom-components';
import {PostChatSurveyIdRequestModel} from '../../../models/requests/PostChatSurveyIdRequestModel';
import moment from 'moment';
import {getPostChatSurveyById} from '../../../redux/SystemService';
import {useSystemOptionHooks} from '../../../shared';

interface Props {
	postChatSurveyId: number;
	showForm: boolean;
	closeModal: () => void;
}

const ViewPostChatSurvey: React.FC<Props> = ({postChatSurveyId, showForm, closeModal}) => {
	const brandOptions = useBrands();
	const messageTypeOptions = useMessageTypeOptions();
	const {getPostChatSurveyOptions, postChatSurveyOptions} = useSystemOptionHooks();
	const [postChatSurveyRecord, setPostChatSurveyRecord] = useState<PostChatSurveyResponseModel>({
		postChatSurveyId: 0,
		messageType: '',
		brand: '',
		brandId: 0,
		license: '',
		questionId: '',
		questionMessage: '',
		answerFormat: '',
		questionMessageEN: '',
		skillName: '',
		updatedDate: moment().format('YYYY-M-D'),
		messageTypeId: 0,
		freeText: true,
		status: true,
		skillsList: [],
		surveyId: '',
		csatTypeId: 0,
	});

	const [selectedCSATTypeIdOption, setSelectedCSATTypeIdOption] = useState<any>(undefined);
	const CSATReferenceId = 266

	const csatOptions = useMasterReferenceOption(CSATReferenceId.toString())
	.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === CSATReferenceId)
	.map((x: MasterReferenceOptionModel) => x.options);

	
	// Side Effects
	useEffect(() => {
		getPostChatSurveyOptions();
	}, []);

	useEffect(() => {
		setPostChatSurveyRecord({
			postChatSurveyId: 0,
			messageType: '',
			brand: '',
			brandId: 0,
			license: '',
			questionId: '',
			questionMessage: '',
			answerFormat: '',
			questionMessageEN: '',
			skillName: '',
			updatedDate: moment().format('YYYY-M-D'),
			messageTypeId: 0,
			freeText: true,
			status: true,
			skillsList: [],
			surveyId: '',
		csatTypeId: 0,
		});
		if (showForm && postChatSurveyId > 0) {
			getPostChatSurveyRecord(postChatSurveyId);
		}
	}, [showForm]);

	// Methods
	const getPostChatSurveyRecord = (pcsId: number) => {
		const request: PostChatSurveyIdRequestModel = {
			postChatSurveyId: pcsId,
		};

		getPostChatSurveyById(request).then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				let resultData = response.data as PostChatSurveyResponseModel;
				
				let selectedBrandText = brandOptions.find((b) => b.value == resultData.brandId.toString());
				let selectedMessageTypeText = messageTypeOptions.find((b) => b.value == resultData.messageTypeId.toString());
				let skillsOption: Array<LookupModel> = [];
				
				resultData.skillsList?.forEach((item) => {
					let option = postChatSurveyOptions.skillsByLicense.find((c) => c.value == item.skillId)!;
					skillsOption.push(option);
				});
				const skillList = skillsOption.map((i) => i.label).join(', ');
			
				setSelectedCSATTypeIdOption(csatOptions.find(csat => csat.value === resultData.csatTypeId?.toString()))
				
				setPostChatSurveyRecord({
					...resultData,
					brand: selectedBrandText?.label ?? '',
					messageType: selectedMessageTypeText?.label ?? '',
					skillName: skillList,


				});
			}
		});
	};

	return (
		<FormModal headerTitle={'View PCS Question'} haveFooter={false} show={showForm}>
			<Container>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-brand' className='form-label-sm required'>Brand</label>
						<input
							id='view-pcs-brand'
							type='text'
							className='form-control form-control-sm'
							aria-label='License ID'
							value={postChatSurveyRecord.brand}
							multiple={true}
							disabled={true}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-message-type' className='form-label-sm required'>Message Type</label>
						<input
							id='view-pcs-message-type'
							type='text'
							className='form-control form-control-sm'
							aria-label='License ID'
							value={postChatSurveyRecord.messageType}
							multiple={true}
							disabled={true}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-license' className='form-label-sm required'>License</label>
						<input
							id='view-pcs-license'
							type='text'
							className='form-control form-control-sm'
							aria-label='License ID'
							value={postChatSurveyRecord.license}
							disabled={true}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-skill' className='form-label-sm required'>Skill</label>
						<input
							id='view-pcs-skill'
							type='text'
							className='form-control form-control-sm'
							aria-label='License ID'
							value={postChatSurveyRecord.skillName}
							multiple={true}
							disabled={true}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
					<label htmlFor='view-pcs-survey-id' className='form-label-sm required'>Survey ID</label>
					<input
							id='view-pcs-survey-id'
							type='text'
							className='form-control form-control-sm'
							aria-label='Survey ID'
							value={postChatSurveyRecord.surveyId}
							disabled={true}
						/>
					</Col>
				</Row>
				

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-question-id' className='form-label-sm required'>Question ID</label>
						<input
							id='view-pcs-question-id'
							type='text'
							className='form-control form-control-sm'
							aria-label='Question ID'
							value={postChatSurveyRecord.questionId}
							disabled={true}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-question-message' className='form-label-sm required'>Question Message</label>
						<textarea id='view-pcs-question-message' className='form-control form-control-sm' aria-label='Question' value={postChatSurveyRecord.questionMessage} disabled={true} />
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-question-message-en' className='form-label-sm required'>Question Message (EN)</label>
						<textarea
							id='view-pcs-question-message-en'
							className='form-control form-control-sm'
							aria-label='Question EN'
							value={postChatSurveyRecord.questionMessageEN}
							disabled={true}
						/>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-free-text' className='form-label-sm required'>Free Text</label>
						<input
							id='view-pcs-free-text'
							type='text'
							className='form-control form-control-sm'
							aria-label='License ID'
							value={postChatSurveyRecord.freeText ? 'True' : 'False'}
							multiple={true}
							disabled={true}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-csat-type' className='form-label-sm'>CSAT Type</label>
						<input
							id='view-pcs-csat-type'
							type='text'
							className='form-control form-control-sm'
							aria-label='Question ID'
							value={selectedCSATTypeIdOption ? selectedCSATTypeIdOption.label : ''}
							disabled={true}
						/>
					</Col>
				</Row>

				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label htmlFor='view-pcs-status' className='form-label-sm required'>Status</label>
						<input
							id='view-pcs-status'
							type='text'
							className='form-control form-control-sm'
							aria-label='License ID'
							value={postChatSurveyRecord.status ? StatusTypeEnum.Active : StatusTypeEnum.Inactive}
							multiple={true}
							disabled={true}
						/>
					</Col>
				</Row>
			</Container>
			<ModalFooter style={{border: 0}}>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default ViewPostChatSurvey;