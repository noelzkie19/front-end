import {faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

interface Props {
	access: boolean | undefined;
	label: string;
	disabled?: boolean;
	onClick?: () => void;
	color?: any;
	border?: any;
	style?: any;
	marginRight?: any;
}

const BorderedPlusButton: React.FC<Props> = ({access, label, color, border, disabled = false, style, marginRight, children, ...props}) => {
	return (
		<>
			{access ? (
				<button
					type='button'
					className={marginRight ? `btn btn-sm me-${marginRight}` : 'btn btn-sm'}
					disabled={disabled}
					style={border ? {border: `${border} `, color: `${color}`} : {border: `1px solid ${color} `, color: `${color}`}}
					{...props}
				>
					<span>
						<FontAwesomeIcon icon={faPlusSquare} style={{color: `${color}`}} />
					</span>
					&nbsp;{label}
				</button>
			) : null}
		</>
	);
};

export default BorderedPlusButton;
