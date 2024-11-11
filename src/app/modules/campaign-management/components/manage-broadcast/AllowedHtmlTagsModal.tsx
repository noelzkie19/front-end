import React, {useEffect} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import { FormContainer, FormGroupContainer, FormModal} from '../../../../custom-components';
import { htmlEncode } from 'js-htmlencode';
interface ModalProps {
    showForm: boolean;
    closeModal: () => void;
}


const AllowedHtmlTagsModal: React.FC<ModalProps> = ({
    showForm,
    closeModal,
}) => {
    // states
    const htmlString = `<b>bold</b>, <strong>bold</strong>,<i>italic</i>, <em>italic</em>, <u>underline</u>, <ins>underline</ins>, <s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del>, <span class="tg-spoiler">spoiler</span>, <tg-spoiler>spoiler</tg-spoiler>, <b>bold <i>italic bold <s>italic bold strikethrough <span class="tg-spoiler">italic bold strikethrough spoiler</span></s> <u>underline italic bold</u></i> bold</b> <a href="http://www.example.com/">inline URL</a> <a href="tg://user?id=123456789">inline mention of a user</a> <tg-emoji emoji-id="5368324170671202286">👍</tg-emoji> <code>inline fixed-width code</code> <pre>pre-formatted fixed-width code block</pre> <pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre> <blockquote>Block quotation started\nBlock quotation continued\nThe last line of the block quotation</blockquote>`;

    // Split the HTML string by the specified tags
    const splitHtml = htmlString.split(',');

    // effects
    useEffect(() => {
        const htmlString = `<b>bold</b>, <strong>bold</strong> <i>italic</i>, <em>italic</em> <u>underline</u>, <ins>underline</ins> <s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del> <span class="tg-spoiler">spoiler</span>, <tg-spoiler>spoiler</tg-spoiler> <b>bold <i>italic bold <s>italic bold strikethrough <span class="tg-spoiler">italic bold strikethrough spoiler</span></s> <u>underline italic bold</u></i> bold</b> <a href="http://www.example.com/">inline URL</a> <a href="tg://user?id=123456789">inline mention of a user</a> <tg-emoji emoji-id="5368324170671202286">👍</tg-emoji> <code>inline fixed-width code</code> <pre>pre-formatted fixed-width code block</pre> <pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre> <blockquote>Block quotation started\nBlock quotation continued\nThe last line of the block quotation</blockquote>`;
        console.log(htmlEncode(htmlString));
    }, [])

  return (
        <FormModal  show={showForm}  customSize={'lg'} headerTitle={'Allowed HTML Tags'} haveFooter={false}>
            <FormContainer onSubmit={()=>{}} >
                        <FormGroupContainer>
                            <div>
                                {
                                splitHtml.map((part, index) => (
                                <div key={'idx_'+index} className='row'>
                                {part}
                                </div>
                                ))}
                            </div>
                        </FormGroupContainer>
               
                <ModalFooter style={{border: 0, float: 'right', paddingLeft: 0, paddingRight: 0} }>
                <button type='button' className="btn btn-secondary btn-sm me-2" onClick={closeModal}>Close</button>
                </ModalFooter>
            </FormContainer>
           
            
        </FormModal>
        
  )
}

export default AllowedHtmlTagsModal