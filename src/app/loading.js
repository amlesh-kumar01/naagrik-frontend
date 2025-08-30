import { LoadingSpinner } from '../components/ui/loading';
import { colors } from '../lib/theme';

export default function Loading() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: colors.gradients.secondary }}
    >
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="mb-8">
          <LoadingSpinner size="xl" className="mx-auto" />
        </div>
        
        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Loading Naagrik
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Please wait while we prepare your community dashboard...
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`,
                animation: 'loading-bar 2s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
