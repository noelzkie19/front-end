import { dataType } from "../../constants/Constants";

export function isEmpty(value: any){
		const whatType = typeof value;
		switch (whatType) {
			case dataType.string.toString():
				return Boolean(value.trim() === '' || value === null || value === undefined);
			case dataType.number.toString():
			case dataType.undefined.toString():
			case dataType.object.toString():
				return Boolean(value === 0 || value === null || value === undefined);
			default:
				break;
		}
	};

export function getInvalidHtmlTags(htmlString: string,validTags:string[]){
	// Create a temporary div element
	const tempDiv = document.createElement('div');
	// Set the HTML content of the div element
	tempDiv.innerHTML = htmlString;
	// Get all elements within the div
	const elements = tempDiv.getElementsByTagName('*');
	
	let invalidTags:string[]=[];
	// Loop through each element
	for (const element of elements) {
		// Check if the tag name of the element is not in the allowed list
		if (!validTags.includes(element.tagName)) {
			invalidTags.push(element.tagName);
		}
	}
	return invalidTags;
};	