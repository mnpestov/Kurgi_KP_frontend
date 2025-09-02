import React, { useState } from "react";
import { Ok, Edit, Trash } from '@skbkontur/react-icons';
import './Row.css';

function Row({
    data,
    index,
    deleteRow,
    listId,
    deleteRowFromDb,
    updateRowInDb,
    rowId,
    isNewKp,
    isCompact,
    dispatch,
    getProductWeightWithMeasure,
    kpPreviewSelectors
}) {
    const { composition } = data;

    // Определяем максимальное смещение в vw
    const MAX_TRANSLATE_VW = -15.8; // 15.8vw
    const THRESHOLD_VW = MAX_TRANSLATE_VW / 2; // Порог для определения завершения жеста

    const [translateX, setTranslateX] = useState(0);
    const [startX, setStartX] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({ ...data });
    const totalCostOfProduct = editedData.countOfProduct * editedData.priceOfProduct;

    const {
        tabeLineProductSelector,
        rowActionsSelector,
        rowButtonSelector,
        tabelLineSelector,
        rowCountSelector,
        deleteButtonSelector
    } = kpPreviewSelectors;

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        const diffX = currentX - startX;

        // Конвертируем разницу в пикселях в vw
        const diffInVw = (diffX / window.innerWidth) * 100;

        if (diffInVw < 0) {
            setTranslateX(Math.max(diffInVw, MAX_TRANSLATE_VW));
        } else {
            setTranslateX(Math.min(diffInVw, 0));
        }
    };

    const handleTouchEnd = () => {
        if (translateX <= THRESHOLD_VW) {
            setTranslateX(MAX_TRANSLATE_VW);
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
        const updatedRowData = { ...editedData };
        setIsEditing(false);
        dispatch({ type: 'UPDATE_ROW', payload: { listId, rowIndex: index, updatedRow: editedData } });
        if (!isNewKp) {
            updateRowInDb(updatedRowData).then(() => {
                dispatch({ type: 'REFRESH_DATA' });
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData({ ...editedData, [name]: value });
    };

    const productWeightWithMeasure = getProductWeightWithMeasure(editedData.productWeight, editedData.typeOfProduct);

    return (
        <div className="row-wrapper">
            <div className={rowActionsSelector}>
                {!translateX ? '' : <>
                    <button type="button" className={`${rowButtonSelector} ${deleteButtonSelector}`} onClick={handleDelete}><Trash /></button>
                    <button type="button" className={`${rowButtonSelector} edit-button`} onClick={handleEdit}><Edit /></button>
                </>}

            </div>
            <tbody
                id={`table__row_${index}`}
                className="table__row-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ transform: `translateX(${translateX}vw)` }}
            >
                <tr className={`table__row ${isEditing ? 'table__row_edit' : ''}`}>
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
                                        placeholder="Продукт"
                                    />
                                    <input
                                        className="row_count-input row_count-input-product"
                                        type="text"
                                        name="composition"
                                        value={editedData.composition}
                                        onChange={handleInputChange}
                                        placeholder="Состав"
                                    />
                                    <input
                                        className="row_count-input row_count-input-product"
                                        type="text"
                                        name="productWeight"
                                        value={editedData.productWeight}
                                        onChange={handleInputChange}
                                        placeholder="Вес"
                                    />
                                </div>
                            </td>
                            <td className="edit-input-container">
                                <input
                                    className="row_count-input edit-input"
                                    type="number"
                                    name="countOfProduct"
                                    value={editedData.countOfProduct}
                                    onChange={handleInputChange}
                                />
                            </td>
                            <td className="edit-input-container">
                                <input
                                    className="row_count-input edit-input"
                                    type="number"
                                    name="priceOfProduct"
                                    value={editedData.priceOfProduct}
                                    onChange={handleInputChange}
                                />
                            </td>
                            <td className={`save-button__container ${rowCountSelector}`}>
                                <button className="row-button save-button" type="button" onClick={handleSaveEdit}><Ok /></button>

                            </td>
                        </>
                    ) : (
                        <>
                            <td className="table__line-container">
                                <p className={`${tabelLineSelector} ${tabeLineProductSelector}`}>{`${editedData.product || ' '} `}
                                    <span className={`${tabelLineSelector} tabel__line_composition-of-product`}>{`${(composition) ? editedData.composition : ' '}`}</span>
                                    <span className={`${tabelLineSelector} tabel__line_weight-of-product`}>{` ${(editedData.productWeight) ? productWeightWithMeasure : ' '}`}</span>
                                </p>
                            </td>
                            <td className={rowCountSelector}>{editedData.countOfProduct || ''}</td>
                            {!isCompact && (
                                <>
                                    <td className={rowCountSelector}>{editedData.priceOfProduct || ''}</td>
                                    <td className={rowCountSelector}>{totalCostOfProduct || ''}</td>
                                </>
                            )}
                        </>
                    )}
                </tr>
            </tbody>
        </div>
    );
}

export default Row;