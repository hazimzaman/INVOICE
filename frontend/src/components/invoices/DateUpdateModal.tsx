import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface DateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  currentDate: string;
  onUpdate: () => void;
}

export default function DateUpdateModal({
  isOpen,
  onClose,
  invoiceId,
  currentDate,
  onUpdate
}: DateUpdateModalProps) {
  const [date, setDate] = useState(currentDate.split('T')[0]); // Format date for input
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ date, updated_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (error) throw error;

      toast.success('Invoice date updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update date');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-lg p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Update Invoice Date
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Date'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 