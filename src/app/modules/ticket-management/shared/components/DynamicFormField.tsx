
import LookUps from './LookUps';
import TextInput from './TextInput';
import TextInputWithSearch from './TextInputWithSearch';
import NumberInput from './NumberInput';
import DropdownSingleSelectionToTextDisplay from './DropdownSingleSelectionToTextDisplay';
import DatetimePicker from './DatetimePicker';
import TextDisplay from './TextDisplay';
import DisplayField from './DisplayField';
import AdjustmentBusinessType from './AdjustmentBusinessType';
import TextAreaEditor from './TextAreaEditor';
import AssigneeField from './AssigneeField';
import CurrencyInput from './CurrencyInput';

export const DynamicFormField = ({ field, handleTextInputSearching, dynamicTicketForm, updateDynamicTicket, viewOnly, currentTicketId, updateTextInputSearchValidation, stateData,
    fromModal, recordCurrentStatus, autoAssignedId, businessReasonList, defaultSize, assigneeList , handleAutoAssign }: any) => {
      
  switch (field.fieldType) {
    case 'text':
      return <input type="text" name={field.fieldName} />;
    case 'radio button':
      return (
        <div aria-label={`${field.fieldMappingId}-${field.fieldName}`}>
          {field.options.map((option: any) => (
            <label key={option}>
              <input type="radio" name={field.fieldName} value={option} /> {option}
            </label>
          ))}
        </div>
      );
    case 'Dropdown Single Selection':
      if (field.fieldName === 'Assignee') {
        return (
          <AssigneeField
          field={field}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          assigneeList={assigneeList}
          autoAssignedId={autoAssignedId}
          fromModal={fromModal}
          handleAutoAssign={handleAutoAssign}
        />
        )
      }
      else if (field.fieldName === 'Adjustment Business Type') {
        return (
          <AdjustmentBusinessType
            field={field}
            updateDynamicTicket={updateDynamicTicket}
            viewOnly={viewOnly}
            businessReasonList={businessReasonList}
          />
        )
      }
      else {
        return (
          <LookUps
            field={field}
            dynamicTicketForm={dynamicTicketForm}
            updateDynamicTicket={updateDynamicTicket}
            viewOnly={viewOnly}
            fromModal={fromModal}
            recordCurrentStatus={recordCurrentStatus}
            defaultSize={defaultSize}
          />
        )
      }
    case 'Dropdown Multi Selection':
      return (
           <LookUps
            isMulti={true}
            field={field}
            dynamicTicketForm={dynamicTicketForm}
            updateDynamicTicket={updateDynamicTicket}
            viewOnly={viewOnly}
            fromModal={fromModal}
            recordCurrentStatus={recordCurrentStatus}
            defaultSize={defaultSize}
          />
      );
    case 'Text Input':
      return (
        <TextInput
          field={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}
          fromModal={fromModal}
          defaultSize={defaultSize}
        />
      )

    case 'Number Input':
      return (
        <NumberInput
          fields={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}
          showForModal={fromModal}
          defaultSize={defaultSize}
        />
      )

    case 'Text Input with Search Action':
      return (
        <TextInputWithSearch
          fields={field}
          handleTextInputSearching={handleTextInputSearching}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          updateTextInputSearchValidation={updateTextInputSearchValidation}
          stateData={stateData}
          defaultSize={defaultSize}
        />
      )
    case 'Datetime Picker':
      return (
        <DatetimePicker
          field={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}
          defaultSize={defaultSize}
        />
      )

    case 'Dropdown Single Selection to Text Display':
      return (
        <DropdownSingleSelectionToTextDisplay
          field={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}
          fromModal={fromModal}
          defaultSize={defaultSize}
        />
      )
    case 'Text Display':
      return (
        <TextDisplay
          field={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}//NOT YET NEEDED
          defaultSize={defaultSize}
        />
      )

    case 'Display Field':
      return (
        <DisplayField
          field={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}
          defaultSize={defaultSize}
        />
      )
    case 'Text Area':
      return(
        <TextAreaEditor
        field={field}
        dynamicTicketForm={dynamicTicketForm}
        updateDynamicTicket={updateDynamicTicket}
        viewOnly={viewOnly}
        currentTicketId={currentTicketId}
        defaultSize={defaultSize}
      />
      )
    case 'Currency Input':
      return (
        <CurrencyInput
          fields={field}
          dynamicTicketForm={dynamicTicketForm}
          updateDynamicTicket={updateDynamicTicket}
          viewOnly={viewOnly}
          currentTicketId={currentTicketId}
          showForModal={fromModal}
          defaultSize={defaultSize}
        />
      )

    default:
      return null;
  }
};