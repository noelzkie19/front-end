import React,{ useState,useEffect } from 'react'
import swal from 'sweetalert'
import { CodeListModel, GetCodeListByIdRequest } from '../modules/system/models'
import { getCodeListById, sendCodeListById } from '../modules/system/redux/SystemService'
import * as hubConnection from '../../setup/hub/MessagingHub'
import { Guid } from "guid-typescript";
import { RootState } from "../../setup"
import { useSelector, shallowEqual } from "react-redux"


export default function useCodeListInfo(codeListPageId: number)  {

    // -----------------------------------------------------------------
    // REDUX STORE
    // -----------------------------------------------------------------
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number

    // -----------------------------------------------------------------
    // STATES
    // -----------------------------------------------------------------
    const [codeListInfo, setCodeListInfo] = useState<CodeListModel>()

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    useEffect(() => {
        _getCodeListInfo()
    }, [])

    const _getCodeListInfo = () => {
        const messagingHub = hubConnection.createHubConnenction();
        messagingHub
        .start()
        .then(() => {
            const request: GetCodeListByIdRequest = {
                queueId:  Guid.create().toString(),
                userId: userAccessId.toString(),
                codeListId : codeListPageId
            }
            sendCodeListById(request)
            .then((response) => {
                if (response.status === 200) {
                    
                    messagingHub.on(request.queueId.toString(), message => {
                        console.log(message)
                        getCodeListById(message.cacheId)
                        .then((returnData) => {
                            const data  = Object.assign(returnData.data)
                            console.log(data)
                            setCodeListInfo(data) 
                        })
                        .catch(() => {
                            console.log('error on geting code list')
                        })
                        messagingHub.off(request.queueId.toString());
                    });

                    setTimeout(() => {
                        if (messagingHub.state === 'Connected') {
                            messagingHub.stop();
                        }
                    }, 30000)

                } else {
                    messagingHub.stop();
                    swal("Failed", response.data.message, "error");
                }
            })
            .catch(() => {
                messagingHub.stop();
                swal("Failed", "Problem in getting message type list", "error");
            })
        })
    }

    return codeListInfo
}
