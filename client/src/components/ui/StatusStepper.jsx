import { Check } from "lucide-react";

export function StatusStepper({ status }) {
    const steps = [
        { id: 'pending', label: 'Requested' },
        { id: 'assigned', label: 'Assigned' },
        { id: 'in_progress', label: 'On Way' },
        { id: 'collected', label: 'Completed' }
    ];

    const getCurrentIndex = () => {
        const index = steps.findIndex(s => s.id === status);
        if (index === -1) {
            if (status === 'accepted') return 1; // map accepted -> assigned visually
            if (status === 'completed') return 3;
            return 0;
        }
        return index;
    };

    const activeIndex = getCurrentIndex();

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative pl-4 pr-4">
                {/* Connecting Line */}
                <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 h-1 bg-slate-100 -z-10" />
                <div 
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500" 
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 90}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted 
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200" 
                                    : "bg-white border-slate-200 text-slate-300"
                            }`}>
                                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                            </div>
                            <span className={`text-[10px] font-bold uppercase mt-2 tracking-wider ${
                                isCompleted ? "text-slate-800" : "text-slate-400"
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
