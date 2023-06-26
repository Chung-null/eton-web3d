export function getCurrentDate(): String {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const timezoneOffset = currentDate.getTimezoneOffset();
    const timezoneHours = Math.abs(Math.floor(timezoneOffset / 60)).toString().padStart(2, '0');
    const timezoneMinutes = Math.abs(timezoneOffset % 60).toString().padStart(2, '0');
    const timezoneSign = timezoneOffset < 0 ? '+' : '-';

    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneSign}${timezoneHours}:${timezoneMinutes}`;
    return formattedDate

}
let haveIt = [];

export function generateUniqueRandom(maxNr) {
    //Generate random number
    let random = Number((Math.random() * maxNr).toFixed());

    if(!haveIt.includes(random)) {
        haveIt.push(random);
        return random;
    } else {
        if(haveIt.length < maxNr) {
          //Recursively generate number
         return  generateUniqueRandom(maxNr);
        } else {
          console.log('No more numbers available.')
          return false;
        }
    }
}
export function round2(number: number) {
    if(number || number == 0){
        let numberToString = number + ""
    let splitNumber = numberToString.split(".")
    let decimal = "00"
    if(splitNumber.length > 1) { 
        decimal = splitNumber[1].slice(0,2)
    }
    return splitNumber[0]+"."+decimal
    }
}