import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import {ElementStyle} from '../../../../constants/Constants';
import {MlabButton} from '../../../../custom-components';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {RemDistributionPlayerModel} from '../../models/RemDistributionPlayerModel';
import {GetRemDistributionPlayer} from '../../redux/PlayerManagementService';

type PlayerRemProfileProps = {
	mlabPlayerId: number;
};

const PlayerRemProfile = ({ mlabPlayerId}: PlayerRemProfileProps) => {
	const history = useHistory();
	const [player, setRemDistributionPlayer] = useState<RemDistributionPlayerModel>({ remProfileID: 0, remProfileName: 'Not Assigned', remAgentName: '', pseudoName: '', assignmentDate: undefined });
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

    // Mounted
    useEffect(() => {    
		getRemDistributionPlayer(mlabPlayerId);
		return;
    }, [])
	
	 // Methods
	const redirectToRemProfile = () => {
		const win = window.open(`/relationship-management/view-rem-profile/view/${player.remProfileID}`, '_blank');
	};

	async function getRemDistributionPlayer(mlabPlayerId: number){    
		    
        await GetRemDistributionPlayer({"mlabPlayerId": mlabPlayerId})
          .then((response) => {
                if (response.status === 200) {  
                    let profile: RemDistributionPlayerModel = response.data
                    if(profile != null)
                    {            
                        setRemDistributionPlayer(profile)
                        return;
                    }
                }
            }).catch((ex) => {     
                console.log('[ERROR] Relationship Manager: ' + ex)
                swal("Failed", "Problem in getting Relationship Manager Player", "error");
            }
        )    
    }

	return (
		<>
			<h6>Relationship Manager</h6>
			<div className='col-lg-3  mt-3'>
				<label>ReM Profile Name</label>
				<input type='text' className='form-control form-control-sm' disabled aria-label='ReM Profile Name' value={player.remProfileName} />
			</div>
			<div className='col-lg-3  mt-3'>
				<label>ReM Agent Name</label>
				<input type='text' className='form-control form-control-sm' disabled aria-label='ReM Agent Name' value={player.remAgentName} />
			</div>
			<div className='col-lg-3  mt-3'>
				<label>Pseudo Name</label>
				<input type='text' className='form-control form-control-sm' disabled aria-label='ReM Pseudo Name' value={player.pseudoName} />
			</div>
			<div className='col-lg-3  mt-3'>
				<label>Last Assigned Date</label>
				<input type='text' className='form-control form-control-sm' disabled aria-label='Assignment Name' value={formatDate(player?.assignmentDate)} />
			</div>

			<div className='col-lg-12  mt-3'>
				<MlabButton
					access={true}
					label={'View Contact and Schedule'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					onClick={redirectToRemProfile}
					disabled={player.remAgentName === '' || !userAccess.includes(USER_CLAIMS.RemProfileRead)}
				/>
			</div>

		</>
	);
};

export default PlayerRemProfile;
