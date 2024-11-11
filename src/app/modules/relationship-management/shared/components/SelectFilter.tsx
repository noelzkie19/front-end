import React from 'react';
import {LookupModel} from '../../../../shared-models/LookupModel';
import Select from 'react-select';
import {OverlayTrigger, Tooltip} from 'react-bootstrap-v5';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

type SelectFilterProps = {
	label: string;
	value: any;
	options: Array<LookupModel>;
	isMulti: boolean;
	isRequired?: boolean;
	onChange: (value: any) => void;
	isClearable?: boolean;
	isDisabled?: boolean;
	showToolTip?: boolean;
	tooltipText?: string;
	closeMenuOnSelect?: boolean;
	hasDependency?: boolean; 
};

const SelectFilter = ({label, value, options, isMulti, isRequired = false, onChange, isClearable = false, isDisabled = false, showToolTip = false, tooltipText, closeMenuOnSelect = true, hasDependency = false}: SelectFilterProps) => {
	const handleOnChange = (val: any) => {
		onChange(val);
	};
	const renderTooltip = () => (
		<Tooltip id='button-tooltip'>
			<label className='row col-form-label col-sm' key={tooltipText}>{tooltipText}</label>
		</Tooltip>
	);
	return (
		<div className='col-md-12 col-xs-12'>
			{ 
				label && label.trim() != "" &&
				<p className={`p-0 m-0 my-1 filter-label ${isRequired ? 'required' : ''}`}>
					{label}
					{
						showToolTip && 
						<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={renderTooltip()}>
							<FontAwesomeIcon icon={faInfoCircle} className='fa-1x' style={{marginLeft: 12}} />
						</OverlayTrigger>
					}

				</p>
			}
			<Select
				native
				isMulti={isMulti}
				size='small'
				isClearable={isClearable}
				style={{width: '100%'}}
				menuPortalTarget={document.body}
				styles={{menuPortal: (base: any) => ({...base, zIndex: 9999})}}
				options={options}
				onChange={handleOnChange}
				value={value}
				isDisabled={isDisabled}
				closeMenuOnSelect={closeMenuOnSelect}
			/>
		</div>
	);
};
export default SelectFilter;
