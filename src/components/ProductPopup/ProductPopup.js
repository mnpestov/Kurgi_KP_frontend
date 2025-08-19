import React, { useState, useEffect } from "react";
import {
    Modal,
    Input,
    Select,
    Button,
    Gapped,
    ComboBox,
} from '@skbkontur/react-ui';
import './ProductPopup.css';
import productsCatalog from '../../data/products.json';

function ProductPopup({ onClose, onSave, productId, productToEdit }) {
    const [productData, setProductData] = useState({
        productId: productId || null,
        product: "",
        composition: "",
        productWeight: "",
        countOfProduct: "",
        priceOfProduct: "",
        typeOfProduct: "eat",
    });

    const [isAuto, setIsAuto] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // { id, name, composition, type }

    const typeOptions = [
        { value: 'eat', label: 'Еда' },
        { value: 'drink', label: 'Напитки' },
        { value: 'organisation', label: 'Организация' },
    ];

    useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
            if (productToEdit.productId) {
                const found = productsCatalog.find(p => p.id === productToEdit.productId);
                if (found) setSelectedProduct(found);
                setIsAuto(true);
            } else {
                setSelectedProduct(null);
                setIsAuto(false);
            }
        } else {
            setProductData({
                productId: productId || null,
                product: "",
                composition: "",
                productWeight: "",
                countOfProduct: "",
                priceOfProduct: "",
                typeOfProduct: "eat",
            });
            setSelectedProduct(null);
            setIsAuto(false);
        }
    }, [productToEdit, productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!productData.product || !productData.countOfProduct || !productData.priceOfProduct) {
            alert("Заполните обязательные поля!");
            return;
        }
        const dataToSave = {
            ...productData,
            id: productToEdit ? productToEdit.id : Date.now(),
        };
        onSave(dataToSave);
        onClose();
    };

    // --- ComboBox helpers ---
    const getItems = (query) => {
        const q = String(query || '').toLowerCase().trim();
        const all = (productsCatalog || []);
        const filtered = q
            ? all.filter(p => String(p.name).toLowerCase().includes(q))
            : all.slice(0, 50);
        return Promise.resolve(filtered);
    };

    const valueToString = (item) => (item && item.name) ? item.name : '';
    const renderItem = (item) => (item && item.name) ? item.name : '';

    const normalizeType = (label) => {
        const s = String(label || '').trim().toLowerCase();
        if (s.startsWith('еда') || s.startsWith('food')) return 'eat';
        if (s.startsWith('напит') || s.startsWith('drink')) return 'drink';
        if (s.startsWith('организ') || s.startsWith('логист') || s.startsWith('organization')) return 'organisation';
        return 'eat';
    };

    return (
        <Modal onClose={onClose} width={500}>
            <Modal.Header>Добавить продукт</Modal.Header>
            <Modal.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Продукт */}
                    <div>
                        <label htmlFor="product" style={{ display: 'block', marginBottom: 4 }}>
                            Продукт:
                        </label>
                        <ComboBox
                            getItems={getItems}
                            value={selectedProduct}
                            valueToString={valueToString}
                            renderItem={renderItem}
                            placeholder="Начните вводить или выберите из списка…"
                            width="100%"
                            onValueChange={(item) => {
                                if (!item) return;
                                setSelectedProduct(item);
                                setIsAuto(true);
                                setProductData(prev => ({
                                    ...prev,
                                    productId: item.id || null,
                                    product: item.name,
                                    composition: item.composition || '',
                                    typeOfProduct: normalizeType(item.type || 'eat'),
                                }));
                            }}
                            onInputValueChange={(text) => {
                                const t = String(text ?? '');

                                // 1) Если выпал пустой текст (blur/внутренний сброс) — НЕ трогаем выбранный товар
                                if (t === '' && selectedProduct) return;

                                // 2) Если текст совпадает с названием выбранного товара — тоже ничего не делаем
                                if (selectedProduct && t === selectedProduct.name) return;

                                // 3) Иначе — пользователь реально что-то печатает → ручной режим
                                if (selectedProduct) setSelectedProduct(null);
                                if (isAuto) setIsAuto(false);
                                setProductData(prev => ({ ...prev, product: t, productId: null }));
                            }}
                        />
                        {isAuto && (
                            <div className="hint" style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                                Автозаполнено из каталога
                            </div>
                        )}
                    </div>

                    {/* Состав */}
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
                            disabled={isAuto}
                        />
                    </div>

                    {/* Вес */}
                    <div>
                        <label htmlFor="productWeight" style={{ display: 'block', marginBottom: 4 }}>
                            Вес:
                        </label>
                        <Input
                            id="productWeight"
                            name="productWeight"
                            value={productData.productWeight}
                            onValueChange={value => handleChange({ target: { name: 'productWeight', value } })}
                            width="100%"
                        />
                    </div>

                    {/* Количество */}
                    <div>
                        <label htmlFor="countOfProduct" style={{ display: 'block', marginBottom: 4 }}>
                            Количество:
                        </label>
                        <Input
                            id="countOfProduct"
                            name="countOfProduct"
                            value={productData.countOfProduct}
                            onValueChange={value => handleChange({ target: { name: 'countOfProduct', value } })}
                            width="100%"
                        />
                    </div>

                    {/* Цена */}
                    <div>
                        <label htmlFor="priceOfProduct" style={{ display: 'block', marginBottom: 4 }}>
                            Цена:
                        </label>
                        <Input
                            id="priceOfProduct"
                            name="priceOfProduct"
                            value={productData.priceOfProduct}
                            onValueChange={value => handleChange({ target: { name: 'priceOfProduct', value } })}
                            width="100%"
                        />
                    </div>

                    {/* Тип */}
                    <div>
                        <label htmlFor="typeOfProduct" style={{ display: 'block', marginBottom: 4 }}>
                            Тип:
                        </label>
                        <Select
                            id="typeOfProduct"
                            items={typeOptions.map(option => option.value)}
                            value={productData.typeOfProduct}
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
                            disabled={isAuto}
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
