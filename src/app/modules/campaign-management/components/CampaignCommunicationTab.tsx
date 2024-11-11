import { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../../setup";
import { FieldContainer } from "../../../custom-components"
import { CampaignCommunication } from "./CampaignCommunication";

export const CampaignCommunicationTab = () => {
    const mode = useSelector<RootState>(({campaign}) => campaign.mode, shallowEqual) as string;
    const [isViewMode, setIsViewMode] = useState<boolean>(false);

    useEffect(() => {
		setIsViewMode(false);
		if (mode === 'view') {
			setIsViewMode(true);
		}
	}, [mode]);
	return (
		<FieldContainer>
			<CampaignCommunication viewMode={isViewMode} />
		</FieldContainer>
	)
}