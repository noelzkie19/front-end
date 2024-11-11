import React, { Component } from 'react'
import { ElementStyle } from '../../constants/Constants'
import useToggle from '../../custom-functions/useToggle'
import MlabButton from '../buttons/MlabButton'
import ButtonsContainer from './ButtonsContainer'
import FilterDrawerContainer from './FilterDrawerContainer'
import FormGroupContainer from './FormGroupContainer'
import MainContainer from './MainContainer'
type Props = {
    filterComponent: React.ReactNode
    contentComponent: React.ReactNode
}
const DefaultFilterDrawerContainer : React.FC<Props> = (props: Props) => {

    const { status: expanded, toggleStatus: toggleExpanded } = useToggle();

    return (
        <FilterDrawerContainer
        toggle={expanded}
        toggleHandle={toggleExpanded}
        filterComponent={
            <MainContainer>
			<div className='card-body p-5'>
				<FormGroupContainer>
					<h5>
						<i className='bi bi-search'></i> Search Filters
					</h5>
				</FormGroupContainer>
                <div className="separator separator-dashed my-3"></div>
                {props.filterComponent}
			</div>
		</MainContainer>
        }
        contentComponent={
            <MainContainer>
			<div className='card-body p-5'>
				<FormGroupContainer>
					<ButtonsContainer>
						<div className='flex-grow-1'>
							<MlabButton type={'button'} label={'Filter'} access={true} style={ElementStyle.primary} weight={'solid'} onClick={toggleExpanded}>
								<i className='bi bi-funnel-fill fs-5 text-secondary'></i> Filter
							</MlabButton>
						</div>
					</ButtonsContainer>
				</FormGroupContainer>
				<div className='separator separator-dashed my-3'></div>
                {props.contentComponent}
			</div>
		</MainContainer>
        }
        />
    )
}


export default DefaultFilterDrawerContainer