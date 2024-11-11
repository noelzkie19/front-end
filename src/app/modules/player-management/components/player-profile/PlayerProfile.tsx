import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import Skeleton from 'react-loading-skeleton';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import useConstant from '../../../../constants/useConstant';
import {ContentContainer, FormGroupContainerBordered, FormHeader, MainContainer} from '../../../../custom-components';
import * as auth from '../../../../modules/auth/redux/AuthRedux';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {PLAYER_CONTANTS} from '../../constants/PlayerContants';
import {PlayerSensitiveDataRequestModel} from '../../models';
import {PlayerContactRequestModel} from '../../models/PlayerContactRequestModel';
import {PlayerModel} from '../../models/PlayerModel';
import { usePlayerManagementHooks } from '../../shared/usePlayerManagementHooks';
import {GetPlayerProfile, SavePlayerContact, getPlayerSensitiveData} from '../../redux/PlayerManagementService';
import PlayerCaseComm from './PlayerCaseComm';
import PlayerRemHistory from './PlayerRemHistory';
import PlayerRemProfile from './PlayerRemProfile';

const PlayerProfile: React.FC = () => {
	const history = useHistory();
	
	// Get Redux Store
	const dispatch = useDispatch();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// States with Models
	const [player, setPlayer] = useState<PlayerModel>();
	const [errorMessageTitle] = useState<string>('');
	const [errorMessageSubTitle] = useState<string>('');
	const [isShowContactTypeEmail, setShowContactTypeEmail] = useState<boolean>(false);
	const [isShowContactTypeMobile, setShowContactTypeMobile] = useState<boolean>(false);
	const [contactMobileType, setContactMobileType] = useState<string>('password');
	const [contactEmailType, setContactEmailType] = useState<string>('password');
	const [isLoadingSensitiveEmail, setIsLoadingSensitiveEmail] = useState<boolean>(false);
	const [isLoadingSensitiveMobile, setIsLoadingSensitiveMobile] = useState<boolean>(false);

	const [mobileNumber, setMobileNumber] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [firstName, setFirstName] = useState<string>('');
	const [country, setCountry] = useState<string>('');
	const {playerId}: {playerId: string} = useParams();
	const {brandName}: {brandName: string} = useParams();
	const {successResponse} = useConstant();
	let sensitiveDefaultValue: string = '***************';
	const [emailHasIcon, setEmailHasIcon] = useState<boolean>(false);
	const [mobileHasIcon, setMobileHasIcon] = useState<boolean>(false);
	const [mlabPlayerId, setMlabPlayerId] = useState<number>(0)

	const { validateContactDetailsAccess } = usePlayerManagementHooks()

	// Mounted
	useEffect(() => {
		if (userAccess.includes(USER_CLAIMS.PlayerProfileRead)) {
			const pathArray = window.location.pathname.split('/');

			if (pathArray.length >= 5) {
				let id = String(pathArray[4]);
				getPlayerProfile(id);
			}
		} 
		else {
			history.push('/error/401');
		}
	}, []);

	//Methods
	const getPlayerProfile = (id: string) => {
		let request = {
			playerId: id,
			pageSource: 'Player Profile',
			hasAccess: userAccess.includes(USER_CLAIMS.ViewSensitiveDataRead) && userAccess.includes(USER_CLAIMS.ViewSensitiveDataWrite),
			userId: userAccessId,
			brandName: brandName
		};
		
		GetPlayerProfile(request)
			.then((response) => {
				if (response.status === successResponse) {
					let profile: PlayerModel = response.data?.data;
					
					if (profile) {
						setPlayer(profile);
						setFirstName(profile?.firstName.toString());
						setLastName(profile?.lastName.toString());
						setMobileNumber(profile?.mobilePhone || '');
						setEmail(profile?.email || '');
						setCountry(profile.country);
						checkCensoredEmail(profile.blindAccount ?? false);
						checkCensoredMobile(profile.blindAccount ?? false);
						setMlabPlayerId(profile?.mlabPlayerId ?? 0)
					} 
					else {
						history.push('/error/401');
					}
				}
			})
			.catch((ex) => {
				swal('Failed', 'Problem in getting profile', 'error');
			});
	};

	const checkCensoredEmail = (_blindAccount: boolean) => {
		const hasIcon = validateContactDetailsAccess(userAccess, _blindAccount) // base on excel matrix
		setEmailHasIcon(hasIcon)
	};

	const checkCensoredMobile = (_blindAccount: boolean) => {
		const hasIcon = validateContactDetailsAccess(userAccess, _blindAccount)
		setMobileHasIcon(hasIcon)
	};

	const getPlayerProfileSensitiveData = async (_sensitiveField: string) => {
		let request: PlayerSensitiveDataRequestModel = {
			mlabPlayerId: mlabPlayerId,
			hasAccess: userAccess.includes(USER_CLAIMS.ViewSensitiveDataRead) && userAccess.includes(USER_CLAIMS.ViewSensitiveDataWrite),
			sensitiveField: _sensitiveField,
			userId: userAccessId,
		};

		let sensitiveDataResponse: string = '';
		await getPlayerSensitiveData(request)
			.then((response) => {
				if (response.status === successResponse) {
					sensitiveDataResponse = response.data.sensitiveValue;
				}
			})
			.catch(() => {
				swal('Failed', 'Problem in getting profile', 'error');
			});

		return sensitiveDataResponse;
	};

	async function saveContactClick(contactTypeId: number) {
		if (player != undefined) {
			const request: PlayerContactRequestModel = {
				mlabPlayerId: mlabPlayerId,
				userId: userAccessId,
				contactTypeId: contactTypeId,
				pageName: 'PLAYER_PROFILE',
			};

			await SavePlayerContact(request)
				.then((response) => {
					if (response.status === 200) {
						if (response.data.item2 != null && response.data.item2.thresholdAction === 'Deactivate User Account') {
							dispatch(auth.actions.logout());
							userDeactivateLogout();
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

	const userDeactivateLogout = () => {
		swal({
			title: 'Your login session is terminated',
			icon: 'warning',
			dangerMode: true,
		});
	};

	const onClickContactEmail = async () => {
		setShowContactTypeEmail(!isShowContactTypeEmail);
		setContactEmailType('password');

		if (!isShowContactTypeEmail) {
			setIsLoadingSensitiveEmail(true);
			let getSensitiveEmail = await getPlayerProfileSensitiveData('Email');
			setEmail(getSensitiveEmail);
			setIsLoadingSensitiveEmail(false);
			setContactEmailType('text');
			saveContactClick(PLAYER_CONTANTS.ContactType_Email_Id).catch(() => {});
		} else {
			setEmail(sensitiveDefaultValue);
		}
	};

	const onClickContactMobile = async () => {
		setShowContactTypeMobile(!isShowContactTypeMobile);
		setContactMobileType('password');

		if (!isShowContactTypeMobile) {
			setContactMobileType('text');
			setIsLoadingSensitiveMobile(true);
			let getSensitivePhone = await getPlayerProfileSensitiveData('MobilePhone');
			setMobileNumber(getSensitivePhone);
			setIsLoadingSensitiveMobile(false);
			saveContactClick(PLAYER_CONTANTS.ContactType_Mobile_Id).catch(() => {});
		} else {
			setMobileNumber(sensitiveDefaultValue);
		}
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Player Profile'} />

				{player != undefined ? (
					<ContentContainer>
						<FormGroupContainerBordered>
							<div className='col-lg-3' style={{position: 'relative'}}>
								<label>Last Name</label>

								<input type='text' className='form-control form-control-sm' disabled aria-label='Last Name' value={lastName} />
							</div>

							<div className='col-lg-3'>
								<label>Brand</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Brand' value={player.brand} />
							</div>

							<div className='col-lg-3'>
								<label>VIP Level</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='VIP Level' value={player.vipLevel} />
							</div>

							<div className='col-lg-3' style={{position: 'relative'}}>
								<label>Country</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Country' value={country} />
							</div>

							<div className='col-lg-3  mt-3' style={{position: 'relative'}}>
								<label>First Name</label>
								<input type={'text'} className='form-control form-control-sm' disabled aria-label='First Name' value={firstName} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Currency</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Currency' value={player.currency} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Risk Level</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Risk Level' value={player.riskLevelName} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Language</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Language' value={player.language} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Player ID</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Player ID' value={player.playerId} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Registration Date</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Registration Date' value={player.registrationDate} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Payment Group</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Payment Group' value={player.paymentGroup} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Bonus Abuser</label>
								<input
									type='text'
									className='form-control form-control-sm'
									disabled
									aria-label='Bonus Abuser'
									value={player.bonusAbuser ? 'Yes' : 'No'}
								/>
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Username</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Username' value={player.username} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Status</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Status' value={player.status} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Deposited</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Deposited' value={player.deposited ? 'Yes' : 'No'} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Received Bonus</label>
								<input
									type='text'
									className='form-control form-control-sm'
									disabled
									aria-label='Received Bonus'
									value={player.receiveBonus ? 'Yes' : 'No'}
								/>
							</div>

							<div className='col-lg-3  mt-3'></div>
							<div className='col-lg-3  mt-3'></div>
							<div className='col-lg-3  mt-3'>
								<label>Blind Account</label>
								<input
									type='text'
									className='form-control form-control-sm'
									disabled
									aria-label='Internal Account'
									value={player.blindAccount === true ? 'Yes' : 'No'}
								/>
							</div>
							<div className='col-lg-3  mt-3'>
								<label>Internal Account</label>
								<input
									type='text'
									className='form-control form-control-sm'
									disabled
									aria-label='Internal Account'
									value={player.internalAccount ? 'Yes' : 'No'}
								/>
							</div>
						</FormGroupContainerBordered>

						<FormGroupContainerBordered>
							<h6>Contact Details</h6>

							<div className='col-lg-3  mt-3' style={{position: 'relative'}}>
								<label>Mobile Number</label>

								{isLoadingSensitiveMobile ? (
									<Skeleton count={1} height={30} style={{marginBottom: 10}} />
								) : (
									<input type={contactMobileType} className='form-control form-control-sm' disabled aria-label='Mobile Number' value={mobileNumber} />
								)}
								{/* user have full permission */}
								{mobileHasIcon ? (
									<div
										className='btn btn-icon w-auto px-0 btn-active-color-primary'
										style={{position: 'absolute', right: '20px', bottom: '-5px'}}
										onClick={onClickContactMobile}
									>
										<FontAwesomeIcon icon={isShowContactTypeMobile ? faEyeSlash : faEye} />
									</div>
								) : null}
							</div>

							<div className='col-lg-3  mt-3' style={{position: 'relative'}}>
								<label>Email Address</label>

								{isLoadingSensitiveEmail ? (
									<Skeleton count={1} height={30} style={{marginBottom: 10}} />
								) : (
									<input type={contactEmailType} className='form-control form-control-sm' disabled aria-label='Email Address' value={email} />
								)}

								{/* user have full permission for email*/}
								{emailHasIcon ? (
									<div
										className='btn btn-icon w-auto px-0 btn-active-color-primary'
										style={{position: 'absolute', right: '20px', bottom: '-5px'}}
										onClick={onClickContactEmail}
									>
										<FontAwesomeIcon icon={isShowContactTypeEmail ? faEyeSlash : faEye} />
									</div>
								) : null}
							</div>
						</FormGroupContainerBordered>

						<FormGroupContainerBordered>
							<h6>Tracking</h6>

							<div className='col-lg-3  mt-3'>
								<label>Marketing Channel</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Marketing Channel' value={player.marketingChannel} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Campaign Name</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Campaign Name' value={player.campaignName} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Referred By</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Referred By' value={player.referredBy} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>BTAG</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='BTAG' value={player.bTAG} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Marketing Source</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Marketing Source' value={player.marketingSource} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Coupon Code</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Coupon Code' value={player.couponCode} />
							</div>

							<div className='col-lg-3  mt-3'>
								<label>Referral URL</label>
								<input type='text' className='form-control form-control-sm' disabled aria-label='Referral URL' value={player.referrerURL} />
							</div>

							<div className='col-lg-3  mt-3'></div>
						</FormGroupContainerBordered>

						<FormGroupContainerBordered>
							<PlayerRemProfile mlabPlayerId={mlabPlayerId}/>
						</FormGroupContainerBordered>

						<FormGroupContainerBordered>
							<PlayerCaseComm playerId={playerId} username={player.username} brand={player.brand} mlabPlayerId={mlabPlayerId} />
						</FormGroupContainerBordered>

						<FormGroupContainerBordered>
							<PlayerRemHistory mlabPlayerId={mlabPlayerId} />
						</FormGroupContainerBordered>
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
		</>
	);
};

export default PlayerProfile;
