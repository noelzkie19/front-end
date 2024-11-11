import { useEffect, useState } from "react";
import { SegmentListModel, SegmentFilterRequestModel } from "../modules/player-management/segmentation/models";
import * as hubConnection from '../../setup/hub/MessagingHub'
import { getSegmentationList, getSegmentationListResult } from "../modules/player-management/segmentation/redux/SegmentationService";

export default function useSegmentationByFilter(request: SegmentFilterRequestModel) {
    const [segmentList, setSegmentList] = useState<Array<SegmentListModel>>([])

    useEffect(() => {
        const messagingHub = hubConnection.createHubConnenction();
        messagingHub
        .start()
        .then(() => {
            // CHECKING STATE CONNECTION
            if (messagingHub.state === 'Connected') { 
                getSegmentationList(request)
                .then((response) => {
                    // IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
                    if (response.status === 200) {

                        messagingHub.on(request.queueId.toString(), message => {
                            // CALLBACK API
                            getSegmentationListResult(message.cacheId)
                            .then((data) => {
                                let resultData = Object.assign(new Array<SegmentListModel>(), data.data);
                                setSegmentList(resultData)

                            })
                            .catch(() => {
                            })
                            messagingHub.off(request.queueId.toString());
                            messagingHub.stop();
                        });

                        setTimeout(() => {
                            if (messagingHub.state === 'Connected') {
                                messagingHub.stop();
                            }
                        }, 30000)

                    } else {
                        messagingHub.stop();
                    }
                })
            } 
        })
        .catch(() => {
            messagingHub.stop();
        })
    }, [])

    return segmentList
}