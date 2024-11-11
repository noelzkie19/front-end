import React,{useState, useEffect} from 'react'
import { FeedbackTypeOptionModel, MessageTypeOptionModel, OptionListModel } from '../../../common/model';
import { GetFeedbackTypeOptionList, GetMessageTypeOptionList } from '../../../common/services';


export default function useFeedbackTypeOption() {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [feedbackTypeOptionList, setFeedbackTypeOptionList] = useState<Array<OptionListModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {

            GetFeedbackTypeOptionList().then((response) => {
                if (response.status === 200) {
                    let subTopics = Object.assign(new Array<FeedbackTypeOptionModel>(), response.data);
                    
                    let tempList = Array<OptionListModel>();
        
                    subTopics.forEach(item => {
                        const OptionValue: OptionListModel = {
                            value: item.feedbackTypeId,
                            label: item.feedbackTypeName,
                        };
                        tempList.push(OptionValue)
                    })
    
                    setFeedbackTypeOptionList(tempList.filter(
                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                    ));
    
                }
                else {
                    // disableSplashScreen()
                    console.log("Problem in message type list")
                }
            })
            .catch(() => {
                //disableSplashScreen()
                console.log("Problem in message type brand list")
            })

    }, [])

    return feedbackTypeOptionList
}
