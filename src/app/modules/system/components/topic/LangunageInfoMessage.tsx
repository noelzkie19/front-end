interface Props {
	languageInstructionStyle: any;
	isDisable: boolean;
}

const LangunageInfoMessage: React.FC<Props> = (Props) => {
	const {isDisable, languageInstructionStyle} = Props;

	return (
		<div style={languageInstructionStyle} className='mt-7 mb-4'>
			*Select Language and enter Local Character Translation to add Language Translation.
			<br />
			{isDisable && <span className='text-danger'>*Subtopic name is required to add or edit Language Translation.</span>}
		</div>
	);
};

export default LangunageInfoMessage;
