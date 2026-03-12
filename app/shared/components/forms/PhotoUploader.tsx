import { useState } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Dragger } = Upload;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

interface PhotoUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  uploadUrl?: string;
  maxFiles?: number;
}

export function PhotoUploader({
  value = [],
  onChange,
  uploadUrl = '/api/v1/uploads/photos',
  maxFiles = MAX_FILES,
}: PhotoUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, i) => ({
      uid: `${i}`,
      name: url.split('/').pop() || `photo-${i}`,
      status: 'done',
      url,
    }))
  );

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      message.error('Only JPEG and PNG files are allowed.');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_SIZE) {
      message.error('File must be smaller than 5MB.');
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} photos allowed.`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const urls = newFileList
      .filter((f) => f.status === 'done')
      .map((f) => f.response?.url || f.url || '')
      .filter(Boolean);
    onChange?.(urls);
  };

  return (
    <Dragger
      name="photos"
      multiple
      action={uploadUrl}
      fileList={fileList}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      accept=".jpg,.jpeg,.png"
      listType="picture-card"
      maxCount={maxFiles}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag photos to upload</p>
      <p className="ant-upload-hint">
        JPEG/PNG only, max 5MB each, up to {maxFiles} files
      </p>
    </Dragger>
  );
}
