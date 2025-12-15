import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Award, Truck } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Certificate({ user, tasks = [] }) {
  const { toast } = useToast();
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Calculate Real Stats
  const completedTasks = tasks.filter(t => ['collected', 'completed'].includes(t.status));
  const totalCollections = completedTasks.length;
  const totalWeight = completedTasks.reduce((acc, t) => acc + (Number(t.actualWeight) || 0), 0).toFixed(1);
  const earnedDate = new Date();

  const handleDownload = async () => {
      setIsDownloading(true);
      try {
          const element = certificateRef.current;
          const canvas = await html2canvas(element, { 
              scale: 2,
              useCORS: true, 
              backgroundColor: "#ffffff"
          });
          const imgData = canvas.toDataURL("image/png");
          
          const pdf = new jsPDF("landscape", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`EcoTrack_Certificate_${user.name?.replace(/\s+/g, '_') || 'Driver'}.pdf`);
          
          toast({ title: "Downloaded!", description: "Certificate saved to your device." });
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
      } finally {
          setIsDownloading(false);
      }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" /> Driver Certification
            </h2>
            <p className="text-slate-500 text-sm">Official proof of your contribution.</p>
          </div>
          <Button onClick={handleDownload} disabled={isDownloading} className="bg-slate-900 shadow-md">
              <Download className="h-4 w-4 mr-2" /> 
              {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
      </div>

      {/* Certificate Preview Wrapper */}
      <div className="overflow-auto py-8 bg-slate-100 rounded-xl border flex justify-center">
          
          {/* Main Certificate Design */}
          <div 
            ref={certificateRef}
            className="w-[800px] h-[560px] relative shadow-2xl overflow-hidden flex flex-col items-center justify-between p-12"
            style={{ 
                fontFamily: 'serif',
                backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #f0fdf4 100%)',
                backgroundColor: '#ffffff',
                borderWidth: '16px',
                borderStyle: 'double',
                borderColor: 'rgba(20, 83, 45, 0.1)', // green-900/10 approx
                color: '#0f172a' // slate-900
            }}
          >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" 
                   style={{
                       backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                   }}>
              </div>

              {/* Header */}
              <div className="text-center space-y-4 z-10">
                  <div className="flex items-center justify-center gap-2 mb-2 opacity-80" style={{ color: '#14532d' }}> {/* green-900 */}
                      <Truck className="h-8 w-8" color="#15803d" /> {/* green-700 */}
                      <span className="text-2xl font-bold tracking-widest uppercase font-sans">Eco-Track</span>
                  </div>
                  <h1 className="text-5xl font-bold uppercase tracking-wide" style={{ letterSpacing: '0.1em', color: '#166534' }}>Certificate</h1> {/* green-800 */}
                  <p className="text-xl italic font-medium" style={{ color: '#64748b' }}>of Environmental Stewardship</p> {/* slate-500 */}
              </div>

              {/* Body */}
              <div className="text-center space-y-6 z-10 w-full max-w-2xl">
                  <p className="text-lg" style={{ color: '#475569' }}>This is to certify that</p> {/* slate-600 */}
                  <h2 className="text-4xl font-bold pb-2 px-8 inline-block min-w-[300px] font-sans" style={{ borderBottom: '2px solid #cbd5e1', color: '#0f172a' }}>
                      {user.name}
                  </h2>
                  <p className="text-lg leading-relaxed" style={{ color: '#475569' }}>
                      has successfully completed <strong style={{ color: '#15803d' }}>{totalCollections} pickups</strong> and responsibly transported 
                      <strong style={{ color: '#15803d' }}> {totalWeight} kg</strong> of waste for recycling.
                  </p>
                  <p className="text-sm mt-4" style={{ color: '#94a3b8' }}>
                      Thank you for your dedication to creating a cleaner, sustainable future.
                  </p>
              </div>

              {/* Footer */}
              <div className="w-full flex justify-between items-end mt-8 z-10">
                  <div className="text-center">
                      <div className="w-32 h-16 mb-2 flex items-end justify-center" style={{ borderBottom: '1px solid #94a3b8' }}>
                         <span className="font-dancing-script text-2xl signature" style={{ color: '#334155' }}>EcoTrack Team</span>
                      </div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: '#64748b' }}>Authorized Signature</p>
                  </div>

                  <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 relative" style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}> {/* amber-100, amber-500 */}
                         <Award className="h-10 w-10" color="#d97706" /> {/* amber-600 */}
                      </div>
                      <span className="text-[10px] font-bold uppercase" style={{ color: '#b45309' }}>Certified Driver</span> {/* amber-700 */}
                  </div>

                  <div className="text-center">
                      <div className="w-32 h-16 mb-2 flex items-end justify-center" style={{ borderBottom: '1px solid #94a3b8' }}>
                          <span className="text-lg" style={{ color: '#0f172a' }}>{format(earnedDate, "MMMM d, yyyy")}</span>
                      </div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: '#64748b' }}>Date Issued</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
