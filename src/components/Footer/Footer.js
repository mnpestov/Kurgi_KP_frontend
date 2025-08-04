import React from "react";
import './Footer.css';
import logo from '../../images/logo.png'

function Footer({ lists, countOfPerson, logisticsCost, isWithinMkad, GetPrice }) {
  const numberOfPersons = parseInt(countOfPerson, 10);

  // Функция для расчета итогового веса и цены
  const calculateTotals = (lists) => {
    const totals = {
      byType: {
        eat: { totalWeight: 0, totalPrice: 0 },
        drink: { totalWeight: 0, totalPrice: 0 },
        organisation: { totalPrice: 0 }
      },
      totalPrice: 0
    };

    lists.forEach(productGroup => {
      productGroup.rows.forEach(product => {
        const { productWeight, priceOfProduct, countOfProduct, typeOfProduct } = product;

        if (priceOfProduct && countOfProduct) {
          totals.totalPrice += priceOfProduct * countOfProduct; // Рассчитать итоговую цену

          // Обработка для типов eat и drink
          if (typeOfProduct === 'eat' && productWeight) {
            const totalWeightForType = productWeight * countOfProduct;
            totals.byType.eat.totalWeight += totalWeightForType;
            totals.byType.eat.totalPrice += priceOfProduct * countOfProduct;
          } else if (typeOfProduct === 'drink' && productWeight) {
            const totalWeightForType = productWeight * countOfProduct;
            totals.byType.drink.totalWeight += totalWeightForType;
            totals.byType.drink.totalPrice += priceOfProduct * countOfProduct;
          } else if (typeOfProduct === 'organisation') {
            totals.byType.organisation.totalPrice += priceOfProduct * countOfProduct;
          }
        }
      });
    });

    // Расчет веса на персону
    if (numberOfPersons > 0) {
      totals.byType.eat.totalWeightByPerson = (totals.byType.eat.totalWeight / numberOfPersons) || 0;
      totals.byType.drink.totalWeightByPerson = (totals.byType.drink.totalWeight / numberOfPersons) || 0;
    } else {
      totals.byType.eat.totalWeightByPerson = 0;
      totals.byType.drink.totalWeightByPerson = 0;
    }

    return totals;
  };

  const totals = calculateTotals(lists);

  return (
    <section className="footer">
      <div className="list list_footer">
        <div className="footer__logo-container">
          <img className="logo" src={logo} alt='logo' />
        </div>
        <div className="footer__count-container">
          <h2 className="list__title footer__title">Расчёт:</h2>
          <p className="table__line tabel__line_product">
            Выход на персону: {(totals.byType.eat.totalWeightByPerson > 0 && totals.byType.drink.totalWeightByPerson > 0) && (
              <span className="tabel__line tabel__line_composition-of-product">
                еда / напитки - {Math.round(totals.byType.eat.totalWeightByPerson)}гр / {Math.round(totals.byType.drink.totalWeightByPerson)}мл
              </span>
            )}
            {(totals.byType.eat.totalWeightByPerson > 0 && totals.byType.drink.totalWeightByPerson === 0) && (
              <span className="tabel__line tabel__line_composition-of-product">
                еда - {Math.round(totals.byType.eat.totalWeightByPerson)}гр
              </span>
            )}
            {(totals.byType.eat.totalWeightByPerson === 0 && totals.byType.drink.totalWeightByPerson > 0) && (
              <span className="tabel__line tabel__line_composition-of-product">
                напитки - {Math.round(totals.byType.drink.totalWeightByPerson)}мл
              </span>
            )}
          </p>
          {/* <p className="table__line tabel__line_product">
            Выход на персону:
            <span className="tabel__line tabel__line_composition-of-product"> еда / напитки - {(totals.byType.eat.totalWeightByPerson > 0) ? Math.round(totals.byType.eat.totalWeightByPerson) : ''}гр / {(totals.byType.drink.totalWeightByPerson > 0) ? Math.round(totals.byType.drink.totalWeightByPerson) : ''}мл</span>
          </p> */}
          <div className="calculation">
            <ul className="totalKp">
              {totals.byType.eat && totals.byType.eat.totalPrice !== 0 && (
                <li className="total row_count footer__row">
                  <span className="table__line tabel__line_product">- Еда</span>
                  {' - ' + GetPrice(totals.byType.eat.totalPrice)}
                </li>
              )}
              {totals.byType.drink && totals.byType.drink.totalPrice !== 0 && (
                <li className="total row_count footer__row">
                  <span className="table__line tabel__line_product">- Напитки</span>
                  {' - ' + GetPrice(totals.byType.drink.totalPrice)}
                </li>
              )}
              {totals.byType.organisation && totals.byType.organisation.totalPrice !== 0 && (
                <li className="total row_count footer__row">
                  <span className="table__line tabel__line_product">- Организация кейтеринга</span>
                  {' - ' + GetPrice(totals.byType.organisation.totalPrice)}
                </li>
              )}
              {(logisticsCost !== 0) && (
                <li className="total row_count footer__row">
                  {isWithinMkad ? (
                    <span className="table__line tabel__line_product">- Логистика в пределах МКАД + монтаж / демонтаж</span>
                  ) : (
                    <span className="table__line tabel__line_product">- Логистика за пределами МКАД + монтаж / демонтаж</span>
                  )}
                  {' - ' + GetPrice(logisticsCost)}
                </li>
              )}
            </ul>
          </div>
          <div className="totalCount">
            <p className="totalAlCash  row_count">
              <span className="table__line tabel__line_product">Итого: </span>
              {(totals.totalPrice) ? GetPrice(totals.totalPrice + logisticsCost) : ''}</p>
            <p className="totalAl  row_count">
              <span className="table__line tabel__line_product">Итого по безналичному расчёту: </span>
              {(totals.totalPrice) ? GetPrice(Math.round((totals.totalPrice + logisticsCost) * 1.07)) : ''}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;