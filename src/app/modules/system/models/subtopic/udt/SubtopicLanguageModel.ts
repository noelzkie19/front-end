export interface SubtopicLanguageModel {
	subtopicId: number;
	subtopicLanguageId: number;
	languageId: number;
	languageName: string | null;
	subtopicLanguageTranslation: string;
	createdBy?: number;
	updatedBy?: number;
}
