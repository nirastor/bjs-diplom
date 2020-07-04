'use strict';


// *** Выход из личного кабинета ***
const logoutButton = new LogoutButton();
logoutButton.action = () => ApiConnector.logout(r => {
    if (r.success) {
        location.reload();
    }
});


// *** Получение информации о пользователе ***
ApiConnector.current(r => ProfileWidget.showProfile(r.data));


// *** Получение текущих курсов валюты ***
function getStocks() {
    ApiConnector.getStocks(r => {
        if (r.success) {
            ratesBoard.clearTable();
            ratesBoard.fillTable(r.data);
        }
    });
}
const ratesBoard = new RatesBoard();
getStocks();
const timerForGetStocks = setInterval(getStocks, 60 * 1000);


// *** Операции с деньгами ***
const moneyManager = new MoneyManager();


// *** Пополнение баланса -- Операции с деньгами ***
moneyManager.addMoneyCallback = addMoneyData => {
    ApiConnector.addMoney(addMoneyData, r => {
        if (r.success) {
            // *** ASK *** показывает правильный баланс только после обновления страницы
            ApiConnector.current(user => ProfileWidget.showProfile(user.data));
            moneyManager.setMessage(false, `Пополнили на ${addMoneyData.amount}${addMoneyData.currency}`);
        } else {
            moneyManager.setMessage(true, r.data);
        }
    });
}


// *** Конвертирование валюты -- Операции с деньгами ***
moneyManager.conversionMoneyCallback = convertMoneyData => {
    console.log(convertMoneyData);
    ApiConnector.convertMoney(convertMoneyData, r => {
        if (r.success) {
            ApiConnector.current(user => ProfileWidget.showProfile(user.data));
            moneyManager.setMessage(false, `Перевели ${convertMoneyData.fromAmount}${convertMoneyData.fromCurrency} в ${convertMoneyData.targetCurrency}`);
        } else {
            moneyManager.setMessage(true, r.data);
        }
    });
}

// *** Пополнение баланса -- Операции с деньгами ***
moneyManager.sendMoneyCallback = sendMoneyData => {
    console.log(sendMoneyData);
}

// *** Пополнение балансаперевод валюты