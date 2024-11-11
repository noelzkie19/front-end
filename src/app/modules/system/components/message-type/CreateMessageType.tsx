import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { ModalFooter } from 'react-bootstrap-v5';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import * as Yup from 'yup';
import { RootState } from '../../../../../setup';
import { MasterReferenceOptionModel } from '../../../../common/model';
import {
	ContentContainer,
	DefaultSecondaryButton,
	ErrorLabel,
	FieldContainer,
	FormContainer,
	FormModal,
	LoaderButton,
	MainContainer,
	SearchTextInput
} from '../../../../custom-components';
import { useMasterReferenceOption } from '../../../../custom-functions';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import { MessageTypeListResponse, MessageTypePostRequest } from '../../models';
import * as system from '../../redux/SystemRedux';
import { validateMessageTypeName } from '../../redux/SystemService';
import useConstant from '../../../../constants/useConstant';

const initialValues = {
	name: '',
	status: '',
	channelTypeName: '',
	channelTypeId: '',
	messageGroupId: '',
	messageGroupName: ''
};

const FormSchema = Yup.object().shape({
	topicName: Yup.string(),
});

interface Props {
	showForm: boolean;
	closeModal: () => void;
	editMode: boolean;
	messageType?: MessageTypeListResponse;
	reloadData: () => void;
}

interface StatusOption {
	value: number;
	label: string;
}

