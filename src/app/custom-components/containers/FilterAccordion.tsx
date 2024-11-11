import { Guid } from 'guid-typescript';
import React from 'react'
import { Accordion, Button, Card } from 'react-bootstrap-v5';
import { AccordionHeaderType } from '../../constants/Constants';
import useToggle from '../../custom-functions/useToggle';

type Props = {
    type: AccordionHeaderType,
    title: string,
    icon?: React.ReactNode
}


const FilterAccordion: React.FC<Props> = ({ type, title, icon, children }) => {
    const accId = Guid.create().toString()
    let headerStyle : string = ' accordion-light '
    switch (type) {
        case AccordionHeaderType.light:
            headerStyle = ' accordion-light'
            break;
        case AccordionHeaderType.default:
            headerStyle = ' accordion-solid'
            break;
        default:
            headerStyle = ' accordion-light'
            break;
    }
    return (
        <Accordion defaultActiveKey="0">
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
               { icon } { title }
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <>
                    { children } 
                </>
            </Accordion.Collapse>
        </Accordion>
    )
}

export default FilterAccordion
