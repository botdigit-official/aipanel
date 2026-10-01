import { useState } from "react";
import {
  CreditCard,
  Plus,
  Users,
  Globe,
  HardDrive,
  Database,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import type { HostingPlan, ClientRecord } from "../../lib/types";

export default function HostingPanel() {
  const [plans] = useState<HostingPlan[]>([
    {
      id: "plan-starter",
      name: "Starter Shared",
      price: "₹499 / mo",
      cycle: "monthly",
      websites: 1,
      databases: 1,
      storageGb: 10,
      domains: 1,
      emails: 5,
      bandwidthGb: 50,
      activeSubscribers: 14,
    },
    {
      id: "plan-pro",
      name: "Pro Developer VPS",
      price: "₹1,499 / mo",
      cycle: "monthly",
      websites: 5,
      databases: 5,
      storageGb: 40,
      domains: 3,
      emails: 25,
      bandwidthGb: 200,
      activeSubscribers: 28,
    },
    {
      id: "plan-agency",
      name: "Agency Dedicated",
      price: "₹4,999 / mo",
      cycle: "monthly",
      websites: 25,
      databases: 20,
      storageGb: 150,
      domains: 15,
      emails: 100,
      bandwidthGb: 1000,
      activeSubscribers: 6,
    },
  ]);

  const [clients] = useState<ClientRecord[]>([
    {
      id: "cli-1",
      name: "Rahul Sharma",
      company: "Apex Digital Solutions",
      email: "rahul@apexdigital.in",
      phone: "+91 98200 12345",
      planId: "plan-pro",
      websitesCount: 3,
      domainsCount: 2,
      renewalDate: "14 Nov 2026",
      status: "active",
      outstandingAmount: "₹0",
      openTickets: 1,
    },
    {
      id: "cli-2",
      name: "Priya Nair",
      company: "Kochi Craft Studio",
      email: "priya@craftstudio.co",
      phone: "+91 94470 54321",
      planId: "plan-starter",
      websitesCount: 1,
      domainsCount: 1,
      renewalDate: "28 Oct 2026",
      status: "expiring_soon",
      outstandingAmount: "₹499",
      openTickets: 0,
    },
    {
      id: "cli-3",
      name: "Vikram Mehta",
      company: "Mehta Logistics ERP",
      email: "vikram@mehtalogistics.com",
      phone: "+91 98110 99887",
      planId: "plan-agency",
      websitesCount: 8,
      domainsCount: 5,
      renewalDate: "05 Dec 2026",
      status: "active",
      outstandingAmount: "₹0",
      openTickets: 0,
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090e] text-slate-100 overflow-y-auto font-sans">
      {/* Top Banner Header */}
      <header className="p-8 border-b border-slate-800/80 bg-[#0d0f18]/80 backdrop-blur-xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950/40">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Hosting Plans & Reseller Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Plugin Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Provision hosting packages, monitor client quotas, track automated recurring billing, and manage tenant boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-950/60 transition-all cursor-pointer hover:shadow-indigo-500/20 active:scale-95">
              <Plus size={16} />
              <span>Create New Plan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-8 space-y-8">
        {/* KPI Summary Cards */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-[#121520] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Active Subscribers</span>
                <Users size={18} className="text-indigo-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">48</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                ↑ 12% increase this month
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#121520] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Monthly Hosting Revenue</span>
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">₹78,940</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Next automated batch: Nov 01
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#121520] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Allocated Websites</span>
                <Globe size={18} className="text-sky-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">34 / 85</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: "40%" }} />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121520] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Allocated NVMe Storage</span>
                <HardDrive size={18} className="text-amber-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">680 GB</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Pooled across 3 primary nodes
              </span>
            </div>
          </div>
        </section>

        {/* Hosting Packages Grid */}
        <section aria-labelledby="packages-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="packages-heading" className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              Active Hosting Packages
            </h2>
            <span className="text-xs text-slate-400 font-mono">3 packages configured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-2xl bg-[#121520] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-indigo-950/20 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                        {plan.name}
                      </h3>
                      <span className="text-xs text-slate-400 capitalize">{plan.cycle} billing cycle</span>
                    </div>
                    <span className="px-3 py-1 rounded-xl text-sm font-bold font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30">
                      {plan.price}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-200">
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2 text-xs">
                        <Globe size={14} className="text-slate-500" /> Max Websites
                      </span>
                      <span className="font-mono font-bold text-slate-100">{plan.websites}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2 text-xs">
                        <Database size={14} className="text-slate-500" /> Databases
                      </span>
                      <span className="font-mono font-bold text-slate-100">{plan.databases}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2 text-xs">
                        <HardDrive size={14} className="text-slate-500" /> Storage Quota
                      </span>
                      <span className="font-mono font-bold text-slate-100">{plan.storageGb} GB</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2 text-xs">
                        <Mail size={14} className="text-slate-500" /> Email Mailboxes
                      </span>
                      <span className="font-mono font-bold text-slate-100">{plan.emails}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    <strong className="text-white font-mono font-bold">{plan.activeSubscribers}</strong> active subscribers
                  </span>
                  <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer">
                    <span>Configure</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Client CRM Preview Table */}
        <section aria-labelledby="clients-heading" className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#121520] border border-slate-800/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="clients-heading" className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" />
                  Subscribed Clients Overview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client websites, assigned domains, renewal calendar, and open support tickets.
                </p>
              </div>
              <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer">
                <span>View Full CRM</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0d14] text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-800/80">
                  <tr>
                    <th className="py-3 px-4">Client & Company</th>
                    <th className="py-3 px-4">Assigned Plan</th>
                    <th className="py-3 px-4">Websites & Domains</th>
                    <th className="py-3 px-4">Next Renewal</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Support Tickets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {clients.map((cli) => (
                    <tr key={cli.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 text-sm">{cli.name}</div>
                        <div className="text-xs text-slate-400">{cli.company}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {cli.planId === "plan-starter"
                          ? "Starter Shared"
                          : cli.planId === "plan-pro"
                          ? "Pro Developer VPS"
                          : "Agency Dedicated"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200">{cli.websitesCount} apps</span> •{" "}
                        <span className="text-slate-400">{cli.domainsCount} domains</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            cli.status === "expiring_soon"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "text-slate-300"
                          }`}
                        >
                          {cli.renewalDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400 text-sm">
                        {cli.outstandingAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        {cli.openTickets > 0 ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
                            {cli.openTickets} Open
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
