function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function setDefaultDateRange(target, startKey, endKey) {
  if (target[startKey] && target[endKey]) {
    return;
  }

  let today = new Date();
  let fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);

  target[startKey] = formatDate(fromDate);
  target[endKey] = formatDate(today);
}

module.exports = { formatDate, setDefaultDateRange };
