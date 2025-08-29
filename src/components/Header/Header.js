import './Header.css';
import logo from '../../images/logo.png'

function Header({ managerName, managerJobTitle, managerEmail, managerTel, kpNumber, kpDate, contractNumber, contractDate, managerPhoto, kpPreviewSelectors, listSelector }) {
    const {
        logoContainerSelector,
        logoSelector,
        subtitleSelector,
        kpNumberSelector,
        kpNumberTitleSelector,
        managerSelector,
        managerInfosSelector,
        managerPhotoSelector
    } = kpPreviewSelectors

    return (
        <section className="header">
            <div className={listSelector}>
                <div className={logoContainerSelector}>
                    <img className={logoSelector} src={logo} alt='logo' />
                </div>
                <div className={subtitleSelector}>
                    <div className={kpNumberSelector}>
                        <h1 className={kpNumberTitleSelector}>
                            <p>{`Коммерческое предложение №  ${kpNumber} от  ${kpDate} `}</p>
                            <p>{`к договору №${contractNumber} от ${contractDate}`}</p>
                        </h1>
                    </div>
                    <div className={managerSelector}>
                        <div className={managerInfosSelector}>
                            <p className="manager_info manager_info__name">{managerName}</p>
                            <p className="manager_info manager_info__job-title">{managerJobTitle}</p>
                            <p className="manager_info manager_info__email">{managerEmail}</p>
                            <p className="manager_info manager_info__tel">{managerTel}</p>
                        </div>
                        <img className={managerPhotoSelector} src={managerPhoto} alt="manager" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Header;