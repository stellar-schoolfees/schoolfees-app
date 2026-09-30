import { ConnectPrompt } from '../components/ConnectPrompt';
import { WalletBar } from '../components/WalletBar';
import type { PageProps } from './shared';

/**
 * The landing page: what the app is, who it is for, and the wallet connection.
 * It also states plainly what has not happened yet, because a reader who lands
 * here should not have to hunt for that.
 */
export function ConnectPage({ config, wallet }: PageProps) {
  return (
    <section>
      <h1>Pay school fees, with a record both sides can read</h1>

      <p>
        <strong>schoolfees</strong> records one fee obligation on Stellar&rsquo;s test network and
        lets families settle it once a contract is deployed for a pilot. Payments move straight
        from the payer&rsquo;s balance to the school&rsquo;s balance: the contract never holds
        anyone&rsquo;s money.
      </p>

      <WalletBar wallet={wallet} />

      {wallet.address === null && <ConnectPrompt wallet={wallet} />}

      <div className="card">
        <h2>What you can do here</h2>
        <ol>
          <li>
            <strong>School:</strong> record a fee against an opaque reference. Never a name or an
            id — see the warning on that page.
          </li>
          <li>
            <strong>Payer:</strong> pay part or all of a fee, in as many installments as you like.
          </li>
          <li>
            <strong>Anyone:</strong> look up a fee by its id and see its total, what has been paid,
            what is left, and its status.
          </li>
          <li>
            <strong>School:</strong> refund a payer from its own balance, up to what that payer
            paid, and close a fee that has nothing owed or nothing paid.
          </li>
        </ol>
      </div>

      <div className="card">
        <h2>What has not happened yet</h2>
        <ul>
          <li>No pilot has happened, and nothing is deployed until a school or centre agrees to try it.</li>
          <li>
            This app has never run against a deployed contract or a real wallet, so no flow here has
            been exercised end to end yet.
          </li>
          <li>There has been no security review or audit. Do not treat this as safe for real money.</li>
          <li>
            The app does not convert decimal places, does not list fees, and cannot restore an
            archived record.
          </li>
        </ul>
        <p className="hint mono">Contract: {config.contractId}</p>
      </div>
    </section>
  );
}
