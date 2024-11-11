import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import {Col, InputGroup, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import useConstant from '../../../../../constants/useConstant';
import {BasicFieldLabel, BasicTextInput, FormHeader, MainContainer} from '../../../../../custom-components';
import * as auth from '../../../../../modules/auth/redux/AuthRedux';
import {IAuthState} from '../../../../../modules/auth/redux/AuthRedux';
import {PLAYER_CONTANTS} from '../../../../player-management/constants/PlayerContants';
import {PlayerSensitiveDataRequestModel} from '../../../../player-management/models';
import {PlayerContactRequestModel} from '../../../../player-management/models/PlayerContactRequestModel';
import {GetPlayerProfile, SavePlayerContact} from '../../../../player-management/redux/PlayerManagementService';
import {usePlayerManagementHooks} from '../../../../player-management/shared/usePlayerManagementHooks';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import LoadingDivForm from './LoadingDivForm';
import { ICasePlayerInformationProps } from '../../../interface/ICasePlayerInformationProps';


const CasePlayerInformations: React.FC<ICasePlayerInformationProps> = (Props) => {
	const {callListNote, mobilePhone, setCallistNote, setMobilePhone, brandName, setCaseMlabPlayerId} = Props;

	/**
	 * ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const dispatch = useDispatch();

	/**
	 * ? Constants
	 */
	const {successResponse, sensitiveDefaultValue} = useConstant();
	/**
	 * ? Hooks
	 */
	const {paramPlayerId}: {paramPlayerId: string} = useParams();
	const {getPlayerSensitiveFieldData} = usePlayerManagementHooks();

	/**
	 * ? States
	 */
	const [username, setUserName] = useState<string>('');
	const [brand, setBrand] = useState<string>('');
	const [currency, setCurrency] = useState<string>('');
	const [vipLevel, setVipLevel] = useState<string>('');
	const [paymentGroup, setPaymentGroup] = useState<string>('');
	const [deposited, setDeposited] = useState<string>('');
	const [marketingChannel, setMarketingChannel] = useState<string>('');
	const [marketingSource, setMarketingSource] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [mlabPlayerId, setMlabPlayerId] = useState<number>(0);

	const [contactMobileType, setContactMobileType] = useState<string>('password');
	const [contactEmail, setContactEmail] = useState<string>('password');
	const [isShowContactTypeMobile, setShowContactTypeMobile] = useState<boolean>(false);
	const [isShowCreateCaseEmailText, setIsShowCreateCaseEmailText] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [emailHasIcon, setEmailHasIcon] = useState<boolean>(false);
	const [mobileHasIcon, setMobileHasIcon] = useState<boolean>(false);

	const { validateContactDetailsAccess } = usePlayerManagementHooks()
	/**
	 * ? Mounted
	 */

	useEffect(() => {
		setLoading(true);

		let definedUserId: number = userId !== undefined ? parseInt(userId) : 0;
		let request = {
			playerId: paramPlayerId,
			pageSource: 'Campaign Case',
			hasAccess: access?.includes(USER_CLAIMS.ViewSensitiveDataRead) && access.includes(USER_CLAIMS.ViewSensitiveDataWrite),
			userId: definedUserId,
			brandName: brandName
		};
		
		GetPlayerProfile(request)
			.then((response) => {
				if (response.status === successResponse) {
					if (response.data?.data) {
						const {
							username,
							brand,
							currency,
							vipLevel,
							paymentGroup,
							deposited,
							marketingChannel,
							marketingSource,
							mobilePhone,
							email,
							blindAccount,
							mlabPlayerId,
						} = response.data?.data || {};

						setUserName(username);
						setBrand(brand);
						setCurrency(currency);
						setVipLevel(vipLevel);
						setPaymentGroup(paymentGroup);
						setDeposited(deposited ? 'Yes' : 'No');
						setMarketingChannel(marketingChannel);
						setMarketingSource(marketingSource);
						setMobilePhone(mobilePhone);
						setEmail(email);
						setLoading(false);
						checkCensoredEmail(blindAccount);
						checkCensoredMobile(blindAccount);
						setMlabPlayerId(mlabPlayerId);
						setCaseMlabPlayerId(mlabPlayerId);
					}
				}
			})
			.catch((ex) => {
				swal('Problem in getting profile');
				setLoading(false);
			});
	}, []);

	/**
	 * ? Methods
	 */
	async function saveContactClick(contactTypeId: number) {
		if (paramPlayerId != undefined && paramPlayerId != null) {
			const request: PlayerContactRequestModel = {
				mlabPlayerId: mlabPlayerId,
				pageName: 'CASE_COMMUNICATION',
				userId: userId === undefined ? 0 : parseInt(userId),
				contactTypeId: contactTypeId,
			};

			await SavePlayerContact(request)
				.then((responseContact) => {
					if (responseContact.status === successResponse) {
						if (responseContact.data.item2 != null && responseContact.data.item2.thresholdAction === 'Deactivate User Account') {
							swal({title: 'Your login session is terminated', icon: 'warning', dangerMode: true}); // Case Player Information > Terminate session if deactivated.
							dispatch(auth.actions.logout()); // Trigger sonar scan
						}
					} else {
						swal('Failed', 'Problem in saving profile contact click', 'error');
					}
				})
				.catch((ex) => {
					console.log('[ERROR] Player Profile: ' + ex);
					swal('Failed', 'Problem in saving profile contact click', 'error');
				});
		}
	}

	const checkCensoredEmail = (_isBlindAccount: boolean) => {
		const hasViewIcon = validateContactDetailsAccess(access, _isBlindAccount)
		setEmailHasIcon(hasViewIcon)
	};

	const checkCensoredMobile = ( _isBlindAccount: boolean) => {
		const hasEyeIcon = validateContactDetailsAccess(access, _isBlindAccount)
		setMobileHasIcon(hasEyeIcon)
	};

	const onClickContactMobile = async () => {
		setShowContactTypeMobile(!isShowContactTypeMobile);
		setContactMobileType('password');

		if (!isShowContactTypeMobile) {
			let request: PlayerSensitiveDataRequestModel = {
				mlabPlayerId: mlabPlayerId,
				hasAccess: (access?.includes(USER_CLAIMS.ViewSensitiveDataRead) && access?.includes(USER_CLAIMS.ViewSensitiveDataWrite)) || false,
				sensitiveField: 'MobilePhone',
				userId: userId !== undefined ? parseInt(userId) : 0,
			};

			setContactMobileType('text');
			let getSensitivePhone = await getPlayerSensitiveFieldData(request);
			setMobilePhone(getSensitivePhone);
			saveContactClick(PLAYER_CONTANTS.ContactType_Mobile_Id).catch(() => {});
		} else {
			setMobilePhone(sensitiveDefaultValue);
		}
	};

	const onClickPlayerInformationShowEmail = async () => {
		setIsShowCreateCaseEmailText(!isShowCreateCaseEmailText);
		setContactEmail('password');

		let request: PlayerSensitiveDataRequestModel = {
			mlabPlayerId: mlabPlayerId,
			hasAccess: (access?.includes(USER_CLAIMS.ViewSensitiveDataRead) && access?.includes(USER_CLAIMS.ViewSensitiveDataWrite)) || false,
			sensitiveField: 'Email',
			userId: userId !== undefined ? parseInt(userId) : 0,
		};

		if (!isShowCreateCaseEmailText) {
			let getSensitiveEmail = await getPlayerSensitiveFieldData(request);
			setEmail(getSensitiveEmail);
			setContactEmail('text');
			saveContactClick(PLAYER_CONTANTS.ContactType_Email_Id).catch(() => {});
		} else {
			setEmail(sensitiveDefaultValue);
		}
	};

	return (
		<>
			{loading ? (
				<LoadingDivForm />
			) : (
				<MainContainer>
					<FormHeader headerLabel={'Player Information'} />
					<div style={{margin: 40}}>
						<Row>
							<Col sm={3}>
								<BasicFieldLabel title={'Username'} />
								<BasicTextInput ariaLabel={'username'} value={username} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Brand'} />
								<BasicTextInput ariaLabel={'brand'} colWidth={'col-sm-12'} value={brand} onChange={(e) => {}} disabled={true} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Currency'} />
								<BasicTextInput ariaLabel={'currency'} colWidth={'col-sm-12'} value={currency} onChange={(e) => {}} disabled={true} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'VIP Level'} />
								<BasicTextInput ariaLabel={'vipLevel'} colWidth={'col-sm-12'} value={vipLevel} onChange={(e) => {}} disabled={true} />
							</Col>
						</Row>

						<Row style={{marginTop: 20}}>
							<Col sm={3}>
								<BasicFieldLabel title={'Payment group'} />
								<BasicTextInput ariaLabel={'paymentGroup'} colWidth={'col-sm-12'} value={paymentGroup} onChange={(e) => {}} disabled={true} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Deposited'} />
								<BasicTextInput ariaLabel={'deposited'} colWidth={'col-sm-12'} value={deposited} onChange={(e) => {}} disabled={true} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Marketing  Channel'} />
								<BasicTextInput ariaLabel={'marketingChannel'} colWidth={'col-sm-12'} value={marketingChannel} onChange={(e) => {}} disabled={true} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Marketing  Source'} />
								<BasicTextInput ariaLabel={'marketingSource'} colWidth={'col-sm-12'} value={marketingSource} onChange={(e) => {}} disabled={true} />
							</Col>
						</Row>

						<Row style={{marginTop: 20}}>
							<Col sm={3}>
								<BasicFieldLabel title={'Call List Note'} />
								<BasicTextInput
									ariaLabel={'callListNote'}
									colWidth={'col-sm-12'}
									value={callListNote}
									onChange={(e) => setCallistNote(e.target.value)}
									disabled={false}
								/>
							</Col>

							<Col sm={3}>
								<BasicFieldLabel title={'Mobile Number'} />
								<InputGroup>
									<div className='col-sm-10'>
										<input
											type={contactMobileType}
											className='form-control form-control-sm'
											disabled
											aria-label='Mobile Number'
											value={mobilePhone}
										/>
									</div>
									{mobileHasIcon === true ? (
										<FontAwesomeIcon
											icon={isShowContactTypeMobile ? faEyeSlash : faEye}
											className='btn btn-icon btn-active-color-primary'
											onClick={onClickContactMobile}
											style={{position: 'absolute', top: 5, right: 70, fontSize: 0.5}}
										/>
									) : null}
								</InputGroup>
							</Col>

							<Col sm={3}>
								<BasicFieldLabel title={'Email Address'} />
								<InputGroup>
									<div className='col-sm-10'>
										<input type={contactEmail} className='form-control form-control-sm' disabled aria-label='email' value={email} />
									</div>
									{emailHasIcon === true ? (
										<FontAwesomeIcon
											icon={isShowCreateCaseEmailText ? faEyeSlash : faEye}
											className='btn btn-icon btn-active-color-primary'
											style={{position: 'absolute', top: 5, right: 70, fontSize: 0.5}}
											onClick={onClickPlayerInformationShowEmail}
										/>
									) : null}
								</InputGroup>
							</Col>
						</Row>
					</div>
				</MainContainer>
			)}
		</>
	);
};

export default CasePlayerInformations;
