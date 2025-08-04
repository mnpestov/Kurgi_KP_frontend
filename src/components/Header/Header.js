import React from "react";
import './Header.css';
import logo from '../../images/logo.png'

function Header({ managerName, managerJobTitle, managerEmail, managerTel, kpNumber, kpDate, contractNumber, contractDate, managerPhoto }) {

    return (
        <section className="header">
            <div className="list">
                <div className="logo-container">
                    <img className="logo" src={logo} alt='logo' />
                </div>
                <div className="subtitle">
                    <div className="kpNumber">
                        <h1 className="kpNumber_title">
                            <p>{`Коммерческое предложение №  ${kpNumber} от  ${kpDate} `}</p>
                            <p>{`к договору №${contractNumber} от ${contractDate}`}</p>
                        </h1>
                    </div>
                    <div className="manager">
                        <div className="manager_infos">
                            <p className="manager_info manager_info__name">{managerName}</p>
                            <p className="manager_info manager_info__job-title">{managerJobTitle}</p>
                            <p className="manager_info manager_info__email">{managerEmail}</p>
                            <p className="manager_info manager_info__tel">{managerTel}</p>
                        </div>
                        <img className="manager__photo" src={managerPhoto} alt="manager" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Header;