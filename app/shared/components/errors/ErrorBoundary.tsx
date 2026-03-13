import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Result, Button, Alert, Typography } from 'antd';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryProps {
  level?: 'page' | 'section';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { level = 'page' } = this.props;
    const { error, errorInfo } = this.state;
    const isDev = import.meta.env.DEV;

    if (level === 'section') {
      return (
        <Alert
          type="error"
          message="Something went wrong in this section"
          description={
            <>
              <Button size="small" onClick={this.handleReset} style={{ marginTop: 8 }}>
                Try Again
              </Button>
              {isDev && error && (
                <Paragraph
                  style={{ marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}
                  type="secondary"
                  ellipsis={{ rows: 3, expandable: true }}
                >
                  {error.message}
                </Paragraph>
              )}
            </>
          }
          showIcon
          style={{ margin: '16px 0' }}
        />
      );
    }

    return (
      <Result
        status="error"
        title="Something went wrong"
        subTitle="An unexpected error occurred. Please try again or go back to the dashboard."
        extra={[
          <Button key="retry" type="primary" onClick={this.handleReset}>
            Try Again
          </Button>,
          <Button key="dashboard" href="/">
            Go to Dashboard
          </Button>,
        ]}
      >
        {isDev && error && (
          <div style={{ textAlign: 'left' }}>
            <Paragraph>
              <Text strong>Error: </Text>
              <Text type="danger">{error.message}</Text>
            </Paragraph>
            {errorInfo?.componentStack && (
              <Paragraph>
                <details>
                  <summary style={{ cursor: 'pointer', color: '#8c8c8c' }}>Stack Trace</summary>
                  <pre style={{ fontSize: 11, overflow: 'auto', maxHeight: 300 }}>
                    {errorInfo.componentStack}
                  </pre>
                </details>
              </Paragraph>
            )}
          </div>
        )}
      </Result>
    );
  }
}
