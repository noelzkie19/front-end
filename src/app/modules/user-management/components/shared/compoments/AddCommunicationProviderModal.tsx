import React from 'react';
import {Col, ModalFooter, Row} from 'react-bootstrap-v5';
import Select from 'react-select';
import {ElementStyle, MessageTypeEnum} from '../../../../../constants/Constants';
import {BasicTextInput, FormModal, MainContainer, MlabButton, RequiredLabel} from '../../../../../custom-components';
import {IAddCommunicationProviderModalProps} from '../../../interface';

const AddCommunicationProviderModal: React.FC<IAddCommunicationProviderModalProps> = (Props) => {
	const {
		showAddCommunicationProviderModal,
		setShowAddCommunicationProviderModal,
		messageTypeOptionList,
		selectedMessageType,
		selectedAddProviderAccountStatus,
		onChangeSelectedMessageType,
		onChangeAddSelectedProviderAccountStatus,
		addTextAccountId,
		setAddTextAccountId,
		setSelectedProviderAccountStatus,
		communicationProviderStatusOptions,
		addCommunicationProvider,
		closeAddCommunicationModal,
		isLoadingAddModal,
		subscription,
		subcriptionOption,
		onChangeAddSubscription,
	} = Props;

	return (
		<FormModal headerTitle='Add Communication Provider Account' haveFooter={false} show={showAddCommunicationProviderModal}>
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
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<RequiredLabel title={'Account Id'} />
						<BasicTextInput
							ariaLabel={'Account Id'}
							onChange={(e) => setAddTextAccountId(e.target.value)}
							value={addTextAccountId}
							disabled={false}
							colWidth={'col-sm-12'}
						/>
					</Col>
				</Row>

				{selectedMessageType.value === MessageTypeEnum.Samespace.toString() && (
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Subscription'} />
							<Select size='small' style={{width: '100%'}} options={subcriptionOption} onChange={onChangeAddSubscription} value={subscription} />
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
							onChange={onChangeAddSelectedProviderAccountStatus}
							value={selectedAddProviderAccountStatus}
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
						loading={isLoadingAddModal}
						loadingTitle={'Please wait...'}
						disabled={isLoadingAddModal}
						onClick={addCommunicationProvider}
					/>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Close'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={isLoadingAddModal}
						loadingTitle={'Please wait...'}
						disabled={isLoadingAddModal}
						onClick={closeAddCommunicationModal}
					/>
				</ModalFooter>
			</MainContainer>
		</FormModal>
	);
};

export default AddCommunicationProviderModal;
