import React, { useState } from "react";
import './Row.css';

function Row({ data, index, deleteRow, listId, deleteRowFromDb, updateRowInDb, rowId, isNewKp, dispatch }) {
    const { composition } = data;
    const [translateX, setTranslateX] = useState(0);
    const [startX, setStartX] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({ ...data });
    const totalCostOfProduct = editedData.countOfProduct * editedData.priceOfProduct;

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        if (diffX < 0) {
            setTranslateX(Math.max(diffX, -150));
        } else {
            setTranslateX(Math.min(diffX, 0));
        }
    };

    const handleTouchEnd = () => {
        if (translateX <= -75) {
            setTranslateX(-150);
        } else {
            setTranslateX(0);
        }
    };

    const handleDelete = () => {
        deleteRow(listId, index);
        if (!isNewKp) deleteRowFromDb(rowId)
        setTranslateX(0);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setTranslateX(0);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
        dispatch({ type: 'UPDATE_ROW', payload: { listId, rowIndex: index, updatedRow: editedData } });
        if (!isNewKp) updateRowInDb(editedData)
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData({ ...editedData, [name]: value });
    };

    const getProductWeightWithMeasure = (productWeight, typeOfProduct) => {
        if (!productWeight) return productWeight;
        return typeOfProduct === 'eat' ? `${productWeight}гр` : `${productWeight}мл`;
    };

    const productWeightWithMeasure = getProductWeightWithMeasure(editedData.productWeight, editedData.typeOfProduct);

    return (
        <div className="row-wrapper">
            <div className="row-actions">
                <button type="button" className="row-button delete-button" onClick={handleDelete}>delete</button>
                <button type="button" className="row-button edit-button" onClick={handleEdit}>edit</button>
            </div>
            <tbody
                id={`table__row_${index}`}
                className="table__row-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ transform: `translateX(${translateX}px)` }}
            >
                <tr className="table__row">
                    {isEditing ? (
                        <>
                            <td className="table__line-container">
                                <div className="table__line_input-container">
                                    <input
                                        className="row_count-input row_count-input-product"
                                        type="text"
                                        name="product"
                                        value={editedData.product}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        className="row_count-input row_count-input-product"
                                        type="text"
                                        name="composition"
                                        value={editedData.composition}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        className="row_count-input row_count-input-product"
                                        type="text"
                                        name="productWeight"
                                        value={editedData.productWeight}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </td>
                            <td>
                                <input
                                    className="row_count-input"
                                    type="number"
                                    name="countOfProduct"
                                    value={editedData.countOfProduct}
                                    onChange={handleInputChange}
                                />
                            </td>
                            <td>
                                <input
                                    className="row_count-input"
                                    type="number"
                                    name="priceOfProduct"
                                    value={editedData.priceOfProduct}
                                    onChange={handleInputChange}
                                />
                            </td>
                            <td className="save-button__container row_count">
                                <button className="row-button save-button" type="button" onClick={handleSaveEdit}>Сохранить</button>
                            </td>
                        </>
                    ) : (
                        <>
                            <td className="table__line-container">
                                <p className="table__line tabel__line_product">{`${editedData.product || ' '} `}
                                    <span className="table__line tabel__line_composition-of-product">{`${(composition) ? editedData.composition : ' '}`}</span>
                                    <span className="table__line tabel__line_weight-of-product">{` ${(editedData.productWeight) ? productWeightWithMeasure : ' '}`}</span>
                                </p>
                            </td>
                            <td className="row_count">{editedData.countOfProduct || ''}</td>
                            <td className="row_count">{editedData.priceOfProduct || ''}</td>
                            <td className="row_count">{totalCostOfProduct || ''}</td>
                        </>
                    )}
                </tr>
            </tbody>
        </div>
    );
}

export default Row;
