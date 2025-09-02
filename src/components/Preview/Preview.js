import React, { useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from '@skbkontur/react-icons';
import { ArrowBoldLeft } from "@skbkontur/react-icons";
import FirstList from '../FirstList/FirstList';
import Kp from '../KP/Kp';
import KpCompact from '../KpCompact/KpCompact';
import { MANAGERS, resolveManagerKey } from '../../constants/managers';
import "./Preview.css";
import HiddenPrint from "../HiddenPrint/HiddenPrint";
import "./PreviewHidden.css"; // классы для скрытых маунтов

// Подключаем LastList лениво (lazy), как это было сделано в App.js
const LastList = lazy(() => import('../LastList/LastList'));

function Preview({
    formData,
    listsKp,
    isNewKp,
    dispatch,
    deleteRow,
    deleteList,
    deleteRowFromDb,
    updateRowInDb,
    addRowOnList,
    GetPrice,
    downloadSpec,
    getProductWeightWithMeasure,
    getDeclination,
    exportHiddenPDF,
    kpPreviewSelectors,
    kpPrintSelectors
}) {
    const navigate = useNavigate();
    const compactPdfRef = useRef(null);
    const hiddenPrintRef = useRef(null);


    // Форматирование даты (ожидаем ISO)
    const formatDate = (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('ru-RU', {
            year: 'numeric', month: 'numeric', day: 'numeric'
        });
    };

    // "HH:MM:SS" -> "HH:MM"
    const formatTime = (value) => {
        if (!value) return '';
        return String(value).slice(0, 5);
    };

    // Выбираем менеджера из констант по manager (если есть) или по managerName
    const managerKey = formData.manager || resolveManagerKey(formData.managerName);
    const m = MANAGERS[managerKey];

    return (
        <div className="preview-page">
            <div className='list__buttons'>
                <button type="button" className={`list__button navigation-button`} onClick={() => navigate('/')}><ArrowBoldLeft />На главную</button>
            </div>
            <div className="preview">
                {/* Шапка КП */}
                <FirstList
                    managerName={formData.managerName || m.name}
                    managerJobTitle={formData.managerJobTitle || m.job}
                    managerEmail={formData.managerEmail || m.email}
                    managerTel={formData.managerTel || m.tel}
                    kpNumber={formData.kpNumber}
                    kpDate={formatDate(formData.kpDate)}
                    contractNumber={formData.contractNumber}
                    contractDate={formatDate(formData.contractDate)}
                    managerPhoto={formData.managerPhoto || m.photo}
                    kpPreviewSelectors={kpPreviewSelectors}
                    listSelector={'list list-preview'}
                />

                {/* Списки товаров (каждый списокKp – отдельный блок КП) */}
                {listsKp.map((item) => (
                    <Kp
                        key={item.id}
                        startEvent={formatDate(formData.startEvent)}
                        endEvent={formatDate(formData.endEvent)}
                        eventPlace={formData.eventPlace}
                        countOfPerson={formData.countOfPerson}
                        list={item}
                        id={item.id}
                        listTitle={formData.listTitle}
                        startTimeStartEvent={formatTime(formData.startTimeStartEvent)}
                        endTimeStartEvent={formatTime(formData.endTimeStartEvent)}
                        startTimeEndEvent={formatTime(formData.startTimeEndEvent)}
                        endTimeEndEvent={formatTime(formData.endTimeEndEvent)}
                        isNewKp={isNewKp}
                        deleteRow={deleteRow}
                        deleteList={deleteList}
                        deleteRowFromDb={deleteRowFromDb}
                        updateRowInDb={updateRowInDb}
                        addRowOnList={addRowOnList}
                        dispatch={dispatch}
                        GetPrice={GetPrice}
                        getProductWeightWithMeasure={getProductWeightWithMeasure}
                        getDeclination={getDeclination}
                        listSelector={'list list-preview'}
                        kpPreviewSelectors={kpPreviewSelectors}
                    />
                ))}

                {/* Скрытые компактные списки для спецификации (без цен) */}
                <div
                    ref={compactPdfRef}
                    style={{
                        position: 'fixed',     // вне потока и не расширяет документ
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        opacity: 0             // можно убрать visibility
                    }}
                >
                    {listsKp.map((list, idx) => (
                        <KpCompact
                            key={`compact-${list.id}-${Date.now()}`}
                            // key={`compact-${idx}`}
                            list={list}
                            listTitle={formData.listTitle}
                            startEvent={formatDate(formData.startEvent)}
                            endEvent={formatDate(formData.endEvent)}
                            startTimeStartEvent={formatTime(formData.startTimeStartEvent)}
                            endTimeStartEvent={formatTime(formData.endTimeStartEvent)}
                            startTimeEndEvent={formatTime(formData.startTimeEndEvent)}
                            endTimeEndEvent={formatTime(formData.endTimeEndEvent)}
                            eventPlace={formData.eventPlace}
                            countOfPerson={formData.countOfPerson}
                            isNewKp={isNewKp}
                            dispatch={dispatch}
                            isCompact={true}
                            deleteRow={deleteRow}
                            deleteRowFromDb={deleteRowFromDb}
                            updateRowInDb={updateRowInDb}
                            getProductWeightWithMeasure={getProductWeightWithMeasure}
                            kpPreviewSelectors={kpPrintSelectors}
                        />
                    ))}
                </div>


                {/* Итоговая часть КП (LastList) с расчетом стоимости, доставкой и пр. */}
                <Suspense fallback={<div>Загрузка LastList...</div>}>
                    <LastList
                        lists={listsKp}
                        countOfPerson={formData.countOfPerson}
                        logisticsCost={parseInt(formData.logisticsCost) || 0}
                        isWithinMkad={formData.isWithinMkad}
                        GetPrice={GetPrice}
                        listSelector={'list list-preview list_last-list'}
                        kpPreviewSelectors={kpPreviewSelectors}
                    />
                </Suspense>
            </div>
            {/* НОВЫЙ скрытый компонент печати полной версии — полностью автономный */}
            <div
                ref={hiddenPrintRef}
                className="hiddenPrintMount"
                data-role="hidden-print-mount"
            >

                <HiddenPrint
                    key={`hidden-${Date.now()}`}
                    formData={formData}
                    listsKp={listsKp}
                    isNewKp={isNewKp}
                    dispatch={dispatch}
                    deleteRow={deleteRow}
                    deleteList={deleteList}
                    deleteRowFromDb={deleteRowFromDb}
                    updateRowInDb={updateRowInDb}
                    addRowOnList={addRowOnList}
                    GetPrice={GetPrice}
                    getProductWeightWithMeasure={getProductWeightWithMeasure}
                    getDeclination={getDeclination}
                    kpPreviewSelectors={kpPrintSelectors}
                />
            </div>
            {/* Кнопки скачивания PDF и спецификации */}
            <div className="list__buttons">
                <button type="button" className={`list__button save-button`} onClick={exportHiddenPDF}><Download />Скачать PDF</button>
                <button type="button" className={`list__button edit-button`} onClick={downloadSpec}><Download />Скачать спецификацию</button>
            </div>
        </div >
    );
}

export default Preview;
