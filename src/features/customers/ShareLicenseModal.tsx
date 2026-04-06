import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export interface ShareLicenseSource {
  id: string;
  name: string;
  email: string;
}

interface ShareLicenseModalProps {
  source: ShareLicenseSource;
  onClose: () => void;
}

type ShareMode = 'file' | 'email';

// TODO: Replace this stub with the actual file-content generation algorithm
// when it is provided. The function receives the customer id and should return
// the full file content as a string.
function generateLicenseFileContent(customerId: string): string {
  return JSON.stringify({ customerId }, null, 2);
}

async function saveToFile(customerId: string): Promise<void> {
  const content = generateLicenseFileContent(customerId);
  const fileName = `license-${customerId}.txt`;
  const blob = new Blob([content], { type: 'text/plain' });

  if ('showSaveFilePicker' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'Text file', accept: { 'text/plain': ['.txt'] } }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch {
      // User cancelled the picker — do nothing
    }
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// TODO: Replace this stub with the actual email-send API call when the
// endpoint and payload are defined. Currently it only logs the intent.
async function sendLicenseByEmail(_customerId: string, _email: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[ShareLicense] TODO: send license for ${_customerId} to ${_email}`);
}

export default function ShareLicenseModal({ source, onClose }: ShareLicenseModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ShareMode>('file');
  const [email, setEmail] = useState(source.email);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (mode === 'file') {
        await saveToFile(source.id);
        onClose();
      } else {
        await sendLicenseByEmail(source.id, email);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('customers.shareTitle')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={mode === 'email' && !email.trim()}
          >
            {t('customers.shareConfirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{source.name}</p>

        {/* Mode selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="shareMode"
              value="file"
              checked={mode === 'file'}
              onChange={() => setMode('file')}
              className="accent-blue-600"
            />
            {t('customers.shareToFile')}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="shareMode"
              value="email"
              checked={mode === 'email'}
              onChange={() => setMode('email')}
              className="accent-blue-600"
            />
            {t('customers.shareEmail')}
          </label>
        </div>

        {/* Email input — shown only when Email mode selected */}
        {mode === 'email' && (
          <Input
            label={t('customers.shareEmailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        )}
      </div>
    </Modal>
  );
}
