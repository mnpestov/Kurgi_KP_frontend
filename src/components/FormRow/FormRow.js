import React from "react";
import './FormRow.css';
import { Input, Button } from '@skbkontur/react-ui';
import { Edit, Trash } from '@skbkontur/react-icons';
import useIsMobile from '../../hooks/useIsMobile';

function FormRow({
  handleRemoveProduct,
  productData,
  handleEditProduct,
}) {

  const isMobile = useIsMobile();

  return (
    <div className="form__table-row">
      <div className="cell cell--name">
        <Input
          disabled
          width="100%"
          name="product"
          value={productData.product}
          placeholder="Наименование товара"
        />
        {isMobile && (
          <span className="composition__mobile">{productData.composition}</span>
        )}
      </div>

      {!isMobile && (
        <div className="cell cell--composition">
          <Input
            disabled
            width="100%"
            name="composition"
            value={productData.composition}
            placeholder="Описание/состав товара"
          />
        </div>
      )}

      <div className="cell cell--weight">
        <Input
          disabled
          width="100%"
          name="productWeight"
          type="number"
          value={productData.productWeight}
          placeholder="Вес"
        />
      </div>
      <div className="cell cell--qty">
        <Input
          disabled
          width="100%"
          name="countOfProduct"
          type="number"
          value={productData.countOfProduct}
          placeholder="Кол-во"
        />
      </div>
      <div className="cell cell--price">
        <Input
          disabled
          width="100%"
          name="priceOfProduct"
          type="number"
          value={productData.priceOfProduct}
          placeholder="Стоимость"
        />
      </div>
      <div className="cell cell--total">
        {Number(productData.priceOfProduct) * Number(productData.countOfProduct) || 0}
      </div>
      <div className="cell cell--edit">
        <Button
          icon={<Edit style={{ width: 16, height: 16 }} />}
          use="link"
          narrow
          onClick={() => handleEditProduct(productData)}
        />
      </div>
      <div className="cell cell--delete">
        <Button
          icon={<Trash style={{ width: 16, height: 16 }} />}
          use="link"
          narrow
          onClick={() => handleRemoveProduct(productData.id)}
        />
      </div>
    </div>
  );

}

export default React.memo(FormRow);
