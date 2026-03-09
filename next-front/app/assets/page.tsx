'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import {
  initWallet,
  depositEther,
  depositERC20,
  depositERC721,
  withdrawEther,
  withdrawERC20,
  transferEther,
  transferERC20,
} from '@/lib/ethereum';
import { getERC20Balance, getEtherBalance } from '@/lib/inspect';
import { formatEther } from 'viem';
import { RefreshCw, Trophy, Loader2 } from 'lucide-react';
import { getUserVouchers, type VoucherItem } from '@/lib/rpc';
import { config } from '@/lib/config';
import VoucherModal from '@/components/VoucherModal';

export default function AssetsPage() {
  const { account, connected, connect } = useWallet();

  const [erc20Balance, setErc20Balance] = useState('0');
  const [etherBalance, setEtherBalance] = useState('0');

  // deposit / withdraw / transfer amounts
  const [etherDeposit, setEtherDeposit] = useState('');
  const [etherWithdraw, setEtherWithdraw] = useState('');
  const [etherTransferTo, setEtherTransferTo] = useState('');
  const [etherTransferAmt, setEtherTransferAmt] = useState('');

  const [erc20Deposit, setErc20Deposit] = useState('');
  const [erc20Withdraw, setErc20Withdraw] = useState('');
  const [erc20TransferTo, setErc20TransferTo] = useState('');
  const [erc20TransferAmt, setErc20TransferAmt] = useState('');

  const [nftAddress, setNftAddress] = useState('');
  const [nftId, setNftId] = useState('');

  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setErc20Balance(await getERC20Balance(account, config.erc20TokenAddress));
    setEtherBalance(await getEtherBalance(account));
  }, [account]);

  useEffect(() => { refresh(); }, [refresh]);

  async function ensureWallet() {
    if (!connected) await connect();
    await initWallet();
  }

  async function loadVouchers() {
    setVouchers(await getUserVouchers(account));
  }

  const run = async (fn: () => Promise<void>) => {
    try {
      await ensureWallet();
      await fn();
      await refresh();
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-stone-800 pb-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-stone-100">The Vault</h2>
        <p className="text-stone-500 text-sm italic">Manage your tokens, tribute and war spoils</p>
      </div>

      <button onClick={refresh}
        className="bg-stone-800 hover:bg-stone-700 text-stone-400 px-5 py-2.5 font-bold border-b-4 border-stone-900 active:border-b-0 active:translate-y-0.5 transition-all uppercase tracking-widest text-xs">
        <RefreshCw size={14} className="inline mr-2" />Refresh Balances
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── ERC-20 ───── */}
        <div className="bg-[#14110f] border-2 border-stone-800 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-amber-900" />
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mb-1">Token Balance</p>
          <h3 className="text-5xl font-black italic text-amber-500 mb-2 drop-shadow-[0_2px_10px_rgba(180,83,9,0.3)]">
            {formatEther(BigInt(erc20Balance))} <span className="text-sm text-stone-600">tokens</span>
          </h3>
          <p className="font-mono text-xs text-stone-700 mb-6 break-all">{config.erc20TokenAddress}</p>

          <div className="space-y-3">
            <FormRow label="Deposit Tokens (in tokens)" value={erc20Deposit} onChange={setErc20Deposit}
              onSubmit={() => run(() => depositERC20(Number(erc20Deposit)))} btnLabel="Offer Gold" />
            <FormRow label="Request Withdrawal (in tokens)" value={erc20Withdraw} onChange={setErc20Withdraw}
              onSubmit={() => run(() => withdrawERC20(account, Number(erc20Withdraw)))} btnLabel="Retrieve" />
            <div className="flex flex-col gap-2 pt-1">
              <input className="am-input" placeholder="Recipient address (0x…)"
                value={erc20TransferTo} onChange={(e) => setErc20TransferTo(e.target.value)} />
              <div className="flex gap-2">
                <input className="am-input flex-1" type="number" placeholder="Amount"
                  value={erc20TransferAmt} onChange={(e) => setErc20TransferAmt(e.target.value)} />
                <button className="am-btn-primary"
                  onClick={() => run(() => transferERC20(account, erc20TransferTo, Number(erc20TransferAmt)))}>
                  Send Tribute
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Ether ───── */}
        <div className="bg-[#14110f] border-2 border-stone-800 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-stone-700" />
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mb-1">Ether Balance</p>
          <h3 className="text-5xl font-black italic text-stone-300 mb-2">
            {formatEther(BigInt(etherBalance))} <span className="text-sm text-stone-600">ETH</span>
          </h3>
          <p className="font-mono text-xs text-stone-700 mb-6 break-all">ETH - On Blockchain</p>

          {/* <div className="mb-6 h-px bg-stone-800" /> */}

          <div className="space-y-3">
            <FormRow label="Deposit Ether (in ETH)" value={etherDeposit} onChange={setEtherDeposit}
              onSubmit={() => run(() => depositEther(Number(etherDeposit)))} btnLabel="Offer Ether" />
            <FormRow label="Request Withdrawal (in ETH)" value={etherWithdraw} onChange={setEtherWithdraw}
              onSubmit={() => run(() => withdrawEther(account, Number(etherWithdraw)))} btnLabel="Retrieve" />
            <div className="flex flex-col gap-2 pt-1">
              <input className="am-input" placeholder="Recipient address (0x…)"
                value={etherTransferTo} onChange={(e) => setEtherTransferTo(e.target.value)} />
              <div className="flex gap-2">
                <input className="am-input flex-1" type="number" placeholder="Amount"
                  value={etherTransferAmt} onChange={(e) => setEtherTransferAmt(e.target.value)} />
                <button className="am-btn-primary"
                  onClick={() => run(() => transferEther(account, etherTransferTo, Number(etherTransferAmt)))}>
                  Send Tribute
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ERC-721 ─── */}
        <div className="bg-[#14110f] border-2 border-stone-800 p-8 shadow-xl lg:col-span-2">
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mb-4">ERC-721 Artefact</p>
          <div className="flex gap-3 flex-wrap">
            <input className="am-input flex-1 min-w-48" placeholder="Token contract address"
              value={nftAddress} onChange={(e) => setNftAddress(e.target.value)} />
            <input className="am-input w-32" type="number" placeholder="Token ID"
              value={nftId} onChange={(e) => setNftId(e.target.value)} />
            <button className="am-btn-primary"
              onClick={() => run(() => depositERC721(nftAddress, Number(nftId)))}>
              Offer Artefact
            </button>
          </div>
        </div>

        {/* ── Vouchers ── */}
        <div className="bg-[#14110f] border-2 border-stone-800 shadow-2xl lg:col-span-2">
          <div className="px-8 py-5 border-b border-stone-800 flex justify-between items-center bg-stone-900/40">
            <h4 className="font-bold uppercase tracking-widest text-sm italic text-stone-300">Royal Vouchers</h4>
            <button onClick={loadVouchers}
              className="text-[10px] text-amber-700 font-bold bg-amber-950/30 px-3 py-1.5 border border-amber-900/50 uppercase tracking-widest hover:bg-amber-950/60 transition">
              Load Spoils
            </button>
          </div>
          {vouchers.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-stone-700 italic opacity-40">
              <Trophy size={56} className="mb-4" />
              <p className="text-lg">The scrolls of victory are empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {vouchers.map((v) => (
                <div key={v.index}
                  className="flex items-center justify-between px-8 py-4 hover:bg-stone-800/20 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-stone-300 uppercase tracking-wider italic">
                      {v.method ?? 'Voucher'}
                    </p>
                    <p className="text-xs text-stone-500">{v.amount ?? ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {v.execution_transaction_hash
                      ? <span className="text-xs text-green-700 font-bold uppercase tracking-widest">Executed</span>
                      : <span className="text-xs text-amber-700 font-bold uppercase tracking-widest">Pending</span>}
                    <button className="am-btn-secondary text-xs" onClick={() => setSelectedVoucher(v)}>
                      Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedVoucher && (
        <VoucherModal voucher={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
      )}

      <style jsx global>{`
        .am-input {
          background: #0c0a09;
          border: 1px solid #44403c;
          padding: 0.625rem 1rem;
          color: #e7e5e4;
          outline: none;
          font-family: inherit;
        }
        .am-input:focus { border-color: #92400e; }
        .am-btn-primary {
          background: #78350f;
          color: #fef3c7;
          font-weight: 700;
          padding: 0.625rem 1.25rem;
          border-bottom: 4px solid #431407;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.15s;
          font-family: inherit;
        }
        .am-btn-primary:hover { background: #92400e; }
        .am-btn-primary:active { border-bottom-width: 0; transform: translateY(2px); }
        .am-btn-secondary {
          background: #1c1917;
          color: #a8a29e;
          font-weight: 700;
          padding: 0.4rem 0.9rem;
          border: 1px solid #44403c;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: inherit;
        }
        .am-btn-secondary:hover { background: #292524; color: #e7e5e4; }
      `}</style>
    </div>
  );
}
function FormRow({
  label, value, onChange, onSubmit, btnLabel,
}: {
  label: string; value: string; onChange: (v: string) => void;
  onSubmit: () => void; btnLabel: string;
}) {
  return (
    <div className="flex gap-2 items-end">
      <label className="flex flex-col gap-1 flex-1">
        <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">{label}</span>
        <input
          type="number"
          step="any"
          className="am-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Amount"
        />
      </label>
      <button className="am-btn-primary" onClick={onSubmit}>{btnLabel}</button>
    </div>
  );
}
