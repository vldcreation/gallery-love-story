import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Presentation as PresentationIcon } from 'lucide-react';
import Select from 'react-select';
import { supabase } from '../lib/supabase';
import { Presentation } from '../components/Presentation';
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
  const [showPresentation, setShowPresentation] = useState(false);

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
      <div className="flex justify-between items-center mb-6">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowPresentation(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <PresentationIcon className="w-5 h-5" />
          <span>Presentation</span>
        </button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map(photo => (
          <Link
            key={photo.id}
            to={`/photo/${photo.id}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={photo.path}
              alt={photo.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{photo.title}</h3>
              <p className="text-gray-500 text-sm">
                {format(new Date(photo.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {showPresentation && (
        <Presentation
          photos={filteredPhotos}
          isOpen={showPresentation}
          onClose={() => setShowPresentation(false)}
        />
      )}
    </div>
  );
}