import { useContext, useEffect, useRef, useState } from 'react'
import MultipleImageUpload from '../../../../../../custom-components/file-inputs/MultipleImageUpload'
import { InsertTicketAttachment, deleteTicketAttachmentById, getImages, uploadFile } from '../../../../services/TicketManagementApi'
import { Guid } from 'guid-typescript';
import { ElementStyle, HttpStatusCodeEnum } from '../../../../../../constants/Constants'
import { Col, Row } from 'react-bootstrap-v5'
import BasicFieldLabel from '../../../../../../custom-components/labels/BasicFieldLabel'
import BasicTextInput from '../../../../../../custom-components/text-fields/BasicTextInput'
import { MlabButton } from '../../../../../../custom-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import '../../../../css/TicketManagement.css';
import swal from 'sweetalert';
import { TicketInfoModel } from '../../../../models/TicketInfoModel';
import { TicketAttachmentModel } from '../../../../models/TicketAttachmentModel';
import useTicketConstant from '../../../../constants/TicketConstant';
import { FileListResponseModel } from '../../../../models/response/FileListResponseModel';
import { convertToBlob } from '../../../../../../utils/converter';
import { FileListRequestModel } from '../../../../models/request/FileListRequestModel';
import { DeleteAttachmentRequestModel } from '../../../../models/request/DeleteAttachmentRequestModel';
import useConstant from '../../../../../../constants/useConstant';
import { InsertTicketAttachmentRequestModel } from '../../../../models/request/InsertTicketAttachmentRequestModel';
import { AddUserCollaboratorRequestModel } from '../../../../models/request/AddUserCollaboratorRequestModel';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { IAuthState } from '../../../../../auth';
import { useTicketManagementHooks } from '../../../hooks/useTicketManagementHooks';
import { TicketContext } from '../../../../context/TicketContext';

interface SectionProps {
  stateData: TicketInfoModel
  stateChange?: any,
  userId?: any,
  viewOnly?: any
}

type CombinedValue = {
    ticketAttachmentId: number;
    name: string;
    link: string;
}

