import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    Input,
    Select,
    Button,
    Gapped,
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
        typeOfProduct: "",
    });

    const [isAuto, setIsAuto] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);

    const typeOptions = [
        { value: 'eat', label: 'Еда' },
        { value: 'drink', label: 'Напитки' },
        { value: 'organisation', label: 'Организация' },
    ];

    useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
            setInputValue(productToEdit.product || "");
            if (productToEdit.productId) {
                const found = productsCatalog.find(p => p.id === productToEdit.productId);
                if (found) {
                    setInputValue(found.name);
                }
                setIsAuto(true);
            } else {
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
                typeOfProduct: "",
            });
            setInputValue("");
            setIsAuto(false);
        }
    }, [productToEdit, productId]);

    useEffect(() => {
        function handleClickOutside(event) {
            // Получаем DOM-элементы через .node для Input из @skbkontur/react-ui
            const inputElement = inputRef.current?.node;
            const suggestionsElement = suggestionsRef.current;
            
            if (inputElement && !inputElement.contains(event.target) &&
                suggestionsElement && !suggestionsElement.contains(event.target)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

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

    const handleInputChange = (value) => {
        setInputValue(value);
        setProductData(prev => ({ ...prev, product: value, productId: null }));
        setIsAuto(false);

        // Фильтруем предложения по введенному тексту
        filterSuggestions(value);
    };

    const filterSuggestions = (value = "") => {
        if (value.length > 0) {
            const filtered = productsCatalog
                .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 10);
            setSuggestions(filtered);
        } else {
            // Если поле пустое, показываем первые 10 товаров
            setSuggestions(productsCatalog.slice(0, 20));
        }
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (product) => {
        setInputValue(product.name);
        setProductData(prev => ({
            ...prev,
            productId: product.id,
            product: product.name,
            composition: product.composition || '',
            typeOfProduct: normalizeType(product.type || 'eat'),
        }));
        setIsAuto(true);
        setShowSuggestions(false);
    };

    const normalizeType = (label) => {
        const s = String(label || '').trim().toLowerCase();
        if (s.startsWith('еда') || s.startsWith('food')) return 'eat';
        if (s.startsWith('напит') || s.startsWith('drink')) return 'drink';
        if (s.startsWith('организ') || s.startsWith('логист') || s.startsWith('organisation')) return 'organisation';
        return 'eat';
    };

    const handleInputFocus = () => {
        // Показываем список при фокусе, даже если поле пустое
        filterSuggestions(inputValue);
    };

    const handleInputBlur = () => {
        // Не закрываем сразу, чтобы дать время на клик по предложению
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <Modal onClose={onClose} width={500}>
            <Modal.Header>Добавить продукт</Modal.Header>
            <Modal.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Продукт - кастомный ComboBox */}
                    <div style={{ position: 'relative' }}>
                        <label htmlFor="product" style={{ display: 'block', marginBottom: 4 }}>
                            Продукт:
                        </label>
                        <Input
                            ref={inputRef}
                            id="product"
                            value={inputValue}
                            onValueChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Начните вводить или выберите из списка…"
                            width="100%"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div
                                ref={suggestionsRef}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }}
                            >
                                {suggestions.map((product) => (
                                    <div
                                        key={product.id}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #eee',
                                            fontSize: '14px',
                                        }}
                                        onClick={() => handleSuggestionClick(product)}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#f5f5f5';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                        }}
                                    >
                                        {product.name}
                                    </div>
                                ))}
                            </div>
                        )}
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