import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] p-8 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg space-y-6">
            <div className="text-6xl" role="img" aria-label="Warning">
              ⚠️
            </div>

            <h2 className="text-2xl font-semibold text-gray-800">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>

            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                       transition-colors duration-200 hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
