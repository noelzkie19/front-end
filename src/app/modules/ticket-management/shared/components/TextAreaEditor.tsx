import { useEffect, useState } from "react";
import { MLabQuillEditor } from "../../../../custom-components";
import { TicketFieldSizes } from "../../constants/useConstant";
import { DynamicTicketModel } from "../../models/ticket-config/DynamicTicketModel";
import { useTicketManagementHooks } from "../hooks/useTicketManagementHooks";


const TextAreaEditor = ({ field, dynamicTicketForm, updateDynamicTicket, currentTicketId, viewOnly, fromModal, defaultSize }: any) => {
    const { formatFieldSelector } = useTicketManagementHooks();
    const [inputValue, setInputValue] = useState<string>("")
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [labelColor, setLabelColor] = useState<string>('')
    const [requiredField, setRequiredField] = useState<boolean>(false);
    
    const isTextAreadRequired = (field: any) => field.isSupersedeOptional !== undefined ? false : field.isRequired;
    const isDynamicTextEditorRequired = (findDynamicRecord: any) => findDynamicRecord.isSupersedeOptional !== undefined ? false : findDynamicRecord.fieldRequired;
    
    useEffect(() => {
      setLabelColor('');

      if (!dynamicTicketForm || dynamicTicketForm.length === 0)
         return
         
      setRequiredField(isTextAreadRequired(field)) 

      let findDynamicRecord = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === field.fieldMappingId)
      setRequiredField(isDynamicTextEditorRequired(findDynamicRecord)) 
      if (!findDynamicRecord) return
  
      if (!findDynamicRecord.fieldActive) {
        setIsDisabled(true)
      }
      return () => { }
    }, [dynamicTicketForm])
  

    useEffect(() => {
      if (!viewOnly) return
  
      if(!fromModal) {      
        setIsDisabled(true)
      }
      return () => { }
    }, [viewOnly])


  const onChangeTextInput = (e: any) => {
    //Text Input Constraints Logic
    const getConstraints = JSON.parse(field.fieldConstraint)
    if (getConstraints !== null) {
      const maxLengthConstraint = getConstraints.hasOwnProperty("MaxLength")
      if (maxLengthConstraint) {
        if (e.currentTarget.value.length > getConstraints["MaxLength"]) return
      }
    }
    //Text Input Constraints Logic
    setInputValue(e.currentTarget.value)
    updateDynamicTicket(field.fieldId, e.currentTarget.value)

  }
    return (
        <div id={formatFieldSelector(field.fieldMappingId, field.fieldName)} aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(fromModal || defaultSize) ? "Default" : field.fieldSizeName as keyof typeof TicketFieldSizes]}>
            <div className={`col-form-label col-sm ${requiredField && 'required'} ${labelColor ?? ''}`} >{field.fieldName}</div>
            <MLabQuillEditor
						isUploadToMlabStorage={true}
						uploadToMlabStorage={undefined}
            heightProps={'200px'}
						quillValue={inputValue}
						setQuillValue={(content: string) => {
							onChangeTextInput(content);
						}}
            isReadOnly= {isDisabled}
						hasImageToEditor={true}
					/>
       
        </div>
)


};
export default TextAreaEditor