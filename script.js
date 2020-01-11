const ctx = document.getElementById('myChart');
const changeLeft = document.getElementById('changeLeft');
const changeRight = document.getElementById('changeRight');
const period = document.getElementById('period');
const leftValue = document.getElementById('leftValue');
const rightValue = document.getElementById('rightValue');
const exchangeValues = document.getElementById('exchangeValues');


let l = 'USD';
let r = 'EUR';
let lastCurLeft = 'USD';
let lastCurRight = 'EUR';
let rate;
periods = {
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24  * 31,
    year: 1000 * 60 * 60 * 24  * 365,
}

currencies = ['CAD','AUD','GBP','PLN','JPY','NOK',
            'SEK','NZD','ISK','CZK','DKK','HKD','RUB','HRK','CHF','HUF']

let todayRaw = new Date();
let today = todayRaw.getFullYear() + '-' + (Number(todayRaw.getUTCMonth())+1) + '-' + todayRaw.getUTCDate()
let weekRaw = new Date(todayRaw - periods.week)
let week = weekRaw.getFullYear() + '-' + (Number(weekRaw.getUTCMonth())+1) + '-' + weekRaw.getUTCDate()
let monthRaw = new Date(todayRaw - periods.month)
let month = monthRaw.getFullYear() + '-' + (Number(monthRaw.getUTCMonth())+1) + '-' + monthRaw.getUTCDate()
let yearRaw = new Date(todayRaw - periods.year)
let year = yearRaw.getFullYear() + '-' + (Number(yearRaw.getUTCMonth())+1) + '-' + yearRaw.getUTCDate()

let basePeriod = week;

let rates;

Chart.defaults.global.elements.point.radius = 0;
Chart.defaults.global.elements.point.hoverRadius = 0;
Chart.defaults.global.hover.intersect = false 
Chart.defaults.global.tooltips.mode = 'index';
Chart.defaults.global.tooltips.intersect = false;



let updateData = () => {
        myChart.data.labels = [...rates.map((data) => data.date)]
        myChart.data.datasets[0] = {
            label: `${l} to ${r}`, 
            data: [...rates.map((data) => data[r])],
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: 'orangered',
            lineTension: 0
        }
        myChart.update()
   
}

let loadData = async () => {
    rates = [];
    await fetch(`https://api.exchangeratesapi.io/history?start_at=${basePeriod}&end_at=${today}&base=${l}&symbols=${r}`)
    .then(response => response.json())
    .then(data => { 
        for(let item in data.rates) {
            let temp = {
                date: item
            }
            temp[Object.keys(data.rates[item])[0]] = Object.values(data.rates[item])[0]
            rates.push(temp)
        }
        rates.sort((a,b) => Number(new Date(a.date).getTime()) > Number(new Date(b.date).getTime()) ? 1 : -1);
    })
}  

window.onload =  () => {
    l = 'USD';
    r = 'EUR';
    lastCurLeft = 'USD';
    lastCurRight = 'EUR';
    period.value = 'week'

    for(let i=0; i < currencies.length; i++) {
        let option = document.createElement('option')
        let option2 = document.createElement('option')
        option.value = currencies[i];
        option2.value = currencies[i];
        option.text = currencies[i];
        option2.text = currencies[i];
        changeLeft.add(option)
        changeRight.add(option2)

    }
    loadData().then(() => {
        rightValue.value = Number(leftValue.value * rates[rates.length-1][r]).toFixed(2)
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...rates.map((data) => data.date)],
                datasets: [{
                    label: `${l} to ${r}`,
                    data: [...rates.map((data) => data[r])],
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'orangered',
                    lineTension: 0
                }]    
                    
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';
                            label += ' ' + Number(tooltipItem.yLabel).toFixed(4);
                            return label;
                        }
                    }
                }
            }
        });
    })
    
};

changeLeft.addEventListener('change', (e) => {
   
    if(e.target.value === r){
        alert('change currency to another one');
        e.target.value = lastCurLeft
    }
    else {
        l = e.target.value
        lastCurLeft = e.target.value
        loadData().then(() => {
            updateData()
            rightValue.value = Number(leftValue.value * rates[rates.length-1][r]).toFixed(2)
        })
    }
})

changeRight.addEventListener('change', (e) => {
    if(e.target.value === l){
        alert('change currency to another one');
        e.target.value = lastCurRight
    }
    else {
        r = e.target.value
        lastCurRight = e.target.value
        loadData().then(() => {
            updateData()
            rightValue.value = Number(leftValue.value * rates[rates.length-1][r]).toFixed(2)
        })
    }
})

period.addEventListener('change', (e) => {
    switch(e.target.value) {
        case 'week': basePeriod = week
        break;
        case 'month': basePeriod = month
        break;
        case 'year': basePeriod = year
        break;
        default: basePeriod = week;
    }
    loadData().then(() => updateData()) 
         
})

exchangeValues.addEventListener('click', () => {
    let temp = r;
    let temp2 = rightValue.value;
    let temp3 = changeRight.value;
    let temp4 = lastCurRight;
    r = l;
    l = temp;
    rightValue.value = leftValue.value;
    leftValue.value = temp2;
    changeRight.value = changeLeft.value;
    changeLeft.value = temp3;
    lastCurRight = lastCurLeft;
    lastCurLeft = temp4
    loadData().then(() => updateData()) 
})

leftValue.addEventListener('input', () => {
    rightValue.value = Number(leftValue.value * rates[rates.length-1][r]).toFixed(2)
})

rightValue.addEventListener('input', () => {
    leftValue.value = Number(rightValue.value / rates[rates.length-1][r]).toFixed(2)
})

