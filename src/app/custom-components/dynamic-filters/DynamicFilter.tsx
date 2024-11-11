import { useEffect, useState } from "react";
import TextFilter from "../../modules/relationship-management/shared/components/TextFilter";
import SelectFilter from "../../modules/relationship-management/shared/components/SelectFilter";
import { DateRangePicker, InputGroup } from "rsuite";
import { TextAreaFilter } from "../../modules/relationship-management/shared/components";
import { Col } from "react-bootstrap-v5";
import MlabButton from "../buttons/MlabButton";
import { ElementStyle } from "../../constants/Constants";

interface Props {
	onChange: Function,
    label: any,
    type: any,
    option?: any,
    showToolTip?: boolean,
    tooltipText?: any
    isRequired?: boolean,
    isMulti?: boolean ,
    isDisabled?: boolean,
    format?: string,
    dateChange?: any,
    style?: any,
    disabled?: boolean,
    ariaLabel?: string,
    inputType?: any,
    title?: any,
    inputChange?: any,
    inputGroupTitle?: any,
    textAreaChange?: any,
    resetFilter?: boolean,
    buttonDisplay?: any,
    handleButtonClick?: any,
    subElementLabel?: any,
    selectGroupTitle?: any,
    isDisabledSubElement?: any,
    onChangeSubElement?: any,
    hasDataClearDependency?: any,
    clearTextField?:boolean,
}


const DynamicFilter: React.FC<Props> = (Props) => {
    const { onChange, label, type , option ,isRequired , tooltipText ,isMulti = false , isDisabled, format, dateChange , style , disabled = true , ariaLabel ,
         inputType , title , inputChange , inputGroupTitle , textAreaChange , resetFilter = false , buttonDisplay , handleButtonClick, subElementLabel, selectGroupTitle, isDisabledSubElement, onChangeSubElement, hasDataClearDependency, clearTextField } = Props;
    const [value, setValue] = useState<any>()
    const [dateValue, setDateValue] = useState<any>()
    const [textAreaValue, setTextAreaValue] = useState<any>()
    const [checkboxValue, setCheckboxValue] = useState<boolean>(false)
    
    useEffect(() => {
        if (resetFilter) {
            setValue(null);
            setDateValue('');
            setTextAreaValue('');
            setCheckboxValue(false)
        }
    }, [resetFilter]);
    
    useEffect(() => {
       if (hasDataClearDependency) {
        setValue(null)
       }
    }, [hasDataClearDependency]);

    useEffect(() => {
        if (isDisabledSubElement) {
            setCheckboxValue(false)
        }
    }, [isDisabledSubElement]);

    useEffect(() => {
        if (clearTextField) {
            setValue('')
        }
    }, [clearTextField]);

    const handleOnChange = (val: any) => {
        setValue(val)
        onChange(val)
    }

    const handleDateChange = (val: any) => {
        setDateValue(val)
        dateChange(val)
    }

    const handleInputChange = (val: any) => {
        
        setValue(val.target.value)
        inputChange(val)
    }

    const handleTextAreaChange = ( val: any) => {
        setTextAreaValue(val)
        textAreaChange(val)
    }

    const handleCheckboxChange = (val: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = val.target.checked;
        setCheckboxValue(isChecked);
        onChangeSubElement(isChecked)

    }


    switch (type) {
        case 'select':
        return (
            <div className='col-12'>
            <SelectFilter
                tooltipText={tooltipText}
                isRequired={isRequired}
                isMulti={isMulti}
                label={label}
                options={option}
                onChange={handleOnChange}
                value={value}
                isDisabled={isDisabled}
                hasDependency={hasDataClearDependency}
            />
            </div>
        )
        case 'text':
        return (
            <div className='col-12'>
            <TextFilter label={label} onChange={handleOnChange} value={value} />
            </div>
        )
        case 'date-select':
        return (
            <div className='col-12'>
					<SelectFilter
						isRequired={isRequired}
						isMulti={isMulti}
						label={label}
						options={option}
						onChange={handleOnChange}
						value={value}
					/>
					<DateRangePicker
						format={format}
						onChange={handleDateChange}
						style={style}
						value={dateValue}
						disabled={disabled}
					/>
				</div>
        )
        case 'input':
        return(
            <div className='col-12'>
                <p className='p-0 m-0 my-1 filter-label'>{title}</p>
                <input
                    type={inputType}
                    className='form-control form-control-sm'
                    aria-label={ariaLabel}
                    disabled={disabled}
                    onChange={handleInputChange}
                    value={value}
                />
            </div>
        )
        case 'input-group':
        return (
            <div className='col-12'>
            <label>{inputGroupTitle}</label>
                <InputGroup>
                        <Col>
                        <SelectFilter
                                label=''
                                isMulti={isMulti}
                                isRequired={isRequired}
                                options={option}
                                onChange={handleOnChange}
                                value={value}
                        />
                        <TextAreaFilter
                                label=''
                                onChange={handleTextAreaChange}
                                value={textAreaValue}
                            />
                        </Col>
                       
                </InputGroup>
            </div>
        
        )
        case 'button':
            return(
                <div className='col-12'>
                <MlabButton
                    access={true}
                    label='Topic/Subtopic Filter'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    loading={false}
                    loadingTitle={'Please wait...'}
                    disabled={disabled}
                    onClick={handleButtonClick}
                />
                <label style={{fontStyle: 'italic', marginTop: '5px', display: 'block'}}>{buttonDisplay}</label>
                </div>
            )
            case 'select-with-checkbox-group':
                return (
                    <div className='col-12'>
                    <label>{selectGroupTitle}</label>
                       
                                <Col>
                                <SelectFilter
                                        label=''
                                        isMulti={isMulti}
                                        isRequired={isRequired}
                                        options={option}
                                        onChange={handleOnChange}
                                        value={value}
                                />
                                <div className='d-flex align-items-center my-2'> 
                                    <input
                                        className='form-check-input' 
                                        type='checkbox'
                                        checked={checkboxValue}
                                        onChange={handleCheckboxChange}
                                        disabled={isDisabledSubElement}
                                        style={{ margin: '0 5px 0 0' }} 
                                    />
                                    <span className='form-check-label' style={{ fontStyle: 'italic' }}>
                                        {subElementLabel}
                                    </span>
                                </div>

                                </Col>
                               
                    </div>
                
                )
        default:
        return <></>
    }

}
 export default DynamicFilter;