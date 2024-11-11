export interface SubtopicDetailsModel {
	id: number;
	subtopicName: string;
	position: number;
	isActive: boolean;
	statusName: string;
	createdBy?: number;
	updatedBy?: number;
}
