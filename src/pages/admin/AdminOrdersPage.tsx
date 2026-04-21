import { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Eye, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, OrderStatus } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-violet-100 text-violet-700 border-violet-200',
  out_for_delivery: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const paymentColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-stone-100 text-stone-700',
};

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : null);
      showToast('Order status updated', 'success');
    } else {
      showToast('Failed to update status', 'error');
    }
    setUpdatingStatus(null);
  };

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.customer_email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1810]">Orders</h1>
        <p className="text-stone-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by order no., name, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  {['Order', 'Customer', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-400 px-5 py-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-stone-400">No orders found</td>
                  </tr>
                ) : filtered.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#2C1810] text-sm">#{order.order_number}</p>
                      <p className="text-xs text-stone-400">{order.order_items?.length || 0} item(s)</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-stone-700 font-medium">{order.customer_name}</p>
                      <p className="text-xs text-stone-400">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#2C1810] text-sm">₹{order.total_amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${paymentColors[order.payment_status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                          disabled={updatingStatus === order.id}
                          className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none ${statusColors[order.status] || 'bg-stone-100 text-stone-600 border-stone-200'}`}
                        >
                          {statusOptions.filter(o => o.value !== 'all').map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-stone-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus }: { order: Order; onClose: () => void; onUpdateStatus: (id: string, status: OrderStatus) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2C1810]">Order #{order.order_number}</h2>
            <p className="text-stone-400 text-sm mt-0.5">{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase mb-3">Customer</p>
              <p className="font-semibold text-[#2C1810]">{order.customer_name}</p>
              <p className="text-sm text-stone-600 mt-1">{order.customer_email}</p>
              <p className="text-sm text-stone-600">{order.customer_phone}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase mb-3">Delivery</p>
              <p className="text-sm text-stone-600 leading-relaxed">{order.delivery_address}</p>
              {order.delivery_date && <p className="text-sm text-amber-700 mt-2 font-medium">Deliver by: {new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
            </div>
          </div>

          {order.special_instructions && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Special Instructions</p>
              <p className="text-sm text-amber-800">{order.special_instructions}</p>
            </div>
          )}

          {order.order_items && order.order_items.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase mb-3">Items Ordered</p>
              <div className="space-y-3">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 bg-stone-50 rounded-xl">
                    <img src={item.cake_image} alt={item.cake_name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-[#2C1810] text-sm">{item.cake_name}</p>
                      <p className="text-xs text-stone-400">{item.weight} · {item.flavor} · Qty: {item.quantity}</p>
                      {item.customization && <p className="text-xs text-amber-700 mt-0.5">Note: {item.customization}</p>}
                    </div>
                    <p className="font-bold text-[#2C1810] text-sm">₹{item.subtotal.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-stone-100 pt-4">
            <div className="flex justify-between text-sm text-stone-500 mb-2">
              <span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500 mb-3">
              <span>Delivery</span><span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-[#2C1810] text-lg">
              <span>Total</span><span>₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">Update Order Status</p>
            <div className="flex flex-wrap gap-2">
              {(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(order.id, s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    order.status === s
                      ? `${statusColors[s]} ring-2 ring-offset-1 ring-current`
                      : 'border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
