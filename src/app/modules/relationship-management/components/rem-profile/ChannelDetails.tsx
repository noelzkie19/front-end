import {faCheckCircle, faTimesCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {right} from '@popperjs/core';
import React, {useState} from 'react';
import swal from 'sweetalert';
import {FormGroupContainer} from '../../../../custom-components';
import useRemProfileConstant from '../../constants/useRemProfileConstant';
import {LiveChatRequest, LivePersonRequest} from '../../models';
import {RemContactDetailsResponse} from '../../models/response/RemAgentProfileContactDetailsResponse';
interface Props {
	selectedTypeId?: any;
	data: Array<RemContactDetailsResponse>;
	selectedTypeName?: any;
	idx?: any;
	setRemovedChannelId: any;
	liveChat?: Array<LiveChatRequest>;
	livePerson?: Array<LivePersonRequest>;
	remProfileId?: number;
	isForViewing?: boolean;
}

const iconStyle = {
	cursor: 'pointer',
};

const ChannelDetails: React.FC<Props> = ({
	selectedTypeId,
	selectedTypeName,
	idx,
	data,
	setRemovedChannelId,
	liveChat,
	livePerson,
	remProfileId,
	isForViewing,
}) => {
	const {LIVEPERSON, LIVECHAT} = useRemProfileConstant();
	const typeName = selectedTypeName;
	const [isChecked, setIsChecked] = useState<boolean>(false);

	const [liveChatAgentId, setLiveChatAgentId] = useState(
		liveChat?.map((obj: any) => {
			return obj.livePersonId == 0 ? undefined : obj.agentID;
		})
	);
	const [liveChatGroupId, setLiveChatGroupId] = useState(
		liveChat?.map((obj: any) => {
			return obj.livePersonId == 0 ? undefined : obj.groupID;
		})
	);
	const [liveChatGroupName, setLiveChatGroupName] = useState(
		liveChat?.map((obj: any) => {
			return obj.livePersonId == 0 ? undefined : obj.groupName;
		})
	);

	const [livePersonEngagementId, setLivePersonEngagementId] = useState(
		livePerson?.map((obj: any) => {
			return obj.liverPersonId == 0 ? undefined : obj.engagementID;
		})
	);
	const [livePersonAgentId, setLivePersonAgentId] = useState(
		livePerson?.map((obj: any) => {
			return obj.liverPersonId == 0 ? undefined : obj.agentID;
		})
	);
	const [livePersonSkillId, setLivePersonSkillId] = useState(
		livePerson?.map((obj: any) => {
			return obj.liverPersonId == 0 ? undefined : obj.skillID;
		})
	);
	const [livePersonSkillName, setLivePersonSkillName] = useState(
		livePerson?.map((obj: any) => {
			return obj.liverPersonId == 0 ? undefined : obj.skillName;
		})
	);
	const [livePersonSection, setLivePersonSection] = useState(
		livePerson?.map((obj: any) => {
			return obj.liverPersonId == 0 ? undefined : obj.section;
		})
	);

	const [contactValue, setContactValue] = useState(data[idx].contactDetailValue);

	const removeSelectedChannel = (selectedTypeId: any, selectedTypeName: any) => {
		swal({
			title: 'Confirmation',
			text: 'Channel Contact Details will be removed from the configuration, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				data[idx].contactDetailValue = contactValue;
				data.splice(idx,1);
				
				setRemovedChannelId(0);
				setRemovedChannelId(selectedTypeId);

				return selectedTypeId;
			}
		});
	};

	const validateValue = (value: any) => {
		if (value !== undefined && value !== '') {
			setIsChecked(true);
		} else {
			setIsChecked(false);
		}
	};

	const handleChangeValue = (e: any, id: any) => {
		const value = e.target.value;
		validateValue(e.target.value);

		data?.map((dt) => {
			//for normal contact detail fields
			if (dt.messageTypeId == id) {
				dt.contactDetailValue = value;
			}
		});
		setContactValue(data[idx].contactDetailValue);
	};

	const handleChangeEngagementId = (value: any, id: any) => {
		validateValue(value);
		setLivePersonEngagementId(value);
		//Edit
		livePerson?.map((lp) => {
			lp.engagementID = value;
		});
	};

	const handleChangeAgentId = (value: any, id: any) => {
		validateValue(value);
		setLivePersonAgentId(value);
		//edit
		livePerson?.map((lp) => (lp.agentID = value));
	};

	const handleChangeSkillId = (value: any, id: any) => {
		validateValue(value);
		setLivePersonSkillId(value);

		//edit
		livePerson?.map((lp) => (lp.skillID = value));
	};

	const handleChangeSkillName = (value: any, id: any) => {
		validateValue(value);
		setLivePersonSkillName(value);

		//edit
		livePerson?.map((lp) => (lp.skillName = value));
	};

	const handleChangeSection = (value: any, id: any) => {
		validateValue(value);
		setLivePersonSection(value);

		//edit
		livePerson?.map((lp) => (lp.section = value));
	};

	const handleChangeLiveChatAgent = (value: any, id: any) => {
		validateValue(value);
		setLiveChatAgentId(value);
		//edit

		liveChat?.map((lc) => (lc.agentID = value));
	};

	const handleChangeLiveChatGroupId = (value: any, id: any) => {
		validateValue(value);
		setLiveChatGroupId(value);

		//edit
		liveChat?.map((lc) => (lc.groupID = value));
	};

	const handleChangeLiveChatGroupName = (value: any, id: any) => {
		validateValue(value);
		setLiveChatGroupName(value);

		//edit
		liveChat?.map((lc) => (lc.groupName = value));
	};

	return (
		<>
			{typeName !== LIVEPERSON && typeName !== LIVECHAT && (
				<FormGroupContainer key={idx}>
					<label className='col-form-label col-md-2 col-sm-3' style={{paddingLeft: '50px'}}>
					{selectedTypeName}
					</label>
					<div className='col-md-3 col-sm-2'>
						{/* Add */}
						{remProfileId != 0 && (
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								disabled={isForViewing}
								onChange={(e) => handleChangeValue(e, selectedTypeId)}
								value={data[idx].contactDetailValue}
							/>
						)}
						{/* Edit */}

						{remProfileId == 0 && (
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								disabled={isForViewing}
								value={data[idx].contactDetailValue}
								onChange={(e) => handleChangeValue(e, selectedTypeId)}
							/>
						)}
					</div>
					<div className='col align-self-center col-form-label col-sm-1'>
						{!isForViewing && (
							<>
								{(isChecked || data[idx].contactDetailValue) && (
									<span className='h4 me-4'>
										<FontAwesomeIcon icon={faCheckCircle} title={'Valid'} style={{color: 'green'}} />
									</span>
								)}
								{!isChecked && !data[idx].contactDetailValue &&  (
									<span className='h4 me-4'>
										<FontAwesomeIcon icon={faTimesCircle} title={'Invalid'} style={{color: 'red'}} />
									</span>
								)}

								<span className='h4'>
									<FontAwesomeIcon
										icon={faTrashAlt}
										style={iconStyle}
										title={'Delete'}
										onClick={() => removeSelectedChannel(selectedTypeId, selectedTypeName)}
									/>
								</span>
							</>
						)}
					</div>
				</FormGroupContainer>
			)}
			{/* Live Person Fields */}
			{typeName === LIVEPERSON && (
				<div key={idx}>
					<label className='col-form-label col-md-2 col-sm-3 bold' style={{paddingLeft: '40px'}}>
						{selectedTypeName}
					</label>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 400}}>
							Engagement ID
						</label>
						<div className='col-md-3 col-sm-6'>
							{remProfileId != 0 && (
								<input
									type='text'
									name='engagementId'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeEngagementId(e.target.value, selectedTypeId)}
									value={livePersonEngagementId}
								/>
							)}

							{remProfileId === 0 && (
								<input
									type='text'
									name='engagementId'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeEngagementId(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
						<div className='col align-self-center col-form-label col-sm-1'>
							{!isForViewing && (
								<>
									{livePerson?.map((lp) => {
										if (!lp.engagementID && !lp.agentID && !lp.skillID && !lp.skillName && !lp.section)
											return (
												<span key={lp.livePersonId} className='h4 me-4'>
													<FontAwesomeIcon icon={faTimesCircle} style={{color: 'red'}} />
												</span>
											);
										else {
											return (
												<span key={lp.livePersonId} className='h4 me-4'>
													<FontAwesomeIcon icon={faCheckCircle} style={{color: 'green'}} />
												</span>
											);
										}
									})}
									<span className='h4'>
										<FontAwesomeIcon
											icon={faTrashAlt}
											style={iconStyle}
											title={'Delete'}
											onClick={() => removeSelectedChannel(selectedTypeId, selectedTypeName)}
										/>
									</span>
								</>
							)}
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label' style={{textAlign: right, fontWeight: 300}}>
							Agent ID
						</label>
						<div className='col-md-3 col-sm-6'>
							{remProfileId != 0 && (
								<input
									type='text'
									name='agentId'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeAgentId(e.target.value, selectedTypeId)}
									value={livePersonAgentId}
								/>
							)}

							{remProfileId === 0 && (
								<input
									type='text'
									name='agentId'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeAgentId(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
					</FormGroupContainer>

					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 300}}>
							Skill ID
						</label>
						<div className='col-md-3 col-sm-6'>
							{remProfileId != 0 && (
								<input
									type='text'
									name='skillId'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeSkillId(e.target.value, selectedTypeId)}
									value={livePersonSkillId}
								/>
							)}

							{remProfileId === 0 && (
								<input
									type='text'
									name='skillId'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeSkillId(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 400}}>
							Skill Name
						</label>
						<div className='col-md-3 col-sm-6'>
							{remProfileId != 0 && (
								<input
									type='text'
									name='skillName'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeSkillName(e.target.value, selectedTypeId)}
									value={livePersonSkillName}
								/>
							)}
							{remProfileId === 0 && (
								<input
									type='text'
									name='skillName'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeSkillName(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 400}}>
							Section
						</label>
						<div className='col-md-3 col-sm-6  mb-5'>
							{remProfileId != 0 && (
								<input
									type='text'
									name='section'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeSection(e.target.value, selectedTypeId)}
									value={livePersonSection}
								/>
							)}
							{remProfileId === 0 && (
								<input
									type='text'
									name='section'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeSection(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
					</FormGroupContainer>
				</div>
			)}

			{/* Live Chat */}
			{typeName === LIVECHAT && (
				<div key={idx}>
					<label className='col-form-label col-md-2 col-sm-3' style={{paddingLeft: '40px'}}>
						{selectedTypeName}
					</label>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 400}}>
							Agent ID
						</label>
						<div className='col-md-3 col-sm-6'>
							{remProfileId != 0 && (
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeLiveChatAgent(e.target.value, selectedTypeId)}
									value={liveChatAgentId}
								/>
							)}

							{remProfileId === 0 && (
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeLiveChatAgent(e.target.value, selectedTypeId)}
								/>
							)}
						</div>

						<div className='col align-self-center col-form-label col-sm-1'>
							{!isForViewing && (
								<>
									{liveChat?.map((lv) => {
										if (!lv.agentID && !lv.groupID && !lv.groupName)
											return (
												<span key={lv.liveChatId} className='h4 me-4'>
													<FontAwesomeIcon icon={faTimesCircle} title={'Invalid'} style={{color: 'red'}} />
												</span>
											);
										else
											return (
												<span key={lv.liveChatId} className='h4 me-4'>
													<FontAwesomeIcon icon={faCheckCircle} title={'Valid'} style={{color: 'green'}} />
												</span>
											);
									})}
									<span className='h4'>
										<FontAwesomeIcon
											icon={faTrashAlt}
											style={iconStyle}
											title={'Delete'}
											onClick={() => removeSelectedChannel(selectedTypeId, selectedTypeName)}
										/>
									</span>
								</>
							)}
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 400}}>
							Group ID
						</label>
						<div className='col-md-3 col-sm-6'>
							{remProfileId != 0 && (
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeLiveChatGroupId(e.target.value, selectedTypeId)}
									value={liveChatGroupId}
								/>
							)}
							{remProfileId === 0 && (
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeLiveChatGroupId(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<label className='col-sm-2 col-form-label ' style={{textAlign: right, fontWeight: 400}}>
							Group Name
						</label>
						<div className='col-md-3 col-sm-6 mb-5'>
							{remProfileId != 0 && (
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeLiveChatGroupName(e.target.value, selectedTypeId)}
									value={liveChatGroupName}
								/>
							)}
							{remProfileId === 0 && (
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={isForViewing}
									onChange={(e) => handleChangeLiveChatGroupName(e.target.value, selectedTypeId)}
								/>
							)}
						</div>
					</FormGroupContainer>
				</div>
			)}
		</>
	);
};

export default ChannelDetails;
