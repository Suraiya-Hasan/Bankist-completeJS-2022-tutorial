'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Suraiya Hasan',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 0, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-05-25T23:36:17.929Z',
    '2023-05-31T10:51:36.790Z',
  ],
  currency: 'NOK',
  locale: 'se-NO', // de-DE
};

const account2 = {
  owner: 'Nazia Islam',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 0,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-05-25T18:49:59.371Z',
    '2020-05-31T02:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const now = new Date();
let currentAccount, timer; //requires to be a global variable

/////////////////////////////////////////////////
// Functions


//Formatting Date using Intl


const formatDateMovement = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;


  return new Intl.DateTimeFormat(locale).format();

};

//Formatting currency according to locale using Intl

const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale,
    { style: "currency", currency: currency }).format(value);
}

//Displaying transactions of an account

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? acc.movements
    .slice()
    .sort((a, b) => a - b) : acc.movements; //sorting according to deposit and withdrawals

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatDateMovement(date, acc.locale);

    const fromattedMov = formatCurr(mov, acc.locale, acc.currency);

    const html =
      `<div class="movements__row">
        <div class="movements__type 
        movements__type--${type}">${i + 1} ${type}</div>
        <div classname="movements__date">${displayDate}</div>
        <div class="movements__value">${fromattedMov}</div>
      </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Displaying total balance

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const fromattedMov = formatCurr(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = fromattedMov;
};

//Displaying summary of transactions

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

//Creating usernames from owners of account

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

//updating UI

const updateUI = function (acc) {
  //display movements
  displayMovements(acc);
  //display balance
  calcDisplayBalance(acc);
  //display summary
  calcDisplaySummary(acc);
}

//Timer after logging in for "logout"

const startLogOutTimer = function () {
  const tick = function () {

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //in each call, printing remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    //when 0 seconds, stopping timer and logging out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;

  };

  //setting time to an hour

  let time = 3600;

  //calling timer every sec

  tick();

  const timer = setInterval(tick, 1000);
  return timer;
};

//"Login"

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(acc => acc.username ===
    inputLoginUsername.value);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {

    //display UI and welcome message
    labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }

    // const locale = navigator.language; to set the locale as the locale of the browser
    //Setting the locale of the account as specified in the account

    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    //clearing input

    inputLoginUsername.value = inputLoginPin.value = '';

    //if there is already a timer, we reset it

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
  else {
    alert(`Incorrect username or pin. Try again.`);
    inputLoginUsername.value = inputLoginPin.value = '';
  }
});

//functionality of a transfer button

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const recieverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (amount > 0 &&
    recieverAccount &&
    currentAccount.balance >= amount &&
    recieverAccount?.username !== currentAccount.username) {
    currentAccount.movements.push(-amount);
    recieverAccount.movements.push(amount);

    //add transfer date

    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    //resetting timer every time a transfer happens(account is active)
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  else alert(`Invalid transaction.`);
});

//Closing account

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin) {

    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username);

    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
  }
  else alert(`Incorrect username or password.`);

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = `Log in to get started`;
});

//Loan functionality

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); //no floating point loan
  if (amount > 0 && currentAccount.movements.some(mov =>
    mov >= amount * 0.1)) {
    setTimeout(function () {
      {
        currentAccount.movements.push(amount);
        currentAccount.movementsDates.push(new Date().
          toDateString());

        updateUI(currentAccount);
      }
    }, 3000);
  }
  else alert("You are not eligible for the loan."); //given condition
  //resetting timer
  clearInterval(timer);
  timer = startLogOutTimer();
  inputLoanAmount.value = '';
});

//sorting transactions

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(
    function (row, i) {
      if (i % 2 == 0) row.style.backgroundColor = 'lightgray';
    })
});