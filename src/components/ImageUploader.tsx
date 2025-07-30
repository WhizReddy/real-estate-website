'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, Star, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
}

export default function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  maxSizePerImage = 5 
}: ImageUploaderProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      // Validate file types
      const validFiles = acceptedFiles.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= maxSizePerImage * 1024 * 1024;
        
        if (!isValidType) {
          setUploadError(`Skedari ${file.name} nuk është një imazh i vlefshëm.`);
          return false;
        }
        
        if (!isValidSize) {
          setUploadError(`Skedari ${file.name} është shumë i madh. Maksimumi është ${maxSizePerImage}MB.`);
          return false;
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Check if adding these files would exceed the limit
      if (images.length + validFiles.length > maxImages) {
        setUploadError(`Mund të ngarkoni maksimum ${maxImages} imazhe. Ju keni ${images.length} dhe po përpiqeni të shtoni ${validFiles.length} të tjera.`);
        setIsUploading(false);
        return;
      }

      // Upload files to Vercel Blob storage
      const newImageUrls: string[] = [];
      
      for (const file of validFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload image');
          }

          const result = await response.json();
          newImageUrls.push(result.url);
        } catch (uploadError) {
          console.error('Error uploading file:', file.name, uploadError);
          setUploadError(`Gabim gjatë ngarkimit të ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Gabim i panjohur'}`);
          setIsUploading(false);
          return;
        }
      }

      onImagesChange([...images, ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Ka ndodhur një gabim gjatë ngarkimit të imazheve.');
    } finally {
      setIsUploading(false);
    }
  }, [images, onImagesChange, maxImages, maxSizePerImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: isUploading || images.length >= maxImages
  });

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // If it's a blob URL, delete it from storage
    if (imageUrl && imageUrl.includes('blob.vercel-storage.com')) {
      try {
        await fetch(`/api/upload/delete?url=${encodeURIComponent(imageUrl)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        // Continue with removal from UI even if deletion from storage fails
      }
    }
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-red-500 bg-red-50'
            : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${
            images.length >= maxImages ? 'text-gray-400' : 'text-red-600'
          }`} />
          
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Duke ngarkuar imazhet...</p>
            </div>
          ) : images.length >= maxImages ? (
            <div className="text-center">
              <p className="text-gray-500 font-medium">
                Keni arritur limitin maksimal të imazheve ({maxImages})
              </p>
              <p className="text-gray-400 text-sm">
                Fshini disa imazhe për të shtuar të reja
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-2">
                {isDragActive
                  ? 'Lëshoni imazhet këtu...'
                  : 'Zvarritni imazhet këtu ose klikoni për të zgjedhur'
                }
              </p>
              <p className="text-gray-500 text-sm">
                Formatet e pranuara: JPEG, PNG, WebP (maksimum {maxSizePerImage}MB secili)
              </p>
              <p className="text-gray-500 text-sm">
                {images.length}/{maxImages} imazhe të ngarkuara
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Modern Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-red-600" />
              Imazhet e Ngarkuara ({images.length})
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Imazhi i parë është kryesor</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Image Container */}
                <div className="aspect-[4/3] relative bg-gradient-to-br from-gray-100 to-gray-200">
                  {imageUrl.startsWith('data:') ? (
                    <img
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        display: 'block',
                        backgroundColor: '#f3f4f6',
                        minHeight: '100%',
                        minWidth: '100%'
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', index);
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', index, imageUrl.substring(0, 50));
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }}
                    />
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => console.log('Next.js Image loaded:', index)}
                      onError={() => console.error('Next.js Image failed to load:', index)}
                    />
                  )}
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      {/* Move Controls */}
                      <div className="flex space-x-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-600 hover:bg-white transition-all duration-200 shadow-lg"
                            title="Lëviz majtas"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                        )}
                        
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-600 hover:bg-white transition-all duration-200 shadow-lg"
                            title="Lëviz djathtas"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500/90 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-all duration-200 shadow-lg"
                        title="Fshi imazhin"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Info Footer */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        Imazhi #{index + 1}
                      </span>
                      {index === 0 && (
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          <Star className="h-3 w-3" />
                          <span>Kryesor</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>Visible</span>
                    </div>
                  </div>
                  
                  {/* Image Order Indicator */}
                  <div className="mt-2 flex items-center space-x-1">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                          i === index 
                            ? 'bg-red-500' 
                            : i < index 
                            ? 'bg-gray-300' 
                            : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Këshilla për imazhet:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Imazhi i parë do të jetë imazhi kryesor që shfaqet në listë</li>
                <li>• Përdorni imazhe me cilësi të lartë për rezultate më të mira</li>
                <li>• Rekomandohet të keni të paktën 3-5 imazhe për çdo pasuri</li>
                <li>• Mund të riorganizoni imazhet duke i lëvizur me butonat</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}