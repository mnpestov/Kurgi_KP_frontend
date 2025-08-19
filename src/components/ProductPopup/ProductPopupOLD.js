import React, { useState, useEffect } from "react";
import {
    Modal,
    Input,
    Select,
    Button,
    Gapped,
} from '@skbkontur/react-ui';
import './ProductPopup.css';

function ProductPopup({ onClose, onSave, productId, productToEdit }) {
    const [productData, setProductData] = useState({
        productId: productId,
        product: "",
        composition: "",
        productWeight: "",
        countOfProduct: "",
        priceOfProduct: "",
        typeOfProduct: "eat"
    });
    const typeOptions = [
        { value: 'eat', label: 'Еда' },
        { value: 'drink', label: 'Напитки' },
        { value: 'organisation', label: 'Организация' },
    ];
    useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
        } else {
            // Сброс формы при создании нового продукта
            setProductData({
                product: "",
                composition: "",
                productWeight: "",
                countOfProduct: "",
                priceOfProduct: "",
                typeOfProduct: "eat"
            });
        }
    }, [productToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {
        if (!productData.product || !productData.countOfProduct || !productData.priceOfProduct) {
            alert("Заполните обязательные поля!");
            return;
        }

        const dataToSave = {
            ...productData,
            id: productToEdit ? productToEdit.id : Date.now()
        };

        console.log('Saving data:', dataToSave); // Для отладки
        onSave(dataToSave);
        onClose();
    };

    return (
        <Modal onClose={onClose} width={500}>
            <Modal.Header>Добавить продукт</Modal.Header>
            <Modal.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="product" style={{ display: 'block', marginBottom: 4 }}>
                            Продукт:
                        </label>
                        <Input
                            id="product"
                            name="product"
                            value={productData.product}
                            onValueChange={value => handleChange({ target: { name: 'product', value } })}
                            required
                            width="100%"
                        />
                    </div>

                    <div>
                        <label htmlFor="composition" style={{ display: 'block', marginBottom: 4 }}>
                            Состав:
                        </label>
                        <Input
                            id="composition"
                            name="composition"
                            value={productData.composition}
                            onValueChange={value => handleChange({ target: { name: 'composition', value } })}
                            width="100%"
                        />
                    </div>

                    <div>
                        <label htmlFor="productWeight" style={{ display: 'block', marginBottom: 4 }}>
                            Вес:
                        </label>
                        <Input
                            id="productWeight"
                            name="productWeight"
                            type="number"
                            value={productData.productWeight}
                            onValueChange={value => handleChange({ target: { name: 'productWeight', value } })}
                            width="100%"
                        />
                    </div>

                    <div>
                        <label htmlFor="countOfProduct" style={{ display: 'block', marginBottom: 4 }}>
                            Количество:
                        </label>
                        <Input
                            id="countOfProduct"
                            name="countOfProduct"
                            type="number"
                            value={productData.countOfProduct}
                            onValueChange={value => handleChange({ target: { name: 'countOfProduct', value } })}
                            required
                            width="100%"
                        />
                    </div>

                    <div>
                        <label htmlFor="priceOfProduct" style={{ display: 'block', marginBottom: 4 }}>
                            Цена:
                        </label>
                        <Input
                            id="priceOfProduct"
                            name="priceOfProduct"
                            type="number"
                            value={productData.priceOfProduct}
                            onValueChange={value => handleChange({ target: { name: 'priceOfProduct', value } })}
                            required
                            width="100%"
                        />
                    </div>

                    <div>
                        <label htmlFor="typeOfProduct" style={{ display: 'block', marginBottom: 4 }}>
                            Тип:
                        </label>
                        <Select
                            id="typeOfProduct"
                            items={typeOptions.map(option => option.value)} // ['eat', 'drink', 'organisation']
                            value={productData.typeOfProduct}               // например, 'eat'
                            onValueChange={value => handleChange({ target: { name: 'typeOfProduct', value } })}
                            renderItem={item => {
                                const match = typeOptions.find(opt => opt.value === item);
                                return match ? match.label : item;
                            }}
                            renderValue={item => {
                                const match = typeOptions.find(opt => opt.value === item);
                                return match ? match.label : item;
                            }}
                            width="100%"
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer panel>
                <Gapped gap={12}>
                    <Button use="primary" onClick={handleSave}>Сохранить</Button>
                    <Button use="default" onClick={onClose}>Отмена</Button>
                </Gapped>
            </Modal.Footer>
        </Modal>
    );
}

export default React.memo(ProductPopup);
