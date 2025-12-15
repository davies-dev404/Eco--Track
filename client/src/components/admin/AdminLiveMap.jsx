import { Map as MapIcon } from "lucide-react";

export default function AdminLiveMap({ drivers, pickups }) {
    const onlineDrivers = drivers.filter(d => d.availability === 'online').length;
    const activeRoutes = pickups.filter(p => p.status === 'in_progress').length;

    return (
        <div className="h-[600px] w-full bg-slate-100 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
             {/* This would be a real map (Google Maps / Mapbox) */}
             <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20 filter grayscale"></div>
             
             <div className="relative z-10 w-full h-full p-8 grid place-items-center">
                 <div className="text-center space-y-4">
                     <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto backdrop-blur-sm bg-white/90">
                         <div className="flex items-center justify-center gap-3 mb-4">
                             <div className="bg-blue-100 p-3 rounded-full animate-pulse">
                                 <MapIcon className="h-8 w-8 text-blue-600" />
                             </div>
                         </div>
                         <h3 className="text-xl font-bold text-slate-900">Live Fleet Tracking</h3>
                         <p className="text-slate-500 text-sm mb-6">
                             Visualization of active drivers and pending pickups is currently in simulation mode.
                         </p>
                         
                         <div className="space-y-3 text-left">
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                 <span className="flex items-center gap-2 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online Drivers</span>
                                 <span className="font-bold">{onlineDrivers}</span>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                 <span className="flex items-center gap-2 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Active Routes</span>
                                 <span className="font-bold">{activeRoutes}</span>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
}
