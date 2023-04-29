interface ServerValidationError {
  path: string | undefined;
  location: string | undefined;
  value: string;
  message: string;
}

export default ServerValidationError;
