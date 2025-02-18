import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Tag, Category, Photo } from '../types';
import Select from 'react-select';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()),
  categories: z.array(z.string())
});

type FormData = z.infer<typeof schema>;

interface PhotoFormProps {
  photo?: Photo | null;
  onSuccess: () => void;
}

export function PhotoForm({ photo, onSuccess }: PhotoFormProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: photo?.title || '',
      description: photo?.description || '',
      tags: photo?.tags || [],
      categories: photo?.categories || []
    }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [tagsRes, categoriesRes] = await Promise.all([
          supabase.from('tags').select('*').order('name'),
          supabase.from('categories').select('*').order('name')
        ]);

        if (tagsRes.error) throw tagsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setTags(tagsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching tags and categories:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (photo) {
      setValue('title', photo.title);
      setValue('description', photo.description || '');
      setValue('tags', photo.tags || []);
      setValue('categories', photo.categories || []);
      setPreviewUrl(photo.path);
    }
  }, [photo, setValue]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      let imagePath = photo?.path;

      if (uploadedImage) {
        imagePath = await uploadToCloudinary(uploadedImage);
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      if (photo) {
        // Update existing photo
        const { error } = await supabase
          .from('photos')
          .update({
            ...data,
            path: imagePath,
            updated_at: new Date().toISOString()
          })
          .eq('id', photo.id);

        if (error) throw error;
      } else {
        // Create new photo
        const { error } = await supabase.from('photos').insert([{
          ...data,
          path: imagePath,
          user_id: userId
        }]);

        if (error) throw error;
      }

      reset();
      setUploadedImage(null);
      setPreviewUrl(null);
      onSuccess();
    } catch (error) {
      console.error('Error saving photo:', error);
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  async function uploadToCloudinary(file: File): Promise<string> {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const formData = new FormData();
    formData.append('file', file);
    formData.append("upload_preset", "love-story")
    formData.append("folder", "love-story")
    formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY)
    formData.append("timestamp", timestamp.toString())

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload image: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.secure_url;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedImage(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-gray-600">
              {isDragActive
                ? "Drop the image here"
                : "Drag 'n' drop an image here, or click to select"}
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              value={tags
                .filter(tag => field.value?.includes(tag.id))
                .map(tag => ({ value: tag.id, label: tag.name }))
              }
              options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
              onChange={(newValue) => field.onChange(newValue ? newValue.map(item => item.value) : [])}
              className="mt-1 block w-full"
              classNamePrefix="select"
              placeholder="Search and select tags..."
              isClearable
              isSearchable
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              value={categories
                .filter(category => field.value?.includes(category.id))
                .map(category => ({ value: category.id, label: category.name }))
              }
              options={categories.map(category => ({ value: category.id, label: category.name }))}
              onChange={(newValue) => field.onChange(newValue ? newValue.map(item => item.value) : [])}
              className="mt-1 block w-full"
              classNamePrefix="select"
              placeholder="Search and select categories..."
              isClearable
              isSearchable
            />
          )}
        />
      </div>

      <button
        type="submit"
        disabled={loading || (!uploadedImage && !photo)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : photo ? 'Update Photo' : 'Create Photo'}
      </button>
    </form>
  );
}