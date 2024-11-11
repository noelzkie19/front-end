import React from 'react';
import {faPencilAlt, faTrash , faPlus, faEye} from '@fortawesome/free-solid-svg-icons';
import { ButtonGroup} from 'react-bootstrap-v5';
import { GridLinkButton, TableIconButton } from '../../../../custom-components';


interface Props {
    data: any;
    pageMode: number; 
    reviewStarted: boolean; 
    addCustomEvent: (data: any) => void; 
    viewCustomEvent: (data: any) => void; 
    editCustomEvent: (data: any) => void; 
    removeCustomEvent: (data: any) => void; 
    type: number // 1 main , 2 misc
}


const ActionRenderer: React.FC<Props> = ({
  data,
  pageMode,
  reviewStarted,
  addCustomEvent,
  viewCustomEvent,
  editCustomEvent,
  removeCustomEvent,
  type
}) => {
  const MAX_REMARKS_LENGTH = 10;
  const remarks = data.remarks === null ? '' : data.remarks;
  const remarksText =
    remarks !== '' && remarks.length > MAX_REMARKS_LENGTH
      ? `${remarks.substring(0, MAX_REMARKS_LENGTH)}...`
      : remarks;

  const isQualityReviewMeasurementCriteriaAbsent =
    (data.qualityReviewMeasurementCriteriaId === 0 && reviewStarted) ||
    (data.qualityReviewMeasurementCriteriaId === undefined && reviewStarted) ||
    (data.qualityReviewMeasurementCriteriaId === 0 && !reviewStarted);

  const shouldCheckWithData = pageMode === 2 || isQualityReviewMeasurementCriteriaAbsent;
  const isDisable = type === 1 ? shouldCheckWithData : !reviewStarted ;

  function renderAddButton() {
    if (data.remarks === '' && data.suggestions === '') {
      return (
        <TableIconButton
          access={true}
          faIcon={faPlus}
          toolTipText={'Add'}
          onClick={() => addCustomEvent(data)}
          isDisable={isDisable}
        />
      );
    } 
    else if(data.remarks !== '')  {
      return (  
            <GridLinkButton
              access={true}
              title={remarksText}
              disabled={false}
              onClick={() => viewCustomEvent(data)}
            />
      );
    } else {
      return (
          <TableIconButton
            access={true}
            faIcon={faEye}
            toolTipText={'View'}
            onClick={() => viewCustomEvent(data)}
            isDisable={false}
          />
      )
    }
  }
  
  function renderEditButton() {
    if ((data.remarks !== '' && data.remarks !== null) || (data.suggestions !== '' && data.suggestions !== null)) {
      return (
          <TableIconButton
            access={true}
            faIcon={faPencilAlt}
            toolTipText={'Edit'}
            onClick={() => editCustomEvent(data)}
            isDisable={!reviewStarted}
          />
      )}
  }
  
  function renderRemoveButton() {
    if ((data.remarks !== '' && data.remarks !== null) || (data.suggestions !== '' && data.suggestions !== null)) {
      return (
        <TableIconButton
          access={true}
          faIcon={faTrash}
          toolTipText={'Remove'}
          onClick={() => removeCustomEvent(data)}
          isDisable={!reviewStarted}
        />
      )
    }
  }

  return (
    <ButtonGroup aria-label='Basic example'>
      <div className='d-flex justify-content-center flex-shrink-0'>
        <div className='me-4'>{renderAddButton()}</div>
        <div className='me-4'>{renderEditButton()}</div>
        <div className='me-4'>{renderRemoveButton()}</div>
      </div>
    </ButtonGroup>
  );
};

export default ActionRenderer;