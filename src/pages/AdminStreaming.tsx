import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Radio, Power, GripVertical, Pencil, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoRadio from '@/assets/logo-radio-tvg.png';
import { useToast } from '@/hooks/use-toast';

interface StreamEnv {
  id: string;
  slug: string;
  label: string;
  description: string;
  stream_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

const AdminStreaming = () => {
  const [environments, setEnvironments] = useState<StreamEnv[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StreamEnv>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    const { data, error } = await supabase
      .from('stream_environments')
      .select('*')
      .order('sort_order');

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    setEnvironments(data || []);
    setLoading(false);
  };

  const startEdit = (env: StreamEnv) => {
    setEditingId(env.id);
    setEditForm({ ...env });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    setSaving(editingId);

    const { error } = await supabase
      .from('stream_environments')
      .update({
        label: editForm.label,
        description: editForm.description,
        stream_url: editForm.stream_url,
        image_url: editForm.image_url,
      })
      .eq('id', editingId);

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Salvo!', description: `${editForm.label} atualizado.` });
      setEditingId(null);
      setEditForm({});
      fetchEnvironments();
    }
    setSaving(null);
  };

  const toggleActive = async (env: StreamEnv) => {
    setSaving(env.id);
    const { error } = await supabase
      .from('stream_environments')
      .update({ is_active: !env.is_active })
      .eq('id', env.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      fetchEnvironments();
    }
    setSaving(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button
          onClick={() => navigate('/admin')}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-display font-bold text-foreground">Streaming</h1>
          <p className="text-xs text-muted-foreground">Gerenciar ambientes e URLs</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {environments.map((env, i) => (
              <motion.div
                key={env.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${env.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Radio className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{env.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {env.stream_url || 'Nenhuma URL configurada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleActive(env)}
                      disabled={saving === env.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${env.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => editingId === env.id ? cancelEdit() : startEdit(env)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {editingId === env.id ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Edit form */}
                <AnimatePresence>
                  {editingId === env.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Nome</label>
                          <input
                            type="text"
                            value={editForm.label || ''}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Descrição</label>
                          <input
                            type="text"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">URL do Stream (HLS)</label>
                          <input
                            type="url"
                            value={editForm.stream_url || ''}
                            onChange={(e) => setEditForm({ ...editForm, stream_url: e.target.value })}
                            placeholder="https://stream.exemplo.com/live.m3u8"
                            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">URL da Imagem</label>
                          <input
                            type="url"
                            value={editForm.image_url || ''}
                            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={saveEdit}
                          disabled={saving === env.id}
                          className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {saving === env.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar</>}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminStreaming;
