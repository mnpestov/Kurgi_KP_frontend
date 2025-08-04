import React, { useState, useCallback } from "react";
import './Form.css';
import FormRow from '../FormRow/FormRow';
import ProductPopup from '../ProductPopup/ProductPopup';

function Form({
  downloadPDF,
  addRowInPdf,
  handleManagerChange,
  handleChangeInput,
  searchKp,
  kpNumber,
  formData,
  deleteKp,
  downloadSpec
}) {

  const [showPopup, setShowPopup] = useState(false);
  const [products, setProducts] = useState([]);
  const [request, setReq] = useState('')
  // console.log('we are in form now');
  // console.log(formData);


  function extractNumberFromPersonString(str) {
    if (!str) return '';
    const match = String(str).match(/\d+/);
    return match ? Number(match[0]) : '';
  }

  const handleSearchKp = () => {
    console.log(request);

    searchKp(request)
  }

  const handleChangeSearchInput = (e) => {
    setReq(e.target.value)
  }

  // Универсальный обработчик изменений ввода
  const handleInputChange = useCallback((e) => {
    const { id, name, value } = e.target;
    setProducts(prevProducts => {
      const existingProduct = prevProducts.find(product => product.id === id);
      if (existingProduct) {
        const updatedProduct = { ...existingProduct, [name]: value };
        // Если изменяется количество или цена, пересчитываем итог
        if (name === 'countOfProduct' || name === 'priceOfProduct') {
          const count = parseInt(updatedProduct.countOfProduct, 10) || 0;
          const price = parseInt(updatedProduct.priceOfProduct, 10) || 0;
          updatedProduct.total = count * price;
        }
        return prevProducts.map(product => product.id === id ? updatedProduct : product);
      } else {
        // Создание нового товара
        const newProduct = { id, [name]: value };
        if (name === 'countOfProduct' || name === 'priceOfProduct') {
          newProduct.total = 0;
        }
        return [...prevProducts, newProduct];
      }
    });
  }, []);

  const handleAddProduct = (productData) => {
    console.log('add');

    setProducts((prevProducts) => [
      ...prevProducts,
      {
        id: Date.now(), // Уникальный идентификатор (можно использовать UUID или другой метод)
        ...productData, // Добавляем все поля из productData
      },
    ]);
  };

  // Удаление строки товара
  const handleRemoveProduct = useCallback((id) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  }, []);

  // Сохранение строк товаров в списке КП
  const addRow = useCallback((e) => {
    e.preventDefault();
    // Разбиваем массив products на группы по 7 элементов
    const chunkSize = 7;
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      addRowInPdf(chunk); // Передаём текущую группу в addRowInPdf
    }

    e.target.reset(); // Сброс формы
    setProducts([]);  // Очищаем массив products
  }, [products, addRowInPdf]);


  return (
    <div className="form">
      <fieldset className="form__search">
        <span>Поиск коммерческого предложения</span>
        <div className="search__search-line">
          <input type="text" name="request" className="search__input" placeholder="Введите номер коммерческого предложения" onChange={handleChangeSearchInput} autoComplete="off" required />
          <button type="button" className="search__btn" onClick={handleSearchKp}></button>
        </div>
      </fieldset>
      {/* <fieldset className="form__search">
        <span>Загрузить последнее КП?</span>
          <button type="button" className="search__btn_in-localStorage" onClick={handleSearchKp}>Загрузить</button>
      </fieldset> */}
      <fieldset className="form__details">
        {/* Реквизиты КП */}
        <div className="form__detail">
          <h2 className="form__title">Реквизиты КП</h2>
          <label htmlFor="kpNumber" className="label">№ КП
            <input
              id="kpNumber"
              className="input"
              type="text"
              placeholder="KP number"
              name="kpNumber"
              onChange={handleChangeInput}
              value={kpNumber}
              required
              disabled
            />
          </label>
          <label htmlFor="kpDate" className="label">Дата КП
            <input
              className="input"
              id="kpDate"
              type="date"
              name="kpDate"
              min="2000-01-01"
              max="2030-12-31"
              onChange={handleChangeInput}
              value={formData.kpDate || ''}
              required
            />
          </label>
          <label htmlFor="contractNumber" className="label">№ договора
            <input
              id="contractNumber"
              className="input"
              type="text"
              placeholder="Contract number"
              name="contractNumber"
              onChange={handleChangeInput}
              value={formData.contractNumber || ''}
              required
            />
          </label>
          <label htmlFor="contractDate" className="label">Дата договора
            <input
              id="contractDate"
              className="input"
              type="date"
              name="contractDate"
              min="2000-01-01"
              max="2030-12-31"
              onChange={handleChangeInput}
              value={formData.contractDate || ''}
              required
            />
          </label>
        </div>
        {/* Реквизиты КП */}

        {/* Общая информация по мероприятию */}
        <div className="form__detail">
          <h2 className="form__title">Общая информация по мероприятию</h2>
          <label htmlFor="listTitle" className="label">Заголовок
            <input
              id="listTitle"
              className="input"
              type="text"
              placeholder="Заголовок"
              name="listTitle"
              onChange={handleChangeInput}
              value={formData.listTitle || ''}
              required
            />
          </label>
          <label htmlFor="startEvent" className="label">Дата начала мероприятия
            <input
              id="startEvent"
              className="input"
              type="date"
              name="startEvent"
              min="2000-01-01"
              max="2030-12-31"
              onChange={handleChangeInput}
              value={formData.startEvent || ''}
              required
            />
            <div className="inputTime">
              C
              <input
                id="startTimeStartEvent"
                className="input"
                type="time"
                name="startTimeStartEvent"
                min="00:00"
                max="23:59"
                onChange={handleChangeInput}
                value={formData.startTimeStartEvent || ''}
                required
              />
              по
              <input
                id="endTimeStartEvent"
                className="input"
                type="time"
                name="endTimeStartEvent"
                min="00:00"
                max="23:59"
                onChange={handleChangeInput}
                value={formData.endTimeStartEvent || ''}
                required
              />
            </div>
          </label>
          <label htmlFor="endEvent" className="label">Дата окончания мероприятия
            <input
              id="endEvent"
              className="input"
              type="date"
              name="endEvent"
              min="2000-01-01T00:00"
              max="2030-12-31T23:59"
              onChange={handleChangeInput}
              value={formData.endEvent || ''}
              required
            />
            <div className="inputTime">
              C
              <input
                id="startTimeEndEvent"
                className="input"
                type="time"
                name="startTimeEndEvent"
                min="00:00"
                max="23:59"
                onChange={handleChangeInput}
                value={formData.startTimeEndEvent || ''}
                required
              />
              по
              <input
                id="endTimeEndEvent"
                className="input"
                type="time"
                name="endTimeEndEvent"
                min="00:00"
                max="23:59"
                onChange={handleChangeInput}
                value={formData.endTimeEndEvent || ''}
                required
              />
            </div>
          </label>
          <label htmlFor="eventPlace" className="label">Место проведения
            <input
              id="eventPlace"
              className="input"
              type="text"
              placeholder="Место проведения"
              name="eventPlace"
              onChange={handleChangeInput}
              value={formData.eventPlace || ''}
              required
            />
          </label>
          <label htmlFor="countOfPerson" className="label">Количество персон
            <input
              id="countOfPerson"
              className="input"
              type="number"
              placeholder="Количество персон"
              name="countOfPerson"
              onChange={handleChangeInput}
              value={extractNumberFromPersonString(formData.countOfPerson)}
              required
            />
          </label>
        </div>
        {/* Общая информация по мероприятию */}

        {/* Доставка */}
        <div className="form__detail">
          <h2 className="form__title">Доставка</h2>
          <span className="label">В пределах МКАД?</span>
          <div className="radio-group">
            <label htmlFor="logisticTrue">
              <input
                id="logisticTrue"
                type="radio"
                name="isWithinMkad"
                value="true"
                onChange={handleChangeInput}
                required
              />
              <span className="radio-title">Да</span>
            </label>
            <label htmlFor="logisticFalse">
              <input
                id="logisticFalse"
                type="radio"
                name="isWithinMkad"
                value="false"
                onChange={handleChangeInput}
                required
              />
              <span className="radio-title">Нет</span>
            </label>
          </div>
          <label htmlFor="logisticsCost" className="label">Стоимость логистики
            <input
              id="logisticsCost"
              className="input"
              type="number"
              placeholder="Стоимость логистики"
              name="logisticsCost"
              onChange={handleChangeInput}
              value={formData.logisticsCost || ''}
              min="0"
              required
            />
          </label>
        </div>
        {/* Доставка */}

        {/* Менеджер */}
        <div className="form__detail">
          <h2 className="form__title">Менеджер</h2>
          <div className="radio-group">
            <label htmlFor="managerTrue">
              <input
                id="managerTrue"
                type="radio"
                name="manager"
                value="true"
                onChange={handleManagerChange}
                required
              />
              <span className="radio-title">Петр</span>
            </label>
            <label htmlFor="managerFalse">
              <input
                id="managerFalse"
                type="radio"
                name="manager"
                value="false"
                onChange={handleManagerChange}
                required
              />
              <span className="radio-title">Павел</span>
            </label>
          </div>
        </div>
        {/* Менеджер */}

      </fieldset >
      {/* Товары */}
      < fieldset className="form__products" >
        <h2 className="form__title">Товары</h2>
        <form id="form" className="form__row" onSubmit={addRow}>
          <table>
            <thead>
              <tr>
                <th>Наименование товара</th>
                <th>Описание/состав товара</th>
                <th>Вес товара</th>
                <th>Тип товара</th>
                <th>Количество товара</th>
                <th>Стоимость товара</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <FormRow
                  key={product.id}
                  id={product.id}
                  number={index + 1}
                  productData={product}
                  handleInputChange={handleInputChange}
                  handleRemoveProduct={handleRemoveProduct}
                />
              ))}
            </tbody>
          </table>

          <button type="button" onClick={() => setShowPopup(true)} className="add-product-button">Добавить товар</button>
          {showPopup && (
            <ProductPopup
              onClose={() => setShowPopup(false)} // Закрытие popup
              onSave={handleAddProduct} // Передаем функцию для сохранения данных
            />
          )}
          <button type="submit" className="save-button">Сохранить</button>
        </form>
      </fieldset >
      <button type="button" onClick={deleteKp} className="download-button form__delete-kp-btn">
        Удалить КП
      </button>
      <button type="button" onClick={downloadPDF} className="download-button">Скачать PDF</button>
      <button type="button" onClick={downloadSpec} className="download-button">Скачать спецификацию</button>
    </div >
  );
}

export default React.memo(Form);