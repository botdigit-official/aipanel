import { useState } from "react";
import {
  Users,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ChevronRight,
  Ticket,
} from "lucide-react";
import type { ClientRecord } from "../../lib/types";

export default function ClientCRMPanel() {
  const [search, setSearch] = useState("");
  const [_selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

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
      outstandingAmount: "₹12,500",
      openTickets: 2,
    },
  ]);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090e] text-slate-100 overflow-y-auto font-sans">
      {/* Header Banner */}
      <header className="p-8 border-b border-slate-800/80 bg-[#0d0f18]/80 backdrop-blur-xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950/40">
              <Users size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Client CRM & Hosting Accounts
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Developer CRM
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Developer-centric hosting CRM. Strictly focused on client applications, domain lifecycles, and tenant quotas.
              </p>
            </div>
          </div>

          <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-950/60 transition-all cursor-pointer hover:shadow-indigo-500/20 active:scale-95">
            <Plus size={16} />
            <span>Add Client</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-8 space-y-8">
        {/* Client Health Dashboard */}
        <section aria-labelledby="fleet-health-heading">
          <div className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="fleet-health-heading" className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-400" />
                Client Fleet Health Overview
              </h2>
              <span className="text-xs text-slate-400 font-medium">Realtime quota monitoring</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-[#0b0d14] rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block font-medium">Websites</span>
                <span className="text-2xl font-bold text-white font-mono mt-1 block">12</span>
              </div>
              <div className="p-4 bg-[#0b0d14] rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block font-medium">Domains</span>
                <span className="text-2xl font-bold text-white font-mono mt-1 block">8</span>
              </div>
              <div className="p-4 bg-[#0b0d14] rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block font-medium">Hosting Subs</span>
                <span className="text-2xl font-bold text-indigo-400 font-mono mt-1 block">3</span>
              </div>
              <div className="p-4 bg-[#0b0d14] rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block font-medium">Open Tickets</span>
                <span className="text-2xl font-bold text-rose-400 font-mono mt-1 block">3</span>
              </div>
              <div className="p-4 bg-[#0b0d14] rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block font-medium">Renewals Due</span>
                <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">2</span>
              </div>
              <div className="p-4 bg-[#0b0d14] rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block font-medium">Outstanding</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">₹12,500</span>
              </div>
            </div>
          </div>
        </section>

        {/* Client List */}
        <section aria-labelledby="client-list-heading" className="space-y-4">
          <div className="bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search clients by name, company, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0b0d14] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredClients.length} clients registered
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {filteredClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className="p-5 hover:bg-slate-800/30 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {c.name}
                        <span className="text-xs font-normal text-slate-400">• {c.company}</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-500" /> {c.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-500" /> {c.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-right">
                    <div>
                      <span className="text-slate-400 block text-xs">Websites & Domains</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">
                        {c.websitesCount} apps / {c.domainsCount} domains
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Next Renewal</span>
                      <span
                        className={`font-mono font-medium px-2 py-0.5 rounded mt-0.5 inline-block ${
                          c.status === "expiring_soon"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "text-slate-300"
                        }`}
                      >
                        {c.renewalDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Balance</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                        {c.outstandingAmount}
                      </span>
                    </div>

                    <div>
                      {c.openTickets > 0 ? (
                        <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold inline-flex items-center gap-1">
                          <Ticket size={12} />
                          {c.openTickets} Open Ticket
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-medium">No Tickets</span>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-slate-500 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
