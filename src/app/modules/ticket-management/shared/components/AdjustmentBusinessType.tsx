import { useEffect, useState } from "react";
import { SelectFilter } from "../../../relationship-management/shared/components";
import { LookupModel } from "../../../../shared-models/LookupModel";
import { FieldMappingResponseModel } from "../../models/ticket-config/FieldMappingResponseModel";

interface AdjustmentBusinessTypeProps {
    field: FieldMappingResponseModel,
    viewOnly: boolean,
    updateDynamicTicket: any,
    businessReasonList: Array<LookupModel>
}

const AdjustmentBusinessType: React.FC<AdjustmentBusinessTypeProps> = ({ field, updateDynamicTicket, viewOnly, businessReasonList }) => {
    const [adjustmentBusinessValue, setAdjustmentBusinessValue] = useState<LookupModel>();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    
    useEffect(() => {
        setIsDisabled(viewOnly)
        return () => { }
    }, [viewOnly])

    const handleOnChange = (e: any) => {
        setAdjustmentBusinessValue(e);
        updateDynamicTicket(field.fieldId, e.value.toString());
    }

    return (
        <div className='d-flex w-100'>
            <div aria-label={`${field.fieldMappingId}-${field.fieldName}`} className='d-flex flex-column w-100' style={{ paddingRight: '1rem', marginBottom: '10px' }}>
                <div className={`col-form-label col-sm ${field.isRequired && 'required'}`} style={{ paddingTop: '0' }} >{field.fieldName}</div>
                <div className='d-flex align-items-center' >
                    <div className='col-lg-9' style={{ paddingRight: '1rem' }}>
                        <SelectFilter
                            key={field.fieldId}
                            isMulti={false}
                            options={businessReasonList}
                            label=""
                            onChange={handleOnChange}
                            value={adjustmentBusinessValue}
                            isRequired={field.isRequired}
                            isDisabled={isDisabled}
                            showToolTip={true}
                            tooltipText='test'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdjustmentBusinessType;