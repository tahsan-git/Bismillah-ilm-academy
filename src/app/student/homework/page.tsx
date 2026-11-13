"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BookOpen, Loader2, CalendarDays, CheckCircle2, AlertTriangle, 
  Upload, Image as ImageIcon, Mic, X, Square, MessageSquare
} from "lucide-react";

export default function StudentHomework() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submit Modal states
  const [selectedHw, setSelectedHw] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  const fetchHomeworks = async () => {
    setLoading(true);
    const studentId = localStorage.getItem("student_id");
    if (!studentId) { window.location.href = "/student/login"; return; }

    const { data } = await supabase
      .from("homework")
      .select("*")
      .eq("student_id", studentId);

    if (data) {
      // 🌟 Sorting Logic: Status Priority + Recent First
      const statusPriority: Record<string, number> = {
        pending: 1,
        submitted: 2,
        reviewed: 3,
      };

      const sortedData = data.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 4;
        const priorityB = statusPriority[b.status] || 4;
        
        // ১. Prothome Status onujayi sort (Pending upore)
        if (priorityA !== priorityB) {
          return priorityA - priorityB; 
        }
        
        // ২. Jodi status same hoy, tokhon notun ta (created_at) upore asbe
        const dateA = new Date(a.created_at || a.id).getTime();
        const dateB = new Date(b.created_at || b.id).getTime();
        
        return dateB - dateA; // Notun ta age asbe
      });

      setHomeworks(sortedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  // 🌟 Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recorded-${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("মাইক্রোফোন ব্যবহারের অনুমতি দিন!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 🌟 Final Submit Logic
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw) return;
    if (imageFiles.length === 0 && !audioFile) {
      alert("অনুগ্রহ করে অন্তত একটি ছবি বা অডিও দিন।");
      return;
    }

    setSubmitting(true);
    try {
      // ১. Multiple Images Upload
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `hw-${selectedHw.id}-img-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error } = await supabase.storage.from('site-images').upload(fileName, file);
        if (error) throw error;
        
        const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
        
        await supabase.from("homework_submissions").insert({
          homework_id: selectedHw.id,
          file_url: data.publicUrl,
          file_type: 'image'
        });
      }

      // ২. Audio Upload
      if (audioFile) {
        const fileExt = audioFile.name.split('.').pop();
        const fileName = `hw-${selectedHw.id}-audio-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error } = await supabase.storage.from('site-images').upload(fileName, audioFile);
        if (error) throw error;
        
        const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
        
        await supabase.from("homework_submissions").insert({
          homework_id: selectedHw.id,
          file_url: data.publicUrl,
          file_type: 'audio'
        });
      }

      // ৩. Update Homework Status
      await supabase.from("homework")
        .update({ 
          status: "submitted", 
          submitted_at: new Date().toISOString()
        })
        .eq("id", selectedHw.id);

      setSelectedHw(null);
      setImageFiles([]);
      setAudioFile(null);
      fetchHomeworks();
    } catch (error: any) {
      alert("জমা দিতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (date: string | null) => date ? new Date(date) < new Date() : false;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">হোমওয়ার্ক</h1>
        <p className="text-slate-500 mt-1">আপনার সব অ্যাসাইনমেন্ট ও ডেডলাইন</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
      ) : homeworks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">এখনো কোনো হোমওয়ার্ক নেই।</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {homeworks.map((hw) => {
            const isSubmitted = hw.status === "submitted";
            const isReviewed = hw.status === "reviewed";
            const overdue = !isSubmitted && !isReviewed && isOverdue(hw.deadline);

            return (
              <div key={hw.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isReviewed ? 'bg-green-100 text-green-600' : isSubmitted ? 'bg-blue-100 text-blue-600' : 'bg-[#4CAF50]/10 text-[#4CAF50]'}`}>
                        <BookOpen size={22} />
                      </div>
                      <p className="font-bold text-slate-800">{hw.title}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${isReviewed ? "bg-green-100 text-green-700" : isSubmitted ? "bg-blue-100 text-blue-700" : overdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {isReviewed ? "রিভিউ সম্পন্ন" : isSubmitted ? "জমা হয়েছে" : overdue ? "মিসড" : "বাকি"}
                    </span>
                  </div>
                  {hw.description && <p className="text-sm text-slate-600 mt-3 line-clamp-2">{hw.description}</p>}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={14} /> ডেডলাইন: {hw.deadline ? new Date(hw.deadline).toLocaleDateString("bn-BD") : "—"}
                  </div>

                  {hw.status === "pending" && (
                    <button onClick={() => setSelectedHw(hw)} disabled={overdue} className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${overdue ? "bg-slate-100 text-slate-400" : "bg-[#4CAF50] text-white hover:bg-[#388E3C]"}`}>
                      {overdue ? <><AlertTriangle size={16} /> ডেডলাইন শেষ</> : <><Upload size={16} /> জমা দিন</>}
                    </button>
                  )}

                  {hw.status === "reviewed" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-green-600 bg-green-50 py-2.5 rounded-lg">
                        <CheckCircle2 size={16} /> শিক্ষক রিভিউ করেছেন
                      </div>
                      
                      {/* 🌟 Teacher Remarks (Student View) */}
                      {hw.teacher_remarks && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-xs font-bold text-blue-700 flex items-center gap-1 mb-1">
                            <MessageSquare size={14} /> শিক্ষকের মতামত:
                          </p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{hw.teacher_remarks}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#002A41]">হোমওয়ার্ক জমা দিন</h2>
              <button onClick={() => setSelectedHw(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmitHomework} className="p-5 space-y-4">
              <p className="text-sm font-bold text-slate-700">{selectedHw.title}</p>
              
              {/* Multiple Image Upload */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1"><ImageIcon size={14}/> ছবি আপলোড (একাধিক)</p>
                  <input type="file" multiple accept="image/*" className="hidden" ref={imageInputRef} onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg">সিলেক্ট</button>
                </div>
                {imageFiles.length > 0 && <p className="text-xs text-green-600">{imageFiles.length} টি ছবি সিলেক্ট করা হয়েছে</p>}
              </div>

              {/* Audio Upload & Record */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-1"><Mic size={14}/> অডিও (রেকর্ড বা সিলেক্ট)</p>
                
                <div className="flex gap-2">
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="flex-1 bg-red-50 text-red-600 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-red-100">
                      <Mic size={14} /> রেকর্ড শুরু করুন
                    </button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="flex-1 bg-red-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 animate-pulse">
                      <Square size={14} /> রেকর্ডিং বন্ধ করুন
                    </button>
                  )}
                  <input type="file" accept="audio/*" className="hidden" ref={audioInputRef} onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                  <button type="button" onClick={() => audioInputRef.current?.click()} className="flex-1 bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-200">
                    <Upload size={14} /> অডিও সিলেক্ট
                  </button>
                </div>

                {audioFile && (
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">রেকর্ডকৃত/সিলেক্টকৃত অডিও:</p>
                    <audio controls src={URL.createObjectURL(audioFile)} className="w-full h-8" />
                  </div>
                )}
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-[#4CAF50] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#388E3C] disabled:opacity-50 mt-4">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {submitting ? "আপলোড হচ্ছে..." : "জমা করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}