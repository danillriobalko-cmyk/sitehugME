import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLang } from '@/hooks/use-lang';
import { supabase } from '@/lib/supabase';
import type { Work, Message } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { WorkForm } from './WorkForm';
import { Trash2, Edit2, Plus, LogOut } from 'lucide-react';

export function AdminPanel() {
  const { signOut } = useAuth();
  const { t } = useLang();
  const [works, setWorks] = useState<Work[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [worksLoading, setWorksLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ work: Work } | null>(null);

  useEffect(() => {
    fetchWorks();
    fetchMessages();
  }, []);

  const fetchWorks = async () => {
    setWorksLoading(true);
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setWorksLoading(false);
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDeleteWork = async (work: Work) => {
    try {
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', work.id);

      if (error) throw error;
      await fetchWorks();
    } catch (error) {
      console.error('Error deleting work:', error);
    }
    setDeleteConfirm(null);
  };

  const handleSaveWork = async () => {
    await fetchWorks();
    setShowWorkForm(false);
    setSelectedWork(null);
  };

  const handleEditWork = (work: Work) => {
    setSelectedWork(work);
    setShowWorkForm(true);
  };

  const handleAddWork = () => {
    setSelectedWork(null);
    setShowWorkForm(true);
  };

  const handleCancel = () => {
    setShowWorkForm(false);
    setSelectedWork(null);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (showWorkForm) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="mb-6 bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {t('admin.back')}
          </Button>
          <WorkForm
            work={selectedWork}
            onSave={handleSaveWork}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{t('admin.title')}</h1>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <LogOut className="h-4 w-4" />
            {t('admin.logout')}
          </Button>
        </div>

        <Tabs defaultValue="works" className="w-full">
          <TabsList className="bg-slate-900 border-slate-800 mb-6">
            <TabsTrigger value="works" className="text-slate-300 data-[state=active]:text-white">
              {t('admin.tabs.works')}
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-slate-300 data-[state=active]:text-white">
              {t('admin.tabs.messages')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="works" className="space-y-6">
            <Button
              onClick={handleAddWork}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('admin.works.add')}
            </Button>

            {worksLoading ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-slate-400">
                  {t('admin.loading')}
                </CardContent>
              </Card>
            ) : works.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-slate-400">
                  {t('admin.messages.empty')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {works.map((work) => (
                  <Card key={work.id} className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {work.cover_url ? (
                            <img
                              src={work.cover_url}
                              alt={work.title}
                              className="h-20 w-20 object-cover rounded"
                            />
                          ) : (
                            <div className="h-20 w-20 bg-slate-800 rounded flex items-center justify-center text-slate-500">
                              {t('admin.no_image')}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {work.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="capitalize">{work.category}</span>
                            {work.year && <span>{work.year}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditWork(work)}
                            className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            {t('admin.works.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm({ work })}
                            className="bg-red-600 hover:bg-red-700 border-red-600 text-white gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('admin.works.delete')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            {messagesLoading ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-slate-400">
                  {t('admin.loading')}
                </CardContent>
              </Card>
            ) : messages.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-slate-400">
                  {t('admin.messages.empty')}
                </CardContent>
              </Card>
            ) : (
              messages.map((message) => (
                <Card key={message.id} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">
                          {message.name || t('admin.anonymous')}
                        </CardTitle>
                        {message.contact && (
                          <p className="text-sm text-slate-400 mt-1">
                            {message.contact}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{message.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogTitle className="text-white">
            {t('admin.works.delete')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {t('admin.works.delete_confirm')}
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
              {t('admin.works.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteWork(deleteConfirm.work)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('admin.works.delete')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
