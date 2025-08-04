import React from "react";
import './FormRow.css';

function FormRow({
  id,
  number,
  handleInputChange,
  handleRemoveProduct,
  productData,
}) {

  return (
    <tr className="form__row-column">
      <td className="form__row-column-name">
        <input
          className="input"
          type="text"
          id={id}
          placeholder="Наименование товара"
          name="product"
          // onChange={handleInputChange} 
          autoComplete="off"
          aria-label={`Наименование товара ${number}`}
          value={productData.product}
          required
          disabled
        />
      </td>
      <td className="form__row-column-name">
        <input
          className="input"
          type="text"
          id={id}
          placeholder="Описание/состав товара"
          name="composition"
          // onChange={handleInputChange} 
          autoComplete="off"
          aria-label={`Описание товара ${number}`}
          value={productData.composition}
          required
          disabled
        />
      </td>
      <td className="form__row-column-name">
        <input
          className="input"
          type="number"
          id={id}
          placeholder="Вес товара"
          name="productWeight"
          // onChange={handleInputChange} 
          autoComplete="off"
          aria-label={`Вес товара ${number}`}
          min="0"
          value={productData.productWeight}
          disabled
        />
      </td>
      <td className="form__row-column-name">
        <select
          className="form__select"
          name="typeOfProduct"
          id={id}
          // onChange={handleInputChange}
          aria-label={`Тип товара ${number}`}
          value={productData.typeOfProduct}
          required
          disabled
        >
          <option value="">-- Выберите тип --</option>
          <option value="eat">Еда</option>
          <option value="drink">Напитки</option>
          <option value="organisation">Организация кейтеринга</option>
        </select>
      </td>
      <td className="form__row-column-name">
        <input
          className="input"
          type="number"
          id={id}
          placeholder="Количество товара"
          name="countOfProduct"
          // onChange={handleInputChange} 
          autoComplete="off"
          aria-label={`Количество товара ${number}`}
          min="0"
          value={productData.countOfProduct}
          required
          disabled
        />
      </td>
      <td className="form__row-column-name">
        <input
          className="input"
          type="number"
          id={id}
          placeholder="Стоимость товара"
          name="priceOfProduct"
          // onChange={handleInputChange} 
          autoComplete="off"
          aria-label={`Стоимость товара ${number}`}
          min="0"
          value={productData.priceOfProduct}
          required
          disabled
        />
      </td>
      <td className="form__row-column-name actions">
        <button type="button" onClick={() => handleRemoveProduct(id)} className="remove-button" aria-label={`Удалить товар ${number}`}>
          Удалить
        </button>
      </td>
    </tr>
  );
}

export default React.memo(FormRow);
