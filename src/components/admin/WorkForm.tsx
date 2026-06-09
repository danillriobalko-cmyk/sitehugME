import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLang } from '@/hooks/use-lang';
import { supabase } from '@/lib/supabase';
import type { Work, Category, MediaType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2, X } from 'lucide-react';

const categories: Category[] = ['video', 'music', 'game', 'code', 'graphics', 'drawing'];
const mediaTypes: MediaType[] = ['video', 'audio', 'image', 'gallery', 'embed'];

const workSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['video', 'music', 'game', 'code', 'graphics', 'drawing']),
  description: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  media_type: z.enum(['video', 'audio', 'image', 'gallery', 'embed']),
  media_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  gallery_urls: z.array(z.string()).optional().nullable(),
  is_featured: z.boolean(),
  show_on_home: z.boolean(),
  sort_order: z.number().int(),
});

type WorkFormData = z.infer<typeof workSchema>;

interface WorkFormProps {
  work?: Work | null;
  onSave: () => void;
  onCancel: () => void;
}

export function WorkForm({ work, onSave, onCancel }: WorkFormProps) {
  const { t } = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(work?.cover_url || null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(work?.media_url || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(work?.gallery_urls || []);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
    defaultValues: work || {
      title: '',
      category: 'video',
      description: null,
      year: null,
      media_type: 'video',
      media_url: null,
      cover_url: null,
      gallery_urls: null,
      is_featured: false,
      show_on_home: false,
      sort_order: 0,
    },
  });

  const mediaType = watch('media_type');

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const timestamp = Date.now();
      const path = `covers/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('covers').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setCoverPreview(publicUrl);
      setValue('cover_url', publicUrl);
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const timestamp = Date.now();
      const path = `media/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setMediaPreview(publicUrl);
      setValue('media_url', publicUrl);
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingGallery(true);
    try {
      const newUrls: string[] = [...galleryPreviews];

      for (const file of Array.from(files)) {
        const timestamp = Date.now();
        const path = `gallery/${timestamp}-${Math.random()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('media').getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      setGalleryPreviews(newUrls);
      setValue('gallery_urls', newUrls);
    } catch (error) {
      console.error('Error uploading gallery:', error);
      alert('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newUrls = galleryPreviews.filter((_, i) => i !== index);
    setGalleryPreviews(newUrls);
    setValue('gallery_urls', newUrls);
  };

  const onSubmit = async (data: WorkFormData) => {
    setIsLoading(true);
    try {
      // Validate that media_url is provided for certain types
      if (['video', 'audio', 'embed'].includes(data.media_type) && !data.media_url) {
        alert(`Media URL is required for ${data.media_type}`);
        return;
      }

      if (data.media_type === 'image' && !data.media_url) {
        alert('Image upload is required');
        return;
      }

      if (data.media_type === 'gallery' && (!data.gallery_urls || data.gallery_urls.length === 0)) {
        alert('At least one gallery image is required');
        return;
      }

      const payload = {
        ...data,
        year: data.year || null,
        description: data.description || null,
        media_url: data.media_url || null,
        cover_url: data.cover_url || null,
        gallery_urls: data.gallery_urls || null,
      };

      if (work) {
        // Edit mode
        const { error } = await supabase
          .from('works')
          .update(payload)
          .eq('id', work.id);

        if (error) throw error;
      } else {
        // Add mode
        const { error } = await supabase
          .from('works')
          .insert([payload]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Failed to save work');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">
          {work ? `Edit: ${work.title}` : 'Add New Work'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">
                {t('admin.works.title')}
              </Label>
              <Input
                id="title"
                {...register('title')}
                className="bg-slate-800 border-slate-700 text-white"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">
                {t('admin.works.category')}
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              {t('admin.works.description')}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-slate-300">
                {t('admin.works.year')}
              </Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media_type" className="text-slate-300">
                {t('admin.works.media_type')}
              </Label>
              <Controller
                name="media_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {mediaTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {['video', 'audio', 'embed'].includes(mediaType) && (
            <div className="space-y-2">
              <Label htmlFor="media_url" className="text-slate-300">
                {t('admin.works.media_url')}
              </Label>
              <Input
                id="media_url"
                type="url"
                {...register('media_url')}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="https://..."
              />
            </div>
          )}

          {mediaType === 'image' && (
            <div className="space-y-2">
              <Label className="text-slate-300">{t('admin.works.media')}</Label>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                disabled={uploadingMedia}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 gap-2"
              >
                {uploadingMedia ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              {mediaPreview && (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded"
                />
              )}
            </div>
          )}

          {mediaType === 'gallery' && (
            <div className="space-y-2">
              <Label className="text-slate-300">{t('admin.works.gallery')}</Label>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 gap-2"
              >
                {uploadingGallery ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Gallery Images
                  </>
                )}
              </Button>
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {galleryPreviews.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${index}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-300">{t('admin.works.cover')}</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 gap-2"
            >
              {uploadingCover ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Cover Image
                </>
              )}
            </Button>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-32 w-32 object-cover rounded"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_featured" className="text-slate-300 font-normal cursor-pointer">
                {t('admin.works.featured')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="show_on_home"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="show_on_home"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="show_on_home" className="text-slate-300 font-normal cursor-pointer">
                {t('admin.works.show_on_home')}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order" className="text-slate-300">
              {t('admin.works.sort_order')}
            </Label>
            <Input
              id="sort_order"
              type="number"
              {...register('sort_order', { valueAsNumber: true })}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? '...' : t('admin.works.save')}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300"
            >
              {t('admin.works.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
