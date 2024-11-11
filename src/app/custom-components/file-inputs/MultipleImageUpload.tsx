import React, { useEffect, useState } from 'react';
import { Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap-v5';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import swal from 'sweetalert';
import useTicketConstant from '../../modules/ticket-management/constants/TicketConstant';
interface ExtendedFile {
  file: File
  blob: Blob;
  uniqueFileName: string,
  referenceId?: any
}

interface Props {
  defaultValue?: File;
  onChange?: (files: FileList | null) => void;
  value?: any;
  accept?: string
  disabled: boolean;
  fileList?: any;
  removeAttachment?: (referenceId: any,  index: number, type?: number, fileName?: string) => void;
}

const MultipleImageUpload: React.FC<Props> = (props) => {
  const [selectedFiles, setSelectedFiles] = useState<ExtendedFile[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const {ATTACHMENT_TYPE} = useTicketConstant();

  useEffect(()=> {
    if(!props.fileList) return;

    if(props.fileList.length > 0) {
      const extendedFiles = props.fileList.map((fileItem: any) => ({
        file: fileItem.file,
        blob: fileItem.blob,
        uniqueFileName: fileItem.originalFileName, // Assuming fileName is unique,
        referenceId: fileItem.referenceId
      }));
      setSelectedFiles(extendedFiles)
    }

  },[props.fileList])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    let isValid = true;
    const updatedFiles: ExtendedFile[] = newFiles.map((file) => {
      const extendedFile: ExtendedFile = {
        file: file,
        blob: new Blob([file], { type: file.type }),
        uniqueFileName: file.name,
        referenceId: 0
      }
      extendedFile.blob = new Blob([file], { type: file.type });
      
      if (!extendedFile.file.type.startsWith('image/')) {
        isValid = false;
        return {
          ...extendedFile,
          blob: new Blob([file], { type: file.type }),
          uniqueFileName: file.name,
          referenceId: 0
        };
      }
      if (extendedFile.file.size > 2 * 1024 * 1024) { // Check if file size exceeds 2MB
        isValid = false;
        return {
          ...extendedFile,
          blob: new Blob([file], { type: file.type }),
          uniqueFileName: file.name,
          referenceId: 0
        };
      }

      return extendedFile;
    });

    if (!isValid) {
      swal({
        title: "Attachment",
        text: "Please select only image files and ensure each file size does not exceed 2MB.",
        icon: "warning",
        buttons: ["OK"],
        dangerMode: true,
      });
      return;
    }
    
    const existingFileNames = selectedFiles.map(d => d.file.name);
    const updatedFilesWithUniqueNames: ExtendedFile[] = [];
    updatedFiles.forEach((x) => {
      let filename = x.file.name;
      let index = 1;
      while (existingFileNames.includes(filename)) {
        const nameParts = x.file.name.split('.');
        const extension = nameParts.pop() ?? '';
        filename = `${nameParts.join('.')} (${index}).${extension}`;
        index++;
      }
      const updatedBlob = new Blob([x.blob], { type: x.file.type });
      const updatedFile: ExtendedFile = {
        ...x,
        blob: updatedBlob,
        uniqueFileName: filename
      };
      updatedFilesWithUniqueNames.push(updatedFile);
    }); 

    setSelectedFiles([...selectedFiles, ...updatedFilesWithUniqueNames]);
    
    
    const filteredNewFiles = updatedFilesWithUniqueNames.filter((d: any) => d.referenceId === 0);
    if(filteredNewFiles && filteredNewFiles.length > 0) {
      updateFileInput(filteredNewFiles);
      if (props.onChange) {
        props.onChange(createFileList(filteredNewFiles));
      }
    }

  };

  const handleImageClick = (newFile: ExtendedFile) => {
    setSelectedImage(URL.createObjectURL(newFile.file));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleRemoveImage = (index: number) => {
    swal({
      title: "Confirmation",
      text: "This action will remove the record. Please confirm.",
      icon: "warning",
      buttons: ["No", "Yes"],
      dangerMode: true,
    }).then((response) => {
      if (response) {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles);

        const newFiles = updatedFiles.filter((d: any) => d.referenceId === 0);
        if(newFiles && newFiles.length > 0) {
          updateFileInput(newFiles);
          if (props.onChange) {
            props.onChange(createFileList(newFiles));
          }
        }

        if(props.removeAttachment){
          props.removeAttachment(selectedFiles[index].referenceId,index , ATTACHMENT_TYPE.Attachment, selectedFiles[index].uniqueFileName);
        }
      }
    });
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);

    handleFiles(files);
  };

  const updateFileInput = (updatedFiles: ExtendedFile[]) => {
    const updatedFileList = new DataTransfer();
    updatedFiles.forEach((d) => {
      updatedFileList.items.add(d.file);
    });
  
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.files = updatedFileList.files;
  
    // Resetting the value of the file input element
    fileInput.value = '';
  };
  const createFileList = (files: ExtendedFile[]): FileList => {
    const dataTransfer = new DataTransfer();

    files.forEach(extendedFile => {
        const file: File = extendedFile.file; 
        const newFile = new File([file], extendedFile.uniqueFileName, { type: file.type });
        Object.defineProperty(newFile, 'blob', { value: extendedFile.blob });
        dataTransfer.items.add(newFile);
    });

    return dataTransfer.files;
  };


  return (
    <Form.Group
      className={`mb-3${isDraggingOver ? ' dragging-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {props.defaultValue ? <Form.Label>{props.defaultValue}</Form.Label> : null}
      <Form.Control
        type="file"
        size="sm"
        onChange={handleFileChange}
        accept={props.accept || 'image/*'}
        value={props.value}
        disabled={props.disabled}
        multiple
        id="file-input"
      />
    {selectedFiles.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: '10px', flexWrap: 'wrap' }}>
        {selectedFiles.map((d, index) => (
          <div key={d.uniqueFileName} style={{ marginRight: '20px', marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '150px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button onClick={() => handleImageClick(d)}>
                <img
                  src={URL.createObjectURL(d.file)}
                  alt={d.uniqueFileName}
                  style={{ width: '120px', height: '100px', objectFit: 'cover' }}
                />
              </button>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id='button-tooltip-2' className="filename-tooltip">{d.uniqueFileName}</Tooltip>}
                >
                  <p
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100px', // Adjust this width as needed
                      marginBottom: '0',
                      position: 'relative', // Needed for tooltip positioning
                    }}
                  >
                    <a href={URL.createObjectURL(d.file)} download={d.uniqueFileName}>{d.uniqueFileName}</a>
                  </p>
                </OverlayTrigger>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
      {/* Modal to display clicked image */}
      <Modal show={showModal} onHide={handleCloseModal} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">{selectedFiles.find(d => URL.createObjectURL(d.file) === selectedImage)?.uniqueFileName || ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={selectedImage || ''} alt="Clicked" style={{ width: '100%', height: 'auto' }} />
        </Modal.Body>
      </Modal>
    </Form.Group>
  );
};

export default MultipleImageUpload;
