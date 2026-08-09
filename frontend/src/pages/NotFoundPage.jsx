import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Page not found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Go back home
          </Link>
          
          <div className="text-sm text-gray-500">
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              Contact support
            </Link>
            {' '}if you think this is an error.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
