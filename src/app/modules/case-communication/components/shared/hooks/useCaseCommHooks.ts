import {htmlEncode} from 'js-htmlencode';
import {compressToBase64} from 'lz-string';
import moment from 'moment';
import {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import useConstant from '../../../../../constants/useConstant';
import {IAuthState} from '../../../../auth';
import {
	CloudTalkCdrResponseModel,
	CloudTalkGetCallRequestModel,
	FlyFoneCallDetailRecordRequestModel,
	FlyFoneOutboundCallRequestModel,
} from '../../../../case-management/models';
import {
	cloudTalkGetCall,
	cloudTalkMakeACall,
	flyFoneEndOutboundCall,
	flyFoneOutboundCall,
	samespaceMakeACall,
	samespaceGetCall,
	uploadFile,
} from '../../../../case-management/services/CustomerCaseApi';
import {
	CloudTalkMakeACallRequestModel,
	FormattedFlyFoneCdrUdt,
	SurveyQuestionAnswerResponse,
	SurveyQuestionResponse,
	SamespaceMakeACallRequestModel,
} from '../../../models';
import {GetCommunicationSurveyQuestionAnswers} from '../../../services/CaseCommunicationApi';
import {SamespaceGetCallRequestModel} from '../../../../case-management/models/request/SamespaceGetCallRequestModel';
import {SamespaceGetCallResponseModel} from '../../../../case-management/models/response/SamespaceGetCallResponseModel';
import {HttpStatusCodeEnum} from '../../../../../constants/Constants';

const useCaseCommHooks = () => {
	/**
	 * ? Constatants
	 */
	const {successResponse, message} = useConstant();

	/**
	 *  ? Redux
	 */
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 * ? States
	 */
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionResponse[]>([]);
	const [surveyQuestionAnswer, setSurveyQuestionAnswer] = useState<SurveyQuestionAnswerResponse[]>([]);
	const [surveyTemplateTitle, setSurveyTemplateTitle] = useState<string>('');
	const [surveyLoading, setSurveyLoading] = useState<boolean>(false);
	const [callingCode, setCallingCode] = useState<string>('0');
	const [isCalling, setIsCalling] = useState<boolean>(false);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [flyfoneCdrData, setFlyfoneCdrData] = useState<FormattedFlyFoneCdrUdt>();
	const [cloudTalkCdr, setCloudTalkCdr] = useState<CloudTalkCdrResponseModel>();
	const [samespaceCdrData, setSamespaceCdrData] = useState<SamespaceGetCallResponseModel>();

	const getSurveyTemplate = (_campaignId: number) => {
		setSurveyLoading(true);
		GetCommunicationSurveyQuestionAnswers(_campaignId)
			.then((response) => {
				if (response.status === successResponse) {
					setSurveyQuestion(response.data.surveyQuestions);
					setSurveyQuestionAnswer(response.data.surveyQuestionAnswers);
					setSurveyTemplateTitle(response.data.surveyTemplate.surveyTemplateName);
					setSurveyLoading(false);
				} else {
					setSurveyLoading(false);
				}
			})
			.catch((err) => {
				setSurveyLoading(false);
				swal('Failed', message.customerCase.communicationSurveyError, 'error');
			});
	};

	const campaignCallPlayer = (_request: FlyFoneOutboundCallRequestModel) => {
		setIsCalling(true);
		flyFoneOutboundCall(_request)
			.then((response) => {
				if (response.data.resultCode === 1) {
					setCallingCode(response.data.dialId);
				} else {
					setCallingCode(response.data.dialId);
					swal('Failed', response.data.resultDesc, 'error').catch(() => {});
					setIsCalling(false);
				}
			})
			.catch(() => {
				swal('Failed', message.customerCase.flyfoneConnectionError, 'error').catch(() => {});
				setIsCalling(false);
			});
	};

	const getFlyfoneCdrData = (_callingCode: string) => {
		setIsFetching(true);
		let request: FlyFoneCallDetailRecordRequestModel = {
			callingCode: _callingCode,
			userId: userId?.toString() ?? '0',
			endTime: moment().format('DD-MM-YYYY hh:mm:ss'),
		};

		flyFoneEndOutboundCall(request)
			.then((response) => {
				if (response.status === successResponse) {
					setFlyfoneCdrData(response.data);
					setIsFetching(false);
				}
				setIsFetching(false);
			})
			.catch(() => {
				swal('Failed', message.customerCase.flyfoneConnectionError, 'error').catch(() => {});
				setIsFetching(false);
			});
	};

	const cloudTalkCall = (_request: CloudTalkMakeACallRequestModel) => {
		setIsCalling(true);
		cloudTalkMakeACall(_request)
			.then((response) => {
				if (response.data.status === successResponse) {
					setCallingCode(response.data.dialId);
				} else {
					setCallingCode(response.data.dialId);
					swal('Failed', response.data.message, 'error').catch(() => {});
					setIsCalling(false);
				}
			})
			.catch(() => {
				swal('Failed', message.customerCase.caseCommCloudTalkError, 'error').catch(() => {});
				setIsCalling(false);
			});
	};

	const convertCommunicationContentToPostRequest = async (_contendRequest: string) => {
		const convertContentToHtmlEncoded = htmlEncode(_contendRequest);
		const convertHtmlContentToBase64 = compressToBase64(convertContentToHtmlEncoded);
		return convertHtmlContentToBase64;
	};

	const getCloudTalkCall = async (_request: CloudTalkGetCallRequestModel) => {
		setIsFetching(true);
		cloudTalkGetCall(_request)
			.then((response) => {
				if (response.status === successResponse) {
					setIsFetching(false);
					setCloudTalkCdr(response.data);
				}
				setIsFetching(false);
			})
			.catch(() => {
				swal('Failed', message.customerCase.caseCommCloudTalkError, 'error');
				setIsFetching(false);
			});
	};

	const samespaceCall = (_request: SamespaceMakeACallRequestModel) => {
		setIsCalling(true);
		samespaceMakeACall(_request)
			.then((response) => {
				if (response.data.success) {
					setCallingCode(response.data.callId);
				} else {
					setCallingCode(response.data.callId);
					swal('Failed', response.data.message, 'error').catch(() => {});
					setIsCalling(false);
				}
			})
			.catch(() => {
				swal('Failed', message.customerCase.samespaceConnectionError, 'error').catch(() => {});
				setIsCalling(false);
			});
	};

	const getSamespaceCall = async (_request: SamespaceGetCallRequestModel) => {
		setIsFetching(true);
		samespaceGetCall(_request)
			.then((response) => {
				if (response.status === successResponse) {
					setIsFetching(false);
					setSamespaceCdrData(response.data);
				} else if (response.status === HttpStatusCodeEnum.NoContent && !response.data) {
					const emptyData: SamespaceGetCallResponseModel = {recordingURL: '', startTime: '', endTime: '', status: ''};
					setSamespaceCdrData(emptyData);
				}
				setIsFetching(false);
			})
			.catch(() => {
				swal('Failed', message.customerCase.samespaceConnectionError, 'error');
				setIsFetching(false);
			});
	};

	const UploadCaseCommContentImageToMlabStorage = async (blobInfo: any) => {
		let _uploadedImage: string = '';
		const formDataCaseComm = new FormData();
		formDataCaseComm.append('file', blobInfo, blobInfo.name);

		await uploadFile(formDataCaseComm)
			.then((response) => {
				const jsonCaseComm = response.data;

				if (response.status === HttpStatusCodeEnum.Ok) {
					_uploadedImage = jsonCaseComm.location;
				} else {
					console.log('Failed to upload. ' + blobInfo, {remove: true});
				}
			})
			.catch((error) => {
				console.log(error, {remove: true});
			});
		return _uploadedImage;
	};

	return {
		getSurveyTemplate,
		surveyQuestion,
		surveyQuestionAnswer,
		surveyTemplateTitle,
		surveyLoading,
		campaignCallPlayer,
		callingCode,
		isCalling,
		setIsCalling,
		getFlyfoneCdrData,
		isFetching,
		flyfoneCdrData,
		convertCommunicationContentToPostRequest,
		cloudTalkCall,
		getCloudTalkCall,
		cloudTalkCdr,
		samespaceCall,
		getSamespaceCall,
		samespaceCdrData,
		UploadCaseCommContentImageToMlabStorage,
	};
};

export default useCaseCommHooks;
