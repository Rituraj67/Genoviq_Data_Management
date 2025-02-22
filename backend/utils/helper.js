// utils/helpers.js
import moment from 'moment';

const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

export default { formatDate };