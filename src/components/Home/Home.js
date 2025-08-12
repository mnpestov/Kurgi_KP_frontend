import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@skbkontur/react-ui";
import "./Home.css";
import { MainApi } from "../../utils/MainApi";

function Home({ dispatch, setIsNewKp }) {
  const [searchNumber, setSearchNumber] = useState("");
  const [lastKps, setLastKps] = useState([]);

  useEffect(() => {
    MainApi.getLastKps()
      .then(data => setLastKps(data))
      .catch(err => console.error("Ошибка загрузки последних КП:", err));
  }, []);

  const navigate = useNavigate();

  const handleSearch = e => {
    e.preventDefault();
    if (searchNumber.trim() !== "") {
      navigate(`/kp/${searchNumber.trim()}`);
    }
  };

  const handleCreatNewKp = () => {
    dispatch({ type: 'RESET_FORM' }); // очистка
    setIsNewKp(true)
    navigate('/new');
  }

  return (
    <div className="home">
      {/* Поиск */}
      <form className="home__search" onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
        <Input
          placeholder="Номер КП..."
          value={searchNumber}
          onValueChange={setSearchNumber}
          width="100%"
        />
        <Button use="primary" type="submit">
          Поиск
        </Button>
      </form>

      {/* Последние КП */}
      <div className="home__recent" style={{ marginTop: 24 }}>
        <h2 className="home__recent-title">Последние коммерческие предложения</h2>

        {Array.isArray(lastKps) && lastKps.length > 0 ? (
          <div className="home__table">
            {/* Заголовки */}
            <div className="home__table-row home__table-header">
              <div className="home__table-cell">Номер</div>
              <div className="home__table-cell">Дата мероприятия</div>
              <div className="home__table-cell">Место мероприятия</div>
            </div>

            {/* Данные */}
            {lastKps.map((kp) => {
              const prettyDate = kp.kpDate
                ? new Date(kp.kpDate).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                })
                : '';
              return (
                <div
                  key={kp.id}
                  className="home__table-row home__table-data"
                  onClick={() => navigate(`/kp/${kp.kpNumber}`)}
                >
                  <div className="home__table-cell">
                    <strong>{kp.kpNumber}</strong>
                  </div>
                  <div className="home__table-cell">{prettyDate}</div>
                  <div className="home__table-cell">{kp.eventPlace}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="home__no-kp">Нет данных для отображения.</p>
        )}
      </div>
      {/* Создание нового КП */}
      <div style={{ marginTop: 16 }}>
        <Button
          width="100%"
          use="success"
          onClick={handleCreatNewKp}
        >
          Создать новое КП
        </Button>
      </div>
    </div>
  );
}

export default Home;
