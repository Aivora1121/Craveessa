import { useState, useEffect } from 'react';
import { Package, ShoppingBag, TrendingUp, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../lib/types';
import { useRouter } from '../../context/RouterContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCakes: number;
  recentOrders: Order[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-violet-100 text-violet-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboardPage() {
  const { navigate } = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, cakesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('cakes').select('id', { count: 'exact' }),
      ]);

      const orders = (ordersRes.data || []) as Order[];
      const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0);
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalCakes: cakesRes.count || 0,
        recentOrders: orders.slice(0, 8),
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-50 text-blue-600', change: '+12% this month' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: 'bg-green-50 text-green-600', change: '+8% this month' },
    { icon: Clock, label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-amber-50 text-amber-600', change: 'Needs attention' },
    { icon: Package, label: 'Total Products', value: stats.totalCakes, color: 'bg-rose-50 text-rose-600', change: 'In catalog' },
  ];

  const revenueByStatus = [
    { label: 'Delivered', count: stats.recentOrders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Preparing', count: stats.recentOrders.filter(o => o.status === 'preparing').length, icon: Clock, color: 'text-amber-500' },
    { label: 'Cancelled', count: stats.recentOrders.filter(o => o.status === 'cancelled').length, icon: XCircle, color: 'text-red-500' },
    { label: 'Pending', count: stats.recentOrders.filter(o => o.status === 'pending').length, icon: AlertCircle, color: 'text-blue-500' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1810]">Dashboard Overview</h1>
        <p className="text-stone-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-stone-400">{card.change}</span>
            </div>
            <p className="text-2xl font-bold text-[#2C1810]">{card.value}</p>
            <p className="text-stone-500 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-stone-50">
            <h2 className="font-semibold text-[#2C1810]">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-amber-600 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left text-xs font-semibold text-stone-400 px-6 py-3 uppercase tracking-wider">Order</th>
                  <th className="text-left text-xs font-semibold text-stone-400 px-6 py-3 uppercase tracking-wider">Customer</th>
                  <th className="text-left text-xs font-semibold text-stone-400 px-6 py-3 uppercase tracking-wider">Amount</th>
                  <th className="text-left text-xs font-semibold text-stone-400 px-6 py-3 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-stone-400 text-sm">No orders yet</td>
                  </tr>
                ) : stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#2C1810]">#{order.order_number}</p>
                      <p className="text-xs text-stone-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-700">{order.customer_name}</p>
                      <p className="text-xs text-stone-400">{order.customer_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#2C1810]">₹{order.total_amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-[#2C1810] mb-4">Order Breakdown</h2>
            <div className="space-y-3">
              {revenueByStatus.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-stone-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-[#2C1810] text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2C1810] rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-2">Quick Actions</h2>
            <p className="text-white/60 text-xs mb-4">Manage your bakery efficiently</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/cakes')}
                className="w-full bg-white/10 hover:bg-amber-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all text-left"
              >
                + Add New Cake
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full bg-white/10 hover:bg-amber-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all text-left"
              >
                View Pending Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white/10 hover:bg-white/20 text-white/70 text-sm font-medium py-2.5 px-4 rounded-xl transition-all text-left"
              >
                View Customer Site
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
