import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useState} from 'react';
import {FormControl, InputGroup} from 'react-bootstrap-v5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {faCalendarAlt} from '@fortawesome/free-solid-svg-icons';
import {DefaultButton} from '..';

interface Props {
	format: string;
	value: any;
	onChange: (val: any) => void;
	onOpenCalendar: (val: any) => void;
	onBlur: (val: any) => void;
	onInputClick?: () => void;
	open: boolean;
	componentExtend?: JSX.Element;
	isDisable?: boolean;
	timeFormat?: string;
}

const BasicDateTimePicker: React.FC<Props> = ({
	format,
	value,
	onChange,
	open,
	onOpenCalendar,
	componentExtend,
	onBlur,
	isDisable,
	onInputClick,
	timeFormat,
}) => {
	// const [open, setOpen] = useState<boolean>(false)

	return (
		<>
			<div
				className='col-sm-10'
				style={{position: 'relative'}}
				// onClick={onOpenCalendar}
			>
				<DatePicker
					dateFormat={format}
					selected={value}
					onChange={onChange}
					onInputClick={onInputClick}
					className='form-control form-control-sm'
					open={open}
					onBlur={onBlur}
					showTimeSelect
					timeFormat={timeFormat === '' ? 'HH:mm' : timeFormat}
					timeIntervals={1}
					disabled={isDisable}
				/>
				<FontAwesomeIcon style={{position: 'absolute', top: '5px', right: '5px'}} icon={faCalendarAlt} onClick={onOpenCalendar} />
			</div>
		</>
	);
};

export default BasicDateTimePicker;
