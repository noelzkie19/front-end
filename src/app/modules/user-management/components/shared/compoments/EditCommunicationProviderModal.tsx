import React from 'react';
import {Col, ModalFooter, Row} from 'react-bootstrap-v5';
import Select from 'react-select';
import {ElementStyle, MessageTypeEnum} from '../../../../../constants/Constants';
import {BasicTextInput, FormModal, MainContainer, MlabButton, RequiredLabel} from '../../../../../custom-components';
import {IEditCommunicationProviderModalProps} from '../../../interface';

const EditCommunicationProviderModal: React.FC<IEditCommunicationProviderModalProps> = (Props) => {
	const {
		showEditCommunicationProviderModal,
		setShowEditCommunicationProviderModal,
		messageTypeOptionList,
		selectedMessageType,
		selectedProviderAccountStatus,
		onChangeSelectedMessageType,
		onChangeSelectedProviderAccountStatus,
		textAccountId,
		setTextAccountId,
		communicationProviderStatusOptions,
		updateCommunicationProvider,
		isLoadingEditModal,
		closeEditCommunicationModal,
		onChangeEditSubscription,
		subscriptionEdit,
		subcriptionOptionEdit,
	} = Props;

	return (
		<FormModal headerTitle='Edit Communication Provider Account' haveFooter={false} show={showEditCommunicationProviderModal}>
			<MainContainer>
				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Message Type'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={messageTypeOptionList}
							onChange={onChangeSelectedMessageType}
							value={selectedMessageType}
							isDisabled={true}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Account Id'} />
						<BasicTextInput
							ariaLabel={'Account Id'}
							onChange={(e) => setTextAccountId(e.target.value)}
							value={textAccountId}
							disabled={false}
							colWidth={'col-sm-12'}
						/>
					</Col>
				</Row>

				{selectedMessageType.value === MessageTypeEnum.Samespace.toString() && (
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Subscription'} />
							<Select
								size='small'
								style={{width: '100%'}}
								options={subcriptionOptionEdit}
								onChange={onChangeEditSubscription}
								value={subscriptionEdit}
							/>
						</Col>
					</Row>
				)}

				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Status'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={communicationProviderStatusOptions}
							onChange={onChangeSelectedProviderAccountStatus}
							value={selectedProviderAccountStatus}
						/>
					</Col>
				</Row>

				<ModalFooter>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Submit'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						loading={isLoadingEditModal}
						loadingTitle={'Please wait...'}
						disabled={isLoadingEditModal}
						onClick={updateCommunicationProvider}
					/>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Close'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={isLoadingEditModal}
						loadingTitle={'Please wait...'}
						disabled={isLoadingEditModal}
						onClick={closeEditCommunicationModal}
					/>
				</ModalFooter>
			</MainContainer>
		</FormModal>
	);
};

export default EditCommunicationProviderModal;
