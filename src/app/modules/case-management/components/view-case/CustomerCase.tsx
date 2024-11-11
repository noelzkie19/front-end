import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {CaseStatusEnum, ElementStyle, HttpStatusCodeEnum, MessageTypeEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {ContentContainer, MainContainer, MlabButton} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {COMMUNICATION_REVIEW_VIEW_DEFAULT} from '../../constants/CommunicationReviewDefault';
import '../../css/CaseManagement.css';
import {ChangeCaseStatusRequestModel} from '../../models';
import {CustomerCaseModel} from '../../models/CustomerCaseModel';
import {CommunicationReviewViewModel} from '../../models/viewModels/CommunicationReviewViewModel';
import {GetCustomerCaseAsync, changeCustomerServiceCaseCommStatus, changeCustomerServiceCaseCommStatusResult} from '../../services/CustomerCaseApi';
import CustomerCaseCommunicationSec from './CustomerCaseCommunicationSec';
import CustomerCaseInformationSec from './CustomerCaseInformationSec';
export const CustomerCase: React.FC = () => {
	const {
		caseStatus,
		HubConnected,
		successResponse,
		SwalConfirmMessage,
		SwalSuccessMessage,
		message,
		noContentResponse,
		notFoundResponse,
		SwalFailedMessage,
	} = useConstant();

	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const [customerCase, setCustomerCase] = useState<CustomerCaseModel>();

	const [errorMessageTitle, setErrorMessageTitle] = useState<string>('');
	const [errorMessageSubTitle, setErrorMessageSubTitle] = useState<string>('');

	const [loading, setLoading] = useState(false);
	const [communicationId, setCommunicationId] = useState('');
	const [caseCommSectionIsValid, setCaseCommSectionIsValid] = useState<boolean>();

	const communicationReviewRef = useRef<CommunicationReviewViewModel>(COMMUNICATION_REVIEW_VIEW_DEFAULT);
	const [isWithCurrentReview, setIsWithCurrentReview] = useState<boolean>(false);
	/**
	 *  ? Hooks
	 */
	const {caseId}: {caseId: number} = useParams();
	const history = useHistory();

	//Leave site modal
	window.onbeforeunload = confirmExit;
	function confirmExit() {
		if (isWithCurrentReview) return true;
		else return;
	}

	//Navigate away
	useEffect(() => {
		if (history) {
			history.block((prompt: any) => {
				if (isWithCurrentReview) {
					alertNavigateAway(prompt.pathname);
					return false;
				}
			});
		} else {
			history.block(() => {});
		}
		return () => {
			history.block(() => {});
		};
	}, [history, isWithCurrentReview]);

	const alertNavigateAway = (promptNamePath: any) => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard the in-progress communication review. Please confirm.',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				history.block(() => {});
				history.push(promptNamePath);
			}
		});
	};

	// Mounted
	useEffect(() => {
		//BEFORE LOADING, CHECK IF USER IS AUTHORIZED TO VIEW CASES
		if (!userAccess?.includes(USER_CLAIMS.ViewCustomerCaseRead) && !userAccess.includes(USER_CLAIMS.ViewCustomerCaseWrite)) {
			history.push('/error/401'); // FIX FOR MLAB-4638
		}

		if (userAccess.includes(USER_CLAIMS.ViewCustomerCaseRead) || userAccess.includes(USER_CLAIMS.ReopenCaseRead)) {
			if (caseId !== 0) {
				getCustomerCaseAsync(caseId);
				if (window.location.hash !== undefined) setCommunicationId(window.location.hash.replace('#', ''));
			} else {
				CaseNotExists();
			}
		} else {
			history.push('/error/401');
		}
	}, [caseId]);

	async function getCustomerCaseAsync(customerCaseId: number) {
		GetCustomerCaseAsync(customerCaseId, userAccessId)
			.then((response) => {
				if (response.status === successResponse) {
					let customerCase: CustomerCaseModel = response.data;
					if (customerCase) {
						setCustomerCase(customerCase);
						return;
					} else {
						history.push('/error/401');
					}
				} else if (response.status === noContentResponse) {
					history.push('/error/401');
				} else if (response.status === notFoundResponse) {
					CaseNotExists();
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Customer Case: ' + ex);
				swal('Failed', 'Problem in getting customer case', 'error');
			});
	}

	// Methods
	async function CaseNotExists() {
		setCustomerCase(undefined);
		setErrorMessageTitle('Case Not Exists');
		setErrorMessageSubTitle('The case record you looked does not exists!');
	}
	//  Edit
	const editCase = useCallback(() => {
		history.push(`/case-management/edit-case/${caseId}`);
	}, []);

	//  Add Communication
	const addCommunication = useCallback(() => {
		history.push(`/case-management/add-communication/${caseId}`);
	}, []);

	function reopenCase() {
		swal({
			title: SwalConfirmMessage.title,
			text: 'This action will change the case status to Open. Please confirm',
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				confirmReOpenCase();
			}
		});
	}

	function confirmReOpenCase() {
		setLoading(true);
		setTimeout(() => {
			const connectMessagingHub = hubConnection.createHubConnenction();
			connectMessagingHub.start().then(() => {
				if (connectMessagingHub.state !== HubConnected) return;
				const request = reOpenCustomerServiceRequest();
				changeCustomerServiceCaseCommStatus(request).then((response) => {
					if (response.status !== HttpStatusCodeEnum.Ok) {
						connectMessagingHub.stop();
						return;
					}
					changeCustomerServiceCaseCommStatusCallback(connectMessagingHub, request);
					setTimeout(() => {
						if (connectMessagingHub.state === HubConnected) {
							connectMessagingHub.stop();
						}
					}, 10000);
				});
			});
		}, 1000);
	}

	const reOpenCustomerServiceRequest = () => {
		return {
			caseInformationIds: caseId.toString(),
			caseStatusId: CaseStatusEnum.Open,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};
	};

	function changeCustomerServiceCaseCommStatusCallback(
		messagingHub: any,
		request: {caseInformationIds: string; caseStatusId: CaseStatusEnum; userId: string; queueId: string}
	) {
		messagingHub.on(request.queueId.toString(), (message: any) => {
			getChangeCustomerServiceCaseCommStatusResult(messagingHub, message, request);
		});
	}

	const confirmCloseCase = (_caseStatus: number) => {
		if (validateAllMandatoryFields()) {
			swal({
				title: SwalConfirmMessage.title,
				text: _caseStatus === caseStatus.Open ? message.genericSaveConfirmation : message.caseCloseOnly,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willSave) => {
				if (willSave) {
					submitCloseCase();
				}
			});
		} else {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}
	};

	const submitCloseCase = () => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION OF MESSAGING HUB //
					if (messagingHub.state !== HubConnected) return;
					const request = getCloseCaseRequest();
					changeCustomerServiceCaseCommStatus(request)
						.then((response) => {
							if (response.status !== successResponse) {
								messagingHub.stop();
								return;
							}
							changeCaseCloseStatusCallback(messagingHub, request);
							setTimeout(() => {
								if (messagingHub.state === HubConnected) {
									messagingHub.stop();
								}
							}, 30000);
						})
						.catch(() => {
							messagingHub.stop();
							swal('Failed', 'Problem in Connection on Gateway', 'error');
						});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const getCloseCaseRequest = () => {
		const request: ChangeCaseStatusRequestModel = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			caseInformationIds: caseId,
			caseStatusId: caseStatus.Closed,
		};

		return request;
	};

	const changeCaseCloseStatusCallback = (messagingHub: any, requestCaseClose: ChangeCaseStatusRequestModel) => {
		messagingHub.on(requestCaseClose.queueId.toString(), (message: any) => {
			getChangeCustomerServiceCaseCommStatusResult(messagingHub, message, requestCaseClose);
		});
	};

	const getChangeCustomerServiceCaseCommStatusResult = (messagingHub: any, message: any, request: any) => {
		changeCustomerServiceCaseCommStatusResult(message.cacheId)
			.then((data) => {
				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
				setLoading(false);
				swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
				history.push(`/case-management/service-case/${caseId}#${communicationId}`);
				getCustomerCaseAsync(caseId);
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const validateCaseInfoData = (caseInfo: any) => {
		const isAllValid =
			validateString(caseInfo.messageType) &&
			validateString(caseInfo.communicationOwnerName) &&
			validateString(caseInfo.messageStatus) &&
			validateWhenMessageResponse(caseInfo) &&
			validateString(caseInfo.startCommunicationDate) &&
			validateString(caseInfo.endCommunicationDate) &&
			validateString(caseInfo.communicationContent);
		setCaseCommSectionIsValid(isAllValid);
	};

	const validateWhenMessageResponse = (caseInfo: any) => {
		if (caseInfo.messageTypeId === MessageTypeEnum.FlyFoneCall.toString()) {
			return validateString(caseInfo.messageResponse);
		} else {
			return true;
		}
	};

	const validateString = (text: any) => {
		return [0, null, undefined, ''].indexOf(text) === -1;
	};

	const validateAllMandatoryFields = () => {
		const isAllValid =
			caseCommSectionIsValid &&
			validateString(customerCase?.brand) &&
			validateString(customerCase?.caseType) &&
			validateString(customerCase?.username) &&
			validateString(customerCase?.subject) &&
			validateString(customerCase?.languageCode) &&
			validateString(customerCase?.topic) &&
			validateString(customerCase?.subtopic);

		return isAllValid;
	};

	return (
		<MainContainer>
			{customerCase !== undefined ? (
				<ContentContainer>
					<label className='col-4 pb-2 control-label fs-4'>
						<h5 style={{display: 'inline-block'}}>Case ID: &nbsp;</h5>
						{customerCase.caseInformationId}
					</label>
					<CustomerCaseInformationSec caseDetails={customerCase} />
					<CustomerCaseCommunicationSec
						communicationId={communicationId}
						customerCaseId={customerCase.caseInformationId}
						validateCaseInfoData={validateCaseInfoData}
						communicationReviewRef={communicationReviewRef}
						stateChange={setIsWithCurrentReview}
					/>
					{customerCase?.caseStatus === 'Closed' ? (
						<MlabButton
							access={userAccess?.includes(USER_CLAIMS.ReopenCaseWrite)}
							size={'sm'}
							label={'Reopen Case'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={loading}
							disabled={loading}
							loadingTitle={'Please wait...'}
							onClick={reopenCase}
						/>
					) : (
						<MlabButton
							access={userAccess?.includes(USER_CLAIMS.EditCustomerCaseWrite)}
							size={'sm'}
							label={'Close Case'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={loading}
							disabled={loading}
							loadingTitle={' Please wait...'}
							onClick={() => confirmCloseCase(caseStatus.Closed)}
						/>
					)}

					<MlabButton
						access={true}
						size={'sm'}
						label={'Edit Case'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={loading}
						disabled={!userAccess?.includes(USER_CLAIMS.EditCustomerCaseWrite) || customerCase?.caseStatus === 'Closed' || loading}
						loadingTitle={' Please wait...'}
						onClick={editCase}
					/>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Add Communication'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={loading}
						disabled={!userAccess?.includes(USER_CLAIMS.AddCaseCommunicationWrite) || customerCase?.caseStatus === 'Closed' || loading}
						loadingTitle={' Please wait...'}
						onClick={addCommunication}
					/>
				</ContentContainer>
			) : (
				<ContentContainer>
					<div className='text-center m-20'>
						<h1 className='fw-bolder fs-2x text-gray-700'>{errorMessageTitle}</h1>
						<div className='fw-bold fs-3 text-gray-400'>{errorMessageSubTitle}</div>
					</div>
				</ContentContainer>
			)}
		</MainContainer>
	);
};

export default CustomerCase;
