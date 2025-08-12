import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Input, DatePicker } from '@skbkontur/react-ui';
import { Add, ArrowBoldLeft } from '@skbkontur/react-icons';
import { MainApi } from '../../utils/MainApi'
import "./Form.css";
import FormRow from "../FormRow/FormRow";
import ProductPopup from "../ProductPopup/ProductPopup";
import PavelPhoto from '../../images/PavelPhoto.png';
import PeterPhoto from '../../images/PeterPhoto.jpg';
import SavedListsAccordion from "../SavedListsAccordion/SavedListsAccordion";
import Switcher from "../Switcher/Switcher";

function Form({
  onSubmit,
  kpNumber,
  formInfo,
  addList,
  listsSummary,
  dateToISO,
  getProductWeightWithMeasure,
  isNewKp,
  onDeleteRow,
  onUpdateRow,
  onAddRowOnList,
  onDeleteList,
}) {
  // Локальное состояние для полей формы КП

  const [formData, setFormData] = useState({
    kpNumber: kpNumber,
    kpDate: formInfo.kpDate,
    contractNumber: formInfo.contractNumber,
    contractDate: formInfo.contractDate,
    startEvent: formInfo.startEvent,
    endEvent: formInfo.endEvent,
    startTimeStartEvent: formInfo.startTimeStartEvent || '10:00',
    endTimeStartEvent: formInfo.endTimeStartEvent || '20:00',
    startTimeEndEvent: formInfo.startTimeEndEvent || '10:00',
    endTimeEndEvent: formInfo.endTimeEndEvent || '20:00',
    eventPlace: formInfo.eventPlace,
    countOfPerson: formInfo.countOfPerson,
    listTitle: formInfo.listTitle,
    isWithinMkad: formInfo.isWithinMkad || 'true',       // будем хранить как boolean (true/false) или "" до выбора
    logisticsCost: formInfo.logisticsCost,
    managerName: formInfo.managerName,
    managerJobTitle: formInfo.managerJobTitle,
    managerEmail: formInfo.managerEmail,
    managerTel: formInfo.managerTel,
    managerPhoto: formInfo.managerPhoto,
    manager: formInfo.manager || 'peter',
  });
  const [errors, setErrors] = useState({
    kpNumber: '',
    kpDate: '',
    contractNumber: '',
    contractDate: '',
    startEvent: '',
    endEvent: '',
    startTimeStartEvent: '',
    endTimeStartEvent: '',
    startTimeEndEvent: '',
    endTimeEndEvent: '',
    eventPlace: '',
    countOfPerson: '',
    logisticsCost: '',
    listTitle: '',
    _lists: '', // ошибки по листам/позициям при финальном сабмите
  });
  const MANAGERS = {
    peter: {
      managerPhoto: PeterPhoto,
      managerName: 'Петр Кург',
      managerJobTitle: 'Руководитель проекта',
      managerEmail: 'kurgi-bar@yandex.ru',
      managerTel: '+7 925 516-31-16',
    },
    pavel: {
      managerPhoto: PavelPhoto,
      managerName: 'Павел Кург',
      managerJobTitle: 'Руководитель проекта',
      managerEmail: 'kurgi-bar@yandex.ru',
      managerTel: '+7 925 516-31-16',
    },
  };

  const navigate = useNavigate();
  const [productToEdit, setProductToEdit] = useState(null);
  // Состояние для списка позиций КП (таблица)
  const [products, setProducts] = useState([]);
  const [showProductPopup, setShowProductPopup] = useState(false);

  useEffect(() => {
    if (!isNewKp) return;
    let cancelled = false;

    MainApi.getLastKpNumber()
      .then((res) => {
        if (cancelled) return;

        // бэк возвращает, например, "9"
        const last = parseInt(String(res).trim(), 10);
        const next = Number.isFinite(last) ? last + 1 : 1;

        setFormData(prev => ({ ...prev, kpNumber: String(next) }));
        setErrors(prev => ({ ...prev, kpNumber: '' }));
      })
      .catch((err) => {
        console.error('Ошибка получения следующего номера КП:', err);
        // фолбэк
        setFormData(prev => ({ ...prev, kpNumber: '1' }));
      });

    return () => { cancelled = true; };
  }, [isNewKp]);

  useEffect(() => {
    if (kpNumber != null && kpNumber !== '' && kpNumber !== formData.kpNumber) {
      setFormData(prev => ({ ...prev, kpNumber }));
      setErrors(prev => ({ ...prev, kpNumber: '' }));
    }
  }, [kpNumber]);
  useEffect(() => {
    const key = formData.manager || 'peter';
    const patch = {};
    for (const k of ['managerPhoto', 'managerName', 'managerJobTitle', 'managerEmail', 'managerTel']) {
      if (!formData[k]) patch[k] = MANAGERS[key][k];
    }
    if (Object.keys(patch).length) {
      setFormData(prev => ({ ...prev, ...patch }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidDate = (v) => /^\d{2}\.\d{2}\.\d{4}$/.test(v) || /^\d{4}-\d{2}-\d{2}$/.test(v);
  const isValidTime = (v) => /^\d{2}:\d{2}$/.test(v) && +v.slice(0, 2) < 24 && +v.slice(3, 5) < 60;
  const isPositiveInt = (v) => /^\d+$/.test(String(v)) && +v >= 1 && +v <= 99999;
  const isNonNegativeNumber = (v) => /^-?\d+(\.\d+)?$/.test(String(v)) && +v >= 0;
  const lenBetween = (s, min, max) => (s ?? '').toString().length >= min && (s ?? '').toString().length <= max;

  // Валидация одного поля
  const validateField = (name, value, all) => {
    switch (name) {
      case 'kpNumber':
        if (!String(value).trim()) return 'Обязательное поле';
        if (!/^\d{1,10}$/.test(String(value))) return 'Только цифры, 1–10 символов';
        return '';
      case 'kpDate':
        if (!isValidDate(value)) return 'Введите дату в формате DD.MM.YYYY';
        return '';
      case 'contractNumber':
        if (!String(value).trim()) return 'Обязательное поле';
        if (!lenBetween(value, 1, 30)) return 'До 30 символов';
        return '';
      case 'contractDate':
        if (!isValidDate(value)) return 'Введите дату в формате DD.MM.YYYY';
        return '';
      case 'startEvent':
        if (!isValidDate(value)) return 'Введите дату в формате DD.MM.YYYY';
        if (all?.endEvent && dateToISO(value) && dateToISO(all.endEvent) && dateToISO(value) > dateToISO(all.endEvent))
          return 'Дата начала позже даты окончания';
        return '';
      case 'endEvent':
        if (!isValidDate(value)) return 'Введите дату в формате DD.MM.YYYY';
        if (all?.startEvent && dateToISO(value) && dateToISO(all.startEvent) && dateToISO(all.startEvent) > dateToISO(value))
          return 'Дата окончания раньше даты начала';
        return '';
      case 'startTimeStartEvent':
      case 'endTimeStartEvent':
      case 'startTimeEndEvent':
      case 'endTimeEndEvent':
        if (!isValidTime(value)) return 'Формат HH:MM';
        return '';
      case 'eventPlace':
        if (!String(value).trim()) return 'Обязательное поле';
        if (!lenBetween(value, 2, 120)) return '2–120 символов';
        return '';
      case 'countOfPerson':
        if (!isPositiveInt(value)) return 'Целое число 1…99999';
        return '';
      case 'logisticsCost':
        if (!isNonNegativeNumber(value)) return 'Число ≥ 0';
        return '';
      case 'listTitle':
        if (!String(value).trim()) return 'Обязательное поле';
        if (!lenBetween(value, 2, 80)) return '2–80 символов';
        return '';
      default:
        return '';
    }
  };

  // Полная проверка формы + листов (на submit)
  const validateForm = (all, lists) => {
    const next = { ...errors, _lists: '' };

    // поля формы
    Object.keys(next).forEach(k => {
      if (k === '_lists') return;
      next[k] = validateField(k, all[k], all);
    });

    // листы/позиции
    if (!Array.isArray(lists) || lists.length === 0) {
      next._lists = 'Добавьте хотя бы один лист';
    } else if (lists.some(l => !Array.isArray(l.rows) || l.rows.length === 0)) {
      next._lists = 'В каждом листе должна быть хотя бы одна позиция';
    }

    const isValid = Object.values(next).every(v => !v);
    return { next, isValid };
  };

  const isFormValidNow = (() => {
    // пробегаемся по полям без setErrors
    const fieldsOk = Object.keys(errors).every(k => k === '_lists' || !errors[k]) &&
      validateField('kpNumber', formData.kpNumber, formData) === '' &&
      validateField('kpDate', formData.kpDate, formData) === '' &&
      validateField('contractNumber', formData.contractNumber, formData) === '' &&
      validateField('contractDate', formData.contractDate, formData) === '' &&
      validateField('startEvent', formData.startEvent, formData) === '' &&
      validateField('endEvent', formData.endEvent, formData) === '' &&
      validateField('startTimeStartEvent', formData.startTimeStartEvent, formData) === '' &&
      validateField('endTimeStartEvent', formData.endTimeStartEvent, formData) === '' &&
      validateField('startTimeEndEvent', formData.startTimeEndEvent, formData) === '' &&
      validateField('endTimeEndEvent', formData.endTimeEndEvent, formData) === '' &&
      validateField('eventPlace', formData.eventPlace, formData) === '' &&
      validateField('countOfPerson', formData.countOfPerson, formData) === '' &&
      validateField('logisticsCost', formData.logisticsCost, formData) === '' &&
      validateField('listTitle', formData.listTitle, formData) === '';
    const listsOk = Array.isArray(listsSummary) &&
      listsSummary.length > 0 &&
      listsSummary.every(l => Array.isArray(l.rows) && l.rows.length > 0);
    return fieldsOk && listsOk;
  })();

  // мгновенная валидация при изменении поля
  const handleValidatedChange = (name, value) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      const msg = validateField(name, value, updated);
      setErrors(e => ({ ...e, [name]: msg }));
      return updated;
    });
  };

  const handleManagerChange = (value) => {
    const m = value; // 'peter' | 'pavel'
    setFormData(prev => ({
      ...prev,
      manager: m,
      ...MANAGERS[m], // закидываем все связанные поля
    }));
  };

  // Валидация: пустые даты не блокируют форму; сравниваем только если обе заданы
  const isDatesValid = (() => {
    const s = dateToISO(formData.startEvent);
    const e = dateToISO(formData.endEvent);
    if (!s || !e) return true;
    return s <= e;
  })();

  const handleEditProduct = useCallback((product) => {
    setProductToEdit(product);
    setShowProductPopup(true);
  }, []);

  const handleUpdateProduct = useCallback((updatedProduct) => {
    setProducts(prev => prev.map(item =>
      item.id === updatedProduct.id
        ? {
          ...item,           // Сохраняем неизмененные поля
          ...updatedProduct  // Обновляем измененные поля
        }
        : item
    ));
    setProductToEdit(null);
    setShowProductPopup(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target ?? e;
    handleValidatedChange(name, value);
  }, []); // eslint-disable-line

  // Добавление новой позиции в таблицу (при сохранении всплывающего окна)
  const handleAddProduct = (product) => {
    // Присваиваем временный ID новой позиции и добавляем в список
    const newItem = { id: Date.now(), ...product };
    setProducts(prev => [...prev, newItem]);
    setShowProductPopup(false);
  };

  // Удаление позиции из списка по ID
  const handleRemoveProduct = useCallback((id) => {
    setProducts(prev => prev.filter(item => item.id !== id));
  }, []);

  // Отправка формы (создание нового КП)
  const handleSubmit = (e) => {
    e.preventDefault();
    const { next, isValid } = validateForm(formData, listsSummary);
    setErrors(next);
    if (!isValid) {
      // можно пробежаться и сфокусировать первое ошибочное поле, если нужно
      alert('Заполните обязательные поля корректно');
      return;
    }
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    } else {
      console.error('onSubmit не передан в Form');
    }
  };
  function toDDMMYYYY(input) {
    if (!input) return '';

    // Если это объект Date
    if (input instanceof Date && !isNaN(input)) {
      const day = String(input.getDate()).padStart(2, '0');
      const month = String(input.getMonth() + 1).padStart(2, '0');
      const year = input.getFullYear();
      return `${day}.${month}.${year}`;
    }

    // Если строка YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [year, month, day] = input.split('-');
      return `${day}.${month}.${year}`;
    }

    // Если уже DD.MM.YYYY
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(input)) {
      return input;
    }

    return '';
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Button
        use="default"
        icon={<ArrowBoldLeft />}
        onClick={() => navigate('/')}
      >
        На главную
      </Button>
      <h1 className="form__title">Коммерческое предложение</h1>

      {/* Секция: Основная информация */}
      <div className="form__section">
        <h3 className="form__section-title">Основная информация</h3>
        <div className="form__fields">
          <div className="form__field">
            <label className="form__label" htmlFor="kpNumber">Номер коммерческого предложения</label>
            <Input
              width="100%"
              id="kpNumber"
              name="kpNumber"
              className={`form__input ${errors.kpNumber ? 'error' : ''}`}
              value={(isNewKp) ? formData.kpNumber : formInfo.kpNumber}
              onValueChange={value => handleInputChange({ target: { name: 'kpNumber', value } })}
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="kpDate">Дата коммерческого предложения</label>
            <DatePicker
              id="kpDate"
              name="kpDate"
              className={`form__input ${errors.kpDate ? 'error' : ''}`}
              value={(isNewKp) ? toDDMMYYYY(formData.kpDate) : toDDMMYYYY(formInfo.kpDate)}
              onValueChange={value => handleInputChange({ target: { name: 'kpDate', value } })}
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="contractNumber">№ договора</label>
            <Input
              width="100%"
              id="contractNumber"
              name="contractNumber"
              className={`form__input ${errors.contractNumber ? 'error' : ''}`}
              value={formData.contractNumber}
              onValueChange={value => handleInputChange({ target: { name: 'contractNumber', value } })}
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="contractDate">Дата договора</label>
            <DatePicker
              id="contractDate"
              name="contractDate"
              className={`form__input ${errors.contractDate ? 'error' : ''}`}
              value={(isNewKp) ? toDDMMYYYY(formData.contractDate) : toDDMMYYYY(formInfo.contractDate)}
              onValueChange={value => handleInputChange({ target: { name: 'contractDate', value } })}
            />
          </div>
        </div>
      </div>

      {/* Секция: Данные мероприятия */}
      <div className="form__section">
        <h3 className="form__section-title">Данные мероприятия</h3>
        <div className="form__fields">

          <div className="form__field">
            <label className="form__label" htmlFor="startEvent">Дата начала</label>
            <DatePicker
              id="startEvent"
              name="startEvent"
              className={`form__input ${errors.startEvent ? 'error' : ''}`}
              value={(isNewKp) ? toDDMMYYYY(formData.startEvent) : toDDMMYYYY(formInfo.startEvent)}
              onValueChange={value => handleInputChange({ target: { name: 'startEvent', value } })}
            />
          </div>

          <div className="form__field form__field__time">
            <div className="form__field">
              <label className="form__label" htmlFor="startTimeStartEvent">Время начала</label>
              <Input
                width="100%"
                type="time"
                id="startTimeStartEvent"
                name="startTimeStartEvent"
                className={`form__input ${errors.startTimeStartEvent ? 'error' : ''}`}
                value={formData.startTimeStartEvent}
                onValueChange={value => handleInputChange({ target: { name: 'startTimeStartEvent', value } })}
              />

            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="endTimeStartEvent">Время окончания</label>
              <Input
                width="100%"
                type="time"
                id="endTimeStartEvent"
                name="endTimeStartEvent"
                className={`form__input ${errors.endTimeStartEvent ? 'error' : ''}`}
                value={formData.endTimeStartEvent}
                onValueChange={value => handleInputChange({ target: { name: 'endTimeStartEvent', value } })}
              />

            </div>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="endEvent">Дата окончания</label>
            <DatePicker
              id="endEvent"
              name="endEvent"
              className={`form__input ${errors.endEvent ? 'error' : ''}`}
              value={(isNewKp) ? toDDMMYYYY(formData.endEvent) : toDDMMYYYY(formInfo.endEvent)}
              onValueChange={value => handleInputChange({ target: { name: 'endEvent', value } })}
            />
            {!isDatesValid && (
              <div className="form__error" style={{ color: '#d00', marginTop: 8 }}>
                Дата начала не может быть позже даты окончания
              </div>
            )}
          </div>

          <div className="form__field form__field__time">
            <div className="form__field">
              <label className="form__label" htmlFor="startTimeEndEvent">Время начала</label>
              <Input
                width="100%"
                type="time"
                id="startTimeEndEvent"
                name="startTimeEndEvent"
                className={`form__input ${errors.startTimeEndEvent ? 'error' : ''}`}
                value={formData.startTimeEndEvent}
                onValueChange={value => handleInputChange({ target: { name: 'startTimeEndEvent', value } })}
              />

            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="endTimeEndEvent">Время окончания</label>
              <Input
                width="100%"
                type="time"
                id="endTimeEndEvent"
                name="endTimeEndEvent"
                className={`form__input ${errors.endTimeEndEvent ? 'error' : ''}`}
                value={formData.endTimeEndEvent}
                onValueChange={value => handleInputChange({ target: { name: 'endTimeEndEvent', value } })}
              />

            </div>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="eventPlace">Место проведения</label>
            <Input
              width="100%"
              id="eventPlace"
              name="eventPlace"
              value={formData.eventPlace}
              className={`form__input ${errors.eventPlace ? 'error' : ''}`}
              onValueChange={value => handleInputChange({ target: { name: 'eventPlace', value } })}
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="countOfPerson">Кол-во персон</label>
            <Input
              width="100%"
              type="number"
              id="countOfPerson"
              name="countOfPerson"
              className={`form__input ${errors.countOfPerson ? 'error' : ''}`}
              value={formData.countOfPerson}
              onValueChange={value => handleInputChange({ target: { name: 'countOfPerson', value } })}
            />
          </div>

          <div className="form__field form__field--full">
            <label className="form__label" htmlFor="listTitle">Название мероприятия</label>
            <Input
              width="100%"
              id="listTitle"
              name="listTitle"
              className={`form__input ${errors.listTitle ? 'error' : ''}`}
              value={formData.listTitle}
              onValueChange={value => handleInputChange({ target: { name: 'listTitle', value } })}
            />
          </div>

        </div>
      </div>

      {/* Секция: Логистика */}
      <div className="form__section">
        <h3 className="form__section-title">Логистика</h3>
        <div className="form__fields form__field_logistic">
          <div className="form__field">
            <label className="form__label">За пределами МКАД?</label>
            <Switcher
              ariaLabel="В пределах МКАД"
              name="isWithinMkad"
              value={formData.isWithinMkad ? "true" : "false"}
              options={[
                { value: "true", label: "Да" },
                { value: "false", label: "Нет" },
              ]}
              onChange={(val) =>
                handleInputChange({
                  target: { name: "isWithinMkad", value: val === "true" },
                })
              }
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="logisticsCost">
              Стоимость логистики
            </label>
            <Input
              width="100%"
              type="number"
              id="logisticsCost"
              name="logisticsCost"
              className={`form__input ${errors.logisticsCost ? 'error' : ''}`}
              value={formData.logisticsCost}
              onValueChange={(value) =>
                handleInputChange({
                  target: { name: 'logisticsCost', value },
                })
              }
            />
          </div>
        </div>
      </div>


      {/* Секция: Менеджер */}
      <div className="form__section">
        <h3 className="form__section-title">Ответственный менеджер</h3>
        <div className="form__fields">
          <div className="form__field form__field--full">
            <Switcher
              ariaLabel="Ответственный менеджер"
              name="manager"
              value={formData.manager || 'peter'} // или как у вас хранится
              options={[
                { value: 'peter', label: "Пётр" },
                { value: 'pavel', label: 'Павел' },
              ]}
              onChange={handleManagerChange}
            />

          </div>
        </div>
      </div>

      {/* Секция: Состав КП (таблица с позициями) */}
      <div className="form__section">
        <h3 className="form__section-title">Состав КП</h3>
        {Array.isArray(listsSummary) && listsSummary.length > 0 && (
          <SavedListsAccordion
            lists={listsSummary}
            isNewKp={isNewKp}              // прокинем из App
            onDeleteRow={onDeleteRow}      // (listId, rowIndex)
            onUpdateRow={onUpdateRow}      // (listId, rowIndex, updatedRow)
            onAddRowOnList={onAddRowOnList}// (row, listId)
            onDeleteList={onDeleteList}    // (listId)
            getProductWeightWithMeasure={getProductWeightWithMeasure}
          />
        )}
        <div className="form__table-container">

          {/* Ряды таблицы */}
          {products.map((prod) => (
            <FormRow
              key={prod.id}
              productData={prod}
              handleRemoveProduct={handleRemoveProduct}
              handleEditProduct={handleEditProduct}
              getProductWeightWithMeasure={getProductWeightWithMeasure}
            />
          ))}
          {errors._lists && (
            <div className="form__error" style={{ marginTop: 8 }}>{errors._lists}</div>
          )}
        </div>

        {/* Кнопки управления */}
        <div className='form__table-button'>
          <Button
            icon={<Add />}
            use="default"
            onClick={() => {
              setProductToEdit(null);
              setShowProductPopup(true);
            }}
          >
            Добавить позицию
          </Button>

          <Button
            use="primary"
            onClick={() => {
              if (!products || products.length === 0) {
                alert('Добавьте хотя бы одну позицию перед сохранением листа');
                return;
              }
              if (typeof addList === 'function') {
                addList(products);
              }
              setProducts([]);         // очистим текущий временный лист
              setProductToEdit(null);  // сброс редактируемого продукта, если был
            }}
          >
            Сохранить лист
          </Button>
        </div>

        {/* Попап */}
        {showProductPopup && (
          <ProductPopup
            onClose={() => {
              setProductToEdit(null);
              setShowProductPopup(false);
            }}
            onSave={productToEdit ? handleUpdateProduct : handleAddProduct}
            productToEdit={productToEdit}
          />
        )}
      </div>

      {/* Кнопка сохранения формы */}
      <div className="form__actions">
        <Button use="success" type="submit" disabled={!isFormValidNow}>
          Сохранить коммерческое предложение
        </Button>
      </div>
    </form>
  );
}

export default Form;
