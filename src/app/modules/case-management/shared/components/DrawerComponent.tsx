import React from "react";
import { Drawer, ButtonToolbar, Button } from 'rsuite';
import { CommunicationReviewModel } from "../../models/CommunicationReviewModel";
import { faSearch , faFileAlt , faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '../../css/CustomDrawer.css';
import { Col, Row } from "react-bootstrap-v5";
import CreateCommunicationReview from "../../components/communication-review/CreateCommunicationReview";

interface Props {
	communicationReview: CommunicationReviewModel,
  communicationReviewRef: any
  stateChange: any
}

const DrawerComponent: React.FC<Props> = ({communicationReview , communicationReviewRef , stateChange}) => {
    const [open, setOpen] = React.useState(false);
    const [dirtyAssessmentForm, setDirtyAssessmentForm] = React.useState(false);

    const closeDrawer =() => {
      console.log(communicationReviewRef.current);
      communicationReviewRef.current.communicationId = communicationReview.communicationId
      setOpen(false);
      stateChange(dirtyAssessmentForm)
    }

    return (
        <>
        <ButtonToolbar>
          <Button appearance="primary" 
            style={{float: 'right' ,
                    height: '50px' , 
                    width: '60px'}} 
                    onClick={() => setOpen(true)}>
            <FontAwesomeIcon icon={faFileAlt} className="file-icon"  style={{ fontSize: '30px'}}/>
            <FontAwesomeIcon icon={faSearch} className="search-icon" style={{ fontSize: '20px', marginLeft: '5px'}} />
          </Button>
        </ButtonToolbar>
  
        <Drawer className="custom-drawer" open={open} onClose={() => closeDrawer()} style={{ width: '60%' , marginRight: '20px'}} placement="right">
              <div>
                
                  <div style={{ padding: '16px', textAlign: 'right' }}>
                    <Row>
                      <Col sm={6}>
                        <h1 style={{marginLeft: '20px'}} className="d-flex align-items-center text-primary fw-bolder my-1 fs-3">Communication Review</h1>
                      </Col>
                      <Col sm={6}>
                        <Button onClick={() => closeDrawer()} appearance="subtle">
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </Col>
                    </Row>
                  </div>
              </div>
            <Drawer.Body>
            <CreateCommunicationReview  communicationReview={communicationReview} communicationReviewRef={communicationReviewRef} stateChange={setDirtyAssessmentForm}></CreateCommunicationReview>
          </Drawer.Body>
        </Drawer>
  
      </>
    );
};

export default DrawerComponent;