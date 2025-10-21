import { supabase } from './supabase';
import { FeedbackSubmission, Feedback } from '../types/feedback';

export class FeedbackService {
  private static readonly BUCKET_NAME = 'feedback-images';

  /**
   * Submit feedback with optional image uploads
   */
  static async submitFeedback(feedback: FeedbackSubmission): Promise<Feedback> {
    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      
      if (feedback.images.length > 0) {
        imageUrls = await this.uploadImages(feedback.images);
      }

      // Insert feedback record
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          description: feedback.description,
          images: imageUrls,
          user_agent: feedback.user_agent,
          url: feedback.url,
          username: feedback.username,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit feedback: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to Supabase Storage
   */
  private static async uploadImages(images: File[]): Promise<string[]> {
    const uploadPromises = images.map((image, index) => 
      this.uploadSingleImage(image, index)
    );

    const results = await Promise.allSettled(uploadPromises);
    
    // Return successfully uploaded URLs, log failures
    const urls: string[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        urls.push(result.value);
      } else {
        console.error(`Failed to upload image ${index}:`, result.reason);
      }
    });

    return urls;
  }

  /**
   * Upload a single image to Supabase Storage
   */
  private static async uploadSingleImage(file: File, index: number): Promise<string> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomId}_${index}.${fileExt}`;

    // Ensure the bucket exists (create if it doesn't)
    await this.ensureBucketExists();

    // Upload file
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Ensure the storage bucket exists
   */
  private static async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760, // 10MB
        });

        if (error) {
          console.error('Failed to create storage bucket:', error);
          // Don't throw here, bucket might exist but we can't see it due to permissions
        }
      }
    } catch (error) {
      console.error('Error checking/creating bucket:', error);
      // Continue anyway, the bucket might exist
    }
  }

  /**
   * Get all feedback (for admin/developer use)
   */
  static async getFeedback(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return data || [];
  }
}