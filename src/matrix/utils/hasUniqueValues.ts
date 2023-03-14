const hasUniqueValues = (values: string[][]): boolean => {
  const flattenValues = values.flat();
  return new Set(flattenValues).size == flattenValues.length;
};

export default hasUniqueValues;
