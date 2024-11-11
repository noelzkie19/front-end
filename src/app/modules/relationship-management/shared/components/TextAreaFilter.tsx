import React from 'react'
type TextAreaFilterProps = {
	label: string;
	value: string;
	onChange: (value: any) => void;
};

const TextAreaFilter: React.FC<TextAreaFilterProps> = ({label, value, onChange}: TextAreaFilterProps) => {
    return (
		<div className='col-md-12 col-xs-12'>
			<p className='p-0 m-0 my-1 filter-label'>{label}</p>
            <textarea 
            rows={1}
            className='form-control form-control-sm '
            name={label}
            value={value}
            onChange={(val: any) => onChange(val.target.value)}
            />
		</div>
	);
}

export default TextAreaFilter