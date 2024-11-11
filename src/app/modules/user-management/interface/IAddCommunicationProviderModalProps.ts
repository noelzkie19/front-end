import {OptionListModel} from '../../../common/model';

export interface IAddCommunicationProviderModalProps {
	showAddCommunicationProviderModal: boolean;
	setShowAddCommunicationProviderModal: (e: boolean) => void;
	messageTypeOptionList: Array<any>;
	selectedMessageType: any;
	selectedAddProviderAccountStatus: any;
	onChangeSelectedMessageType: (e: any) => void;
	onChangeAddSelectedProviderAccountStatus: (e: any) => void;
	addTextAccountId: string;
	setAddTextAccountId: (e: string) => void;
	setSelectedProviderAccountStatus: (e: any) => void;
	communicationProviderStatusOptions: Array<any>;
	addCommunicationProvider: () => void;
	closeAddCommunicationModal: () => void;
	isLoadingAddModal: boolean;
	subscription: any;
	subcriptionOption: OptionListModel[];
	onChangeAddSubscription: (event: any) => void;
}
