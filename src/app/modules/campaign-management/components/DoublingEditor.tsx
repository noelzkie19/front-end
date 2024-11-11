import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const DoublingEditor = forwardRef((props: any, ref) => {
    const [value, setValue] = useState<any>('');
    const refInput = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      // Focus on the input
      setTimeout(() => refInput.current?.focus());
    }, []);
  
    const setBlur = (_event: any) => {
      props.stopEditing();
    };
  
    useImperativeHandle(ref, () => ({
      getValue() {
        // This simple editor doubles any value entered into the input
        const match = /(\d{0,7})[^.]*((?:\.\d{0,2})?)/g.exec(value);
        const val = match ? match[1] + match[2] : 0;
        return val;
      },
      isCancelBeforeStart() {
        return false;
      },
      isCancelAfterEnd() {
        // Our editor will reject any value greater than 9999999.99
        if (value) return Number(parseInt(value).toFixed(2)) > 9999999.99;
        return false;
      },
    }));
  
    return (
      <input
        type="number"
        ref={refInput}
        value={value}
        onBlur={(event) => setBlur(event)}
        onChange={(event) => setValue(event.target.value)}
        style={{ width: '100%', height: '50%' }}
      />
    );
  });
  export default DoublingEditor