const AttachmentGroupings = ({  stateData , stateChange , userId , viewOnly }: SectionProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const fileType = 'image/*'; 
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [list, setList] = useState<CombinedValue[]>([]);
    const {ATTACHMENT_TYPE} = useTicketConstant();
    const uploadedFiles = useRef<any>([]);
    const selectedCurrent = useRef<any>([]);
    const [isAddedAttachment, setIsAddedAttachment] = useState<boolean>(false);
    const [fileList, setFileList] = useState<Array<FileListResponseModel>>([]);
    const [convertedFileList, setConvertedFileList] = useState<Array<FileListResponseModel>>([]);
    const { SwalServerErrorMessage, SwalSuccessDeleteRecordMessage } = useConstant();
    const [linkAttachmentId, setLinkAttachmentId] = useState<number>(0);
    const { fullName } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
    const { validateAddUserAsCollaborator } = useTicketManagementHooks();
    const { historyFilter, ticketHistoryAsync, ticketInformation } = useContext(TicketContext);

    useEffect(() => {
      if(ticketInformation.ticketId > 0) {
        stateData = ticketInformation
        updateLists()
      }
    },[ticketInformation])

    useEffect(() => {
      if(!fileList) return;

      if(fileList.length > 0) {
        fileList.map((item: FileListResponseModel) => {
          item.referenceId = (stateData.ticketAttachments.find((d: any) => d.url === `${item.fileName}/${item.originalFileName}`)?.ticketAttachmentId)!;
          item.blob = convertToBlob(item.base64Text, 'image/');
          item.file = new File([item.blob], item.fileName, { type: 'image/' });
        });
  
        setConvertedFileList(fileList)
        stateChange(stateData)
        setIsAddedAttachment(false)
      }
      
    },[fileList , isAddedAttachment])

    useEffect(() => {
      stateData.ticketAttachments = stateData.ticketAttachments.filter((d: any) => d.typeId !== ATTACHMENT_TYPE.Link);
      list.map((d: any) => {

          if(stateData.ticketId > 0 && d.ticketAttachmentId === 0) {
            const request: InsertTicketAttachmentRequestModel = {
              ticketId: stateData.ticketId,
              ticketTypeId: stateData.ticketTypeId,
              typeId: ATTACHMENT_TYPE.Link,
              url: `<a href="${d.link}" target="_blank" rel="noopener noreferrer">${d.name}</a>`,
              queueId: Guid.create().toString(),
              userId: userId?.toString() ?? '0'
            }
           InsertAttachment(request);
          } 
          else {
            const attachment: TicketAttachmentModel = {
              ticketAttachmentId: d.ticketAttachmentId,
              typeId: ATTACHMENT_TYPE.Link,
              url: `<a href="${d.link}" target="_blank" rel="noopener noreferrer">${d.name}</a>`
            };
            stateData.ticketAttachments.push(attachment);
            stateChange(stateData)
          }
          

      });
     
    }, [list])

    useEffect(() => {
      if(linkAttachmentId > 0) {
        list.map((d: any) => {
          if(d.ticketAttachmentId === 0) {
            d.ticketAttachmentId = linkAttachmentId
          }
        })
        setLinkAttachmentId(0)
      }

    },[linkAttachmentId])

    const InsertAttachment = async (request: InsertTicketAttachmentRequestModel) => {
      try {
      const response = await InsertTicketAttachment(request);
      const result = response.data;
        if (response.status === HttpStatusCodeEnum.Ok) {
          const attachment: TicketAttachmentModel = {
            ticketAttachmentId: result,
            typeId: request.typeId,
            url: request.url
          };
          setLinkAttachmentId(result)
          stateData.ticketAttachments.push(attachment);
          if(request.typeId === ATTACHMENT_TYPE.Attachment) {
            uploadedFiles.current.push(attachment);
            const attachments = stateData.ticketAttachments.filter((d: any) => d.typeId === ATTACHMENT_TYPE.Attachment);
            const lastIndex = attachments.length - 1;
            let resultArray = [];
            if (lastIndex >= 0) {
                resultArray = [attachments[lastIndex]];
                retrieveAttachmentBlob(resultArray,true)
            }
          }
          validateUserInAttachmentAsCollaborator(request.ticketId, request.ticketTypeId);
          stateChange(stateData)
        }
      } catch (error) {
          // Handle the error here
          // failure(error, { remove: true });
      }
    }


    const getAllBase64Text = async (fileNames: any, IsSingleUpload: any) => {

      try {
        const response = await getImages(fileNames);
        const result = response.data;
          if (response.status === HttpStatusCodeEnum.Ok) {
              if(IsSingleUpload) {
                setFileList(prevFileList => [...prevFileList, ...result]);
              } else {
                setFileList(result);
              }  
              
          }
        } catch (error) {
            // Handle the error here
            // failure(error, { remove: true });
        }
      
    }
    const onChangeSelectedFile = async (val: any) => {
      let files: File[] = [];

      if (selectedCurrent.current.length === 0) {
        selectedCurrent.current = val;
        files = Array.from(val);
      } else {
        files = Array.from(val);
        files = files.filter((file: File) => {
          for (const selectedFile of selectedCurrent.current) {
            if (file.name === selectedFile.name && file.size === selectedFile.size) {
                return false; // Filter out the file if it matches an existing file
            }
           }
            return true; // Keep the file if it doesn't match any existing file
        });
      }

     
      //initialize
      setLoading(true)
      uploadedFiles.current = [];
      if(files.length > 0) {
        for (const file of files) {
          await uploadImage(file);
        }
      }
      
      setLoading(false)
    }
      
    const uploadImage = async (fileInfo:any) => {
      const formData = new FormData();
      const ext = Guid.create().toString();
      formData.append('file', fileInfo.blob, ext);
  
      try {
          const response = await uploadFile(formData);
          const result = response.data;
          if (response.status === HttpStatusCodeEnum.Ok) {
          
              
              if(stateData.ticketId > 0) {
                const request: InsertTicketAttachmentRequestModel = {
                  ticketId: stateData.ticketId,
                  ticketTypeId: stateData.ticketTypeId,
                  typeId: ATTACHMENT_TYPE.Attachment,
                  url:`${result.uri}/${fileInfo.name}`,
                  queueId: Guid.create().toString(),
                  userId: userId?.toString() ?? '0'
                }
                InsertAttachment(request)
              }
              else {
                const attachment: TicketAttachmentModel = {
                    ticketAttachmentId: 0,
                    typeId: ATTACHMENT_TYPE.Attachment,
                    url: `${result.uri}/${fileInfo.name}`
                };
    
                stateData.ticketAttachments.push(attachment);
                uploadedFiles.current.push(attachment);
              }
             
              validateUserInAttachmentAsCollaborator(stateData.ticketId, stateData.ticketTypeId);
              setIsAddedAttachment(true);
          }
      } catch (error) {
        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
      }
    }

    const handleSubmit =  () => {
      const combinedValue: CombinedValue = {
        ticketAttachmentId: 0,
        name: name,
        link: link
      } 
        setList([...list, combinedValue]);
      
        setName('');
        setLink('');
        ticketHistoryAsync(historyFilter);
      };

    const handleDelete = (index: number) => {
      swal({
        title: "Confirmation",
        text: "This action will remove the record. Please confirm.",
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
      }).then(async (response) => {
        if (response) {
          const newList = [...list];
           if(newList[index].ticketAttachmentId > 0) {
            await deleteAttachment(newList[index].ticketAttachmentId,index,ATTACHMENT_TYPE.Link);
           }else{
            newList.splice(index, 1);
            setList(newList);
            swal(SwalSuccessDeleteRecordMessage.title, SwalSuccessDeleteRecordMessage.textSuccess, SwalSuccessDeleteRecordMessage.icon)
           }
          
        }
      });
    
    };

    const deleteAttachment = async (ticketAttachmentId: any, index: number, type?: number, fileName?: string) => {

      try {
        const request: DeleteAttachmentRequestModel = {
          ticketAttachmentId: ticketAttachmentId,
          ticketTypeId: stateData.ticketTypeId,
          queueId: Guid.create().toString(),
			    userId: userId?.toString() ?? '0'
        }

        const response = await deleteTicketAttachmentById(request);
        if (response.status === HttpStatusCodeEnum.Ok) {
          swal(SwalSuccessDeleteRecordMessage.title, SwalSuccessDeleteRecordMessage.textSuccess, SwalSuccessDeleteRecordMessage.icon)
          if(type === ATTACHMENT_TYPE.Link) {
            const newList = [...list];
            newList.splice(index, 1);
            setList(newList);
          }
          else if(type === ATTACHMENT_TYPE.Attachment){
            const deletedIndex = stateData.ticketAttachments.findIndex((d: any) => d.ticketAttachmentId === ticketAttachmentId)
            if(deletedIndex !== -1) {
              selectedCurrent.current = []
              const fIndex = fileList.findIndex((d: any) => d.referenceId === ticketAttachmentId);
              const updatedFileList = [...fileList];
              updatedFileList.splice(fIndex, 1);
              setFileList(updatedFileList)
              stateData.ticketAttachments.splice(deletedIndex, 1);
              stateChange(stateData)
            }
          }
          ticketHistoryAsync(historyFilter);
        }
    } catch (error) {
          swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
    }
  }

  const updateLists = () => {
    const attachments = stateData.ticketAttachments.filter((d: any) => d.typeId === ATTACHMENT_TYPE.Attachment);
    const links = stateData.ticketAttachments.filter((d: any) => d.typeId === ATTACHMENT_TYPE.Link);
    if (attachments.length > 0) {
      retrieveAttachmentBlob(attachments,false)
    }
    let newList = ticketInformation.ticketId > 0 ? [] : list;
    if (links.length > 0) {
      const parser = new DOMParser();
      links.forEach((link: any) => {
        const doc = parser.parseFromString(link.url ?? '', 'text/html');
        const href = doc.querySelector('a')?.getAttribute('href') ?? '';
        const linkName = doc.querySelector('a')?.textContent ?? '';

        const combinedValue: CombinedValue = {
          ticketAttachmentId: link.ticketAttachmentId,
          name: linkName,
          link: href
        }

        newList.push(combinedValue)
        setList(newList);
      }); // Closing parenthesis was missing here
    }
} 

  const retrieveAttachmentBlob = (attachments: any,isSingleUpload: boolean) => {
    const urls: string[] = [];
        attachments.forEach((attachment: any) => {
          urls.push(attachment.url); // change url case
        });
    
        const stringsBeforeFilename: FileListRequestModel[] = [];
        urls.forEach((url: string) => {
          const lastIndex = url.lastIndexOf('/');

          if (lastIndex !== -1) {
            const request: FileListRequestModel = {
              fileName: url.substring(0, lastIndex),
              originalFileName: url.substring(lastIndex + 1)
            }
            stringsBeforeFilename.push(request);
          }
        });
    
        getAllBase64Text(stringsBeforeFilename,isSingleUpload);
  }

  const validateUserInAttachmentAsCollaborator = (ticketId: any, ticketTypeId: any) => {
    const requestObj: AddUserCollaboratorRequestModel = {
        userId: parseInt(userId ?? "0"),
        username: fullName ?? "",
        ticketId: ticketId,
        tIcketTypeId: ticketTypeId,
        createdBy: parseInt(userId ?? "0")
    }
  
    validateAddUserAsCollaborator(requestObj);
  }

  return (
    <div className='p-4'>
      <Col sm={12}>
        <p className='fw-bolder'>Attachment</p>
      </Col>
      <div>
        <Row>
          <Col sm={8}>
            <MultipleImageUpload accept={fileType} onChange={onChangeSelectedFile} disabled={false} fileList={convertedFileList} removeAttachment={deleteAttachment} />
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <div className="d-flex flex-column">
                <Row>
                  {/* Column for Name */}
                  <Col sm={4}>
                    <BasicFieldLabel title={'Name'} />
                    <BasicTextInput ariaLabel={'name'} colWidth={'col-sm-12'} value={name} onChange={(e) => setName(e.target.value)} disabled={false} />
                  </Col>

                  <Col sm={4}>
                    <BasicFieldLabel title={'Link'} />
                    <BasicTextInput ariaLabel={'link'} colWidth={'col-sm-12'} value={link} onChange={(e) => setLink(e.target.value)} disabled={false} />
                  </Col>

                  <Col sm={4} className="align-self-end">
                    <MlabButton
                      type={'button'}
                      label={'Submit'}
                      disabled={!name || !link}
                      access={true}
                      style={ElementStyle.primary}
                      weight={'solid'}
                      onClick={handleSubmit}
                      loading={loading}
                      loadingTitle='Please wait...'
                    />
                  </Col>
                </Row>
              </div>
          </Col>
        </Row>
        {/* Row for displaying the list */}
        <div style={{ padding: '0.5rem' }}></div>
        {list.length > 0 && (
          <Col sm={8}>
            {list.map((item, index) => (
              <div key={item.link} className="row-with-border">
                <Row className="m-1">
                  <div className="link-list">
                    <span><a href={item.link} target="_blank" rel="noopener noreferrer">{item.name}</a></span>
                    <button className="delete-btn" onClick={() => handleDelete(index)}>
                           <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </Row>
              </div>
            ))}
          </Col>
        )}
      </div>
    </div>
  )
}

export default AttachmentGroupings