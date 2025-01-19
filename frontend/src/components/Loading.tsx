const LoadingScreen: React.FC = () => {
	return (
	  <div className="flex items-center justify-center min-h-screen bg-gray-900">
		<div className="flex flex-col items-center">
		  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
		  <p className="text-white mt-4">Loading proposals...</p>
		</div>
	  </div>
	);
};

export default LoadingScreen;