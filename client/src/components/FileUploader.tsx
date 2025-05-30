import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/supabase';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type InsertAttachment } from '@shared/schema';

interface FileUploaderProps {
  claimId: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ claimId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { fileName, fileUrl } = await uploadFile(file);
      
      const attachmentData: InsertAttachment = {
        claimId,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        uploadedBy: '', // This should be set by the server
      };

      return await apiRequest('POST', '/api/attachments', attachmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims', claimId, 'attachments'] });
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only PDF, JPG, and PNG files are allowed',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        {uploadMutation.isPending ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
            <p className="text-sm text-gray-600">
              Drag and drop files here, or{' '}
              <span className="text-primary-600 hover:text-primary-500 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
};
