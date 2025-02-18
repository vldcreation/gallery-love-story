import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Photo, Tag, Category } from '../types';

export function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [photoRes, tagsRes, categoriesRes] = await Promise.all([
          supabase.from('photos').select('*').eq('id', id).single(),
          supabase.from('tags').select('*'),
          supabase.from('categories').select('*')
        ]);

        if (photoRes.error) throw photoRes.error;
        if (tagsRes.error) throw tagsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setPhoto(photoRes.data);
        setTags(tagsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching photo:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Photo not found</h2>
        <Link to="/" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
          Return to gallery
        </Link>
      </div>
    );
  }

  const photoTags = tags.filter(tag => photo.tags.includes(tag.id));
  const photoCategories = categories.filter(cat => photo.categories.includes(cat.id));

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to gallery
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          src={`${photo.path}`}
          alt={photo.title}
          className="w-full h-[60vh] object-cover"
        />
        
        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{photo.title}</h1>
            <p className="text-gray-500 mt-1">
              {format(new Date(photo.created_at), 'MMMM d, yyyy')}
            </p>
          </div>

          {photo.description && (
            <p className="text-gray-700 leading-relaxed">{photo.description}</p>
          )}

          <div className="space-y-3">
            {photoCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {photoCategories.map(category => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {photoTags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {photoTags.map(tag => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}