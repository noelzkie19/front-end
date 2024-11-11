import React, { useEffect, useState } from 'react';
import { Col, ModalFooter, Row } from 'react-bootstrap-v5';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import { RootState } from '../../../../../setup';
import { ElementStyle } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import { BasicTextInput, FormModal, MainContainer, MlabButton, RequiredLabel } from '../../../../custom-components';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import { IAuthState } from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import { MessageTypeListResponse, MessageTypePostRequest } from '../../models';
import * as system from '../../redux/SystemRedux';

interface Props {
	data?: MessageTypeListResponse;
	showForm: boolean;
	setModalShow: any;
}

const EditMessageType: React.FC<Props> = ({data, setModalShow, showForm}) => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const postData = useSelector<RootState>(({system}) => system.postMessageTypeList, shallowEqual) as any;
	const systemData = useSelector<RootState>(({system}) => system.getMessageTypeList, shallowEqual) as any;
    const {SwalFailedMessage} = useConstant();

	/**
	 *  ? States
	 */
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [messageType, setMessageType] = useState<string>('');
	const [selectedStatuses, setSelectedStatuses] = useState<any >('');
	const [selectedChannel, setSelectedChannel] = useState<any>([]);
	const [selectedMessageGroup, setSelectedMessageGroup] = useState<any>(undefined);

	/**
	 *  ? Hooks
	 */
	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const {message} = useConstant();
	const dispatch = useDispatch();

	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		if (showForm) {
			
			getMasterReference('189');
			setMessageType(data?.messageTypeName || '');
			setSelectedStatuses(data?.messageTypeStatus === true ? {value: '1', label: 'Active'} : {value: '2', label: 'Inactive'});
		}
	}, [showForm]);

	useEffect(() => {
		if (data?.channelTypeId !== null) {
			let result = masterReferenceOptions.filter((n) => data?.channelTypeId.split(',').includes(n.options.value)).map((obj) => obj.options);
			setSelectedChannel(result);
		}
	}, [masterReferenceOptions]);


	/**
	 *  ? Methods
	 */
	const validateRequiredFields = () => {
		let error: boolean = false;

		if (messageType === '') {
			error = true;
		}

		if (selectedStatuses.value === undefined) {
			error = true;
		}

		if (selectedChannel.length === 0) {
			error = true;
		}

		return error;
	};

	const validateEditMessageTypeSubmit = () => {
		if (validateRequiredFields() === true) {
			swal(SwalFailedMessage.title, message.requiredFields, SwalFailedMessage.icon);
		} else {
			setIsSubmitting(true)
			_dispatchEditTransaction();
		}
	};

	const _dispatchEditTransaction = () => {
		let userAccessId = userId !== undefined ? userId.toString() : '0';
		let storedData = systemData ? systemData : [];

		let newDataToStore = storedData;

		const request: MessageTypeListResponse = {
			messageTypeId: data?.messageTypeId,
			messageTypeName: data?.messageTypeName || '',
			messageTypeStatus: selectedStatuses.value === '1' ? true : false,
			position: data?.position || 0,
			messageChannelTypeName: selectedChannel.map((i: any) => i.label).join(', '),
			channelTypeId: selectedChannel.map((i: any) => i.value).join(', '),
			messageGroupId: selectedMessageGroup != undefined ? selectedMessageGroup?.value : '',
			messageGroupName: selectedMessageGroup != undefined ? selectedMessageGroup?.label : '',
		};

		let itemIndex = newDataToStore.findIndex((obj: MessageTypeListResponse) => obj.messageTypeName === request.messageTypeName);
		newDataToStore[itemIndex].channelTypeId = request.channelTypeId;
		newDataToStore[itemIndex].messageTypeStatus = request.messageTypeStatus;
		newDataToStore[itemIndex].messageGroupName = request.messageGroupName;
		newDataToStore[itemIndex].messageGroupId = request.messageGroupId;
		newDataToStore[itemIndex].messageChannelTypeName = request.messageChannelTypeName;
		request.messageTypeId = newDataToStore[itemIndex].messageTypeId;

		const postRequest: MessageTypePostRequest = {
			id: request.messageTypeId ?? 0,
			messageTypeName: messageType,
			codeListId: 3,
			position: request.position,
			isActive: selectedStatuses.value === '1' ? true : false,
			channelTypeId: selectedChannel.map((i: any) => i.value).join(', '),
			messageGroupId: selectedMessageGroup,
			createdBy: parseInt(userAccessId),
			updatedBy: parseInt(userAccessId),
			action: 'EDIT',
		};

		// CONCAT PASSED DATA TO EXISTING POST DATA STORE
		const newDataToPostStore = postData.concat(postRequest);
		// DISPATCH TOPIC TO POST TABLE REDUX
		dispatch(system.actions.postMessageTypeList(newDataToPostStore));

		// DISPATCH TOPIC TABLE REDUX
		dispatch(system.actions.getMessageTypeList(newDataToStore));
		
		setSelectedMessageGroup(undefined)
		setIsSubmitting(false)
		setModalShow(false);
	};

	const closeEditMessageType = () => {
		setModalShow(false);
	};

	/**
	 *  ? Events
	 */

	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};

	const onChangeSelectedChannel = (val: string) => {
		setSelectedChannel(val);
	};

	return (
		<FormModal headerTitle={'Edit Message Type'} haveFooter={false} show={showForm} customSize={'lg'}>
			<MainContainer>
				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Message Type Name'} />
						<BasicTextInput
							ariaLabel={'Message Type Name'}
							colWidth={'col-sm-12'}
							value={messageType}
							onChange={(e) => {
								setMessageType(e.target.value);
							}}
							disabled={true}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Status'} />
						<Select native size='small' style={{width: '100%'}} options={statusOptions} onChange={onChangeSelectedStatues} value={selectedStatuses} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Channel Type'} />
						<Select
							isMulti
							size='small'
							style={{width: '100%'}}
							options={masterReferenceOptions.flatMap((obj) => obj.options)}
							onChange={onChangeSelectedChannel}
							value={selectedChannel}
						/>
					</Col>
				</Row>
			</MainContainer>

			<ModalFooter style={{border: 0}}>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicWrite)}
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={validateEditMessageTypeSubmit}
				/>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicRead)}
					size={'sm'}
					label={'Close'}
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={closeEditMessageType}
				/>
			</ModalFooter>
		</FormModal>
	);
};

export default EditMessageType;
