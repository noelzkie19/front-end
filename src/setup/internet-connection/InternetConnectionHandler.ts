import swal from 'sweetalert';

export function isSlowConnection(history: any): boolean {
    let isSlow: boolean = false;

    const condition = navigator.onLine ? 'online' : 'offline';
    console.log('console:' + condition)

    if (condition === 'online') {
        const webPing = setInterval(
            () => {
                fetch('//google.com', {
                    mode: 'no-cors',
                })
                    .then(() => {
                        console.log('able to ping google')
                        clearInterval(webPing)
                    }).catch(() => {
                        isSlow = true

                        swal({
                            title: "Internet Connection Interrupted",
                            text: "You are about to logout, Please click OK to proceed.",
                            icon: "warning",
                            dangerMode: true,
                        })
                            .then((willLogout) => {
                                if (willLogout) {
                                    history.push("/logout");
                                }
                            });
                    })
            }, 1000);
    }
    return isSlow;
}
