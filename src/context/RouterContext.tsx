import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
  params: {},
});

function parsePath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ path, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useMatch(pattern: string): Record<string, string> | null {
  const { path } = useContext(RouterContext);
  return parsePath(pattern, path);
}

interface RouteProps {
  path: string;
  children: ReactNode;
}

export function Route({ path: pattern, children }: RouteProps) {
  const { path } = useContext(RouterContext);
  const params = parsePath(pattern, path);
  if (params === null) return null;
  return <>{children}</>;
}

export function useParams(pattern: string): Record<string, string> {
  const { path } = useContext(RouterContext);
  return parsePath(pattern, path) || {};
}
