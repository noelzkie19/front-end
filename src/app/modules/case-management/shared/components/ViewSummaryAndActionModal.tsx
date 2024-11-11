import {FormContainer, FormModal, MlabButton} from '../../../../custom-components';
import {Col, Container, ModalFooter, Row} from 'react-bootstrap-v5';
import {ElementStyle, HttpStatusCodeEnum} from '../../../../constants/Constants';
import {useEffect, useState} from 'react';
import swal from 'sweetalert';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {ChatSurveyActionAndSummaryGetByIdRequestModel, GetChatSurveyByIdResultResponse} from '../../models';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {IAuthState} from '../../../auth';
import {GetChatSurveyByIdAsync, GetChatSurveyByIdResultAsync} from '../../services/CustomerCaseApi';
import useConstant from '../../../../constants/useConstant';

interface Props {
	chatSurveyId: number;
	showForm: boolean;
	closeModal: () => void;
	communicationId: number;
}
const ViewSummaryAndActionModal: React.FC<Props> = ({chatSurveyId, showForm, closeModal, communicationId}) => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? States
	 */
	const [loading, setLoading] = useState<boolean>(false);
	const [summaryAndAction, setSummaryAndAction] = useState<GetChatSurveyByIdResultResponse>({
		Action: '',
		ChatSurveyId: 0,
		CreatedBy: '',
		Summary: '',
		UpdatedBy: '',
	});
	const {HubConnected} = useConstant();

	/**
	 *  ? Methods
	 */
	const onCloseModal = () => {
		closeModal();
	};
	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		if (showForm) {
			setLoading(true);
			clearFields();
			const request: ChatSurveyActionAndSummaryGetByIdRequestModel = {
				queueId: Guid.create().toString(),
				userId: userId?.toString() || '0',
				chatSurveyId: chatSurveyId,
			};

			setTimeout(() => {
				const messagingHub = hubConnection.createHubConnenction();
				messagingHub.start().then(() => {
					if (messagingHub.state === HubConnected) {
						GetChatSurveyByIdAsync(request)
							.then((response) => {
								if (response.status === HttpStatusCodeEnum.Ok) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetChatSurveyByIdResultAsync(message.cacheId)
											.then((data) => {
												let resultData = Object.assign({} as GetChatSurveyByIdResultResponse, data.data[0]);
												setSummaryAndAction(resultData);
												messagingHub.off(request.queueId.toString());
												messagingHub.stop();
												setLoading(false);
											})
											.catch(() => {
												setLoading(false);
											});
									});
									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
								}
							})
							.catch(() => {
								swal('Failed', 'Problem in getting GetChatSurveyByIdAsync', 'error');
							});
					}
				});
			}, 1000);
		}
	}, [showForm]);
	const clearFields = () => {
		setSummaryAndAction({
			Action: '',
			ChatSurveyId: 0,
			CreatedBy: '',
			Summary: '',
			UpdatedBy: '',
		});
	};
	return (
		<FormModal headerTitle='View Summary and Action' haveFooter={false} show={showForm}>
			<FormContainer onSubmit={() => {}}>
				<Container>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm'>Communication ID: {communicationId}</label>
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Summary</label>
							<input disabled type='text' className='form-control form-control-sm' aria-label='Summary' value={summaryAndAction.Summary} />
						</Col>
					</Row>
					<Row style={{marginTop: 20}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Action</label>
							<input disabled type='text' className='form-control form-control-sm' aria-label='Action' value={summaryAndAction.Action} />
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={6}>
							<label className='form-label-sm'>Created By: {summaryAndAction.CreatedBy}</label>
						</Col>
						<Col sm={6}>
							<label className='form-label-sm'>Updated By: {summaryAndAction.UpdatedBy}</label>
						</Col>
					</Row>
				</Container>
				<ModalFooter style={{border: 0}}>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Close'}
						additionalClassStyle={{marginRight: 0}}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={loading}
						loadingTitle={'Please wait...'}
						disabled={loading}
						onClick={() => {
							onCloseModal();
						}}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};
export default ViewSummaryAndActionModal;
