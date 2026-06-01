const arrayEquals = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const intersection = (a = [], b = []) => {
  const bSet = new Set(b);
  return [...new Set(a)].filter(e => bSet.has(e));
};

const handleTableChange = setSorter => (pagination, filters, sorterParam) => {
  if (sorterParam?.order === 'ascend') {
    return setSorter(`${Array.isArray(sorterParam.field) ? sorterParam.field.join('.') : sorterParam.field}`);
  }
  if (sorterParam.order === 'descend') {
    return setSorter(`-${Array.isArray(sorterParam.field) ? sorterParam.field.join('.') : sorterParam.field}`);
  }
  return setSorter('');
};

export { arrayEquals, classNames, intersection, handleTableChange };
