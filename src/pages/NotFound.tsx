import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Hexagon className="h-16 w-16 text-blue-600 mb-6" />
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-neutral-700 mb-6">Page Not Found</h2>
      <p className="text-neutral-500 mb-8 max-w-md">
        We couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Back to Designer
      </Link>
    </div>
  );
}