const CreateMessageType: React.FC<Props> = ({showForm, closeModal, editMode, messageType, reloadData}) => {
	const dispatch = useDispatch();
	const {successResponse} = useConstant();

	//  Get redux store
	const systemData = useSelector<RootState>(({system}) => system.getMessageTypeList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const postData = useSelector<RootState>(({system}) => system.postMessageTypeList, shallowEqual) as any;

	//  States
	const [messageTypeInfo, setMessageTypeInfo] = useState<MessageTypeListResponse | undefined>(messageType);
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [selectedChannel, setSelectedChannel] = useState<any>([]);
	const [selectedMessageGroup, setSelectedMessageGroup] = useState<any>(undefined);
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	//  Variables
	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const messageGroupOptions =  useMasterReferenceOption('287')
	.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 287)
	.map((x: MasterReferenceOptionModel) => x.options);

	//  Watcher
	useEffect(() => {
		setLoading(false);
		setHasErrors(false);
		setErrorMessage('');
		formik.setFieldValue('name', null);
		setSelectedStatuses('');
		setSelectedChannel([]);
		setSelectedMessageGroup(undefined);
		getMasterReference('189');

		if (!editMode) {
			formik.setFieldValue('name', '');
		}

		if (editMode && messageType !== undefined) {
			setMessageTypeInfo(messageType);
			formik.setFieldValue('name', messageType.messageTypeName);
			setSelectedStatuses(messageType.messageTypeStatus ? statusOptions[0] : statusOptions[1]);
		}

		if (editMode && messageType?.messageGroupId !== null) {
			let result = messageGroupOptions.find((n) => messageType?.messageGroupId == n.value);
			setSelectedMessageGroup(result);
		}
	}, [showForm]);

	useEffect(() => {
		if (editMode && messageType?.channelTypeId !== null) {
			let filteredArrays = masterReferenceOptions.map((obj) => obj.options).filter((el) => messageType?.channelTypeId.includes(el.value));
			setSelectedChannel(filteredArrays);
		}
	}, [masterReferenceOptions]);


	//  Methods
	const _dispatchTransaction = (name: string, status: string, channelTypeId: string, channelTypeName: string, messageGroupId: string, messageGroupName: string) => {
		// CHECK IF SYSTEM STORES HAVE DATA
		let storedData = systemData ? systemData : [];
		let postDatas = postData ? postData : [];

		let newDataToStore = storedData;
		if (editMode) {
			const editDataObj = {
				name: name,
				status: status,
				channelTypeId: channelTypeId,
				channelTypeName: channelTypeName,
				messageGroupId: messageGroupId,
				messageGroupName: messageGroupName,

			}
			dispatchEditProcess(editDataObj, newDataToStore, postDatas)
		} else {
			const request: MessageTypeListResponse = {
				messageTypeId: 0,
				messageTypeName: name,
				messageTypeStatus: status === '1' ? true : false,
				position: 0,
				messageChannelTypeName: channelTypeName,
				channelTypeId: channelTypeId,
				messageGroupId: messageGroupId,
				messageGroupName: messageGroupName
			};

			newDataToStore = storedData.concat(request);

			const postRequest: MessageTypePostRequest = {
				id: 0,
				messageTypeName: name,
				codeListId: 3,
				position: 0,
				isActive: status === '1' ? true : false,
				channelTypeId: channelTypeId,
				messageGroupId: messageGroupId,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				action: 'ADD',
			};

			// CONCAT PASSED DATA TO EXISTING POST DATA STORE
			const newDataToPostStore = postDatas.concat(postRequest);
			// DISPATCH TOPIC TO POST TABLE REDUX
			dispatch(system.actions.postMessageTypeList(newDataToPostStore));

			// DISPATCH TOPIC TABLE REDUX
			dispatch(system.actions.getMessageTypeList(newDataToStore));
		}
	};

	const dispatchEditProcess = (editDataObj: any, newDataToStore: any, postDatas: any) => {
		const request: MessageTypeListResponse = {
			messageTypeId: messageTypeInfo !== undefined ? messageTypeInfo?.messageTypeId : 0,
			messageTypeName: editDataObj.name,
			messageTypeStatus: editDataObj.status === '1' ? true : false,
			position: messageTypeInfo !== undefined ? messageTypeInfo?.position : 0,
			messageChannelTypeName: editDataObj.channelTypeName,
			channelTypeId: editDataObj.channelTypeId,
			messageGroupId: editDataObj.messageGroupId,
			messageGroupName: editDataObj.messageGroupName,
		};

		let itemIndex = newDataToStore.findIndex((obj: MessageTypeListResponse) => obj.messageTypeName === request.messageTypeName);
		newDataToStore[itemIndex].channelTypeId = request.channelTypeId;
		newDataToStore[itemIndex].messageChannelTypeName = request.messageChannelTypeName;
		newDataToStore[itemIndex].messageTypeStatus = request.messageTypeStatus;
		newDataToStore[itemIndex].messageGroupId = request.messageGroupId;
		newDataToStore[itemIndex].messageGroupName = request.messageGroupName;
		request.messageTypeId = newDataToStore[itemIndex].messageTypeId;

		const postRequest: MessageTypePostRequest = {
			id: request.messageTypeId ?? 0,
			messageTypeName: editDataObj.name,
			codeListId: 3,
			position: request.position,
			isActive: editDataObj.status === '1' ? true : false,
			channelTypeId: editDataObj.channelTypeId,
			messageGroupId: editDataObj.messageGroupId,
			createdBy: userAccessId,
			updatedBy: userAccessId,
			action: 'EDIT',
		};
		const newDataToPostStore = postDatas.concat(postRequest);
		dispatch(system.actions.postMessageTypeList(newDataToPostStore));
		dispatch(system.actions.getMessageTypeList([]));
		dispatch(system.actions.getMessageTypeList(newDataToStore));
		reloadData();
	}

	function onChangeSelectedStatues(val: string) {
		setSelectedStatuses(val);
	}

	function onChangeSelectedChannel(val: string) {
		setSelectedChannel(val);
	}

	function onChangeSelectedMessageGroup(val: any) {
		setSelectedMessageGroup(val);
	}

	const _validateTransaction = (name: string, status: string, channelTypeId: string, channelTypeName: string, messageGroupId: string) => {
		let storedData = systemData ? systemData : [];

		let isError: boolean = false;

		if (name === '' || name === undefined || name === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up the mandatory fields');
			isError = true;
		}

		if (status === '' || status === undefined || status === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up the mandatory fields');
			isError = true;
		}

		if (channelTypeId === '' || channelTypeId === undefined || channelTypeId === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up the mandatory fields');
			isError = true;
		}

		if (messageGroupId === '' || messageGroupId === undefined || messageGroupId === null) {
			setHasErrors(true);
			setErrorMessage('Unable to proceed, kindly fill up the mandatory fields');
			isError = true;
		}
		// -- VALIDATE VALUES IF EXISTING ON TABLE -- //
		let searchValue = [storedData][0].find((x: MessageTypeListResponse) => x.messageTypeName.toLowerCase() === name.toLowerCase());

		if (searchValue != undefined && !editMode) {
			setHasErrors(true);
			setErrorMessage('Value already exists, please use the search filter to find them');
			isError = true;
		}

		return isError;
	};

	//  Formik form post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);

			// -- SET TOPIC STATUS ON -- //
			values.status = selectedStatuses.value;
			const selectedChannelSorted = selectedChannel.sort((s: any, t: any) => {
				return parseInt(s.value) - parseInt(t.value);
			});

			values.channelTypeId = selectedChannelSorted.value ? selectedChannelSorted.value : selectedChannelSorted.map((i: any) => i.value).join(',');
			values.channelTypeName = selectedChannelSorted.label ? selectedChannelSorted.label : selectedChannelSorted.map((i: any) => i.label).join(', ');

			values.messageGroupId = selectedMessageGroup != undefined ? selectedMessageGroup.value : undefined;
			values.messageGroupName = selectedMessageGroup != undefined ? selectedMessageGroup.label : undefined;

			// -- VALIDATE VALUES IF EMPTY OR NULL --//
			let isError = _validateTransaction(values.name, values.status, values.channelTypeId, values.channelTypeName, values.messageGroupId);

			// -- VALIDATION SATISFIED PROCEED TO TRANSACTION --//
			if (isError === false) {
				// -- VALIDATE IF EXIST ON DATABASE --//
				validateMessageTypeName(values.name)
					.then((response) => {
						if (response.data.status === successResponse || (editMode && response.data.message == 'Message Type already exist')) {
							// IF SUCCESS THEN PROCEED TO TRANSACTION
							_dispatchTransaction(values.name, values.status, values.channelTypeId, values.channelTypeName, values.messageGroupId, values.messageGroupName);
							resetForm();
							setHasErrors(false);
							setErrorMessage('');
						} else {
							isError = true;
							setHasErrors(true);
							setErrorMessage(response.data.message);
						}
					})
					.catch(() => {
						isError = true;
						setHasErrors(true);
						setErrorMessage('Connection error Please close the form and try again');
					});

				formik.setFieldValue('name', null);
			}
			setSubmitting(false);
		},
	});

	//  Return element
	return (
		<FormModal headerTitle={(editMode ? 'Edit ' : 'Add ') + 'Message Type'} haveFooter={false} show={showForm} customSize={'lg'}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
						<FieldContainer>
							<label className={'form-label-sm ' + (!editMode ? 'required' : '')}>Message Type Name</label>
							<SearchTextInput ariaLabel={'Message Type Name'} disabled={editMode} {...formik.getFieldProps('name')} />
						</FieldContainer>

						<FieldContainer>
							<label className='form-label-sm required'>Status</label>
							<Select
								native
								size='small'
								style={{width: '100%'}}
								options={statusOptions}
								onChange={onChangeSelectedStatues}
								value={selectedStatuses}
							/>
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Channel Type</label>
							<Select
								native
								size='small'
								isMulti
								style={{width: '100%'}}
								options={masterReferenceOptions.flatMap((obj) => obj.options)}
								onChange={onChangeSelectedChannel}
								value={selectedChannel}
							/>
						</FieldContainer>
						<FieldContainer>
							<label className='form-label-sm required'>Message Group</label>
							<Select
								native
								size='small'
								style={{width: '100%'}}
								options={messageGroupOptions}
								onChange={onChangeSelectedMessageGroup}
								value={selectedMessageGroup}
							/>
						</FieldContainer>
					</ContentContainer>
				</MainContainer>
				<ModalFooter style={{border: 0}}>
					<LoaderButton access={true} title={'Submit'} loading={loading} disabled={formik.isSubmitting} loadingTitle={'Please wait ...'} />
					<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default CreateMessageType;
