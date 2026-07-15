export const parseDDMMYYYY = (str) => {
    const [day, month, year] = str.split('/').map(Number);
    return new Date(year, month - 1, day);
};

export const compareDatesDesc = (dateStrA, dateStrB) =>
    parseDDMMYYYY(dateStrB) - parseDDMMYYYY(dateStrA);
