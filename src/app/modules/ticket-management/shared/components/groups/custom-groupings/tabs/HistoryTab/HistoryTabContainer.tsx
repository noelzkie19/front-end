import { Col, Row } from "react-bootstrap-v5"
import { MainContainer } from "../../../../../../../../custom-components"
import CollaboratorGrid from "./CollaboratorGrid"
import TicketHistoryGrid from "./TicketHistoryGrid"


const HistoryTabContainer: React.FC = () => {
    return (
        <div style={{ marginLeft: 13, marginRight: 13 }}>
            <MainContainer>
                <Row>
                    <Col md={8}>
                        <TicketHistoryGrid />
                    </Col>
                    <Col md={4}>
                        <CollaboratorGrid />
                    </Col>
                </Row>
            </MainContainer>
        </div>
    )
}

export default HistoryTabContainer;