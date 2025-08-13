import React, { useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Gapped } from '@skbkontur/react-ui';
import { ArrowBoldLeft } from "@skbkontur/react-icons";
import Header from '../Header/Header';
import Kp from '../KP/Kp';
import KpCompact from '../KpCompact/KpCompact';
import { MANAGERS, resolveManagerKey } from '../../constants/managers';

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
    getDeclination
}) {    
    const navigate = useNavigate();
    const compactPdfRef = useRef(null);

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
            <Button
                use="default"
                icon={<ArrowBoldLeft />}
                onClick={() => navigate('/')}
            >
                На главную
            </Button>
            
            {/* <Button
                use="default"
                icon={<ArrowBoldLeft />}
                onClick={() => navigate('/new')}
            >
                Назад к редактированию
            </Button> */}

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
                    managerPhoto={m.photo}
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
                    />
                </Suspense>
            </div>
            {/* Кнопки скачивания PDF и спецификации */}
            <div className="preview__actions">
                <Gapped gap={16}>
                    <Button
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
                </Gapped>
            </div>
        </div>
    );
}

export default Preview;
