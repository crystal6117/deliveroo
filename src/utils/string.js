

export const convertPriceStringToFloat = (price) => {
    var tmp = price.replace("€", "");
    tmp = tmp.replace(",", ".");
    return parseFloat(tmp);
}