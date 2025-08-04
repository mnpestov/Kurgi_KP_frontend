import React, { useState } from "react";
import './ProductPopup.css';
import buttonCloseIcon from "../../images/closeIcon.svg"

function ProductPopup({ onClose, onSave, productId }) {
    const [productData, setProductData] = useState({
        productId: productId,
        product: "",
        composition: "",
        productWeight: "",
        countOfProduct: "",
        priceOfProduct: "",
        typeOfProduct: "eat" // Default type
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {        
        onSave(productData); // Save the data in parent component
        onClose(); // Close the popup after saving
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <h3 className="form__title">Добавить продукт</h3>
                <label className="popup__lable">
                    <span className="popup__lableText">
                        Продукт:
                    </span>
                    <input
                        className="popup__input"
                        type="text"
                        name="product"
                        value={productData.product}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="popup__lable">
                    <span className="popup__lableText">
                        Состав:
                    </span>
                    <input
                        className="popup__input"
                        type="text"
                        name="composition"
                        value={productData.composition}
                        onChange={handleChange}
                    />
                </label>
                <label className="popup__lable">
                    <span className="popup__lableText">
                        Вес:
                    </span>
                    <input
                        className="popup__input"
                        type="number"
                        name="productWeight"
                        value={productData.productWeight}
                        onChange={handleChange}
                    />
                </label>
                <label className="popup__lable">
                    <span className="popup__lableText">
                        Количество:
                    </span>
                    <input
                        className="popup__input"
                        type="number"
                        name="countOfProduct"
                        value={productData.countOfProduct}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="popup__lable">
                    <span className="popup__lableText">
                        Цена:
                    </span>
                    <input
                        className="popup__input"
                        type="number"
                        name="priceOfProduct"
                        value={productData.priceOfProduct}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="popup__lable">
                    <span className="popup__lableText">
                        Тип:
                    </span>
                    <select
                        className="popup__input"
                        name="typeOfProduct"
                        value={productData.typeOfProduct}
                        onChange={handleChange}
                    >
                        <option value="eat">Еда</option>
                        <option value="drink">Напитки</option>
                        <option value="organisation">Организация</option>
                    </select>
                </label>
                <button className="popup__button popup__button_save" onClick={handleSave}>Сохранить</button>
                <button className="popup__button popup__button_close" onClick={onClose}><img className="popup__button_icon" src={buttonCloseIcon} alt="buttonCloseIcon"/></button>
            </div>
        </div>
    );
}

export default ProductPopup;
