import "../../styles/TicketComment.css";
import "../../styles/HistoryCollaborator.css";
import { Tab, Tabs } from "react-bootstrap-v5";
import AddComment from "./groups/custom-groupings/tabs/CommentTab/AddComment";
import HistoryTabContainer from "./groups/custom-groupings/tabs/HistoryTab/HistoryTabContainer";

interface TicketDetails {
    refreshComment?: boolean
    refreshTicketComment?: any
}

const DynamicTab = ({ refreshComment , refreshTicketComment }: TicketDetails) => {
    return (
        <div className="comment-history-container">
            <Tabs defaultActiveKey='comment' id='comment-history'>
                <Tab eventKey="comment" title="Comment">
                    <AddComment isFromModal = {false} refreshComment={refreshComment} refreshTicketComment={refreshTicketComment}/>
                </Tab>
                {/* History Tab */}
                <Tab eventKey="history" title="History">
                    <HistoryTabContainer />
                </Tab>
                {/* Player List Tab */}
            </Tabs>
        </div>
    )
}

export default DynamicTab;