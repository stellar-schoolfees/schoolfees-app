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
  const previousPage = useRef(page);

  // Move focus to <main> on every page change so keyboard and screen-reader
  // users land at the new content instead of the nav button that triggered it.
  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
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
        <button type="button" className="brand-home brand-identity" onClick={() => setPage('connect')} aria-label="SchoolFees home"><img className="brand-mark" src="/brand/mark.svg" width="36" height="36" alt="" aria-hidden="true" />SchoolFees</button>
        {page === 'connect' ? <div className="header-actions"><a href="https://github.com/stellar-schoolfees/schoolfees-docs" target="_blank" rel="noreferrer noopener">Read the docs</a><button type="button" className="secondary" onClick={() => setPage('lookup')}>Open workspace</button></div> : <WalletBar wallet={wallet} />}
      </header>

      {page !== 'connect' && <nav aria-label="Main" className="workspace-nav">
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
      </nav>}

      <main id="main" ref={mainRef} tabIndex={-1} className={page === 'connect' ? 'landing-main' : 'workspace-main'}>
        {page === 'connect' && <ConnectPage {...pageProps} onNavigate={setPage} />}
        {page !== 'connect' && <div className="workspace-intro"><p>SchoolFees workspace</p><span>Connect → review → sign → keep the record</span></div>}
        {page === 'create' && <CreateFeePage {...pageProps} />}
        {page === 'lookup' && <LookupFeePage {...pageProps} />}
        {page === 'pay' && <PayPage {...pageProps} />}
        {page === 'school' && <SchoolActionsPage {...pageProps} />}
      </main>

      <span role="status" aria-live="polite" className="sr-only">
        {NAV.find((item) => item.id === page)?.label}
      </span>

      <footer className="site-footer">
        <p className="brand-identity"><img className="brand-mark" src="/brand/mark.svg" width="28" height="28" alt="" />SchoolFees</p>
        <p className="hint">
          Synthetic testnet demonstration. Browser wallet flows still need verification.
          Not audited. No real pilot. No real money.
        </p>
      </footer>
    </>
  );
}
