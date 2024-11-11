export interface CommunicationReviewAccordionModel {
	accordionIndex: number;
	headerId: number; // reviewee Id
	header: string; // reviewee name
	recordCount: number;
	isOpen: boolean;
}