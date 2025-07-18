'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
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

      // Convert files to base64 URLs for preview (in a real app, upload to cloud storage)
      const newImageUrls: string[] = [];
      
      for (const file of validFiles) {
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
        newImageUrls.push(imageUrl);
      }

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Imazhet e Ngarkuara ({images.length})
            </h3>
            <p className="text-xs text-gray-500">
              Imazhi i parë do të jetë imazhi kryesor
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <Image
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                
                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {/* Move Left */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                        title="Lëviz majtas"
                      >
                        ←
                      </button>
                    )}
                    
                    {/* Move Right */}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                        title="Lëviz djathtas"
                      >
                        →
                      </button>
                    )}
                    
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                      title="Fshi imazhin"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Kryesor
                  </div>
                )}
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