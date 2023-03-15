const isTwoDimensionalArray = (value: any): boolean => {
  return (
    Array.isArray(value) &&
    value.every(
      (arr: any) =>
        Array.isArray(arr) && arr.every((item) => typeof item === 'string')
    )
  );
};

export default isTwoDimensionalArray;
