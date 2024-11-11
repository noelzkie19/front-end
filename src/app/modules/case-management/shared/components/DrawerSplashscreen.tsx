const DrawerSplashscreen: React.FC = () => {
    const spinnerElements = Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="spinner-grow my-2"></div>
    ));

    return (
        <div id="splash-screen-drawer" className="splash-screen-drawer">
            <div className="row align-items-center">
                {spinnerElements}
            </div>
            <span>Please wait ...</span>
        </div>)
}
export default DrawerSplashscreen
