export const customRound = (val, cnt) => {
    const unit = Math.pow(10, cnt);
    var res = Math.round(val * unit);
    res = res / unit;
    return res;
}