import { useEffect, useMemo, useRef, useState } from 'react';

import { ConfigNotice } from './components/ConfigNotice';
import { TestnetBanner } from './components/TestnetBanner';
import { WalletBar } from './components/WalletBar';
import { configResult } from './config';
import { useWallet } from './hooks/useWallet';
import { createContractClient } from './lib/contract';
import { ConnectPage } from './pages/ConnectPage';
import { CreateFeePage } from './pages/CreateFeePage';
import { LookupFeePage } from './pages/LookupFeePage';
import { PayPage } from './pages/PayPage';
import { SchoolActionsPage } from './pages/SchoolActionsPage';
import type { PageProps } from './pages/shared';

type PageId = 'connect' | 'create' | 'lookup' | 'pay' | 'school';

const NAV: ReadonlyArray<{ readonly id: PageId; readonly label: string }> = [
  { id: 'connect', label: 'Home' },
  { id: 'create', label: 'Create a fee' },
  { id: 'lookup', label: 'View a fee' },
  { id: 'pay', label: 'Pay' },
  { id: 'school', label: 'School actions' },
];

/**
 * The app shell. If the environment is incomplete or points somewhere other
 * than testnet, only the banner and the configuration notice render: no page,
 * and therefore no transaction, is reachable.
 */
export default function App() {
  const wallet = useWallet();
  const [page, setPage] = useState<PageId>('connect');
  const mainRef = useRef<HTMLElement>(null);

  // Move focus to <main> on every page change so keyboard and screen-reader
  // users land at the new content instead of the nav button that triggered it.
  useEffect(() => {
    mainRef.current?.focus();
  }, [page]);

  const config = configResult.ok ? configResult.config : null;
  const client = useMemo(() => (config === null ? null : createContractClient(config)), [config]);

  if (config === null || client === null) {
    return (
      <>
        <TestnetBanner />
        <header className="app-header"><p className="app-title brand-identity"><img className="brand-mark" src="/brand/mark.svg" width="36" height="36" alt="" aria-hidden="true" />schoolfees</p></header>
        <ConfigNotice problems={configResult.ok ? [] : configResult.problems} />
      </>
    );
  }

  const pageProps: PageProps = { client, config, wallet };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TestnetBanner />

      <header className="app-header">
        <p className="app-title brand-identity"><img className="brand-mark" src="/brand/mark.svg" width="36" height="36" alt="" aria-hidden="true" />schoolfees</p>
        <WalletBar wallet={wallet} />
      </header>

      <nav aria-label="Main">
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={page === item.id ? 'page' : undefined}
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" ref={mainRef} tabIndex={-1}>
        {page === 'connect' && <ConnectPage {...pageProps} />}
        {page === 'create' && <CreateFeePage {...pageProps} />}
        {page === 'lookup' && <LookupFeePage {...pageProps} />}
        {page === 'pay' && <PayPage {...pageProps} />}
        {page === 'school' && <SchoolActionsPage {...pageProps} />}
      </main>

      <span role="status" aria-live="polite" className="sr-only">
        {NAV.find((item) => item.id === page)?.label}
      </span>

      <footer>
        <p className="hint">
          Testnet only. Not audited. No pilot has happened yet, and nothing is deployed until a real
          school or tutorial centre agrees to try it.
        </p>
      </footer>
    </>
  );
}
