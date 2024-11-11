type TextFilterProps = {
	label: string;
	value: string;
	onChange: (value: any) => void;
};

const TextFilter = ({label, value, onChange}: TextFilterProps) => {
	return (
		<div className='col-md-12 col-xs-12'>
			<p className='p-0 m-0 my-1 filter-label'>{label}</p>
			<input
				type='text'
				className='form-control form-control-sm '
				name='ReM Profile Name'
				value={value}
				onChange={(val: any) => onChange(val.target.value)}
			/>
		</div>
	);
};

export default TextFilter;
