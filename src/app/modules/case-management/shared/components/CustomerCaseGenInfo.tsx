import React, {useCallback, useEffect, useState} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {RootState} from '../../../../../setup';
import {LookupModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {BasicFieldLabel, BasicTextInput, MainContainer, RequiredLabel} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {useCaseCommOptions} from '../../../case-communication/components/shared/hooks';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {CustomerCaseGenInfoPropsModel} from '../../models/CustomerCaseGenInfoPropsModel';
import useCaseManagementConstant from '../../useCaseManagementConstant';
import {useCaseManagementHooks} from '../hooks/useCaseManagementHooks';

const CustomerCaseGenInfo: React.FC<CustomerCaseGenInfoPropsModel> = (Props) => {
	/**
	 *  ? Redux
	 */
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	//case-management/create-case/{PLAYER_ID}/{BRAND_ID}/{USERNAME}/{CAMPAIGN_ID}
	const pathArray = window.location.pathname.split('/');
	/**
	 *  ? Hooks
	 */
	const {
		pageAction,
		caseId,
		brand,
		setBrand,
		brandOptions,
		currency,
		caseTexStatus,
		caseType,
		setCaseType,
		caseOwner,
		setCaseOwner,
		vipLevel,
		username,
		setUsername,
		playerId,
		setPlayerId,
		userList,
		onChangeUsername,
		searchUserName,
		onChangePlayerId,
		searchPlayerId,
		paymentGroup,
		playerIdOptions,
		usernameOptions,
		setPlayerIdOptions,
		setUsernameOptions,
		campaignNames,
		setCampaignNames,
	} = Props;
	const {caseTypeOptionsList, getCaseTypeOptionList} = useCaseCommOptions();
	const {campaignOptions, getEditServiceCaseCampaignByUsername} = useCaseManagementHooks();
	const {pageActions} = useCaseManagementConstant();
	const {SwalFailedMessage} = useConstant();

	//Constant
	const [isFromPlayerProfile, setIsFromPlayerProfile] = useState<boolean>(false);
	const [showCampaignError, setShowCampaignError] = useState<boolean>(false);
	const [isFromAgentWorkSpace, setIsFromAgentWorkSpace] = useState<boolean>(false);
	const [dpCampaignNames, setDpCampaignNames] = useState<Array<LookupModel>>([]);
	/**
	 *  ? Mouted
	 */
	useEffect(() => {
		getCaseTypeOptionList();
		if (pathArray.length > 6) {
			setIsFromAgentWorkSpace(true);
		}
	}, []);

	useEffect(() => {
		if (brandOptions.length > 0) {
			if (pathArray.length >= 5) {
				const playerBrand = brandOptions.find((d) => d.label == pathArray[4]);
				setBrand(playerBrand);
				setIsFromPlayerProfile(true);
			} else {
				setIsFromPlayerProfile(false);
			}
		}
	}, [brandOptions]);

	useEffect(() => {
		if (brand !== '' || brand !== undefined || brand !== null) {
			if (pathArray.length >= 5) {
				searchPlayerId(pathArray[3].toString());
			}
		}
	}, [brand]);

	useEffect(() => {
		if (playerIdOptions.length)
			if (pathArray.length >= 5) {
				let _paramPlayerId = pathArray[3];
				let _valueMlabPlayerId = playerIdOptions.find((obj) => obj.playerId === _paramPlayerId.toString())?.mlabPlayerId;
				onChangePlayerId({label: _paramPlayerId.toString(), value: _valueMlabPlayerId?.toString()});
			}
	}, [playerIdOptions]);

	useEffect(() => {
		if (username && username.label !== '') {
			if (pageAction === pageActions.createCase) {
				setCampaignNames([]); // Clear Campaign Names if Player Id changes
			}
			getEditServiceCaseCampaignByUsername(username.label, parseInt(brand.value));
		}
	}, [username]);

	useEffect(() => {
		if (campaignOptions && campaignOptions.length > 0 && pathArray.length >= 6) {
			let selectedCampaign = campaignOptions.filter((d) => Number(d.value) == Number(pathArray[6]));
			onChangeCampaignNames(selectedCampaign);
		}

		if (pageAction === pageActions.editCase || pageAction === pageActions.addCommunication || pageAction === pageActions.editCommunication) {
			const selectedCampaigns = campaignOptions.filter((i) => campaignNames.find((a) => a.value === i.value?.toString()));
			setDpCampaignNames(selectedCampaigns);
		}
	}, [campaignOptions]);
	/**
	 *  ? Events
	 */
	const onChangeBrand = useCallback(
		(event: any) => {
			setBrand(event);
			setUsername([]);
			setPlayerId([]);
			setPlayerIdOptions([]);
			setUsernameOptions([]);
		},
		[brand]
	);

	const onChangeCaseType = useCallback(
		(event: any) => {
			setCaseType(event);
		},
		[caseType]
	);

	const onChangeCaseOwner = useCallback(
		(event: any) => {
			setCaseOwner(event);
		},
		[caseOwner]
	);

	const onChangeCampaignNames = useCallback(
		(value: any) => {
			if (value.length > 10) {
				setShowCampaignError(true);
			} else {
				setCampaignNames(value);
				setDpCampaignNames(value);
				setShowCampaignError(false);
			}
		},
		[campaignNames]
	);

	const checkPage = () => {
		return isFromPlayerProfile || pageAction === pageActions.editCommunication || pageAction === pageActions.addCommunication;
	};
	return (
		<MainContainer>
			<div style={{margin: 20}}>
				{caseId !== undefined ? (
					<Row>
						<Col sm='6'>
							<h5 className='fw-bolder'>{`Case ID: ${caseId}`}</h5>
						</Col>
					</Row>
				) : null}
				<Row>
					<Col sm={12}>
						<p className='fw-bolder'>General Information</p>
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<RequiredLabel title={'Brand'} />
						<Select size='small' style={{width: '100%'}} options={brandOptions} onChange={onChangeBrand} value={brand} isDisabled={checkPage()} />
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Case Status'} />
						<BasicTextInput ariaLabel={'status'} colWidth={'col-sm-12'} value={caseTexStatus} onChange={(e) => {}} disabled={true} />
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Currency'} />
						<BasicTextInput ariaLabel={'currency'} colWidth={'col-sm-12'} value={currency} onChange={(e) => {}} disabled={true} />
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<RequiredLabel title={'Case Type'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={caseTypeOptionsList}
							onChange={onChangeCaseType}
							value={caseType}
							isDisabled={true}
						/>
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'Case Owner'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={userList}
							onChange={onChangeCaseOwner}
							value={caseOwner}
							isDisabled={!access?.includes(USER_CLAIMS.CreateCaseonBehalfWrite) || isFromAgentWorkSpace}
						/>
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'VIP Level'} />
						<BasicTextInput ariaLabel={'vipLevel'} colWidth={'col-sm-12'} value={vipLevel} onChange={(e) => {}} disabled={true} />
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<RequiredLabel title={'Username'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={usernameOptions.flatMap((obj) => [
								{
									label: obj.username,
									value: obj.mlabPlayerId,
								},
							])}
							onChange={onChangeUsername}
							value={username}
							onInputChange={searchUserName}
							isDisabled={checkPage()}
						/>
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'Player ID'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={playerIdOptions.flatMap((obj) => [
								{
									label: obj.playerId,
									value: obj.mlabPlayerId,
								},
							])}
							onChange={onChangePlayerId}
							value={playerId}
							onInputChange={searchPlayerId}
							isDisabled={checkPage()}
						/>
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Payment group'} />
						<BasicTextInput ariaLabel={'vipLevel'} colWidth={'col-sm-12'} value={paymentGroup} onChange={(e) => {}} disabled={true} />
					</Col>
					<Col sm={12}>
						<BasicFieldLabel title={'Campaign Name'} />
						<OverlayTrigger
							show={showCampaignError}
							delay={{show: 700, hide: 0}}
							placement='bottom-end'
							overlay={
								<Tooltip id='campaign-tooltip' className='dropdown-tooltip'>
									{SwalFailedMessage.textCampaignNameCountExceeded}
								</Tooltip>
							}
						>
							<Select
								isMulti
								closeMenuOnSelect={false}
								size='small'
								style={{width: '100%'}}
								options={campaignOptions}
								onChange={onChangeCampaignNames}
								value={dpCampaignNames}
								isDisabled={!(pageAction === pageActions.createCase || pageAction === pageActions.editCase) || isFromAgentWorkSpace}
							/>
						</OverlayTrigger>
					</Col>
				</Row>
			</div>
		</MainContainer>
	);
};

export default CustomerCaseGenInfo;
