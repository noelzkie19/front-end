import React,{useState, useEffect} from 'react'
import { MessageStatusOptionModel, OptionListModel } from '../../../common/model';
import { GetMessageStatusOptionById, GetSubtopicOptionById } from '../../../common/services';


export default function useMessageStatusOption(messageTypeId : number) {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [messageStatusOptionList, setMessageStatusOptionList] = useState<Array<OptionListModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {

        if (messageTypeId !== 0) {

            GetMessageStatusOptionById(messageTypeId).then((response) => {
                if (response.status === 200) {
                    let messageStatus = Object.assign(new Array<MessageStatusOptionModel>(), response.data);
                    
                    let tempList = Array<OptionListModel>();
        
                    messageStatus.forEach(item => {
                        const OptionValue: OptionListModel = {
                            value: item.messageStatusId,
                            label: item.messageStatusName,
                        };
                        tempList.push(OptionValue)
                    })
    
                    setMessageStatusOptionList(tempList.filter(
                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                    ));
    
                }
                else {
                    // disableSplashScreen()
                    console.log("Problem in curremcy brand list")
                }
            })
            .catch(() => {
                //disableSplashScreen()
                console.log("Problem in curremcy brand list")
            })
        }


    }, [messageTypeId])

    return messageStatusOptionList
}
