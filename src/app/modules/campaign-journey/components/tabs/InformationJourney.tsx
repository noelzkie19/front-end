import { useEffect, useState } from 'react';
import { FieldContainer } from "../../../../custom-components";
import { JOURNEY_ACTION_MODE } from '../../constants/Journey';
import { JourneyDetailsModel } from '../../models/JourneyDetailsModel';

interface IInformationJourney {
	pageMode: number,
	stateData: JourneyDetailsModel,
	stateChange: any
}

export const InformationJourney: React.FC<IInformationJourney> = ({pageMode, stateData, stateChange}) => {

	const [createMode, setCreateMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<boolean>(false);

	useEffect(() => {
		switch (pageMode) {
            case JOURNEY_ACTION_MODE.Create:
                setCreateMode(true);
                setEditMode(false);
                setViewMode(false);
                break;
            case JOURNEY_ACTION_MODE.Edit:
                setCreateMode(false);
                setEditMode(true);
                setViewMode(false);
                break;
            case JOURNEY_ACTION_MODE.View:
                setCreateMode(false);
                setEditMode(false);
                setViewMode(true);
                break
        };
	}, [pageMode])

	const handleChange = (e: any) => {
		const fieldType = e.target.ariaLabel;

		if (fieldType === "journeyName") {
			let handler: JourneyDetailsModel = {
				journeyId: stateData.journeyId ? stateData.journeyId : 0,
				journeyName: e.target.value,
				journeyDescription: stateData.journeyDescription ? stateData.journeyDescription : '',
				journeyStatus: stateData.journeyStatus ? stateData.journeyStatus : '',
				createdDate: stateData.createdDate ? stateData.createdDate : '',
				updatedDate: stateData.updatedDate ? stateData.updatedDate : '',
				updatedBy: stateData.updatedBy ? stateData.updatedBy : ''
			};
			stateChange(handler);
		} else if (fieldType === "journeyDesc") {
			let handler: JourneyDetailsModel = {
				journeyId: stateData.journeyId ? stateData.journeyId : 0,
				journeyName: stateData.journeyName ? stateData.journeyName : '',
				journeyDescription: e.target.value,
				journeyStatus: stateData.journeyStatus ? stateData.journeyStatus : '',
				createdDate: stateData.createdDate ? stateData.createdDate : '',
				updatedDate: stateData.updatedDate ? stateData.updatedDate : '',
				updatedBy: stateData.updatedBy ? stateData.updatedBy : ''
			}
			stateChange(handler);
		}
	};

    return (
        <FieldContainer>
            <div className='col-lg-12 mt-6'></div>
            <FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Journey Name</label>
				</div>
				<div className='col-sm-6'>
					<input className={'form-control form-control-sm'}
						aria-label="journeyName"
						type='text'
						disabled={viewMode}
						onChange={handleChange}
						value={stateData.journeyName} />
				</div>
			</FieldContainer>
			<FieldContainer>
				<div className='col-sm-3'>
					<label className='form-label-sm required'>Journey Description</label>
				</div>
				<div className='col-sm-6'>
					<textarea className='form-control form-control-sm'
						aria-label='journeyDesc'
						disabled={viewMode}
						onChange={handleChange}
						value={stateData.journeyDescription}>
                    </textarea>
				</div>
			</FieldContainer>
        </FieldContainer>
    )
}