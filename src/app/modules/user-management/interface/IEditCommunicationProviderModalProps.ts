import {OptionListModel} from '../../../common/model';

export interface IEditCommunicationProviderModalProps {
	showEditCommunicationProviderModal: boolean;
	setShowEditCommunicationProviderModal: (e: boolean) => void;
	messageTypeOptionList: Array<any>;
	selectedMessageType: any;
	selectedProviderAccountStatus: any;
	onChangeSelectedMessageType: (e: any) => void;
	onChangeSelectedProviderAccountStatus: (e: any) => void;
	textAccountId: string;
	setTextAccountId: (e: string) => void;
	communicationProviderStatusOptions: Array<any>;
	updateCommunicationProvider: () => void;
	isLoadingEditModal: boolean;
	closeEditCommunicationModal: () => void;
	onChangeEditSubscription: (event: any) => void;
	subscriptionEdit: any;
	subcriptionOptionEdit: OptionListModel[];
}
