import React from "react";
import './FormRow.css';
import { Button } from '@skbkontur/react-ui';
import { Edit, Trash } from '@skbkontur/react-icons';
// import useIsMobile from '../../hooks/useIsMobile';

function FormRow({
  handleRemoveProduct,
  productData,
  handleEditProduct,
  getProductWeightWithMeasure
}) {

  // const isMobile = useIsMobile();

  return (
    <div className="form__table-row">
      <div className="cell cell--name">
        <span>{productData.product}</span>
        <span className="composition__mobile">{productData.composition}</span>
      </div>
      <div className="cell cell--weight">
        <span>{getProductWeightWithMeasure(productData.productWeight, productData.typeOfProduct)}</span>
      </div>
      <div className="cell cell--qty">
        <span>{productData.countOfProduct}</span>
      </div>
      <div className="cell cell--price">
        <span>{productData.priceOfProduct}</span>
      </div>
      <div className="cell cell--total">
        <span>{Number(productData.priceOfProduct) * Number(productData.countOfProduct) || 0}</span>
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
