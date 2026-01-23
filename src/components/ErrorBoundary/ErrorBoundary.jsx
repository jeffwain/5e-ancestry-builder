import { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log detailed error info to console
    console.group('%c React Error Caught by ErrorBoundary', 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.groupEnd();
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h1 className="error-boundary__title">Something went wrong</h1>

            <div className="error-boundary__message">
              <strong>Error:</strong> {error?.message || 'Unknown error'}
            </div>

            {error?.stack && (
              <details className="error-boundary__details">
                <summary>Stack Trace</summary>
                <pre className="error-boundary__stack">{error.stack}</pre>
              </details>
            )}

            {errorInfo?.componentStack && (
              <details className="error-boundary__details">
                <summary>Component Stack</summary>
                <pre className="error-boundary__stack">{errorInfo.componentStack}</pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <button
                className="error-boundary__button"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
