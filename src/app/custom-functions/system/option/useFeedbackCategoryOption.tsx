import React,{useState, useEffect} from 'react'
import { FeedbackCategoryOptionModel, OptionListModel } from '../../../common/model';
import { GetFeedbackCategoryOptionById } from '../../../common/services';


export default function useFeedbackCategoryOption( feedbackTypeId : number ) {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [feedbackCategoryOptionList, setFeedbackCategoryOptionList] = useState<Array<OptionListModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {

        if ( feedbackTypeId !== 0) {

            GetFeedbackCategoryOptionById(feedbackTypeId).then((response) => {
                if (response.status === 200) {
                    let subTopics = Object.assign(new Array<FeedbackCategoryOptionModel>(), response.data);
                    
                    let tempList = Array<OptionListModel>();
        
                    subTopics.forEach(item => {
                        const OptionValue: OptionListModel = {
                            value: item.feedbackCategoryId,
                            label: item.feedbackCategoryName,
                        };
                        tempList.push(OptionValue)
                    })
    
                    setFeedbackCategoryOptionList(tempList.filter(
                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                    ));
    
                }
                else {
                    // disableSplashScreen()
                    console.log("Problem in category list")
                }
            })
            .catch(() => {
                //disableSplashScreen()
                console.log("Problem in category list")
            })

        }

    }, [feedbackTypeId])

    return feedbackCategoryOptionList
}
