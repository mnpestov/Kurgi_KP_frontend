import './App.css';
import React, { useReducer, useCallback, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Form from './components/Form/Form';
import PavelPhoto from './images/PavelPhoto.jpg';
import PeterPhoto from './images/PeterPhoto.jpg';
import { MainApi } from './utils/MainApi'
import Home from './components/Home/Home';
import Preview from './components/Preview/Preview';
import KpLoader from './components/KpLoader/KpLoader';


function App() {
  const [isNewKp, setIsNewKp] = useState(true)
  const [updetedRows, setUpdatedRows] = useState([])
  const navigate = useNavigate();

  const initialState = {
    formData: {},
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
    isWithinMkad: true,
    listTitle: ''
  });

  const kpPreviewSelectors = {
    listSelector: 'list list-preview',
    logoContainerSelector: 'logo-container logo-container-preview',
    logoSelector: 'logo logo-preview',
    subtitleSelector: 'subtitle subtitle-preview',
    kpNumberSelector: 'kpNumber kpNumber-preview',
    kpNumberTitleSelector: 'kpNumber_title kpNumber_title-preview',
    managerSelector: 'manager manager-preview',
    managerInfosSelector: 'manager_infos manager_infos-preview',
    managerPhotoSelector: 'manager__photo manager__photo-preview',
    listLogoSelector: 'list__logo list__logo-preview',
    listTitleSelector: 'list__title list__title-preview',
    listTableSelector: 'list__table list__table-preview',
    tableTitlesSelector: 'table__titles table__titles-preview',
    tableTitleSelector: 'table__title table__title-preview',
    tableSubtitleSelector: 'table__subtitle table__subtitle-preview',
    footerSelector: 'footer footer-preview',
    listTotalSelector: 'list__total list__total-preview',
    tabeLineProductSelector: 'tabel__line_product tabel__line_product-preview',
    rowActionsSelector: 'row-actions row-actions-preview',
    rowButtonSelector: 'row-button row-button-preview',
    tabelLineSelector: 'table__line tabel__line-preview',
    rowCountSelector: 'row_count row_count-preview',
    deleteButtonSelector: 'delete-button delete-button-preview',
    footerLogoContainerSelector: 'footer__logo-container footer__logo-container-preview',
    footerCountContainerSelector: 'footer__count-container footer__count-container-preview'
  }
  const kpPrintSelectors = {
    listSelector: 'list',
    logoContainerSelector: 'logo-container',
    logoSelector: 'logo',
    subtitleSelector: 'subtitle',
    kpNumberSelector: 'kpNumber',
    kpNumberTitleSelector: 'kpNumber_title',
    managerSelector: 'manager',
    managerInfosSelector: 'manager_infos',
    managerPhotoSelector: 'manager__photo',
    listLogoSelector: 'list__logo',
    listTitleSelector: 'list__title',
    listTableSelector: 'list__table',
    tableTitlesSelector: 'table__titles',
    tableTitleSelector: 'table__title',
    tableSubtitleSelector: 'table__subtitle',
    footerSelector: 'footer',
    listTotalSelector: 'list__total',
    tabeLineProductSelector: 'tabel__line_product',
    rowActionsSelector: 'row-actions',
    rowButtonSelector: 'row-button',
    tabelLineSelector: 'table__line',
    rowCountSelector: 'row_count',
    deleteButtonSelector: 'delete-button',
    footerLogoContainerSelector: 'footer__logo-container',
    footerCountContainerSelector: 'footer__count-container'
  }

  initialState.formData = getEmptyFormData()

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
          listsKp: action.payload.map(list => ({
            ...list,
            rows: [...(list.rows || [])].sort((a, b) => (a.order - b.order) || ((a.id ?? 0) - (b.id ?? 0))),
          })),
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

      case 'ADD_ROW_ON_LIST': {
        const { listId, row } = action.payload;
        return {
          ...state,
          listsKp: state.listsKp.map((l) => {
            if (l.id !== listId) return l;
            const rows = [...(l.rows || []), row];
            // (опционально) жёстко удерживаем порядок по order
            rows.sort((a, b) => (a.order - b.order) || ((a.id ?? 0) - (b.id ?? 0)));
            return { ...l, rows };
          }),
        };
      }
      case 'REFRESH_DATA':
        return {
          ...state,
          listsKp: [...state.listsKp]
        };

      case 'SYNC_ROW_UPDATE':
        return {
          ...state,
          listsKp: state.listsKp.map(list => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                rows: list.rows.map((row, idx) =>
                  idx === action.payload.rowIndex
                    ? { ...row, ...action.payload.updatedRow }
                    : row
                )
              };
            }
            return list;
          })
        };
      case 'SYNC_ALL_DATA':
        return {
          ...state,
          listsKp: action.payload,
          allRowsData: action.payload // синхронизировать все данные
        };



      case 'RESET_FORM':
        return {
          ...state,
          formData: {

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
            logisticsCost: '',
            isWithinMkad: true,
            listTitle: ''
          },
          listsKp: [],
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
                  index === action.payload.rowIndex
                    ? {
                      ...row,
                      ...action.payload.updatedRow,
                      order: Number.isInteger(action.payload.updatedRow?.order)
                        ? action.payload.updatedRow.order
                        : row.order,
                    }
                    : row
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

        const nextNumber = lastKpNumber ? parseInt(lastKpNumber) + 1 : 467;

        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: { kpNumber: nextNumber }
        });

      } catch (err) {
        console.log('Ошибка: ' + err);
      }
    };

    if (isNewKp) {
      fetchLastKpNumber();
    }
  }, [isNewKp]);

  useEffect(() => {
    // При изменении listsKp синхронизировать все данные
    dispatch({ type: 'SYNC_ALL_DATA', payload: listsKp });
  }, [listsKp]);

  const getProductWeightWithMeasure = (productWeight, typeOfProduct) => {
    if (!productWeight) return productWeight;
    return typeOfProduct === 'eat' ? `${productWeight}гр` : `${productWeight}мл`;
  };

  // Форматирование времени
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Оставляем только HH:MM
  };

  // Приводим DD.MM.YYYY -> YYYY-MM-DD, всё остальное аккуратно пропускаем
  const toISO = (v) => {
    if (!v) return null;
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(v)) {
      const [d, m, y] = v.split('.');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; // уже ISO
    if (v === 'Invalid date') return null;
    const d = new Date(v);
    return isNaN(d) ? null : d.toISOString().slice(0, 10);
  };
  const toHHMM = (v) => {
    if (!v) return null;
    if (/^\d{2}:\d{2}$/.test(v)) return v; // уже в нормальном виде
    if (/^\d{2}:\d{2}:\d{2}/.test(v)) return v.slice(0, 5); // обрезаем секунды
    return v; // оставляем как есть
  };

  // Нормализуем только поля-даты формы КП
  const normalizeKpPayload = (data) => ({
    ...data,
    kpDate: toISO(data.kpDate),
    contractDate: toISO(data.contractDate),
    startEvent: toISO(data.startEvent),
    endEvent: toISO(data.endEvent),
    startTimeStartEvent: toHHMM(data.startTimeStartEvent),
    endTimeStartEvent: toHHMM(data.endTimeStartEvent),
    startTimeEndEvent: toHHMM(data.startTimeEndEvent),
    endTimeEndEvent: toHHMM(data.endTimeEndEvent),
  });

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
    console.log(formData);

    if (isNewKp) {
      try {
        // 1) нормализуем шапку КП по датам
        const kpPayload = normalizeKpPayload(formData);

        // 2) создаём КП
        const kpRes = await MainApi.addKp(kpPayload);
        console.log('KP создан:', kpRes);

        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: { ...formData, id: kpRes.id },
        });

        // 3) создаём списки и строки
        let updatedLists = [];

        if (listsKp?.length > 0 && kpRes.id) {
          updatedLists = await Promise.all(
            listsKp.map(async (list) => {
              const listRes = await MainApi.addList({
                ...formData,
                startEvent: toISO(formData.startEvent),
                endEvent: toISO(formData.endEvent),
                kpId: kpRes.id,
              });
              let createdRows = [];
              if (list.rows?.length > 0) {
                createdRows = await Promise.all(
                  list.rows.map((row, i) =>
                    MainApi.addRow({
                      ...row,
                      listId: listRes.id,
                      // если локально уже есть order — уважим его, иначе индекс
                      order: Number.isInteger(row.order) ? row.order : i,
                    })
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

        // 4) редирект на предпросмотр по номеру (у тебя просмотр грузит по kpNumber)
        if (kpRes?.kpNumber) {
          navigate(`/kp/${kpRes.kpNumber}`);
        }

        setIsNewKp(false);
        console.log('✅ Все данные успешно записаны');
      } catch (err) {
        console.error('Ошибка при создании KP:', err);
        throw err;
      }
    } else {
      // Редактирование существующего КП: обновляем изменённые строки
      try {
        console.log('update');
        console.log(formData.kpNumber);

        const updatedKp = await MainApi.updateKp(formData, formData.kpNumber)
        console.log('✅ Данные коммерческого предложения обновлены');
        console.log(updatedKp?.kp.kpNumber);

        if (updatedKp?.kp.kpNumber) {
          navigate(`/kp/${updatedKp.kp.kpNumber}`);
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
    const currentKp = await MainApi.getKp(kpNumber);
    updateCurrentKp(currentKp);
    // если не найдено, MainApi.getKp выбросит исключение, которое пойдет дальше
    return currentKp;
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

  // Функция экспорта в PDF
  const exportPDF = useCallback(async () => {
    // сохраняем режим редактирования как существующий КП (как было)
    setIsNewKp(false);

    // A4 landscape в мм
    const A4_WIDTH_MM = 297;
    const A4_HEIGHT_MM = 210;

    // Целевая «плотность» для растрового кадра (200 dpi даёт отличное качество печати)
    const TARGET_DPI = 200;
    const MM_PER_INCH = 25.4;
    const targetPxWidth = Math.round((A4_WIDTH_MM / MM_PER_INCH) * TARGET_DPI); // ~2338px

    // Хелпер: даунскейл холст до targetPxWidth и верни JPEG dataURL
    const canvasToJPEG = (srcCanvas, maxWidthPx = targetPxWidth, quality = 0.85) => {
      const { width, height } = srcCanvas;
      // если ширина и так меньше лимита — просто конвертируем
      if (width <= maxWidthPx) {
        return srcCanvas.toDataURL("image/jpeg", quality);
      }
      const scale = maxWidthPx / width;
      const dst = document.createElement("canvas");
      dst.width = Math.round(width * scale);
      dst.height = Math.round(height * scale);
      const ctx = dst.getContext("2d");
      // чуть лучше ресемплинг
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(srcCanvas, 0, 0, dst.width, dst.height);
      return dst.toDataURL("image/jpeg", quality);
    };

    const pdf = new jsPDF("landscape", "mm", "a4");
    const lists = document.querySelectorAll(".list");

    for (const [index, list] of lists.entries()) {
      // scale=2 оставляем для чёткости рендеринга шрифтов и линий
      const canvas = await html2canvas(list, { scale: 2 });

      // Конвертация и сжатие: PNG -> JPEG + кап по пиксельной ширине
      const imgData = canvasToJPEG(canvas, targetPxWidth, 0.85);

      // Поддерживаем пропорции: ширина по всей странице, высота — по аспекту
      const imgWidthMm = A4_WIDTH_MM;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

      if (index !== 0) pdf.addPage("a4", "landscape");
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, Math.min(imgHeightMm, A4_HEIGHT_MM));
    }

    pdf.save(`КП № ${state.formData.kpNumber} от ${state.formData.kpDate}.pdf`);
  }, [state.formData, state.listsKp]);

  const exportHiddenPDF = useCallback(async () => {
    // сохраняем режим редактирования как существующий КП (как было)
    setIsNewKp(false);

    // A4 landscape в мм
    const A4_WIDTH_MM = 297;
    const A4_HEIGHT_MM = 210;

    // Целевая «плотность» для растрового кадра (200 dpi даёт отличное качество печати)
    const TARGET_DPI = 200;
    const MM_PER_INCH = 25.4;
    const targetPxWidth = Math.round((A4_WIDTH_MM / MM_PER_INCH) * TARGET_DPI); // ~2338px

    // Хелпер: даунскейл холст до targetPxWidth и верни JPEG dataURL
    const canvasToJPEG = (srcCanvas, maxWidthPx = targetPxWidth, quality = 0.85) => {
      const { width, height } = srcCanvas;
      // если ширина и так меньше лимита — просто конвертируем
      if (width <= maxWidthPx) {
        return srcCanvas.toDataURL("image/jpeg", quality);
      }
      const scale = maxWidthPx / width;
      const dst = document.createElement("canvas");
      dst.width = Math.round(width * scale);
      dst.height = Math.round(height * scale);
      const ctx = dst.getContext("2d");
      // чуть лучше ресемплинг
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(srcCanvas, 0, 0, dst.width, dst.height);
      return dst.toDataURL("image/jpeg", quality);
    };

    const hidenPdf = new jsPDF("landscape", "mm", "a4");
    const lists = document.querySelectorAll(".hiden-list");

    for (const [index, list] of lists.entries()) {
      // scale=2 оставляем для чёткости рендеринга шрифтов и линий
      const canvas = await html2canvas(list, {
        scale: 2,
        onclone: (clonedDoc) => {
          const clonedList = clonedDoc.querySelectorAll(".hiden-list")[index];
          if (clonedList) {
            clonedList.style.visibility = "visible";
            clonedList.style.position = "static";
            clonedList.style.zIndex = "auto";
          }
        }
      });

      // Конвертация и сжатие: PNG -> JPEG + кап по пиксельной ширине
      const imgData = canvasToJPEG(canvas, targetPxWidth, 0.85);

      // Поддерживаем пропорции: ширина по всей странице, высота — по аспекту
      const imgWidthMm = A4_WIDTH_MM;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

      if (index !== 0) hidenPdf.addPage("a4", "landscape");
      hidenPdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, Math.min(imgHeightMm, A4_HEIGHT_MM));
    }

    hidenPdf.save(`КП № ${state.formData.kpNumber} от ${state.formData.kpDate}.pdf`);
  }, [state.formData, state.listsKp]);

  const downloadSpec = useCallback(async () => {
    const A4_WIDTH_MM = 297;
    const A4_HEIGHT_MM = 210;
    const TARGET_DPI = 200;
    const MM_PER_INCH = 25.4;
    const targetPxWidth = Math.round((A4_WIDTH_MM / MM_PER_INCH) * TARGET_DPI); // ≈2338px

    const canvasToJPEG = (srcCanvas, maxWidthPx = targetPxWidth, quality = 0.85) => {
      const { width, height } = srcCanvas;
      if (width <= maxWidthPx) {
        return srcCanvas.toDataURL("image/jpeg", quality);
      }
      const scale = maxWidthPx / width;
      const dst = document.createElement("canvas");
      dst.width = Math.round(width * scale);
      dst.height = Math.round(height * scale);
      const ctx = dst.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(srcCanvas, 0, 0, dst.width, dst.height);
      return dst.toDataURL("image/jpeg", quality);
    };

    const compactPdf = new jsPDF("landscape", "mm", "a4");
    const listsCompact = document.querySelectorAll(".listCompact");

    for (const [index, list] of listsCompact.entries()) {
      const canvas = await html2canvas(list, {
        scale: 2,
        onclone: (clonedDoc) => {
          const clonedList = clonedDoc.querySelectorAll(".listCompact")[index];
          if (clonedList) {
            clonedList.style.visibility = "visible";
            clonedList.style.position = "static";
            clonedList.style.zIndex = "auto";
          }
        }
      });

      const imgData = canvasToJPEG(canvas, targetPxWidth, 0.85);
      const imgWidthMm = A4_WIDTH_MM;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

      if (index !== 0) compactPdf.addPage("a4", "landscape");
      compactPdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, Math.min(imgHeightMm, A4_HEIGHT_MM));
    }

    compactPdf.save(`Спецификация к КП № ${state.formData.kpNumber} от ${state.formData.kpDate}.pdf`);
  }, [state.formData, state.listsKp]);



  const deleteRow = useCallback((listId, rowIndex) => {
    dispatch({ type: 'DELETE_ROW', payload: { listId, rowIndex } });
  }, []);

  const deleteList = useCallback((id) => {
    dispatch({ type: 'DELETE_LIST', payload: { id } });
    if (!isNewKp) deleteListFromDb(id);
  }, [isNewKp]);

  const addRowOnList = async (row, listId) => {
    // найдём список, чтобы понять текущую длину
    const list = state.listsKp.find((l) => l.id === listId);
    const nextOrder = (list?.rows?.length ?? 0);
    const rowWithListIdAndOrder = {
      ...row,
      listId,
      order: Number.isInteger(row.order) ? row.order : nextOrder,
    };

    if (!isNewKp) {
      try {
        const savedRow = await MainApi.addRow(rowWithListIdAndOrder);
        dispatch({
          type: 'ADD_ROW_ON_LIST',
          payload: { row: savedRow, listId },
        });
      } catch (error) {
        console.error('Ошибка при добавлении строки в БД:', error);
      }
    } else {
      // Черновик: пока нет id из БД — сгенерируем временный
      const tempRow = { ...rowWithListIdAndOrder, id: Date.now() };
      dispatch({
        type: 'ADD_ROW_ON_LIST',
        payload: { row: tempRow, listId },
      });
    }
  };

  const onDeleteRow = useCallback(async (listId, rowIndex) => {
    // локально
    dispatch({ type: 'DELETE_ROW', payload: { listId, rowIndex } });
    // в БД (если КП уже существует)
    if (!isNewKp) {
      const list = state.listsKp.find(l => l.id === listId);
      const row = list?.rows?.[rowIndex];
      if (row?.id) await deleteRowFromDb(row.id);
    }
  }, [isNewKp, state.listsKp]);

  const onUpdateRow = useCallback(async (listId, rowIndex, updatedRow) => {
    // локально
    dispatch({ type: 'UPDATE_ROW', payload: { listId, rowIndex, updatedRow } });
    // в БД (если КП уже существует)
    if (!isNewKp) {
      await updateRowInDb(updatedRow);
    }
  }, [isNewKp]);

  return (
    <Routes>
      {/* Главная страница */}
      <Route
        path="/"
        element={
          <Home
            searchKp={searchKp}
            dispatch={dispatch}
            setIsNewKp={setIsNewKp}
            getEmptyFormData={getEmptyFormData} />}
      />

      {/* Страница формы нового КП */}
      <Route
        path="/new"
        element={
          <Form
            dateToISO={toISO}
            listsSummary={listsKp}
            onSubmit={(data) => addToDb(data, listsKp)}
            addList={(rows) => dispatch({ type: 'ADD_ROW_IN_PDF', payload: rows })}
            kpNumber={formData.kpNumber}
            formInfo={formData}
            getProductWeightWithMeasure={getProductWeightWithMeasure}
            isNewKp={isNewKp}
            onDeleteRow={onDeleteRow}
            onUpdateRow={onUpdateRow}
            onAddRowOnList={addRowOnList}
            onDeleteList={deleteList}
          />
        }
      />

      <Route
        path="/kp/:kpNumber"
        element={<KpLoader dispatch={dispatch} setIsNewKp={setIsNewKp} />}
      />

      {/* Страница превью КП */}
      <Route
        path="/preview"
        element={
          <Preview
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
            downloadPDF={exportPDF}
            downloadSpec={downloadSpec}
            getProductWeightWithMeasure={getProductWeightWithMeasure}
            getDeclination={getDeclination}
            exportHiddenPDF={exportHiddenPDF}
            kpPreviewSelectors={kpPreviewSelectors}
            kpPrintSelectors={kpPrintSelectors}
          />
        }
      />
    </Routes>
  );
}

export default React.memo(App);
