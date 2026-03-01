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

// Sub-component for individual image preview with fallback
function ImagePreview({ imageUrl, index }: { imageUrl: string; index: number }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !imageUrl) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
        <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-40">Imazhi nuk u ngarkua</span>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {imageUrl.startsWith('data:') ? (
        <img
          src={imageUrl}
          alt={`Property preview ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={`Property image ${index + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          unoptimized={imageUrl.includes('blob.vercel-storage.com')}
        />
      )}
    </>
  );
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

      if (images.length + validFiles.length > maxImages) {
        setUploadError(`Mund të ngarkoni maksimum ${maxImages} imazhe.`);
        setIsUploading(false);
        return;
      }

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
          setUploadError(`Gabim gjatë ngarkimit të ${file.name}`);
          setIsUploading(false);
          return;
        }
      }

      onImagesChange([...images, ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Ka ndodhur një gabim gjatë ngarkimit.');
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

  const removeImage = (index: number) => {
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
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
          ? 'border-red-500 bg-red-50 ring-4 ring-red-500/10'
          : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : 'border-gray-300 hover:border-red-500 hover:bg-red-50/50 hover:shadow-inner'
          }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 transition-colors ${images.length >= maxImages ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-600'
            }`}>
            <Upload className="h-8 w-8" />
          </div>

          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-600">Duke ngarkuar...</p>
            </div>
          ) : images.length >= maxImages ? (
            <div className="text-center">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">
                Limiti u arrit ({maxImages})
              </p>
              <p className="text-gray-400 text-xs">Fshini imazhe për të shtuar të reja</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-900 font-bold mb-1">
                {isDragActive ? 'Lëshoni imazhet këtu' : 'Shtoni foto të pronës'}
              </p>
              <p className="text-gray-500 text-xs mb-3">Zvarritni ose klikoni për të selektuar</p>
              <div className="flex gap-2 justify-center">
                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">JPG</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">PNG</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">WEBP</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{uploadError}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center">
              <ImageIcon className="h-4 w-4 mr-2 text-red-600" />
              Galeria ({images.length})
            </h3>
            <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span>Foto e parë është ballina</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-500"
              >
                <div className="aspect-square relative bg-gray-50">
                  <ImagePreview imageUrl={imageUrl} index={index} />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-2 bg-white rounded-full text-gray-900 hover:text-red-600 transition-colors shadow-lg"
                        title="Lëviz majtas"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-2 bg-white rounded-full text-gray-900 hover:text-red-600 transition-colors shadow-lg"
                        title="Lëviz djathtas"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
                      title="Fshi"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-white rounded text-[8px] font-black uppercase tracking-widest shadow-lg">
                      Ballina
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-md text-white rounded text-[10px] font-bold">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}