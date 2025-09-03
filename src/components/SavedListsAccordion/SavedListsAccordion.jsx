import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@skbkontur/react-ui';
import { Add, Edit, Trash } from '@skbkontur/react-icons';
import ProductPopup from '../ProductPopup/ProductPopup';
import './SavedListsAccordion.css';

function RowView({
  row,
  onEdit,
  onDelete,
  getProductWeightWithMeasure,
}) {
  return (
    <div className="form__table-row">
      <div className="cell cell--name">
        <span>{row.product}</span>
        <span className="composition__mobile">{row.composition}</span>
      </div>
      <div className="cell cell--weight">
        <span>{getProductWeightWithMeasure(row.productWeight, row.typeOfProduct)}</span>
      </div>
      <div className="cell cell--qty">
        <span>{row.countOfProduct}</span>
      </div>
      <div className="cell cell--price">
        <span>{row.priceOfProduct}</span>
      </div>
      <div className="cell cell--total">
        <span>{Number(row.priceOfProduct) * Number(row.countOfProduct) || 0}</span>
      </div>
      <div className="cell cell--edit">
        <Button icon={<Edit style={{ width: 16, height: 16 }} />} use="link" narrow onClick={onEdit} />
      </div>
      <div className="cell cell--delete">
        <Button icon={<Trash style={{ width: 16, height: 16 }} />} use="link" narrow onClick={onDelete} />
      </div>
    </div>
  );
}

const MemoRowView = React.memo(RowView);

function SavedListsAccordion({
  lists,
  // isNewKp,
  onDeleteRow,       // (listId, rowIndex) -> dispatch + (if !isNewKp) deleteRowFromDb
  onUpdateRow,       // (listId, rowIndex, updatedRow) -> dispatch + (if !isNewKp) updateRowInDb
  onAddRowOnList,    // (row, listId) -> добавить позицию в лист (и в БД, если !isNewKp)
  onDeleteList,      // (listId) -> удалить лист (и в БД, если !isNewKp)
  getProductWeightWithMeasure,
}) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [popupState, setPopupState] = useState({ isOpen: false, mode: 'add', listId: null, rowIndex: null, row: null });

  const toggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const openAdd = useCallback((listId) => {
    setPopupState({ isOpen: true, mode: 'add', listId, rowIndex: null, row: null });
  }, []);
  const openEdit = useCallback((listId, rowIndex, row) => {
    setPopupState({ isOpen: true, mode: 'edit', listId, rowIndex, row });
  }, []);
  const closePopup = useCallback(() => setPopupState(s => ({ ...s, isOpen: false })), []);

  const handleSave = useCallback(async (rowData) => {
    if (popupState.mode === 'add' && popupState.listId) {
      await onAddRowOnList(rowData, popupState.listId);
      closePopup();
      return;
    }
    if (popupState.mode === 'edit' && popupState.listId != null && popupState.rowIndex != null) {
      await onUpdateRow(popupState.listId, popupState.rowIndex, { ...popupState.row, ...rowData });
      closePopup();
    }
  }, [popupState, onAddRowOnList, onUpdateRow, closePopup]);

  const renderHeader = useCallback((list) => {
    const opened = expandedIds.has(list.id);
    return (
      <button
        type="button"
        className={`sla__header ${opened ? 'is-open' : ''}`}
        onClick={() => toggle(list.id)}
        aria-expanded={opened}
      >
        <span className="sla__chevron" aria-hidden />
        <span className="sla__title">{list.listTitle || `Лист ${list.id}`}</span>
        <span className="sla__meta">позиций: {list.rows?.length || 0}</span>
      </button>
    );
  }, [expandedIds, toggle]);

  const contentById = useMemo(() => {
    const map = new Map();
    lists.forEach((list) => {
      map.set(list.id, (
        <div className="sla__content">
          <div className="sla__rows">
            {list.rows?.map((row, idx) => (
              <MemoRowView
                key={row.id ?? idx}
                row={row}
                getProductWeightWithMeasure={getProductWeightWithMeasure}
                onEdit={() => openEdit(list.id, idx, row)}
                onDelete={() => onDeleteRow(list.id, idx)}
              />
            ))}
          </div>

          <div className="sla__actions">
            <Button icon={<Add />} use="default" onClick={() => openAdd(list.id)} disabled={(list.rows.length<7) ? false : true}>
              
            </Button>
            <Button icon={<Trash />} use="default" onClick={() => onDeleteList(list.id)}>
              Удалить лист
            </Button>
          </div>
        </div>
      ));
    });
    return map;
  }, [lists, getProductWeightWithMeasure, onDeleteRow, onDeleteList, openAdd, openEdit]);

  return (
    <div className="sla">
      <h4 className="sla__caption">Сохранённые листы</h4>
      {lists.map((list) => (
        <div className="sla__item" key={list.id}>
          {renderHeader(list)}
          {expandedIds.has(list.id) ? contentById.get(list.id) : null}
        </div>
      ))}

      {popupState.isOpen && (
        <ProductPopup
          onClose={closePopup}
          onSave={handleSave}
          productToEdit={popupState.mode === 'edit' ? popupState.row : null}
        />
      )}
    </div>
  );
}

export default React.memo(SavedListsAccordion);
