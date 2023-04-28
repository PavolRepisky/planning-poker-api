interface ValidationError {
  path: string | undefined;
  location: string | undefined;
  value: string;
  message: string;
}

export default ValidationError;
