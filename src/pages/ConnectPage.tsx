import type { PageProps } from './shared';

type Destination = 'connect' | 'create' | 'lookup' | 'pay' | 'school';

/** Public orientation before entering the wallet-powered testnet workspace. */
export function ConnectPage({ config, onNavigate }: PageProps & { onNavigate?: (page: Destination) => void }) {
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-context"><span aria-hidden="true" className="context-dot" />A Stellar testnet prototype</p>
          <h1 id="hero-title">Pay school fees.<br />Keep a clearer record.</h1>
          <p className="hero-description">One fee, one shared record. Schools record what is owed. Payers pay in parts or in full, with a record both sides can read.</p>
          <div className="hero-actions"><button type="button" onClick={() => onNavigate?.('pay')}>Pay a fee</button><button type="button" className="secondary" onClick={() => onNavigate?.('create')}>Create a fee</button></div>
          <p className="hero-footnote">Explore first. Your wallet signs only when you choose an action.</p>
        </div>
        <div className="hero-art" aria-hidden="true"><img src="/schoolfees-studio.svg" alt="" width="700" height="620" /></div>
      </section>
      <section className="record-principles" aria-label="How your fee works">
        <div><h2>Direct payments.</h2><p>Tokens move from the payer to the school. The contract never holds a balance on your behalf.</p></div>
        <div><h2>Flexible installments.</h2><p>Pay part or all of the remaining amount. The record shows payments, refunds and what is still owed.</p></div>
        <div><h2>A shared view.</h2><p>Look up a numeric fee id to read the record. A lookup uses a connected wallet but does not ask you to sign.</p></div>
      </section>
      <section className="role-section" aria-labelledby="role-heading">
        <div className="section-heading"><h2 id="role-heading">Start on your side<br />of the school desk.</h2><p>A focused workspace for the person recording a fee and the person paying it.</p></div>
        <div className="role-options">
          <article className="role-option"><span className="role-symbol" aria-hidden="true">↗</span><h3>For schools</h3><p>Create a fee with an opaque reference, token amount and due date. Review existing records, refund a payer or close an eligible fee.</p><button className="secondary" type="button" onClick={() => onNavigate?.('create')}>Record a new fee</button></article>
          <article className="role-option"><span className="role-symbol" aria-hidden="true">↙</span><h3>For parents and payers</h3><p>Use the fee id shared by the school. Check the amount and school address, then choose how much to pay.</p><button className="secondary" type="button" onClick={() => onNavigate?.('lookup')}>View a fee</button></article>
        </div>
      </section>
      <section className="steps-section" aria-labelledby="steps-heading"><h2 id="steps-heading">A record you can follow.</h2><ol className="flow-steps"><li><h3>Find the fee</h3><p>Connect a testnet wallet and enter the school’s numeric fee id.</p></li><li><h3>Review the details</h3><p>Check the school address, token and remaining raw-unit amount.</p></li><li><h3>Choose your payment</h3><p>Enter your amount and review the request in your wallet before signing.</p></li><li><h3>Keep the confirmation</h3><p>Use the transaction hash and explorer link to inspect the result.</p></li></ol></section>
      <section className="prototype-section" aria-labelledby="prototype-heading"><div><h2 id="prototype-heading">Built to explore.<br />Still a prototype.</h2><p>A synthetic testnet contract demonstration is deployed. Browser wallet business flows still need verification. No pilot has happened, and there has been no independent audit.</p><a href="https://github.com/stellar-schoolfees/schoolfees-contracts/blob/main/docs/TESTNET_DEMONSTRATION.md" target="_blank" rel="noreferrer noopener">Read the testnet evidence</a></div><details><summary>Before you use the workspace</summary><ul><li>Use testnet tokens only. The practice network can reset and records can disappear.</li><li>Never enter student names, phone numbers, emails or identifiers. Only opaque references belong on-chain.</li><li>Amounts use whole raw token units. Decimal conversion, fee lists and archive restoration are not implemented.</li><li>Use Connect wallet in the workspace header. A lookup does not request a signature.</li></ul><p className="hint mono">Contract: {config.contractId}</p></details></section>
    </div>
  );
}
