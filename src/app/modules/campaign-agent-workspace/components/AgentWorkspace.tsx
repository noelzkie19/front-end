import { FilterDrawerContainer } from '../../../custom-components';
import useToggle from '../../../custom-functions/useToggle'
import { AgentWorkspaceFilter } from './AgentWorkspaceFilter'
import { AgentWorkspacePlayerList } from './AgentWorkspacePlayerList'

export const AgentWorkspace = () => {

    const { status: expanded, toggleStatus: toggleExpanded } = useToggle();

    return (
        <FilterDrawerContainer
        toggle={expanded}
        toggleHandle={toggleExpanded}
        filterComponent={<AgentWorkspaceFilter/>}
        contentComponent={<AgentWorkspacePlayerList toggleFilter={toggleExpanded} />}
        />
    )
}
