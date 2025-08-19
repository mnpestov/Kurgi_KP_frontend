import React, { useState, useEffect, useRef } from "react";
import {
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
        typeOfProduct: "eat",
    });

    const [isAuto, setIsAuto] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);
    const modalRef = useRef(null);

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
                typeOfProduct: "eat",
            });
            setInputValue("");
            setIsAuto(false);
        }
    }, [productToEdit, productId]);

    useEffect(() => {
        function handleClickOutside(event) {
            const inputElement = inputRef.current?.node;
            const suggestionsElement = suggestionsRef.current;
            const modalElement = modalRef.current;
            
            if (inputElement && !inputElement.contains(event.target) &&
                suggestionsElement && !suggestionsElement.contains(event.target) &&
                modalElement && !modalElement.contains(event.target)) {
                setShowSuggestions(false);
            }

            if (modalElement && !modalElement.contains(event.target)) {
                onClose();
            }
        }

        function handleEscapeKey(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        
        // Предотвращение скролла
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = 'unset';
            document.body.style.position = 'static';
        };
    }, [onClose]);

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

        filterSuggestions(value);
    };

    const filterSuggestions = (value = "") => {
        if (value.length > 0) {
            const filtered = productsCatalog
                .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 10);
            setSuggestions(filtered);
        } else {
            setSuggestions(productsCatalog.slice(0, 10));
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
        if (s.startsWith('организ') || s.startsWith('логист') || s.startsWith('organization')) return 'organisation';
        return 'eat';
    };

    const handleInputFocus = () => {
        filterSuggestions(inputValue);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <div className="popup-overlay">
            <div 
                ref={modalRef}
                className="popup"
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px'
                }}>
                    <h2 className="form__title">Добавить продукт</h2>
                    <button 
                        className="popup__button_close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <label htmlFor="product" style={{ display: 'block', marginBottom: '8px' }}>
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
                            <div ref={suggestionsRef} className="suggestions-list">
                                {suggestions.map((product) => (
                                    <div
                                        key={product.id}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(product)}
                                    >
                                        {product.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isAuto && (
                            <div className="hint">
                                Автозаполнено из каталога
                            </div>
                        )}
                    </div>

                    {['composition', 'productWeight', 'countOfProduct', 'priceOfProduct'].map((field) => (
                        <div key={field}>
                            <label htmlFor={field} style={{ display: 'block', marginBottom: '8px' }}>
                                {field === 'composition' && 'Состав:'}
                                {field === 'productWeight' && 'Вес:'}
                                {field === 'countOfProduct' && 'Количество:'}
                                {field === 'priceOfProduct' && 'Цена:'}
                            </label>
                            <Input
                                id={field}
                                name={field}
                                value={productData[field]}
                                onValueChange={value => handleChange({ target: { name: field, value } })}
                                width="100%"
                                disabled={field === 'composition' && isAuto}
                            />
                        </div>
                    ))}

                    <div>
                        <label htmlFor="typeOfProduct" style={{ display: 'block', marginBottom: '8px' }}>
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

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button use="primary" onClick={handleSave}>Сохранить</Button>
                    <Button use="default" onClick={onClose}>Отмена</Button>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ProductPopup);