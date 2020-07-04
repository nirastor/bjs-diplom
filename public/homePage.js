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
// *** ASK *** Во всех операциях с деньгами показывает правильный баланс только после обновления страницы
const moneyManager = new MoneyManager();


// *** Пополнение баланса -- Операции с деньгами ***
moneyManager.addMoneyCallback = addMoneyData => {
    ApiConnector.addMoney(addMoneyData, r => {
        if (r.success) {
            ApiConnector.current(user => ProfileWidget.showProfile(user.data));
            moneyManager.setMessage(
                false,
                `Пополнили на ${addMoneyData.amount}${addMoneyData.currency}`);
        } else {
            moneyManager.setMessage(true, r.data);
        }
    });
}


// *** Конвертирование валюты -- Операции с деньгами ***
moneyManager.conversionMoneyCallback = convertMoneyData => {
    ApiConnector.convertMoney(convertMoneyData, r => {
        if (r.success) {
            ApiConnector.current(user => ProfileWidget.showProfile(user.data));
            moneyManager.setMessage(
                false,
                `Перевели ${convertMoneyData.fromAmount}${convertMoneyData.fromCurrency} в ${convertMoneyData.targetCurrency}`);
        } else {
            moneyManager.setMessage(true, r.data);
        }
    });
}

// *** Перевод валюты -- Операции с деньгами ***
moneyManager.sendMoneyCallback = sendMoneyData => {
    console.log(sendMoneyData);
    ApiConnector.transferMoney(sendMoneyData, r => {
        if (r.success) {
            ApiConnector.current(user => ProfileWidget.showProfile(user.data));
            moneyManager.setMessage(
                false,
                `Перевели ${sendMoneyData.amount}${sendMoneyData.currency}`);
        } else {
            moneyManager.setMessage(true, r.data);
        }
    });
}


// *** Работа с избранным ***
const favoritesWidget = new FavoritesWidget();

const updateFavoritList = (list) => {
    favoritesWidget.clearTable();
    favoritesWidget.fillTable(list);
    moneyManager.updateUsersList(list);
}

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
        
        const userNameForMessage = `${userForAdd.name} (id=${userForAdd.id})`
        
        if (r.success) {
            updateFavoritList(r.data);
            favoritesWidget.setMessage(false, `${userNameForMessage} добавлен в избранное`);
        } else {
            favoritesWidget.setMessage(true, `Не удалось добавить ${userNameForMessage} в избранное`);
        }
    });
};


// *** удаление пользователя из избранного -- Работа с избранным ***
favoritesWidget.removeUserCallback = (id) => {
    ApiConnector.removeUserFromFavorites(id, r => {
        if (r.success) {
            updateFavoritList(r.data);
            favoritesWidget.setMessage(false, 'Уделен из избранного');
        } else {
            favoritesWidget.setMessage(true, 'Не удалось удалить из избранного');
        }
    });
};