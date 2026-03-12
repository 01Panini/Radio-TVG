import { useRef } from 'react';
import { Loader2, Upload, ImageIcon, X } from 'lucide-react';

export const InputField = ({ label, value, onChange, placeholder, type = 'text', className = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) => (
  <div>
    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`} />
  </div>
);

export const ImageUploadField = ({ imageUrl, onUrlChange, uploadKey, label = 'Imagem', uploading, onUpload, accept = 'image/*' }: { imageUrl: string; onUrlChange: (url: string) => void; uploadKey: string; label?: string; uploading: string | null; onUpload: (file: File, key: string) => Promise<string | null>; accept?: string }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">{label}</label>
      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="" className="h-14 w-auto rounded-xl border border-border object-contain bg-muted/30" />
          <button onClick={() => onUrlChange('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-2.5 w-2.5" /></button>
        </div>
      ) : (
        <div className="h-14 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/10"><ImageIcon className="h-4 w-4 text-muted-foreground/30" /></div>
      )}
      <input type="file" accept={accept} ref={fileRef} className="hidden"
        onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await onUpload(file, uploadKey); if (url) onUrlChange(url); } }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading === uploadKey}
        className="h-8 px-3 rounded-xl bg-muted text-foreground text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60 hover:bg-muted/80 transition-colors">
        {uploading === uploadKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading === uploadKey ? 'Enviando...' : 'Upload'}
      </button>
    </div>
  );
};
