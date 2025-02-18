import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PhotoForm } from '../../components/PhotoForm';
import { CategoryForm } from '../../components/CategoryForm';
import { TagForm } from '../../components/TagForm';
import type { Photo, Tag, Category } from '../../types';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  // Add this to your existing state declarations
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [photosRes, tagsRes, categoriesRes] = await Promise.all([
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('tags').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
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

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  }

  async function handleDeleteTag(id: string) {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        const { error } = await supabase.from('tags').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
          
          {showCategoryForm && (
            <CategoryForm
              category={editingCategory}
              onSuccess={() => {
                fetchData();
                setShowCategoryForm(false);
                setEditingCategory(null);
              }}
              onCancel={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }}
            />
          )}

          <div className="mt-4 space-y-2">
            {categories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span>{category.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setShowCategoryForm(true);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tags</h2>
            <button
              onClick={() => {
                setEditingTag(null);
                setShowTagForm(true);
              }}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </button>
          </div>

          {showTagForm && (
            <TagForm
              tag={editingTag}
              onSuccess={() => {
                fetchData();
                setShowTagForm(false);
                setEditingTag(null);
              }}
              onCancel={() => {
                setShowTagForm(false);
                setEditingTag(null);
              }}
            />
          )}

          <div className="mt-4 space-y-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span>{tag.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingTag(tag);
                      setShowTagForm(true);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Manage Photos</h2>
        <PhotoForm 
          photo={editingPhoto} 
          onSuccess={() => {
            fetchData();
            setEditingPhoto(null);
          }} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={`${photo.path}`}
                alt={photo.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{photo.title}</h3>
                {photo.description && (
                  <p className="text-gray-600 text-sm mb-4">{photo.description}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingPhoto(photo)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this photo?')) {
                        await supabase.from('photos').delete().eq('id', photo.id);
                        fetchData();
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}