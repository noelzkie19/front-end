import React,{useState, useEffect} from 'react'
import { CurrencyOptions, CurrencyResponseModel, GetMessageStatusListRequest, GetMessageStatusListResponse, OptionsSelectedModel } from '../modules/system/models';
import { getAllCurrency, getMessageStatusList, sendGetMessageStatusList } from '../modules/system/redux/SystemService';
import * as hubConnection from '../../setup/hub/MessagingHub'
import { Guid } from 'guid-typescript';
import { useSelector, shallowEqual } from "react-redux"
import { RootState } from '../../setup';

export default function useMessageStatus( messageStatusId?: number | undefined) {

    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [messageStatusList, setMessageStatusList] = useState<Array<OptionsSelectedModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {
        //FETCH TO API
        const messagingHub = hubConnection.createHubConnenction();
        messagingHub
        .start()
        .then(() => {
            // CHECKING STATE CONNECTION
            if (messagingHub.state === 'Connected') { 

                // PARAMETER TO PASS ON API GATEWAY //
                const request: GetMessageStatusListRequest = {
                    queueId:  Guid.create().toString(),
                    userId: userAccessId.toString(),
                    messageStatusName: "",
                    messageStatusStatus: "",
                    messageTypeId: 0,
                    messageTypeIds : null
                }
                
                // REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
                sendGetMessageStatusList(request)
                .then((response) => {
                    // IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
                    if (response.status === 200) {

                        messagingHub.on(request.queueId.toString(), message => {
                            // CALLBACK API
                            getMessageStatusList(message.cacheId)
                            .then((data) => {
                                let resultData = Object.assign(new Array<GetMessageStatusListResponse>(), data.data);

                                let tempList = Array<OptionsSelectedModel>();

                                resultData.forEach(item => {
                                    const Options: OptionsSelectedModel = {
                                        value: item.messageStatusId.toString(),
                                        label: item.messageStatusName,
                                    };
                                    tempList.push(Options)
                                })
                                setMessageStatusList(tempList.filter(
                                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value && t.value !== messageStatusId?.toString()) === i
                                ));

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
                .catch(() => {
                    messagingHub.stop();
                })
            
            } else {
            }
        })
        .catch(err => console.log('Error while starting connection: ' + err))
    }, [])

    return messageStatusList
}
