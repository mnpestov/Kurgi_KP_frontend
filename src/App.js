import './App.css';
import React, { useReducer, useCallback, Suspense, lazy, useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useNavigate,
//   useLocation
// } from "react-router-dom";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Form from './components/Form/Form';
import Header from './components/Header/Header';
import Kp from './components/KP/Kp';
import PavelPhoto from './images/PavelPhoto.png';
import PeterPhoto from './images/PeterPhoto.jpg';
import { MainApi } from './utils/MainApi'

// Ленивое загрузка компонента Footer
const Footer = lazy(() => import('./components/Footer/Footer'));


function App() {
  const [isNewKp, setIsNewKp] = useState(true)
  const [updetedRows, setUpdatedRows] = useState([])

  const initialState = {
    formData: {
      // id: '',
      // managerName: 'Павел Кург',
      // managerJobTitle: 'Руководитель проекта',
      // managerEmail: 'kurgi-bar@yandex.ru',
      // managerTel: '+7 925 516-31-16',
      // managerPhoto: PavelPhoto,
      // kpNumber: '',
      // kpDate: new Date().toISOString().split('T')[0],
      // contractNumber: '',
      // contractDate: new Date().toISOString().split('T')[0],
      // startEvent: new Date().toISOString().split('T')[0],
      // endEvent: new Date().toISOString().split('T')[0],
      // startTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      // endTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      // startTimeStartEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      // endTimeStartEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      // startTimeEndEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      // endTimeEndEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      // eventPlace: '',
      // countOfPerson: '',
      // logisticsCost: 0,
      // isWithinMkad: null,
      // listTitle: '',
    },
    listsKp: [],
  };
  const getEmptyFormData = () => ({
    managerPhoto: PavelPhoto,
    managerName: 'Павел Кург',
    managerJobTitle: 'Руководитель проекта',
    managerEmail: 'kurgi-bar@yandex.ru',
    managerTel: '+7 925 516-31-16',
    kpNumber: '',
    kpDate: new Date().toISOString().split('T')[0],
    contractNumber: '',
    contractDate: new Date().toISOString().split('T')[0],
    startEvent: new Date().toISOString().split('T')[0],
    endEvent: new Date().toISOString().split('T')[0],
    startTimeStartEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    endTimeStartEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    startTimeEndEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    endTimeEndEvent: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    eventPlace: '',
    countOfPerson: '',
    logisticsCost: 0,
    isWithinMkad: null,
    listTitle: ''
  });



  const [state, dispatch] = useReducer(reducer, initialState);
  const { formData, listsKp } = state;

  function reducer(state, action) {
    switch (action.type) {
      case 'UPDATE_FORM_DATA':
        return {
          ...state,
          formData: {
            ...state.formData,
            ...action.payload
          }
        };
      case 'UPDATE_LISTS':
        return {
          ...state,
          listsKp: action.payload
        };
      case 'ADD_ROW_IN_PDF':
        return {
          ...state,
          listsKp: [...state.listsKp, { id: state.listsKp.length + 1, rows: action.payload }]
        };
      case 'DELETE_ROW':
        return {
          ...state,
          listsKp: state.listsKp.map(list => {
            if (list.id === action.payload.listId) {
              const updatedRows = list.rows.filter((_, index) => index !== action.payload.rowIndex);
              return { ...list, rows: updatedRows };
            }
            return list;
          })
        };

      case 'ADD_ROW_ON_LIST':
        return {
          ...state,
          listsKp: state.listsKp.map(list => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                rows: [...list.rows, action.payload.row]
              };
            }
            return list;
          })
        };

      case 'UPDATE_ROW':
        setUpdatedRows([...updetedRows, action.payload.updatedRow])
        return {
          ...state,
          listsKp: state.listsKp.map(list => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                rows: list.rows.map((row, index) =>
                  index === action.payload.rowIndex ? action.payload.updatedRow : row
                )
              };
            }
            return list;
          })
        };
      case 'DELETE_LIST':
        return {
          ...state,
          listsKp: state.listsKp.filter(obj => obj.id !== action.payload.id)
        };
      default:
        return state;
    }
  }

  useEffect(() => {
    const fetchLastKpNumber = async () => {
      try {
        const lastKpNumber = await MainApi.getLastKpNumber();
        if (lastKpNumber && lastKpNumber !== formData.kpNumber) {
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: { kpNumber: parseInt(lastKpNumber) + 1 }
          });
        }
      } catch (err) {
        console.log('Ошибка: ' + err);
      }
    };

    if (isNewKp) {
      fetchLastKpNumber();
    }
  }, [isNewKp]);


  // Форматирование даты
  const formatDate = useCallback((value, options = { year: 'numeric', month: 'numeric', day: 'numeric' }) => {
    const enteredDate = new Date(value);
    return enteredDate.toLocaleDateString('ru-RU', options);
  }, []);
  // Форматирование времени
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Оставляем только HH:MM
  };

  // Форматирование цены
  const GetPrice = useCallback((price) => {
    return `${Math.round(price).toLocaleString('ru-RU')} руб`;
  }, []);

  // Корректное склонение слова "человек"
  const getDeclination = useCallback((num) => {
    const n = parseInt(num, 10);
    const remainder10 = n % 10;
    const remainder100 = n % 100;
    if (remainder100 >= 11 && remainder100 <= 14) {
      return `${n} человек`;
    }
    if (remainder10 === 1) {
      return `${n} человек`;
    }
    if (remainder10 >= 2 && remainder10 <= 4) {
      return `${n} человека`;
    }
    return `${n} человек`;
  }, []);

  const addToDb = async (formData, listsKp, updatedRows = []) => {
    if (isNewKp) {
      try {
        const kpRes = await MainApi.addKp(formData);
        console.log('KP создан:', kpRes);

        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: { ...formData, id: kpRes.id },
        });

        let updatedLists = [];

        if (listsKp?.length > 0 && kpRes.id) {
          updatedLists = await Promise.all(
            listsKp.map(async (list) => {
              const listRes = await MainApi.addList({
                ...formData,
                kpId: kpRes.id
              });

              let createdRows = [];

              if (list.rows?.length > 0) {
                createdRows = await Promise.all(
                  list.rows.map(row =>
                    MainApi.addRow({ ...row, listId: listRes.id })
                  )
                );
              }

              return {
                ...listRes,
                rows: createdRows
              };
            })
          );
          console.log('Списки созданы:', updatedLists);
        }

        dispatch({
          type: 'UPDATE_LISTS',
          payload: updatedLists,
        });

        setIsNewKp(false);
        console.log('✅ Все данные успешно записаны');
      } catch (err) {
        console.error('Ошибка при создании KP:', err);
        throw err;
      }
    } else {
      try {
        if (updatedRows?.length > 0) {
          await Promise.all(
            updatedRows.map(row => MainApi.updateRow(row))
          );
          console.log('✅ Строки обновлены');
        }
      } catch (err) {
        console.error('Ошибка при обновлении строк:', err);
        throw err;
      }
    }
  };

  const deleteRowFromDb = async (rowId) => {
    try {
      await MainApi.deleteRow(rowId);
      console.log('Строка удалена из БД');
    } catch (err) {
      console.error('Ошибка при удалении строки из БД:', err);
      alert('Ошибка при удалении строки из базы данных.');
    }
  };

  const updateRowInDb = async (updatedRow) => {
    try {
      await MainApi.updateRow(updatedRow);
      console.log('✅ Строка обновлена в БД');
    } catch (err) {
      console.error('Ошибка при обновлении строки в БД:', err);
      alert('Ошибка при обновлении строки в базе данных.');
    }
  };

  const deleteListFromDb = async (listId) => {
    try {
      await MainApi.deleteList(listId);
      console.log('✅ Список удалён из БД');
    } catch (err) {
      console.error('Ошибка при удалении списка из БД:', err);
      alert('Ошибка при удалении списка из базы данных.');
    }
  };



  const searchKp = async (kpNumber) => {
    // const curentKp = { formData: JSON.parse(localStorage.getItem(`${state.kpNumber}+formData`)), listsKp: JSON.parse(localStorage.getItem(`${state.kpNumber}+listsKp`)) }

    // updateCurrentKp(curentKp)

    try {
      const curentKp = await MainApi.getKp(kpNumber);
      updateCurrentKp(curentKp);

    } catch (err) {
      console.log('Ошибка: ' + err);
    }
  };

  const updateCurrentKp = useCallback((kpData) => {
    if (!kpData) return;
    setIsNewKp(false)
    let managerInfo = {
      managerPhoto: '',
      managerName: kpData.formData.managerName || '',
      managerTel: '',
      managerJobTitle: '',
      managerEmail: ''
    };
    if (kpData.formData.managerName === 'Петр Кург') {
      managerInfo = {
        managerPhoto: PeterPhoto,
        managerName: 'Петр Кург',
        managerTel: '+7 926 966-88-71',
        managerJobTitle: 'Руководитель проекта',
        managerEmail: 'kurgi-bar@yandex.ru'
      };
    } else {
      managerInfo = {
        managerPhoto: PavelPhoto,
        managerName: 'Павел Кург',
        managerTel: '+7 925 516-31-16',
        managerJobTitle: 'Руководитель проекта',
        managerEmail: 'kurgi-bar@yandex.ru'
      };
    }
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        ...kpData.formData,
        ...managerInfo,
        startTimeStartEvent: formatTime(kpData.formData.startTimeStartEvent),
        endTimeStartEvent: formatTime(kpData.formData.endTimeStartEvent),
        startTimeEndEvent: formatTime(kpData.formData.startTimeEndEvent),
        endTimeEndEvent: formatTime(kpData.formData.endTimeEndEvent),
      }
    });
    dispatch({
      type: 'UPDATE_LISTS',
      payload: kpData.listsKp.map(list => ({
        ...list,
        rows: list.rows.sort((a, b) => a.id - b.id) // Сортируем строки по id
      }))
    });
  }, []);

  // Обработчик смены менеджера
  const handleManagerChange = useCallback(({ target: { value } }) => {
    const manager = value === 'true'
      ? {
        managerPhoto: PeterPhoto,
        managerName: 'Петр Кург',
        managerTel: '+7 926 966-88-71',
        managerJobTitle: 'Руководитель проекта',
        managerEmail: 'kurgi-bar@yandex.ru'
      }
      : {
        managerPhoto: PavelPhoto,
        managerName: 'Павел Кург',
        managerTel: '+7 925 516-31-16',
        managerJobTitle: 'Руководитель проекта',
        managerEmail: 'kurgi-bar@yandex.ru'
      };
    dispatch({ type: 'UPDATE_FORM_DATA', payload: manager });
  }, []);

  // Обработчик изменений полей формы
  const handleChangeInput = useCallback(({ target: { value, name } }) => {
    let data
    if (name === 'countOfPerson') {
      data = getDeclination(value)
    } else if (name === 'isWithinMkad') {
      data = value === "true"
    } else {
      data = value
    }
    dispatch({ type: 'UPDATE_FORM_DATA', payload: { [name]: data } });
  }, [getDeclination]);

  // Функция экспорта в PDF
  const exportPDF = useCallback(async () => {
    const pdf = new jsPDF("landscape", "mm", "a4");
    const lists = document.querySelectorAll(".list");
    for (const [index, list] of lists.entries()) {
      const canvas = await html2canvas(list, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 297; // Ширина A4 в мм (альбомная ориентация)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (index !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }
    pdf.save(`КП № ${state.formData.kpNumber} от ${state.formData.kpDate}.pdf`);
    addToDb(state.formData, state.listsKp)
    localStorage.setItem(`${state.kpNumber}formData`, JSON.stringify(state.formData))
    localStorage.setItem(`${state.kpNumber}listsKp`, JSON.stringify(state.listsKp))
    setIsNewKp(false)
  }, [state.formData, state.listsKp]);

  // Функции добавления и удаления строк/списков
  const addRowInPdf = useCallback((newObj) => {
    console.log(newObj);

    dispatch({ type: 'ADD_ROW_IN_PDF', payload: newObj });
  }, []);

  const deleteRow = useCallback((listId, rowIndex) => {
    dispatch({ type: 'DELETE_ROW', payload: { listId, rowIndex } });
  }, []);

  const deleteList = useCallback((id) => {
    dispatch({ type: 'DELETE_LIST', payload: { id } });
    if (!isNewKp) deleteListFromDb(id);
  }, [isNewKp]);

  const addRowOnList = async (row, listId) => {
    const rowWithListId = {
      ...row,
      listId,
    };

    if (!isNewKp) {
      try {
        // Добавляем строку в БД
        const savedRow = await MainApi.addRow(rowWithListId);

        // Обновляем состояние с ID из базы
        dispatch({
          type: 'ADD_ROW_ON_LIST',
          payload: { row: savedRow, listId }
        });
      } catch (error) {
        console.error("Ошибка при добавлении строки в БД:", error);
      }
    } else {
      // Добавляем строку локально (новый КП ещё не сохранён)
      const tempRow = { ...rowWithListId, id: Date.now() };

      dispatch({
        type: 'ADD_ROW_ON_LIST',
        payload: { row: tempRow, listId }
      });
    }
  };


  const deleteKp = async () => {
    if (isNewKp) {
      const confirmClear = window.confirm('КП ещё не сохранён. Очистить форму?');
      if (confirmClear) {
        dispatch({ type: 'UPDATE_FORM_DATA', payload: {} });
        dispatch({ type: 'UPDATE_LISTS', payload: [] });
        setIsNewKp(true);
      }
      return;
    }

    if (!formData.id) {
      alert('Ошибка: отсутствует ID КП для удаления.');
      return;
    }

    const confirmDelete = window.confirm('Удалить сохранённый КП и все связанные данные?');
    if (!confirmDelete) return;

    try {
      await MainApi.deleteKp(formData.id);
      alert('КП удалён из базы данных.');

      // Очистка UI
      dispatch({ type: 'UPDATE_FORM_DATA', payload: getEmptyFormData() });
      dispatch({ type: 'UPDATE_LISTS', payload: [] });

      setIsNewKp(true);
    } catch (err) {
      console.error('Ошибка при удалении КП:', err);
      alert('Не удалось удалить КП из базы данных.');
    }
  };


  return (
    <div className='page'>
      <Form
        downloadPDF={exportPDF}
        addRowInPdf={addRowInPdf}
        handleManagerChange={handleManagerChange}
        handleChangeInput={handleChangeInput}
        searchKp={searchKp}
        kpNumber={formData.kpNumber}
        deleteKp={deleteKp}
        formData={formData}
      />
      <div className="preview">
        <Header
          managerName={formData.managerName}
          managerJobTitle={formData.managerJobTitle}
          managerEmail={formData.managerEmail}
          managerTel={formData.managerTel}
          kpNumber={formData.kpNumber}
          kpDate={formatDate(formData.kpDate)}
          contractNumber={formData.contractNumber}
          contractDate={formatDate(formData.contractDate)}
          managerPhoto={formData.managerPhoto} />
        {listsKp.map((item) => (
          <Kp
            key={item.id}
            startEvent={formatDate(formData.startEvent)}
            endEvent={formatDate(formData.endEvent)}
            eventPlace={formData.eventPlace}
            countOfPerson={formData.countOfPerson}
            list={item}
            deleteRow={deleteRow}
            id={item.id}
            deleteList={deleteList}
            GetPrice={GetPrice}
            listTitle={formData.listTitle}
            startTimeStartEvent={formData.startTimeStartEvent}
            endTimeStartEvent={formData.endTimeStartEvent}
            startTimeEndEvent={formData.startTimeEndEvent}
            endTimeEndEvent={formData.endTimeEndEvent}
            deleteRowFromDb={deleteRowFromDb}
            updateRowInDb={updateRowInDb}
            isNewKp={isNewKp}
            addRowOnList={addRowOnList}
            dispatch={dispatch}
          />
        ))}
        <Suspense fallback={<div>Загрузка Footer...</div>}>
          <Footer
            lists={listsKp}
            countOfPerson={formData.countOfPerson}
            logisticsCost={parseInt(formData.logisticsCost)}
            isWithinMkad={formData.isWithinMkad}
            GetPrice={GetPrice} />
        </Suspense>
      </div>
    </div>
  );
}

export default React.memo(App);
