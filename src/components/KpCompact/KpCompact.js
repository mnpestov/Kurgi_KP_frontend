import './KpCompact.css';
import logo from '../../images/logo.png';
import Row from '../Row/Row';

function KpCompact({
    startEvent,
    endEvent,
    eventPlace,
    countOfPerson,
    list,
    deleteRow,
    listTitle,
    startTimeStartEvent,
    endTimeStartEvent,
    startTimeEndEvent,
    endTimeEndEvent,
    deleteRowFromDb,
    updateRowInDb,
    isNewKp,
    isCompact,
    dispatch
}) {
    return (
        <>
            <div className="listCompact">
                <div className="list__container">
                    <img className="list__logo" src={logo} alt="logo" />
                    <h2 className="list__title">{listTitle}</h2>
                    <table className="list__table">
                        <thead>
                            <tr className="table__row table__titles">
                                <th className="table__title list__subtitle-container">
                                    <p className="list__subtitle list__subtitle_place">место: <span className="list__subtitle_text">{`${eventPlace}`}</span></p>
                                    <p className="list__subtitle list__subtitle_person">кол-во персон: <span className="list__subtitle_text">{`${countOfPerson}`}</span></p>
                                    <div className="list__subtitle_time">
                                        <p className="list__subtitle list__subtitle_time_text">время мероприятия: </p>
                                        <p>
                                            <span className="list__subtitle_time_text list__subtitle_text">{`${startEvent.slice(0, 5)} (${startTimeStartEvent} - ${endTimeStartEvent})`}</span>
                                            <span className="list__subtitle_time_text list__subtitle_text"> {`–`} </span>
                                            <span className="list__subtitle_time_text list__subtitle_text">{`${endEvent.slice(0, 5)} (${startTimeEndEvent} - ${endTimeEndEvent})`}</span>
                                        </p>
                                    </div>
                                </th>
                                <th className="table__title">Количество, шт</th>
                            </tr>
                        </thead>
                        {list.rows.map((item, index) => (
                            <Row key={index} data={item} index={index} deleteRow={deleteRow} deleteRowFromDb={deleteRowFromDb} updateRowInDb={updateRowInDb} listId={list.id} rowId={item.id} isNewKp={isNewKp} isCompact={isCompact} dispatch={dispatch} />
                        ))}
                    </table>
                </div>
            </div>
        </>
    );
}

export default KpCompact;