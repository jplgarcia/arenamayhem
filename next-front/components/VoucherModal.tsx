'use client';

import { executeVoucher } from '@/lib/ethereum';
import { initWallet } from '@/lib/ethereum';
import type { VoucherItem } from '@/lib/rpc';
import { ScrollText } from 'lucide-react';

interface Props {
  voucher: VoucherItem;
  onClose: () => void;
}

export default function VoucherModal({ voucher, onClose }: Props) {
  const executed = voucher.execution_transaction_hash != null;

  async function execute() {
    try {
      await initWallet();
      await executeVoucher(voucher.output);
      alert('Execute transaction submitted!');
      onClose();
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#14110f] border-2 border-stone-800 p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-900" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-900" />

        <h2 className="text-amber-600 text-xl font-black uppercase italic tracking-wider mb-5">
          <ScrollText size={20} className="inline mr-2" />{voucher.method ?? 'Royal Decree'}
        </h2>

        <table className="text-sm w-full mb-6">
          <tbody className="divide-y divide-stone-800/50">
            {[
              ['Scroll #', voucher.index],
              ['Destination', <span key="d" className="font-mono text-xs break-all">{voucher.destination}</span>],
              ['Amount', voucher.amount ?? '—'],
              ['Status', executed
                ? <span key="e" className="text-green-700 font-bold uppercase tracking-widest text-xs">Executed</span>
                : <span key="p" className="text-amber-600 font-bold uppercase tracking-widest text-xs">Pending</span>],
              ...(executed ? [['Tx', <span key="tx" className="font-mono text-xs break-all">{voucher.execution_transaction_hash}</span>]] : []),
            ].map(([label, val]) => (
              <tr key={String(label)}>
                <td className="text-stone-600 pr-4 py-2 text-[10px] uppercase font-bold tracking-widest">{label}</td>
                <td className="text-stone-300 py-2">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold border-b-4 border-stone-900 uppercase tracking-widest text-xs transition-all active:border-b-0 active:translate-y-0.5">
            Retreat
          </button>
          {!executed && (
            <button onClick={execute}
              className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold border-b-4 border-amber-950 uppercase tracking-widest text-xs transition-all active:border-b-0 active:translate-y-0.5">
              Claim Spoils
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
