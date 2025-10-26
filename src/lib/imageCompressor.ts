/**
 * 图片压缩配置
 */
export interface ImageCompressorOptions {
  // 最大宽度（像素）
  maxWidth?: number;
  // 最大高度（像素）
  maxHeight?: number;
  // 图片质量 (0-1)
  quality?: number;
  // 最大文件大小（字节）
  maxSize?: number;
  // 输出格式
  mimeType?: string;
}

/**
 * 默认压缩配置
 */
const DEFAULT_OPTIONS: Required<ImageCompressorOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSize: 500 * 1024, // 500KB
  mimeType: 'image/jpeg',
};

/**
 * 压缩单个图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
export async function compressImage(
  file: File,
  options: ImageCompressorOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 如果文件已经很小，且是支持的格式，直接返回
  if (
    file.size <= opts.maxSize &&
    (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/webp')
  ) {
    // 仍然需要检查尺寸
    const needsResize = await checkImageNeedsResize(file, opts.maxWidth, opts.maxHeight);
    if (!needsResize) {
      console.log(`图片 ${file.name} 无需压缩`);
      return file;
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('读取文件失败'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('加载图片失败'));

      img.onload = () => {
        try {
          // 计算新的尺寸
          let { width, height } = calculateNewDimensions(
            img.width,
            img.height,
            opts.maxWidth,
            opts.maxHeight
          );

          // 创建 canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法获取 canvas context'));
            return;
          }

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);

          // 转换为 blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('压缩失败'));
                return;
              }

              // 创建新文件
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'), // 统一转换为 jpg
                {
                  type: opts.mimeType,
                  lastModified: Date.now(),
                }
              );

              const originalSize = (file.size / 1024).toFixed(2);
              const compressedSize = (compressedFile.size / 1024).toFixed(2);
              const ratio = ((compressedFile.size / file.size) * 100).toFixed(1);

              console.log(
                `图片压缩完成: ${file.name}\n` +
                `  原始大小: ${originalSize} KB\n` +
                `  压缩后: ${compressedSize} KB\n` +
                `  压缩率: ${ratio}%\n` +
                `  尺寸: ${img.width}x${img.height} -> ${width}x${height}`
              );

              resolve(compressedFile);
            },
            opts.mimeType,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 检查图片是否需要调整尺寸
 */
async function checkImageNeedsResize(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('加载图片失败'));
      img.onload = () => {
        resolve(img.width > maxWidth || img.height > maxHeight);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 计算新的图片尺寸（保持宽高比）
 */
function calculateNewDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * 批量压缩多个图片
 * @param files 图片文件列表
 * @param options 压缩选项
 * @param onProgress 进度回调
 * @returns 压缩后的文件数组
 */
export async function compressImages(
  files: File[],
  options: ImageCompressorOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressed: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options);
      compressed.push(compressedFile);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`压缩图片 ${files[i].name} 失败:`, error);
      // 如果压缩失败，使用原文件
      compressed.push(files[i]);
    }
  }

  return compressed;
}

/**
 * 验证文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

