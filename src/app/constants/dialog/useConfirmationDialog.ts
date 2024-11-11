import { useEffect } from 'react';
import swal from 'sweetalert';

const useConfirmationDialog = (showWarningModal: boolean, history: any) => {
    useEffect(() => {
        const handleBlockedNavigation = (prompt: any) => {
            if (showWarningModal) {
                alertNavigateAway(prompt.pathname);
                return false;
            }
        };

        if (history) {
            history.block(handleBlockedNavigation);
        } else {
            history.block(() => {});
        }

        return () => {
            history.block(() => {});
        };
    }, [history, showWarningModal]);

    const alertNavigateAway = (promptNamePath: any) => {
        swal({
            title: 'Confirmation',
            text: 'Any changes will be discarded, please confirm',
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((confirmSave) => {
            if (confirmSave) {
                history.block(() => {});
                history.push(promptNamePath);
            }
        });
    };
};

export default useConfirmationDialog;