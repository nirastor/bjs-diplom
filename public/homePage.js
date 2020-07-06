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


// *** Обновление интерфеса и вызов отображения сообщений ***

const updateFavoritList = (list) => {
    favoritesWidget.clearTable();
    favoritesWidget.fillTable(list);
    moneyManager.updateUsersList(list);
}

const showChangesAndMessages = (result, successMessage, fn) => {
    if (result.success) {
        fn(result.data);
        moneyManager.setMessage(false, successMessage);
    } else {
        moneyManager.setMessage(true, result.data);
    }
}


// *** Операции с деньгами ***
const moneyManager = new MoneyManager();


// *** Пополнение баланса -- Операции с деньгами ***
moneyManager.addMoneyCallback = addMoneyData => {
    ApiConnector.addMoney(addMoneyData, r => {
        const successMessage = `Пополнили на ${addMoneyData.amount} ${addMoneyData.currency}`;
        //showMoneyManagerResult(r, successMessage);
        showChangesAndMessages(r, successMessage, ProfileWidget.showProfile);
    });
}


// *** Конвертирование валюты -- Операции с деньгами ***
moneyManager.conversionMoneyCallback = convertMoneyData => {
    ApiConnector.convertMoney(convertMoneyData, r => {
        const successMessage = `Перевели ${convertMoneyData.fromAmount} ${convertMoneyData.fromCurrency} в ${convertMoneyData.targetCurrency}`;
        showChangesAndMessages(r, successMessage, ProfileWidget.showProfile);
    });
}

// *** Перевод валюты -- Операции с деньгами ***
moneyManager.sendMoneyCallback = sendMoneyData => {
    ApiConnector.transferMoney(sendMoneyData, r => {
        const successMessage = `Перевели ${sendMoneyData.amount} ${sendMoneyData.currency}`;
        showChangesAndMessages(r, successMessage, ProfileWidget.showProfile);
    });
}


// *** Работа с избранным ***
const favoritesWidget = new FavoritesWidget();


// *** начальный список избранного -- Работа с избранным ***
ApiConnector.getFavorites((r) => {
    if (r.success) {
        updateFavoritList(r.data);
    }
});


// *** добавления пользователя в список избранных -- Работа с избранным ***
favoritesWidget.addUserCallback = () => {
    const userForAdd = favoritesWidget.getData();
    ApiConnector.addUserToFavorites(userForAdd, r => {
        const successMessage = `${userForAdd.name} (id=${userForAdd.id}) добавлен в избранное`;
        showChangesAndMessages(r, successMessage, updateFavoritList);
    });
};


// *** удаление пользователя из избранного -- Работа с избранным ***
favoritesWidget.removeUserCallback = (id) => {
    ApiConnector.removeUserFromFavorites(id, r => {
        const successMessage = `Удален из избранного`;
        showChangesAndMessages(r, successMessage, updateFavoritList);
    });
};