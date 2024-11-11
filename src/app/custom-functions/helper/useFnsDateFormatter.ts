import {format} from 'date-fns';
import useConstant from '../../constants/useConstant';

export default function useFnsDateFormatter() {
	const {FnsDateFormatPatterns} = useConstant();

	const mlabFormatDate = (dateInput: any, pattern?: string) => {
		const datePattern = pattern ?? FnsDateFormatPatterns.mlabDateFormat;
		let formattedDate = '';
		try {
			if (dateInput !== undefined) {
				const newDate = format(new Date(dateInput.toString()), datePattern);
				formattedDate = newDate;
			}
		} catch (error) {
			console.log(error, '---date');
			formattedDate = '';
		}
		return formattedDate;
	};

	return {
		mlabFormatDate,
	};
}
