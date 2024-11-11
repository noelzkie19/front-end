import React, { useContext} from 'react'
import { Col, Row } from 'react-bootstrap-v5';
import useFnsDateFormatter from '../../../../../custom-functions/helper/useFnsDateFormatter';
import { StaffPerformanceContext } from '../context/StaffPerformanceContext';

const StaffPerformanceHeader = () => {
  const { mlabFormatDate } = useFnsDateFormatter();
  const { staffPerformanceHeader } = useContext(StaffPerformanceContext);
  return (
    <>
      <Row>
        <Col sm={2}><b>Setting Name</b></Col>
        <Col sm={2}></Col>
        <Col sm={2}><b>Parent</b></Col>
        <Col sm={2}></Col>
      </Row>
      <Row>
        <Col sm={2}>
          <div>{staffPerformanceHeader?.settingName ?? ''}</div>
        </Col>
        <Col sm={2}>
          <div>{staffPerformanceHeader?.parent ?? ''}</div>
        </Col>
      </Row>
      <div style={{ marginTop: 10 }}>
        <Row>
          <Col sm={2}><b>Created Date</b></Col>
          <Col sm={2}><b>Created By</b></Col>
          <Col sm={2}><b>Last Modified Date</b></Col>
          <Col sm={2}><b>Last Modified By</b></Col>
        </Row>
        <Row>
          <Col sm={2}>
            <div>{mlabFormatDate(staffPerformanceHeader?.createdDate ?? "", 'MM/d/yyyy HH:mm:ss')}</div>
          </Col>
          <Col sm={2}>
            <div>{staffPerformanceHeader?.createdBy ?? ''}</div>
          </Col>
          <Col sm={2}>
            <div>{mlabFormatDate(staffPerformanceHeader?.lastModifiedDate ?? '', 'MM/d/yyyy HH:mm:ss')}</div>
          </Col>
          <Col sm={2}>
            <div>{staffPerformanceHeader?.lastModifiedBy ?? ''}</div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default StaffPerformanceHeader