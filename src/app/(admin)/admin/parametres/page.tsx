'use client';

import React, { useState, useEffect } from 'react';
import { Save, Settings, Mail, Megaphone, ShieldCheck, CheckCircle2, Users, UserPlus, Trash2, Sparkles, LifeBuoy, Edit3, Server, Check, Key, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SmtpServer {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function AdminParametresPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [siteTitle, setSiteTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [currency, setCurrency] = useState('EUR (€)');
  const [bannerTickerText, setBannerTickerText] = useState('');
  const [bannerTickerLink, setBannerTickerLink] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');

  // SMTP SERVERS STATE
  const [smtpServers, setSmtpServers] = useState<SmtpServer[]>([]);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [editingSmtp, setEditingSmtp] = useState<SmtpServer | null>(null);
  
  // SMTP Form State
  const [smtpName, setSmtpName] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState('TLS');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');
  const [smtpIsDefault, setSmtpIsDefault] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [testingSmtpId, setTestingSmtpId] = useState<string | null>(null);

  // ROLE PERMISSIONS MATRIX (ADMIN, EDITOR, SUPPORT)
  const [rolePermissions, setRolePermissions] = useState<{
    [role: string]: {
      apparence: boolean;
      boutique: boolean;
      contenu: boolean;
      configuration: boolean;
    };
  }>({
    ADMIN: { apparence: true, boutique: true, contenu: true, configuration: true },
    EDITOR: { apparence: false, boutique: false, contenu: true, configuration: false },
    SUPPORT: { apparence: false, boutique: true, contenu: false, configuration: false },
  });

  // DEMO TEAM LIST FOR ROLE REPARTITION
  const [teamMembers, setTeamMembers] = useState<any[]>([
    { id: '1', name: 'Alexandre Morel', email: 'admin@solopreneur.io', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: '2', name: 'Sarah Connor', email: 'sarah.support@solopreneur.io', role: 'SUPPORT', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    { id: '3', name: 'Marc Vane', email: 'marc.editor@solopreneur.io', role: 'EDITOR', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  ]);

  // New Team Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('SUPPORT');

  const fetchSmtpServers = async () => {
    try {
      const res = await fetch('/api/admin/smtp');
      const data = await res.json();
      if (data.servers) setSmtpServers(data.servers);
    } catch (err) {
      console.error('Failed to fetch SMTP servers:', err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/parametres').then((res) => res.json()),
      fetchSmtpServers(),
    ])
      .then(([data]) => {
        if (data && data.settings) {
          setSiteTitle(data.settings.siteTitle || '');
          setTagline(data.settings.tagline || '');
          setContactEmail(data.settings.contactEmail || '');
          setAdminEmail(data.settings.adminEmail || '');
          setCurrency(data.settings.currency || 'EUR (€)');
          setBannerTickerText(data.settings.bannerTickerText || '');
          setBannerTickerLink(data.settings.bannerTickerLink || '');
          setFooterCopyright(data.settings.footerCopyright || '');
          if (data.settings.rolePermissions) {
            setRolePermissions(data.settings.rolePermissions);
          }
          if (data.settings.teamMembers && data.settings.teamMembers.length > 0) {
            setTeamMembers(data.settings.teamMembers);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreateSmtpModal = () => {
    setEditingSmtp(null);
    setSmtpName('');
    setSmtpHost('smtp-relay.brevo.com');
    setSmtpPort(587);
    setSmtpUsername('');
    setSmtpPassword('');
    setSmtpEncryption('TLS');
    setSmtpFromEmail(contactEmail || 'contact@solopreneur.io');
    setSmtpFromName('Alex - Solopreneur&Co');
    setSmtpIsDefault(smtpServers.length === 0);
    setShowSmtpModal(true);
  };

  const openEditSmtpModal = (server: SmtpServer) => {
    setEditingSmtp(server);
    setSmtpName(server.name);
    setSmtpHost(server.host);
    setSmtpPort(server.port);
    setSmtpUsername(server.username);
    setSmtpPassword(server.password);
    setSmtpEncryption(server.encryption || 'TLS');
    setSmtpFromEmail(server.fromEmail);
    setSmtpFromName(server.fromName);
    setSmtpIsDefault(server.isDefault);
    setShowSmtpModal(true);
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpName || !smtpHost || !smtpUsername || !smtpPassword || !smtpFromEmail || !smtpFromName) return;
    setSmtpSaving(true);

    try {
      const endpoint = editingSmtp ? `/api/admin/smtp/${editingSmtp.id}` : '/api/admin/smtp';
      const method = editingSmtp ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: smtpName,
          host: smtpHost,
          port: Number(smtpPort),
          username: smtpUsername,
          password: smtpPassword,
          encryption: smtpEncryption,
          fromEmail: smtpFromEmail,
          fromName: smtpFromName,
          isDefault: smtpIsDefault,
        }),
      });

      if (res.ok) {
        setShowSmtpModal(false);
        fetchSmtpServers();
        setMessage(editingSmtp ? 'Serveur SMTP mis à jour avec succès !' : 'Nouveau serveur SMTP ajouté avec succès !');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving SMTP server:', err);
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleDeleteSmtp = async (id: string, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le serveur SMTP "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/smtp/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSmtpServers();
        setMessage(`Serveur SMTP "${name}" supprimé.`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting SMTP server:', err);
    }
  };

  const handleTestSmtp = async (server: SmtpServer) => {
    setTestingSmtpId(server.id);
    try {
      const res = await fetch(`/api/admin/smtp/${server.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: adminEmail || contactEmail || 'test@solopreneur.io' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Test réussi ! ${data.message}`);
      } else {
        setMessage(`❌ Échec du test SMTP : ${data.error}`);
      }
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Error testing SMTP server:', err);
    } finally {
      setTestingSmtpId(null);
    }
  };

  const handlePermissionChange = (roleKey: string, moduleKey: 'apparence' | 'boutique' | 'contenu' | 'configuration') => {
    setRolePermissions((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [moduleKey]: !prev[roleKey]?.[moduleKey],
      },
    }));
  };

  const handleTeamRoleChange = (id: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, role: newRole } : member))
    );
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const newMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMemberName)}`,
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/parametres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle,
          tagline,
          contactEmail,
          adminEmail,
          currency,
          bannerTickerText,
          bannerTickerLink,
          footerCopyright,
          rolePermissions,
          teamMembers,
        }),
      });

      if (res.ok) {
        setMessage('Paramètres enregistrés avec succès !');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-none pt-2">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-black text-slate-950 tracking-tight">Paramètres Généraux & Serveurs SMTP</h1>
            <Badge variant="indigo" className="text-xs font-mono font-extrabold uppercase bg-purple-100 text-purple-950">
              Système & Emails ⚙️
            </Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Configurez vos informations globales, vos serveurs SMTP pour l envoi d emails réels et les rôles de votre équipe.
          </p>
        </div>

        <Button
          onClick={handleSubmitGeneral}
          disabled={saving}
          size="sm"
          className="btn-purple gap-2 font-heading font-black text-xs px-5 py-2.5 shadow-md shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Enregistrement...' : 'Enregistrer tout'}</span>
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-heading font-black shadow-sm ${
          message.startsWith('❌') ? 'bg-rose-50 border border-rose-300 text-rose-950' : 'bg-emerald-50 border border-emerald-300 text-emerald-950'
        }`}>
          {message}
        </div>
      )}

      {/* SECTION 1: SERVEURS SMTP MULTIPLES & ENVOI D'EMAILS */}
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-heading font-black text-slate-950 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-700" />
              <span>Gestion des Serveurs SMTP (Envoi d Emails Réels)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ajoutez vos serveurs SMTP (Brevo, Amazon SES, Mailgun, OVH, Gmail...). Liez ensuite vos campagnes d'emails au serveur de votre choix.
            </p>
          </div>

          <Button
            onClick={openCreateSmtpModal}
            size="sm"
            className="btn-purple text-xs font-bold gap-1.5 shrink-0"
          >
            <Server className="w-4 h-4" />
            <span>+ Ajouter un Serveur SMTP</span>
          </Button>
        </div>

        {/* LIST OF SMTP SERVERS */}
        {smtpServers.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Server className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Aucun serveur SMTP configuré pour le moment.
            </p>
            <Button
              onClick={openCreateSmtpModal}
              size="sm"
              variant="outline"
              className="text-xs font-bold border-purple-300 text-purple-800 hover:bg-purple-50"
            >
              + Configurer mon premier serveur SMTP
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smtpServers.map((server) => (
              <div
                key={server.id}
                className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4 hover:border-purple-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm text-slate-950">{server.name}</h3>
                      {server.isDefault && (
                        <Badge className="bg-emerald-600 text-white font-black text-[10px]">
                          ⭐ Par Défaut
                        </Badge>
                      )}
                    </div>

                    <Badge variant="outline" className="bg-white text-slate-700 font-mono font-bold text-[10px]">
                      {server.host}:{server.port}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 font-medium">
                    <div>
                      <span className="font-bold text-slate-700">Expéditeur :</span> {server.fromName} &lt;{server.fromEmail}&gt;
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Login :</span> <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">{server.username}</code>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <Button
                    onClick={() => handleTestSmtp(server)}
                    disabled={testingSmtpId === server.id}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testingSmtpId === server.id ? 'Test en cours...' : 'Tester le serveur'}</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditSmtpModal(server)}
                      className="p-1.5 text-slate-700 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSmtp(server.id, server.name)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </Card>

      {/* SECTION 2: IDENTITÉ DU SITE & EMAILS DE CONTACT */}
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-6">
        <h2 className="text-lg font-heading font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-5 h-5 text-purple-700" />
          <span>Identité Globale & Contacts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div className="space-y-1">
            <label className="block font-extrabold text-slate-700">Titre de la plateforme*</label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="ex. Solopreneur&Co"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-extrabold text-slate-700">Slogan / Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="ex. Plateforme de Formations & Automation IA"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-extrabold text-slate-700">Email de contact général (Boutique)*</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="ex. contact@solopreneur.io"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-extrabold text-slate-700">Email Administrateur (Alertes)*</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="ex. admin@solopreneur.io"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-extrabold text-slate-700">Devise Principale</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
            >
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="USD ($)">USD ($) - Dollar US</option>
              <option value="CAD ($)">CAD ($) - Dollar Canadien</option>
              <option value="CHF (CHF)">CHF - Franc Suisse</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-extrabold text-slate-700">Copyright du Footer</label>
            <input
              type="text"
              value={footerCopyright}
              onChange={(e) => setFooterCopyright(e.target.value)}
              placeholder="ex. © 2026 Solopreneur&Co - Tous droits réservés."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
            />
          </div>

        </div>
      </Card>

      {/* SECTION 3: RÔLES D'ÉQUIPE & PERMISSIONS */}
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-6">
        <h2 className="text-lg font-heading font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <span>Matrice des Permissions & Équipe</span>
        </h2>

        {/* TEAM MEMBERS TABLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-sm text-slate-900">Membres de l Équipe Administrateur ({teamMembers.length})</h3>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{member.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleTeamRoleChange(member.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="ADMIN">ADMINISTRATEUR (Accès Total)</option>
                    <option value="SUPPORT">SUPPORT (Accès Boutique & Tickets)</option>
                    <option value="EDITOR">ÉDITEUR (Accès Blog & Contenu)</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTeamMember(member.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </Card>

      {/* MODAL CRÉER / ÉDITER UN SERVEUR SMTP */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-black text-slate-950 flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-700" />
                <span>{editingSmtp ? 'Modifier le Serveur SMTP' : 'Ajouter un Nouveau Serveur SMTP'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
              
              {/* SERVER NAME */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-700">Nom d identification du serveur*</label>
                <input
                  type="text"
                  value={smtpName}
                  onChange={(e) => setSmtpName(e.target.value)}
                  placeholder="ex. Brevo Principal / Amazon SES Marketing"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {/* HOST & PORT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-extrabold text-slate-700">Serveur Hôte SMTP*</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="ex. smtp-relay.brevo.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Port*</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="587"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* USERNAME & PASSWORD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Login / Utilisateur SMTP*</label>
                  <input
                    type="text"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    placeholder="ex. 7f891001@smtp-brevo.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Mot de passe / Clé API*</label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* SENDER EMAIL & FROM NAME (BRAND) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Email de l expéditeur*</label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="ex. contact@solopreneur.io"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Nom / Brand d expéditeur*</label>
                  <input
                    type="text"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="ex. Alex - Solopreneur&Co"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* ENCRYPTION & DEFAULT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block font-extrabold text-slate-700">Chiffrement / Protocole</label>
                  <select
                    value={smtpEncryption}
                    onChange={(e) => setSmtpEncryption(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="TLS">TLS (Recommandé - Port 587)</option>
                    <option value="SSL">SSL (Port 465)</option>
                    <option value="NONE">Aucun (Port 25)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={smtpIsDefault}
                    onChange={(e) => setSmtpIsDefault(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isDefault" className="font-extrabold text-slate-800 cursor-pointer">
                    Définir comme serveur SMTP par défaut
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setShowSmtpModal(false)}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={smtpSaving}
                  size="sm"
                  className="btn-purple font-heading font-black text-xs px-5"
                >
                  {smtpSaving ? 'Enregistrement...' : editingSmtp ? 'Mettre à jour' : 'Enregistrer le Serveur'}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
