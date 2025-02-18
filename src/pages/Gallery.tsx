import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Select from 'react-select';
import { supabase } from '../lib/supabase';
import type { Photo, Tag, Category } from '../types';

type Option = {
  value: string;
  label: string;
};

export function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [photosRes, tagsRes, categoriesRes] = await Promise.all([
          supabase.from('photos').select('*').order('created_at', { ascending: false }),
          supabase.from('tags').select('*'),
          supabase.from('categories').select('*')
        ]);

        if (photosRes.error) throw photosRes.error;
        if (tagsRes.error) throw tagsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setPhotos(photosRes.data);
        setTags(tagsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredPhotos = photos.filter(photo => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tagId => photo.tags.includes(tagId));
    const matchesCategories = selectedCategories.length === 0 || 
      selectedCategories.every(catId => photo.categories.includes(catId));
    const matchesSearch = searchQuery === '' ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTags && matchesCategories && matchesSearch;
  });

  const tagOptions: Option[] = tags.map(tag => ({
    value: tag.id,
    label: tag.name
  }));

  const categoryOptions: Option[] = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="w-72">
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <Select
            isMulti
            options={tagOptions}
            value={tagOptions.filter(option => selectedTags.includes(option.value))}
            onChange={(selected) => {
              setSelectedTags((selected as Option[] || []).map(option => option.value));
            }}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select tags..."
          />
        </div>
        
        <div className="w-72">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          <Select
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter(option => selectedCategories.includes(option.value))}
            onChange={(selected) => {
              setSelectedCategories((selected as Option[] || []).map(option => option.value));
            }}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select categories..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map(photo => (
          <Link
            key={photo.id}
            to={`/photo/${photo.id}`}
            className="group relative overflow-hidden rounded-lg shadow-lg aspect-[4/3]"
          >
            <img
              src={`${photo.path}`}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h2 className="text-xl font-bold mb-1">{photo.title}</h2>
                <p className="text-sm opacity-90">
                  {format(new Date(photo.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}