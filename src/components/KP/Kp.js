import React, { useState } from "react";
import { Add, Trash } from '@skbkontur/react-icons';
import './Kp.css';
import logo from '../../images/logo.png';
import Row from '../Row/Row';
import ProductPopup from '../ProductPopup/ProductPopup';

function Kp({
    startEvent,
    endEvent,
    eventPlace,
    countOfPerson,
    list,
    deleteRow,
    id,
    deleteList,
    GetPrice,
    listTitle,
    startTimeStartEvent,
    endTimeStartEvent,
    startTimeEndEvent,
    endTimeEndEvent,
    deleteRowFromDb,
    updateRowInDb,
    isNewKp,
    addRowOnList,
    dispatch,
    getProductWeightWithMeasure,
    getDeclination,
    kpPreviewSelectors,
    listSelector
}) {

    const {
        listLogoSelector,
        listTitleSelector,
        listTableSelector,
        tableTitlesSelector,
        tableTitleSelector,
        tableSubtitleSelector,
        footerSelector,
        listTotalSelector
    } = kpPreviewSelectors

    const [showPopup, setShowPopup] = useState(false);
    const totalCost = list.rows.map((item) => {
        return item.countOfProduct * item.priceOfProduct;
    }).reduce((partialSum, a) => partialSum + a, 0);

    const handleDeleteList = () => {
        deleteList(id);
    };

    const handleAddProduct = (newObj) => {
        newObj.productId = Date.now()
        addRowOnList(newObj, list.id)
    }

    return (
        <>
            <div className={listSelector}>
                <div className="list__container">
                    <img className={listLogoSelector} src={logo} alt="logo" />
                    <h2 className={listTitleSelector}>{listTitle}</h2>
                    <table className={listTableSelector}>
                        <thead>
                            <tr className={`table__row ${tableTitlesSelector}`}>
                                <th className={`${tableTitleSelector} list__subtitle-container`}>
                                    <p className="list__subtitle list__subtitle_place">место: <span className="list__subtitle_text">{`${eventPlace}`}</span></p>
                                    <p className="list__subtitle list__subtitle_person">кол-во персон: <span className="list__subtitle_text">{`${getDeclination(countOfPerson)}`}</span></p>
                                    <div className="list__subtitle_time">
                                        <p className="list__subtitle list__subtitle_time_text">время мероприятия: </p>
                                        <p>
                                            <span className="list__subtitle_time_text list__subtitle_text">{`${startEvent.slice(0, 5)} (${startTimeStartEvent.slice(0, 5)} - ${endTimeStartEvent.slice(0, 5)})`}</span>
                                            <span className="list__subtitle_time_text list__subtitle_text"> {`–`} </span>
                                            <span className="list__subtitle_time_text list__subtitle_text">{`${endEvent.slice(0, 5)} (${startTimeEndEvent.slice(0, 5)} - ${endTimeEndEvent.slice(0, 5)})`}</span>
                                        </p>
                                    </div>
                                </th>
                                <th className={tableTitleSelector}>Количество, шт</th>
                                <th className={tableTitleSelector}>Стоимость</th>
                                <th className={tableTitleSelector}>Цена, руб</th>
                            </tr>
                        </thead>
                        {list.rows.map((item, index) => (
                            <Row
                                key={index}
                                data={item}
                                index={index}
                                deleteRow={deleteRow}
                                deleteRowFromDb={deleteRowFromDb}
                                updateRowInDb={updateRowInDb}
                                listId={list.id}
                                rowId={item.id}
                                isNewKp={isNewKp}
                                dispatch={dispatch}
                                getProductWeightWithMeasure={getProductWeightWithMeasure}
                                kpPreviewSelectors={kpPreviewSelectors}
                            />
                        ))}
                    </table>
                </div>
                <div className={tableSubtitleSelector}>
                    <div className={footerSelector}>
                        <div className="list__footnotes">
                            <p className="list__footnote">*В стоимость включены все расходники.</p>
                        </div>
                        <div className={listTotalSelector}>
                            <p className="list__totla-cost">{`Итоговая сумма: ${GetPrice(parseInt(totalCost))}`}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="list__buttons">
                <button type="button" className={`list__button delete-button`} onClick={handleDeleteList}><Trash />Удалить лист</button>
                <button type="button" className={`list__button edit-button`} onClick={setShowPopup}><Add />Добавить товар</button>
            </div>
            {showPopup && (
                <ProductPopup
                    onClose={() => setShowPopup(false)} // Закрытие popup
                    onSave={handleAddProduct} // Передаем функцию для сохранения данных
                />
            )}
        </>
    );
}

export default Kp;