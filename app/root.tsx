import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntApp, Result, Button } from 'antd';
import type { Route } from './+types/root';
import { store } from '~/store';
import { theme } from '~/shared/theme';
import './app.css';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>KAMATS — Kano Alum Management &amp; Transparency System</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <Outlet />
        </AntApp>
      </ConfigProvider>
    </Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let message = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.status === 404
      ? 'The requested page could not be found.'
      : error.statusText || message;
  } else if (import.meta.env.DEV && error instanceof Error) {
    message = error.message;
  }

  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <div style={{ padding: 48 }}>
          <Result
            status={status === 404 ? '404' : '500'}
            title={status}
            subTitle={message}
            extra={[
              <Button key="reload" type="primary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>,
              <Button key="dashboard" href="/">
                Back to Dashboard
              </Button>,
            ]}
          />
        </div>
      </ConfigProvider>
    </Provider>
  );
}
