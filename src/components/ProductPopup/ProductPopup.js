import React, { useState, useEffect, useRef } from "react";
import { Input, Button } from '@skbkontur/react-ui';
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
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);
    const modalRef = useRef(null);
    const typeDropdownRef = useRef(null);

    const typeOptions = [
        { value: 'eat', label: 'Еда' },
        { value: 'drink', label: 'Напитки' },
        { value: 'organisation', label: 'Организация' },
    ];

    const getTypeLabel = (value) => {
        const option = typeOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
            setInputValue(productToEdit.product || "");
            if (productToEdit.productId) {
                const found = productsCatalog.find(p => p.id === productToEdit.productId);
                if (found) setInputValue(found.name);
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
            const typeDropdownElement = typeDropdownRef.current;

            if (suggestionsElement && !suggestionsElement.contains(event.target) &&
                inputElement && !inputElement.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (typeDropdownElement && !typeDropdownElement.contains(event.target)) {
                setShowTypeDropdown(false);
            }
            if (modalElement && !modalElement.contains(event.target)) {
                onClose();
            }
        }

        function handleEscapeKey(event) {
            if (event.key === 'Escape') {
                if (showSuggestions) setShowSuggestions(false);
                else if (showTypeDropdown) setShowTypeDropdown(false);
                else onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);

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
    }, [onClose, showSuggestions, showTypeDropdown]);

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

    // ---------- Продукт ----------
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
            typeOfProduct: product.type || 'eat',
        }));
        setIsAuto(true);
        setShowSuggestions(false);
    };

    const handleInputFocus = () => filterSuggestions(inputValue);
    const handleInputBlur = () => setTimeout(() => setShowSuggestions(false), 200);

    // ---------- Тип (без фильтрации) ----------
    const handleTypeSelect = (value) => {
        setProductData(prev => ({ ...prev, typeOfProduct: value }));
        setShowTypeDropdown(false);
    };

    return (
        <div className="popup-overlay">
            <div ref={modalRef} className="popup">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                    <h2 className="form__title">Добавить продукт</h2>
                    <button className="popup__button_close" onClick={onClose}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Продукт */}
                    <div style={{ position: 'relative' }}>
                        <label htmlFor="product" style={{ display: 'block', marginBottom: '8px' }}>Продукт:</label>
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
                        {isAuto && <div className="hint">Автозаполнено из каталога</div>}
                    </div>

                    {/* Остальные поля */}
                    {['composition','productWeight','countOfProduct','priceOfProduct'].map((field) => (
                        <div key={field}>
                            <label htmlFor={field} style={{ display:'block', marginBottom:'8px' }}>
                                {field==='composition' && 'Состав:'}
                                {field==='productWeight' && 'Вес:'}
                                {field==='countOfProduct' && 'Количество:'}
                                {field==='priceOfProduct' && 'Цена:'}
                            </label>
                            <Input
                                id={field}
                                name={field}
                                value={productData[field]}
                                onValueChange={value => handleChange({ target:{name:field,value} })}
                                width="100%"
                                disabled={field==='composition' && isAuto}
                            />
                        </div>
                    ))}

                    {/* Тип */}
                    <div ref={typeDropdownRef} style={{ position:'relative' }}>
                        <label htmlFor="typeOfProduct" style={{ display:'block', marginBottom:'8px' }}>Тип:</label>
                        <div className="popup_select" onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
                            <span>{getTypeLabel(productData.typeOfProduct)}</span>
                        </div>
                        {showTypeDropdown && (
                            <div
                                style={{
                                    position:'absolute',
                                    top:'100%',
                                    left:0,
                                    right:0,
                                    backgroundColor:'white',
                                    border:'1px solid #d9d9d9',
                                    borderRadius:'4px',
                                    boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
                                    zIndex:10010
                                }}
                            >
                                {typeOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        style={{
                                            padding:'7px',
                                            cursor:'pointer',
                                            borderBottom:'1px solid #eee',
                                            backgroundColor: productData.typeOfProduct===option.value ? '#F0F0F0':'white',
                                            minHeight:'32px',
                                            display:'flex',
                                            alignItems:'center',
                                            boxSizing: 'border-box'
                                        }}
                                        onClick={() => handleTypeSelect(option.value)}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop:'24px', display:'flex', justifyContent:'flex-end', gap:'12px' }}>
                    <Button use="primary" onClick={handleSave}>Сохранить</Button>
                    <Button use="default" onClick={onClose}>Отмена</Button>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ProductPopup);
