import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, XCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings({ settings, setSettings }) {
    const { toast } = useToast();

    const handleSettingsSave = async () => {
        try {
            await api.put("/settings", settings);
            toast({ title: "Settings Saved", description: "System configuration updated successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
                <CardHeader>
                    <CardTitle>Pricing Configuration</CardTitle>
                    <CardDescription>Set the payout rates per kg for collected waste.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(settings.pricing).map(([type, price]) => (
                        <div key={type} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded bg-white">
                            <Label className="capitalize font-medium">{type} ($/kg)</Label>
                            <Input 
                                type="number" 
                                className="w-24 text-right" 
                                step="0.1"
                                value={price}
                                onChange={(e) => setSettings({...settings, pricing: {...settings.pricing, [type]: Number(e.target.value)}})}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Service Zones</CardTitle>
                    <CardDescription>Areas where pickups are available.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-4 rounded-lg min-h-[60px]">
                        {settings.zones.map(z => (
                            <Badge key={z} variant="secondary" className="px-3 py-1 flex items-center gap-2 bg-white shadow-sm hover:bg-slate-100">
                                {z} <XCircle className="h-3 w-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setSettings({...settings, zones: settings.zones.filter(zone => zone !== z)})} />
                            </Badge>
                        ))}
                        {settings.zones.length === 0 && <span className="text-slate-400 text-sm italic">No zones configured</span>}
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Add new zone..." id="new-zone" onKeyDown={(e) => {
                            if(e.key === 'Enter') {
                                setSettings({...settings, zones: [...settings.zones, e.currentTarget.value]});
                                e.currentTarget.value = '';
                            }
                        }} />
                        <Button variant="outline" onClick={() => {
                            const input = document.getElementById('new-zone');
                            if(input.value) {
                                setSettings({...settings, zones: [...settings.zones, input.value]});
                                input.value = '';
                            }
                        }}>Add</Button>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button size="lg" className="gap-2 bg-slate-900 shadow-xl hover:bg-slate-800" onClick={handleSettingsSave}>
                    <Save className="h-4 w-4" /> Save Configuration
                </Button>
            </div>
        </div>
    );
}
