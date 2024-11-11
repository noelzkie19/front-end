import swal from 'sweetalert';

export function isSessionExpired(expiresIn: string, history: any): boolean {
    let isExpired: boolean = false;

    const expiration = new Date(expiresIn)
    var today = new Date();

    if (expiration <= today) {
        swal({
            title: "Expired Session Detected",
            text: "You are about to logout, Please click OK to proceed.",
            icon: "warning",
            dangerMode: true,
        })
            .then((willLogout) => {
                if (willLogout) {
                    isExpired = true;
                    history.push("/logout");
                }
            });
    }
    return isExpired;
}