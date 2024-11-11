export interface FileListResponseModel {
    fileName: string,
    originalFileName: string,
    base64Text: string,
    file: File,
    blob: Blob,
    referenceId: number
}