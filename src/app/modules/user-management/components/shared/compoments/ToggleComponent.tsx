
interface ToggleProps {
    toggleId: string;
    toggleChange: (e: any) => void;
    toggleDefaultValue: boolean;
    toggleTagging: string; //Read or Write Only
    isDisabled: boolean
}

const ToggleComponent = ({ toggleId, toggleChange, toggleDefaultValue, toggleTagging, isDisabled }: ToggleProps) => {
    return (
        <div className='form-check form-switch form-check-custom form-check-solid'>
            <input
                className='form-check-input input-edit'
                type='checkbox'
                value=''
                id={toggleId}
                onChange={(event) => toggleChange(event.target.checked)}
                defaultChecked={toggleDefaultValue}
                disabled={isDisabled}
            />
            <div className='form-check-label'>{toggleTagging}</div>
        </div>
    )
}

export default ToggleComponent