import React from 'react';

export type ErrorMessageType = {
  [key: string]: string[];
};

type Props = {
  errorMessage: ErrorMessageType | string[]; // 👈 Cho phép nhận cả mảng
};

const ErrorMessage: React.FC<Props> = ({ errorMessage }) => {
  // 👇 Normalize: nếu là mảng, gán key mặc định "base"
  const normalizedError: ErrorMessageType = Array.isArray(errorMessage)
    ? { base: errorMessage }
    : errorMessage;

  return (
    <div id="error_explanation">
      {Object.keys(normalizedError).length !== 0 && (
        <div className="alert alert-danger">
          The form contains {Object.keys(normalizedError).length} error
          {Object.keys(normalizedError).length !== 1 ? 's' : ''}.
        </div>
      )}
      {Object.keys(normalizedError).map((key) => (
        <ul key={key}>
          {Array.isArray(normalizedError[key]) ? (
            normalizedError[key].map((error, index) => (
              <li key={index}>{error}</li>
            ))
          ) : (
            <li>
              {String(normalizedError[key])}
            </li>
          )}
        </ul>
      ))}
    </div>
  );
};

export default ErrorMessage;
