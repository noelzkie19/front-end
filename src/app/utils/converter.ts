export const convertToBlob = (b64Data: any, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

 export const convertBlobImageToFile = (b64Data: any) => {
    // Convert Base64 string to Blob
    const blob = convertToBlob(b64Data, 'image/');
    
    // Convert Blob to File
    const file = new File([blob], 'filename', { type: 'image/' });
    
    return file;
  };

    // Function to convert date into ISO
  export const convertDateIntoISO = (selectedDate: any) => {
    // Parse the validation period string to obtain date object

    const dateObj = new Date(selectedDate);
    
    // Extract date components
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    
    // Extract time components
    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    const seconds = ('0' + dateObj.getSeconds()).slice(-2);
    
    // Construct the ISO 8601 formatted string
    const isoFormattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    
    return isoFormattedDate;
  }