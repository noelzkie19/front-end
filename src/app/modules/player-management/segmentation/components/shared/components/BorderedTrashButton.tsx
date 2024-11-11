import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

interface ButtonProps {
	access: boolean | undefined;
	label: string;
	disabled?: boolean;
	onClick?: () => void;
	color?: any;
	style?: any;
}

const BorderedTrashButton: React.FC<ButtonProps> = ({access, label, color, disabled = false, style, children, ...props}) => {
	return (
		<>
			{access ? (
				<button type='button' className='btn btn-sm' disabled={disabled} style={{border: `1px solid ${color}`, color: `${color}`}} {...props}>
					<span>
						<FontAwesomeIcon icon={faTrash} style={{color: `${color}`}} />
					</span>
					&nbsp;{label}
				</button>
			) : null}
		</>
	);
};

export default BorderedTrashButton;
