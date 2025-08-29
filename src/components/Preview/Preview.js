import React, { useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Gapped } from '@skbkontur/react-ui';
import { ArrowBoldLeft } from "@skbkontur/react-icons";
import Header from '../Header/Header';
import Kp from '../KP/Kp';
import KpCompact from '../KpCompact/KpCompact';
import { MANAGERS, resolveManagerKey } from '../../constants/managers';
import "./Preview.css";
// import HiddenPrint from "../HiddenPrint/HiddenPrint";
import "./PreviewHidden.css"; // классы для скрытых маунтов

// Подключаем Footer лениво (lazy), как это было сделано в App.js
const Footer = lazy(() => import('../Footer/Footer'));

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
    downloadPDF,
    downloadSpec,
    getProductWeightWithMeasure,
    getDeclination,
    exportHiddenPDF,
    kpPreviewSelectors
}) {
    const navigate = useNavigate();
    const compactPdfRef = useRef(null);
    // const hiddenPrintRef = useRef(null);


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
            <div className='preview-page__buttons'>
                <Button
                    height="3.333vw"
                    use="default"
                    icon={<ArrowBoldLeft />}
                    onClick={() => navigate('/')}
                >
                    На главную
                </Button>

                {/* <Button
                    height="3.333vw"
                    use="default"
                    icon={<ArrowBoldLeft />}
                    onClick={() => navigate('/new')}
                >
                    Назад к редактированию
                </Button> */}
            </div>
            <div className="preview">
                {/* Шапка КП */}
                <Header
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
                    style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0, zIndex: -9999 }}
                >
                    {listsKp.map((list, idx) => (
                        <KpCompact
                            key={`compact-${idx}`}
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
                            kpPreviewSelectors={kpPreviewSelectors}
                        />
                    ))}
                </div>


                {/* Итоговая часть КП (Footer) с расчетом стоимости, доставкой и пр. */}
                <Suspense fallback={<div>Загрузка Footer...</div>}>
                    <Footer
                        lists={listsKp}
                        countOfPerson={formData.countOfPerson}
                        logisticsCost={parseInt(formData.logisticsCost) || 0}
                        isWithinMkad={formData.isWithinMkad}
                        GetPrice={GetPrice}
                        listSelector={'list list-preview list_footer'}
                        kpPreviewSelectors={kpPreviewSelectors}
                    />
                </Suspense>
            </div>
            {/* НОВЫЙ скрытый компонент печати полной версии — полностью автономный */}
            {/* <div
                ref={hiddenPrintRef}
                className="hiddenPrintMount"
                data-role="hidden-print-mount"
            >
                
                <HiddenPrint
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
                    kpPreviewSelectors={kpPreviewSelectors}
                //   rowsByListId={rowsByListId}
                />
            </div> */}
            {/* Кнопки скачивания PDF и спецификации */}

            {/* <Gapped gap={16}> */}
                <div className="preview-page__buttons">
                    <Button
                    fontSize="1px"
                        use="success"
                        onClick={downloadPDF}
                    >
                        Скачать PDF
                    </Button>
                    <Button
                        use="primary"
                        onClick={downloadSpec}
                    >
                        Скачать спецификацию
                    </Button>
                    {/* <Button
                        use="success"
                        onClick={exportHiddenPDF}
                    >
                        Скачать hiden PDF
                    </Button> */}
                </div>
            {/* </Gapped > */}

        </div >
    );
}

export default Preview;
