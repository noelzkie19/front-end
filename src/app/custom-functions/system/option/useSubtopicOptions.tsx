import React,{useState, useEffect} from 'react'
import { OptionListModel, SubtopicOptionModel, TopicOptionModel } from '../../../common/model';
import { GetSubtopicOptionById } from '../../../common/services';


export default function useSubtopicOptions(topicId : number) {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [subtopicOptionList, setSubTopicOptionList] = useState<Array<OptionListModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {

        if (topicId !== 0) {

            GetSubtopicOptionById(topicId).then((response) => {
                if (response.status === 200) {
                    let subTopics = Object.assign(new Array<SubtopicOptionModel>(), response.data);
                    
                    let tempList = Array<OptionListModel>();
        
                    subTopics.forEach(item => {
                        const OptionValue: OptionListModel = {
                            value: item.subtopicId,
                            label: item.subtopicName,
                        };
                        tempList.push(OptionValue)
                    })
    
                    setSubTopicOptionList(tempList.filter(
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


    }, [topicId])

    return subtopicOptionList
}
