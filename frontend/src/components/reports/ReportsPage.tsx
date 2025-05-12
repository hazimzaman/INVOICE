'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchInvoices } from '@/store/slices/invoicesSlice';
import { fetchClients } from '@/store/slices/clientsSlice';
import { FiUsers, FiFileText, FiDollarSign, FiClock, FiAlertCircle } from 'react-icons/fi';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ClientRevenue {
  [key: string]: {
    name: string;
    revenue: number;
  };
}

interface MonthlyData {
  [key: string]: number;
}

interface Stats {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  totalClients: number;
  averageInvoiceAmount: number;
}

type TimePeriod = 'today' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const { invoices, loading: invoicesLoading } = useAppSelector((state) => state.invoices);
  const { clients, loading: clientsLoading } = useAppSelector((state) => state.clients);
  
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    totalAmount: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    overdueInvoices: 0,
    overdueAmount: 0,
    totalClients: 0,
    averageInvoiceAmount: 0
  });

  const [topClients, setTopClients] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchInvoices());
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    if (!invoicesLoading && !clientsLoading) {
      const now = new Date();
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'overdue'
      );
      
      setStats({
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
        paidInvoices: paidInvoices.length,
        pendingAmount: pendingInvoices.reduce((sum, inv) => sum + inv.total, 0),
        overdueInvoices: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.total, 0),
        totalClients: clients.length,
        averageInvoiceAmount: invoices.length ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0
      });

      const clientRevenue: ClientRevenue = invoices.reduce((acc, invoice) => {
        const clientId = invoice.client_id;
        if (!acc[clientId]) {
          acc[clientId] = {
            name: invoice.client?.name || 'Unknown',
            revenue: 0
          };
        }
        acc[clientId].revenue += invoice.total;
        return acc;
      }, {} as ClientRevenue);

      const topClientsData = Object.values(clientRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopClients(topClientsData);

      setStatusData([
        { name: 'Paid', value: paidInvoices.length },
        { name: 'Pending', value: pendingInvoices.length },
        { name: 'Overdue', value: overdueInvoices.length }
      ]);

      const monthly: MonthlyData = invoices.reduce((acc, invoice) => {
        const month = new Date(invoice.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += invoice.total;
        return acc;
      }, {} as MonthlyData);

      setMonthlyRevenue(
        Object.entries(monthly).map(([month, amount]) => ({
          month,
          amount
        }))
      );
    }
  }, [invoices, clients, invoicesLoading, clientsLoading]);

  const filterDataByPeriod = (date: string, period: TimePeriod) => {
    const today = new Date();
    const dataDate = new Date(date);
    
    switch(period) {
      case 'today':
        return dataDate.toDateString() === today.toDateString();
      case 'weekly':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        return dataDate >= weekAgo;
      case 'monthly':
        return dataDate.getMonth() === today.getMonth() && 
               dataDate.getFullYear() === today.getFullYear();
      case 'yearly':
        return dataDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  if (invoicesLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!invoices.length && !clients.length) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-lg">Start by adding some clients and invoices to see your reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-40 py-30 max-w-[1240px]">
      <div className="flex flex-col gap-2 sm:flex-row items-center justify-between mb-6 ">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {(['today', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FiFileText />}
          title="Total Invoices"
          value={stats.totalInvoices}
          subtitle="All time invoices"
          color="bg-white"
          iconColor="text-blue-500"
        />
        <StatCard 
          icon={<FiDollarSign />}
          title="Total Amount"
          value={`$${stats.totalAmount.toFixed(2)}`}
          subtitle="Revenue generated"
          color="bg-white"
          iconColor="text-green-500"
        />
        <StatCard 
          icon={<FiUsers />}
          title="Total Clients"
          value={stats.totalClients}
          subtitle="Active clients"
          color="bg-white"
          iconColor="text-purple-500"
        />
        <StatCard 
          icon={<FiDollarSign />}
          title="Pending Amount"
          value={`$${stats.pendingAmount.toFixed(2)}`}
          subtitle="Yet to be paid"
          color="bg-white"
          iconColor="text-yellow-500"
        />
        <StatCard 
          icon={<FiClock />}
          title="Paid Invoices"
          value={`${stats.paidInvoices}/${stats.totalInvoices}`}
          subtitle="Payment ratio"
          color="bg-white"
          iconColor="text-teal-500"
        />
        <StatCard 
          icon={<FiDollarSign />}
          title="Average Invoice"
          value={`$${stats.averageInvoiceAmount.toFixed(2)}`}
          subtitle="Average amount per invoice"
          color="bg-white"
          iconColor="text-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Invoice Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Status</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6 ">
          <h2 className="text-xl font-semibold mb-4">Top Clients by Revenue</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8">
                  {topClients.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Area Chart */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-lg shadow p-6 hidden ">
        <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Invoice #</th>
                <th className="text-left py-3">Client</th>
                <th className="text-left py-3 hidden sm:table-cell">Amount</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="py-3">{invoice.invoice_number}</td>
                  <td className="py-3">{invoice.client?.name}</td>
                  <td className="py-3 hidden sm:table-cell">${invoice.total.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 hidden sm:table-cell">{new Date(invoice.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  iconColor: string;
}

function StatCard({ icon, title, value, subtitle, color, iconColor }: StatCardProps) {
  return (
    <div className={` rounded-lg shadow-lg p-6 ${color} transition-transform hover:scale-105 `}>
      <div className="flex items-center mb-4">
        <div className={`${iconColor} p-3 rounded-full bg-white/80 mr-3`}>
          {icon}
        </div>
        <h3 className="text-gray-800 font-medium">{title}</h3>
      </div>
      <div className="text-3xl font-bold mb-2 text-gray-900">{value}</div>
      <div className="text-gray-600 text-sm">{subtitle}</div>
    </div>
  );
} 