import {DefaultDateRangePicker} from '../../../../custom-components';
type DateRangeFilterProps = {
	label: string;
	value: Array<string>;
	onChange: (value: any) => void;
};
const DateRangeFilter = ({label, value, onChange}: DateRangeFilterProps) => {
	return (
		<div className='col-md-12 col-xs-12'>
			<label>{label}</label>
			<DefaultDateRangePicker format='dd/MM/yyyy HH:mm:ss' maxDays={180} onChange={(val: any) => onChange(val)} value={value} />
		</div>
	);
};

export default DateRangeFilter;
