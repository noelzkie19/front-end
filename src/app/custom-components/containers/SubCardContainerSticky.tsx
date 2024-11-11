import React from 'react';


const MainContainerSticky: React.FC = (props) => {
    return (
        <div
            className='card card-custom gutter-b'
            style={{
                position: 'sticky',
                top: '20px', // Adjust this value to leave space from the top fixed header
                left: '2px',
                zIndex: 1,
                cursor: 'move',
                backgroundColor: 'white',  // Optional: Ensure it's visible
            }}
        >
            {props.children}
        </div>
    );
};

export default MainContainerSticky;
