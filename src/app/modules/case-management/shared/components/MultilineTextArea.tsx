import React from 'react'
type MultilineTextAreaProps = {
	label: string;
	value: string;
  disabled: boolean;
	onChange: (value: any) => void;
};

const MultilineTextArea: React.FC<MultilineTextAreaProps> = ({label, value, disabled, onChange}: MultilineTextAreaProps) => {
    return (
      <div className='col-md-12 col-xs-12'>
        <textarea rows={5}
          className='form-control form-control-sm '
          aria-label={label}
          value={value}
          onChange={(val: any) => onChange(val.target.value)}
          disabled={disabled} />
      </div>
    );
}

export default MultilineTextArea