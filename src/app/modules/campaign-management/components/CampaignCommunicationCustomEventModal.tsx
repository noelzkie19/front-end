import {useEffect, useState} from 'react';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../setup';
import {DefaultSecondaryButton, FormModal, MlabButton} from '../../../custom-components';
import {Col, Container, ModalFooter, Row} from 'react-bootstrap-v5';
import Select from 'react-select';
import swal from 'sweetalert';
import {Guid} from 'guid-typescript';
import {CustomEventTypeEnum, ElementStyle, HttpStatusCodeEnum} from '../../../constants/Constants';
import {useCurrencies} from '../../../custom-functions';
import {LookupModel} from '../../../common/model';
import {SelectFilter} from '../../relationship-management/shared/components';
import CommonLookups from '../../../custom-functions/CommonLookups';
import {CampaignModel} from '../models/request/CampaignModel';
import {CampaignCommunicationCustomEventRequestModel} from '../models/request/CampaignCommunicationCustomEventRequestModel';
import {CampaignCustomEventCountryRequestModel} from '../models/request/CampaignCustomEventCountryRequestModel';
import {CustomEventFilterModel, CustomEventModel} from '../../campaign-setting/setting-custom-event/models';
import {
	addCampaignCustomEventSettingList,
	addCampaignCustomEventSettingListResult,
	validatePlayerConfigurationRecord,
} from '../../campaign-setting/setting-custom-event/services/CampaignCustomEventSettingService';
import useConstant from '../../../constants/useConstant';
import { HubConnection } from '@microsoft/signalr';

interface Props {
	customEvent: CampaignCommunicationCustomEventRequestModel | null;
	onHide?: () => void;
	onSubmit?: (
		customEventName: string,
		customEvent: CampaignCommunicationCustomEventRequestModel,
		customEventCountries: Array<CampaignCustomEventCountryRequestModel>
	) => void;
	modal: boolean;
	title: string;
	customEventsOptions: Array<any>;
}

