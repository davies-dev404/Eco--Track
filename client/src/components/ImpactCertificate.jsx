import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Award, Leaf } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ImpactCertificate({ user, totalWeight, totalCarbon }) {
  const { toast } = useToast();
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const earnedDate = new Date();

  const handleDownload = async () => {
      setIsDownloading(true);
      try {
          const element = certificateRef.current;
          // Use logging to debug if needed, but the fix is likely ensuring colors are standard
          const canvas = await html2canvas(element, { 
              scale: 2,
              useCORS: true, 
              backgroundColor: "#ffffff" // Force white background
          });
          const imgData = canvas.toDataURL("image/png");
          
          const pdf = new jsPDF("landscape", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`EcoTrack_Impact_Certificate_${user.name?.replace(/\s+/g, '_') || 'User'}.pdf`);
          
          toast({ title: "Downloaded!", description: "Your impact certificate is saved." });
      } catch (error) {
          console.error("PDF Gen Error:", error);
          toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
      } finally {
          setIsDownloading(false);
      }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full items-center">
        <div>
            <h3 className="font-bold text-lg">Certificate Preview</h3>
            <p className="text-sm text-muted-foreground">This official document certifies your contribution.</p>
        </div>
        <Button onClick={handleDownload} disabled={isDownloading} className="bg-green-700 hover:bg-green-800">
            <Download className="h-4 w-4 mr-2" /> 
            {isDownloading ? "Generating..." : "Download PDF"}
        </Button>
      </div>

       {/* Certificate Preview Wrapper */}
       <div className="w-full overflow-auto flex justify-center bg-slate-100 p-4 rounded-lg border">
          <div 
            ref={certificateRef}
            className="min-w-[800px] h-[560px] relative shadow-xl overflow-hidden flex flex-col items-center justify-between p-12"
            style={{ 
                fontFamily: 'serif',
                backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #ecfdf5 100%)',
                backgroundColor: '#ffffff',
                borderWidth: '16px',
                borderStyle: 'double',
                borderColor: 'rgba(22, 163, 74, 0.2)', // green-600 with opacity
                color: '#0f172a' // slate-900
            }}
          >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" 
                   style={{
                       backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2315803d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                   }}>
              </div>

              {/* Header */}
              <div className="text-center space-y-4 z-10">
                  <div className="flex items-center justify-center gap-2 mb-2 opacity-80" style={{ color: '#166534' }}> {/* green-800 */}
                      <Leaf className="h-8 w-8" color="#16a34a" /> {/* green-600 */}
                      <span className="text-2xl font-bold tracking-widest uppercase font-sans">Eco-Track</span>
                  </div>
                  <h1 className="text-5xl font-bold uppercase tracking-wide" style={{ letterSpacing: '0.1em', color: '#15803d' }}>Certificate</h1> {/* green-700 */}
                  <p className="text-xl italic font-medium" style={{ color: '#64748b' }}>of Environmental Impact</p> {/* slate-500 */}
              </div>

              {/* Body */}
              <div className="text-center space-y-6 z-10 w-full max-w-2xl">
                  <p className="text-lg" style={{ color: '#475569' }}>This certifies that</p> {/* slate-600 */}
                  <h2 className="text-4xl font-bold pb-2 px-8 inline-block min-w-[300px] font-sans" style={{ borderBottom: '2px solid #cbd5e1', color: '#0f172a' }}> {/* slate-300, slate-900 */}
                      {user?.name || "Valued User"}
                  </h2>
                  <p className="text-lg leading-relaxed" style={{ color: '#475569' }}> {/* slate-600 */}
                      has successfully recycled <strong style={{ color: '#15803d' }}>{Number(totalWeight).toFixed(1)} kg</strong> of waste, 
                      actively reducing landfill usage and calculating <strong style={{ color: '#15803d' }}>{Number(totalCarbon).toFixed(1)} kg</strong> of CO₂ emissions.
                  </p>
                  <p className="text-sm mt-4" style={{ color: '#94a3b8' }}> {/* slate-400 */}
                      Thank you for making our planet greener, one step at a time.
                  </p>
              </div>

              {/* Footer */}
              <div className="w-full flex justify-between items-end mt-8 z-10">
                  <div className="text-center">
                      <div className="w-32 h-16 mb-2 flex items-end justify-center" style={{ borderBottom: '1px solid #94a3b8' }}> {/* slate-400 */}
                         <span className="font-dancing-script text-2xl signature" style={{ color: '#334155' }}>EcoTrack Team</span> {/* slate-700 */}
                      </div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: '#64748b' }}>Authorized Signature</p> {/* slate-500 */}
                  </div>

                  <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 relative" style={{ backgroundColor: '#dcfce7', border: '2px solid #22c55e' }}> {/* green-100, green-500 */}
                         <Award className="h-10 w-10" color="#16a34a" /> {/* green-600 */}
                      </div>
                      <span className="text-[10px] font-bold uppercase" style={{ color: '#15803d' }}>Top recycler</span> {/* green-700 */}
                  </div>

                  <div className="text-center">
                      <div className="w-32 h-16 mb-2 flex items-end justify-center" style={{ borderBottom: '1px solid #94a3b8' }}> {/* slate-400 */}
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
