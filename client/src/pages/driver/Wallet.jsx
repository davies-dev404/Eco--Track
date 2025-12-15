import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, ArrowUpRight, History, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import api from "@/lib/api";

export default function Wallet({ user, tasks = [] }) {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Withdrawal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("mpesa");

  // Pricing constants (Mock)
  const BASE_RATE = 50; // Base fee per collection
  const PER_KG_RATE = 10; // KES per kg

  useEffect(() => {
      calculateEarnings();
  }, [tasks, user]);

  const calculateEarnings = () => {
      setIsLoading(true);

      // 1. Calculate Credits from Completed Tasks
      const completedTasks = tasks.filter(t => ['collected', 'completed'].includes(t.status));
      
      const earningsHistory = completedTasks.map(task => {
          const weight = Number(task.actualWeight) || 0;
          const amount = BASE_RATE + (weight * PER_KG_RATE);
          return {
              id: task._id,
              type: 'credit',
              amount: Math.round(amount),
              date: new Date(task.collectedAt || task.updatedAt || Date.now()),
              description: `Collection: ${task.address.split(',')[0]} (${weight}kg)`
          };
      });

      // 2. Sort by Date Descending
      const sortedHistory = earningsHistory.sort((a,b) => b.date - a.date);

      // 3. Calculate Totals
      const earned = sortedHistory.reduce((acc, item) => acc + item.amount, 0);
      
      // 4. Subtract Withdrawals (Mocked in local storage for now as we don't have backend withdrawals yet)
      const storedWithdrawals = JSON.parse(localStorage.getItem(`withdrawals_${user.id || user._id}`)) || [];
      const withdrawn = storedWithdrawals.reduce((acc, item) => acc + item.amount, 0);

      const allHistory = [...sortedHistory, ...storedWithdrawals].sort((a,b) => new Date(b.date) - new Date(a.date));

      setTotalEarned(earned);
      setBalance(earned - withdrawn);
      setHistory(allHistory);
      setIsLoading(false);
  };

  const handleWithdrawal = async (e) => {
      e.preventDefault();
      const amount = Number(withdrawAmount);
      if (amount <= 0 || amount > balance) {
          toast({ title: "Invalid Amount", description: "Please check your balance.", variant: "destructive" });
          return;
      }

      // Mock API Withdrawal Record
      const withdrawalRecord = {
          id: `wd_${Date.now()}`,
          type: 'debit',
          amount: amount,
          date: new Date(),
          description: `Withdrawal via ${withdrawMethod === 'mpesa' ? 'M-Pesa' : 'Bank'}`
      };

      // Save to local storage to persist for session demo
      const key = `withdrawals_${user.id || user._id}`;
      const existing = JSON.parse(localStorage.getItem(key)) || [];
      localStorage.setItem(key, JSON.stringify([withdrawalRecord, ...existing]));

      toast({ title: "Processing Payment", description: "Funds sent to your account." });
      
      // Refresh Logic
      calculateEarnings();
      setShowWithdraw(false);
      setWithdrawAmount("");
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <WalletIcon className="h-6 w-6" /> My Wallet
        </h2>
        <Button onClick={() => setShowWithdraw(true)} className="bg-green-600 hover:bg-green-700 shadow-md">
            <ArrowUpRight className="h-4 w-4 mr-2" /> Withdraw
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Available Balance</span>
              <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-bold">KES {balance.toLocaleString()}</span>
                  <span className="text-sm text-green-400 font-medium">.00</span>
              </div>
              <div className="mt-4 flex gap-4">
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <span className="block text-xs text-slate-400">Total Earned</span>
                      <span className="font-semibold text-lg">KES {totalEarned.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <span className="block text-xs text-slate-400">Pending</span>
                      <span className="font-semibold text-lg">KES 0</span>
                  </div>
              </div>
          </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200">
              <TabsTrigger value="transactions" className="data-[state=active]:shadow-sm">Transactions</TabsTrigger>
              <TabsTrigger value="methods" className="data-[state=active]:shadow-sm">Payment Methods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History className="h-3 w-3" /> Recent Activity
              </h3>
              
              {history.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-500 text-sm">No transactions yet.</p>
                      <p className="text-xs text-slate-400">Complete jobs to start earning.</p>
                  </div>
              )}

              <div className="space-y-3">
                  {history.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${item.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                  {item.type === 'credit' ? (
                                      <Banknote className="h-5 w-5 text-green-600" />
                                  ) : (
                                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                                  )}
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-slate-800">{item.description}</p>
                                  <p className="text-xs text-slate-500">{format(new Date(item.date), "MMM d, h:mm a")}</p>
                              </div>
                          </div>
                          <span className={`font-bold text-sm ${item.type === 'credit' ? 'text-green-600' : 'text-slate-900'}`}>
                              {item.type === 'credit' ? '+' : '-'} {item.amount.toLocaleString()}
                          </span>
                      </div>
                  ))}
              </div>
          </TabsContent>

          <TabsContent value="methods" className="pt-4">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-base">M-Pesa (Primary)</CardTitle>
                      <CardDescription>Withdrawals are sent here by default.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                          <div className="bg-green-600 text-white p-2 rounded-md font-bold text-xs shadow-sm">MPESA</div>
                          <div className="flex-1">
                              <p className="font-bold text-sm text-slate-900">{user.phone}</p>
                              <p className="text-xs text-slate-500">Verified Phone Number</p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>

      {/* Withdrawal Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>Transfer money to your account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleWithdrawal} className="space-y-4 py-2">
                  <div className="space-y-2">
                      <Label>Amount (KES)</Label>
                      <Input 
                          type="number" 
                          placeholder="e.g. 500" 
                          value={withdrawAmount} 
                          onChange={e => setWithdrawAmount(e.target.value)}
                          max={balance}
                          min={100}
                          required
                          className="text-lg font-bold"
                      />
                      <p className="text-xs text-slate-500 text-right">Available: {balance.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                      <Label>Withdraw To</Label>
                      <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="mpesa">M-Pesa ({user.phone})</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <DialogFooter>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Confirm Withdrawal</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
