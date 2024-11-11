
import MainContainer from "../../../../../custom-components/containers/MainContainer";
import {Col, Row} from 'react-bootstrap';
import MultilineTextArea from "../../../../case-management/shared/components/MultilineTextArea";
import { useEffect } from "react";

interface Props {
	stateData: string,
	stateChange: any,
  reviewStarted: boolean
}

const SummarySection: React.FC<Props> = ({stateData, stateChange, reviewStarted}) => {
  /* States */
  /* Hooks */
  /* Mount */

  /* Effects */
  useEffect(() => {
  }, [])

  /* Functions */
  const handleChange = (e: any) => {
    if (e.length > 50000) return
    stateChange(e);
  };
	  
  return (
    <MainContainer>
      <div style={{margin: 20}}>
        <Row>
			      <p className='fw-bolder required'>{'Summary'}</p>
        </Row>
        <Row>
          <Col sm={12}>
          <div className='col-sm-12'>
							<MultilineTextArea label={'summary'} onChange={handleChange} value={stateData} disabled={!reviewStarted}/>
					</div>
          </Col>
        </Row>
      </div>
    </MainContainer>
  );
}

export default SummarySection;