const CampaignCommunicationCustomEventModal = (props: Props) => {
	const currentUserId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign, shallowEqual) as CampaignModel;
	const currencyOptions = useCurrencies(currentUserId).filter((i) =>
		campaignState.campaignInformationCurrencyModel.map((j) => j.currencyId).includes(Number(i.value))
	);
	const countryOptions = CommonLookups('countries');
	const customEventTypeOptions: Array<LookupModel> = [
		{label: 'Create New', value: '1'},
		{label: 'Select Existing', value: '2'},
	];
	const {SwalCampaignMessage, message, SwalSuccessRecordMessage, HubConnected, SwalConfirmMessage} = useConstant();
	const [currentCampaignCommunicationCustomEventId, setCurrentCampaignCommunicationCustomEventId] = useState(0);
	const [currencyId, setCurrencyId] = useState<LookupModel>();
	const [countryIds, setCountryIds] = useState<Array<LookupModel>>([]);
	const [customEventType, setCustomEventType] = useState<LookupModel>();
	const [customEventId, setCustomEventId] = useState<LookupModel | undefined>(undefined);
	const [customEventName, setCustomEventName] = useState('');
	const [loading, setLoading] = useState(false);
	let currentCustomEventGuid = "";

	useEffect(() => {
		clearForm();
		if (props.modal) {
			if (props.customEvent?.campaignEventSettingId != null && props.customEvent.campaignEventSettingId > 0) {
				const campaignCommunicationCustomEventId = props.customEvent?.campaignCommunicationCustomEventId ?? 0;
				setCurrentCampaignCommunicationCustomEventId(campaignCommunicationCustomEventId);
				setCurrencyId(currencyOptions.find((i) => i.value === props.customEvent?.currencyId?.toString()));
				const selectedCountries = campaignState.campaignCustomEventCountryModel
					.filter((i) =>
						campaignCommunicationCustomEventId > 0
							? i.campaignCommunicationCustomEventId == campaignCommunicationCustomEventId
							: i.parentCustomEventGuid === props.customEvent?.customEventGuid
					)
					.map((i) => i.countryId);
				const selectedEventType = customEventTypeOptions.find((i) => i.value === CustomEventTypeEnum.SelectExisting);
				setCountryIds(countryOptions.filter((i) => selectedCountries.includes(Number(i.value))));
				setCustomEventId(props.customEventsOptions.find((i) => i.value === props.customEvent?.campaignEventSettingId));
				setCustomEventType(selectedEventType);
				setCustomEventName('');
				setLoading(false);
				currentCustomEventGuid = "";
			}
		}
	}, [props.modal]);

	const onChangeCustomEvent = (val: LookupModel) => {
		setCustomEventId(val);
	};

	const onChangeCountryIds = (val: Array<LookupModel>) => {
		setCountryIds(val);
	};

	const handleOnHide = () => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalCampaignMessage.textConfirmDiscardCampaignCustomEvent,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				props.onHide?.();
			}
		});
	};

	const clearForm = () => {
		setCurrencyId(undefined);
		setCountryIds([]);
		setCustomEventId(undefined);
		setCustomEventName('');
		setLoading(false);
	};

	const handleSubmit = () => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalCampaignMessage.textConfirmSaveCampaignCustomEvent,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				saveCampaignCommunicationCustomEvent();
			}
		});
		
	};

	const saveCampaignCommunicationCustomEvent = async () => {
		setLoading(true);
		const connectingGuid = props.customEvent?.campaignCommunicationCustomEventId != null ? props.customEvent.customEventGuid ?? '' : Guid.create().toString();
		currentCustomEventGuid = connectingGuid;

		const messageItems: CampaignCommunicationCustomEventRequestModel = {
			campaignCommunicationCustomEventId: currentCampaignCommunicationCustomEventId,
			campaignCommunicationSettingId: props.customEvent?.campaignCommunicationSettingId ?? 0,
			campaignEventSettingId: Number(customEventId?.value),
			currencyId: Number(currencyId?.value),
			customEventGuid: connectingGuid,
		};

		const countryItems: CampaignCustomEventCountryRequestModel[] = countryIds.map((i) => {
			const countryItem: CampaignCustomEventCountryRequestModel = {
				campaignCommunicationCustomEventId: currentCampaignCommunicationCustomEventId,
				campaignCustomEventCountryId:
					campaignState.campaignCustomEventCountryModel.find(
						(x) =>
							(currentCampaignCommunicationCustomEventId > 0
								? x.campaignCommunicationCustomEventId == currentCampaignCommunicationCustomEventId
								: x.parentCustomEventGuid === props.customEvent?.customEventGuid) && x.countryId === Number(i.value)
					)?.campaignCustomEventCountryId ?? 0,
				countryId: Number(i.value),
				parentCustomEventGuid: connectingGuid,
			};
			return countryItem;
		});

		if (await validateCustomEventRecord()) {
			if (customEventType?.value == CustomEventTypeEnum.CreateNew) {
				saveNewCustomEvent(messageItems, countryItems);
			} else {
				props.onSubmit?.(customEventName, messageItems, countryItems);
				setLoading(false);
			}
		} else {
			setLoading(false);
		}
	};

	const saveNewCustomEvent = (
		messageItems: CampaignCommunicationCustomEventRequestModel,
		countryItems: Array<CampaignCustomEventCountryRequestModel>
	) => {
		const request: CustomEventModel = {
			campaignEventSettingId: 0,
			customEventName: customEventName,
			createdBy: currentUserId.toString(),
			userId: currentUserId.toString(),
			queueId: Guid.create().toString(),
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						addCampaignCustomEventSettingList(request)
							.then((response) => {
								if (response.status === HttpStatusCodeEnum.Ok) {
									saveCustomEventCallback(messagingHub, request, messageItems, countryItems);
								} else {
									messagingHub.stop();
									setLoading(false);
								}
							})
							.catch(() => {
								setLoading(false);
							});
					}
				})
				.catch(() => {
					messagingHub.stop();
					setLoading(false);
				});
		}, 1000);
	};

	const saveCustomEventCallback = (messagingHub: HubConnection, request: any, messageItems: CampaignCommunicationCustomEventRequestModel,
		countryItems: Array<CampaignCustomEventCountryRequestModel>) => {
		messagingHub.on(request.queueId.toString(), (message) => {
			addCampaignCustomEventSettingListResult(message.cacheId).then((returnData) => {
				if (returnData.status !== HttpStatusCodeEnum.Ok) {
					swal(SwalCampaignMessage.titleFailed, SwalCampaignMessage.textErrorSavingPlayer, SwalCampaignMessage.iconError);
				} else {
					messagingHub.off(request.queueId.toString());
					messagingHub.stop();
					setLoading(false);
					swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon);
					props.onSubmit?.(customEventName, messageItems, countryItems);
				}
			});
		});
		setTimeout(() => {
			if (messagingHub.state === HubConnected) {
				messagingHub.stop();
			}
		}, 30000);
	};

	const validateCustomEventRecord = async () => {
		if (!isValidCurrency()) {
			return false;
		}

		if (customEventType?.value === CustomEventTypeEnum.CreateNew) {
			if (!isValidNewCustomEventName()) {
				return false;
			}

			if (!(await isUniqueCustomEventName())) {
				return false;
			}
		} 
		
		if (customEventType?.value !== CustomEventTypeEnum.CreateNew && !isValidExistingCustomEvent()) {
			return false;
		}
		
		if (!isValidCurrencyWithoutCountry()) {
			return false;
		}

		return true;
	};

	const isValidCurrency = () => {
		if (currencyId == undefined) {
			showValidationError(message.requiredAllFields);
			return false;
		}
		return true;
	};

	const isValidNewCustomEventName = () => {
		if (customEventName.trim() === '') {
			showValidationError(message.requiredAllFields);
			return false;
		}
		return true;
	};

	const isUniqueCustomEventName = async () => {
		const customEventRequest: CustomEventFilterModel = {
			customEventName: customEventName.trim(),
			pageSize: 5,
			offsetValue: 0,
			sortColumn: 'CampaignEventSettingId',
			sortOrder: 'ASC',
			queueId: Guid.create().toString(),
			userId: currentUserId.toString(),
		};
		const response = await validatePlayerConfigurationRecord(customEventRequest);

		if (response.data && response.data.status !== HttpStatusCodeEnum.Ok) {
			showValidationError(SwalCampaignMessage.textCustomEventAreadyExist);
			return false;
		}

		return true;
	};

	const isValidExistingCustomEvent = () => {
		if (customEventId === undefined) {
			showValidationError(message.requiredAllFields);
			return false;
		}

		return true;
	};

	const isValidCurrencyWithoutCountry = () => {
		const currencyMatch = campaignState.campaignCommunicationCustomEventModel.filter(
			(i) => i.customEventGuid != currentCustomEventGuid && i.currencyId === Number(currencyId?.value)
		);

		if (currencyMatch.length > 0) {
			const countryMatch = campaignState.campaignCustomEventCountryModel.filter(
				(i) =>
					(i.campaignCommunicationCustomEventId != null &&
						i.campaignCommunicationCustomEventId > 0 &&
						currencyMatch.map((i) => i.campaignCommunicationCustomEventId).includes(i.campaignCommunicationCustomEventId)) ||
					(i.parentCustomEventGuid != null && currencyMatch.map((i) => i.customEventGuid).includes(i.parentCustomEventGuid))
			);

			if (countryMatch.length === 0 || (countryMatch.length > 0 && countryIds.length === 0)) {
				showValidationError(SwalCampaignMessage.textDuplicateCustomEvent);
				return false;
			}

			if (countryIds.length > 0 && countryMatch.length > 0) {
				const matchedCountries = countryIds.some((country) => countryMatch.map((i) => i.countryId).includes(Number(country.value)));

				if (matchedCountries) {
					showValidationError(SwalCampaignMessage.textDuplicateCustomEvent);
					return false;
				}
			}
		}

		return true;
	};

	const showValidationError = (message: string) => {
		swal(SwalCampaignMessage.titleFailed, message, SwalCampaignMessage.iconError);
		setLoading(false);
	};

	return (
		<FormModal headerTitle={props.title} onHide={handleOnHide} haveFooter={false} show={props.modal}>
			<Container>
				<Row style={{marginTop: 10}}>
					<Col sm={6}>
						<label className='form-label-sm required'>Currency</label>
						<Select style={{width: '100%'}} options={currencyOptions} onChange={(val: any) => setCurrencyId(val)} value={currencyId} />
					</Col>
					<Col sm={6}>
						<label className='form-label-sm'>Country</label>
						<SelectFilter isMulti={true} label='' options={countryOptions} onChange={(val: any) => onChangeCountryIds(val)} value={countryIds} />
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col sm={6}>
						<label className='form-label-sm required'>Custom Event</label>
						<Select
							style={{width: '100%'}}
							options={customEventTypeOptions}
							onChange={(val: any) => setCustomEventType(val)}
							value={customEventType}
						/>
					</Col>

					{customEventType && customEventType.value == '2' && (
						<Col sm={6}>
							<label className='form-label-sm required'>Custom Event Name</label>
							<Select size='small' style={{width: '100%'}} options={props.customEventsOptions} onChange={onChangeCustomEvent} value={customEventId} />
						</Col>
					)}

					{customEventType && customEventType.value == '1' && (
						<Col sm={6}>
							<label className='form-label-sm required'>Custom Event Name</label>
							<input
								type='text'
								className={'form-control form-control-sm '}
								onChange={(e: any) => setCustomEventName(e.target.value)}
								value={customEventName}
								aria-label='Custom Event Name'
							/>
						</Col>
					)}
				</Row>
			</Container>
			<ModalFooter style={{border: 0}}>
				<MlabButton
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loading={loading}
					disabled={loading}
					loadingTitle={' Please wait...'}
					onClick={handleSubmit}
					access={true}
				></MlabButton>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={handleOnHide} />
			</ModalFooter>
		</FormModal>
	);
};

export default CampaignCommunicationCustomEventModal;
