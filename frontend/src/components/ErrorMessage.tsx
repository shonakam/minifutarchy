interface ErrorMessageProps {
	message: string;
  }
  
  const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
	return (
	  <div className="flex items-center justify-center min-h-screen bg-gray-900">
		<p className="text-red-500 text-center">{message}</p>
	  </div>
	);
  };
  
  export default ErrorMessage;