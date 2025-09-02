import React, { useRef, Suspense, lazy } from 'react';
import FirstList from '../FirstList/FirstList';
import Kp from '../KP/Kp';
import { MANAGERS, resolveManagerKey } from '../../constants/managers';
import "./HiddenPrint.css"; // классы для скрытых маунтов

// Подключаем LastList лениво (lazy), как это было сделано в App.js
const LastList = lazy(() => import('../LastList/LastList'));

function HiddenPrint({
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
  getProductWeightWithMeasure,
  getDeclination,
  kpPreviewSelectors
}) {
  // kpPreviewSelectors.listSelector = 'hiden-list'
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
        listSelector='hiden-list'
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
          listSelector={'hiden-list'}
          kpPreviewSelectors={kpPreviewSelectors}
        />
      ))}
      {/* Итоговая часть КП (LastList) с расчетом стоимости, доставкой и пр. */}
      <Suspense fallback={<div>Загрузка LastList...</div>}>
        <LastList
          lists={listsKp}
          countOfPerson={formData.countOfPerson}
          logisticsCost={parseInt(formData.logisticsCost) || 0}
          isWithinMkad={formData.isWithinMkad}
          GetPrice={GetPrice}
          listSelector={'hiden-list list_last-list'}
          kpPreviewSelectors={kpPreviewSelectors}
        />
      </Suspense>
    </div>
  );
}

export default HiddenPrint;
