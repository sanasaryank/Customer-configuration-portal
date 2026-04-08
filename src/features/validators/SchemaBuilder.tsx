import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SchemaNode, SchemaKind } from '../../types/validator';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

/** Kinds that have nested child schemas and thus are collapsible. */
const COLLAPSIBLE_KINDS = new Set<SchemaKind>(['object', 'array', 'map']);

const KIND_OPTIONS: { value: SchemaKind; label: string }[] = [
  { value: 'string',    label: 'String' },
  { value: 'integer',   label: 'Integer' },
  { value: 'number',    label: 'Number' },
  { value: 'boolean',   label: 'Boolean' },
  { value: 'null',      label: 'Null' },
  { value: 'object',    label: 'Object' },
  { value: 'array',     label: 'Array' },
  { value: 'map',       label: 'Map' },
  { value: 'date',      label: 'Date' },
  { value: 'time',      label: 'Time' },
  { value: 'datetime',  label: 'DateTime' },
  { value: 'date-time', label: 'Date-Time' },
];

const FORMAT_OPTIONS = [
  { value: '',         label: '— None —' },
  { value: 'date',     label: 'date' },
  { value: 'time',     label: 'time' },
  { value: 'datetime', label: 'datetime' },
  { value: 'date-time', label: 'date-time' },
  { value: 'email',    label: 'email' },
  { value: 'uuid',     label: 'uuid' },
];

interface SchemaBuilderProps {
  value: SchemaNode;
  onChange: (node: SchemaNode) => void;
  depth?: number;
}

function makeDefault(kind: SchemaKind): SchemaNode {
  const base: SchemaNode = { kind };
  if (kind === 'array') base.items = { kind: 'string' };
  if (kind === 'map') base.values = { kind: 'string' };
  if (kind === 'object') {
    base.fields = {};
    base.required = [];
    base.allowExtra = true;
  }
  return base;
}

export default function SchemaBuilder({ value, onChange, depth = 0 }: SchemaBuilderProps) {
  const { t } = useTranslation();
  const kind = value.kind;
  const [collapsed, setCollapsed] = useState(false);
  const isCollapsible = COLLAPSIBLE_KINDS.has(kind);

  const update = useCallback(
    (patch: Partial<SchemaNode>) => onChange({ ...value, ...patch }),
    [value, onChange],
  );

  const handleKindChange = useCallback(
    (newKind: SchemaKind) => onChange(makeDefault(newKind)),
    [onChange],
  );

  // --- Object helpers ---
  const addField = useCallback(() => {
    const fields = { ...(value.fields ?? {}) };
    let name = 'newField';
    let i = 1;
    while (fields[name]) { name = `newField${i++}`; }
    fields[name] = { kind: 'string' };
    update({ fields });
  }, [value, update]);

  const renameField = useCallback(
    (oldName: string, newName: string) => {
      if (!newName || newName === oldName) return;
      const fields = { ...(value.fields ?? {}) };
      if (fields[newName]) return; // duplicate
      const schema = fields[oldName];
      delete fields[oldName];
      fields[newName] = schema;
      const req = (value.required ?? []).map((r) => (r === oldName ? newName : r));
      update({ fields, required: req });
    },
    [value, update],
  );

  const removeField = useCallback(
    (name: string) => {
      const fields = { ...(value.fields ?? {}) };
      delete fields[name];
      const req = (value.required ?? []).filter((r) => r !== name);
      update({ fields, required: req });
    },
    [value, update],
  );

  const updateFieldSchema = useCallback(
    (name: string, schema: SchemaNode) => {
      const fields = { ...(value.fields ?? {}), [name]: schema };
      update({ fields });
    },
    [value, update],
  );

  const toggleRequired = useCallback(
    (name: string) => {
      const req = value.required ?? [];
      if (req.includes(name)) {
        update({ required: req.filter((r) => r !== name) });
      } else {
        update({ required: [...req, name] });
      }
    },
    [value, update],
  );

  // --- Enum helpers ---
  const enumStr = value.enum ? JSON.stringify(value.enum) : '';
  const handleEnumChange = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        const { enum: _, ...rest } = value;
        onChange(rest);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) update({ enum: parsed });
      } catch { /* ignore invalid JSON */ }
    },
    [value, onChange, update],
  );

  // --- Key enum helpers for map ---
  const keyEnumStr = (value.keyEnum ?? []).join(', ');
  const handleKeyEnumChange = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        const { keyEnum: _, ...rest } = value;
        onChange(rest);
        return;
      }
      update({ keyEnum: raw.split(',').map((s) => s.trim()).filter(Boolean) });
    },
    [value, onChange, update],
  );

  const indent = depth > 0;

  return (
    <div className={`space-y-3 ${indent ? 'ml-4 pl-3 border-l-2 border-gray-200' : ''}`}>
      {/* Kind selector + nullable + collapse toggle */}
      <div className="flex items-end gap-2 flex-wrap">
        {isCollapsible && (
          <button
            type="button"
            className="mb-1 p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 self-end"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg className="w-4 h-4 transition-transform" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        <div className="w-40">
          <Select
            label={t('validators.kind')}
            options={KIND_OPTIONS}
            value={kind}
            onChange={(e) => handleKindChange(e.target.value as SchemaKind)}
          />
        </div>
        <div className="pt-5">
          <Checkbox
            label={t('validators.nullable')}
            checked={value.nullable ?? false}
            onChange={(e) => update({ nullable: (e.target as HTMLInputElement).checked })}
          />
        </div>
        {isCollapsible && collapsed && (
          <span className="text-xs text-gray-400 italic self-end mb-1">
            {kind === 'object' && `${Object.keys(value.fields ?? {}).length} fields`}
            {kind === 'array' && `items: ${value.items?.kind ?? '?'}`}
            {kind === 'map' && `values: ${value.values?.kind ?? '?'}`}
          </span>
        )}
      </div>

      {/* Collapsible body */}
      {!(isCollapsible && collapsed) && (
        <>

      {/* String-specific */}
      {kind === 'string' && (
        <div className="flex gap-2 flex-wrap">
          <div className="w-28">
            <Input
              label={t('validators.minLength')}
              type="number"
              value={value.minLength ?? ''}
              onChange={(e) => update({ minLength: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="w-28">
            <Input
              label={t('validators.maxLength')}
              type="number"
              value={value.maxLength ?? ''}
              onChange={(e) => update({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label={t('validators.pattern')}
              value={value.pattern ?? ''}
              onChange={(e) => update({ pattern: e.target.value || undefined })}
            />
          </div>
          <div className="w-36">
            <Select
              label={t('validators.format')}
              options={FORMAT_OPTIONS}
              value={value.format ?? ''}
              onChange={(e) => update({ format: e.target.value || undefined })}
            />
          </div>
        </div>
      )}

      {/* Integer / Number */}
      {(kind === 'integer' || kind === 'number') && (
        <div className="flex gap-2">
          <div className="w-32">
            <Input
              label={t('validators.min')}
              type="number"
              value={value.min ?? ''}
              onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="w-32">
            <Input
              label={t('validators.max')}
              type="number"
              value={value.max ?? ''}
              onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      )}

      {/* Array */}
      {kind === 'array' && (
        <fieldset className="border border-gray-200 rounded-md p-3 space-y-3">
          <legend className="text-sm font-medium text-gray-700 px-1">{t('validators.arrayItems')}</legend>
          <div className="flex gap-2">
            <div className="w-28">
              <Input
                label={t('validators.minItems')}
                type="number"
                value={value.minItems ?? ''}
                onChange={(e) => update({ minItems: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="w-28">
              <Input
                label={t('validators.maxItems')}
                type="number"
                value={value.maxItems ?? ''}
                onChange={(e) => update({ maxItems: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          <SchemaBuilder
            value={value.items ?? { kind: 'string' }}
            onChange={(items) => update({ items })}
            depth={depth + 1}
          />
        </fieldset>
      )}

      {/* Map */}
      {kind === 'map' && (
        <fieldset className="border border-gray-200 rounded-md p-3 space-y-3">
          <legend className="text-sm font-medium text-gray-700 px-1">{t('validators.mapValues')}</legend>
          <div className="flex gap-2 flex-wrap">
            <div className="w-28">
              <Input
                label={t('validators.minItems')}
                type="number"
                value={value.minItems ?? ''}
                onChange={(e) => update({ minItems: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="w-28">
              <Input
                label={t('validators.maxItems')}
                type="number"
                value={value.maxItems ?? ''}
                onChange={(e) => update({ maxItems: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                label={t('validators.keyPattern')}
                value={value.keyPattern ?? ''}
                onChange={(e) => update({ keyPattern: e.target.value || undefined })}
              />
            </div>
          </div>
          <div>
            <Input
              label={t('validators.keyEnum')}
              value={keyEnumStr}
              placeholder="KEY1, KEY2, KEY3"
              onChange={(e) => handleKeyEnumChange(e.target.value)}
            />
          </div>
          <SchemaBuilder
            value={value.values ?? { kind: 'string' }}
            onChange={(values) => update({ values })}
            depth={depth + 1}
          />
        </fieldset>
      )}

      {/* Object */}
      {kind === 'object' && (
        <fieldset className="border border-gray-200 rounded-md p-3 space-y-3">
          <legend className="text-sm font-medium text-gray-700 px-1">{t('validators.objectFields')}</legend>
          <Checkbox
            label={t('validators.allowExtra')}
            checked={value.allowExtra ?? true}
            onChange={(e) => update({ allowExtra: (e.target as HTMLInputElement).checked })}
          />
          {Object.entries(value.fields ?? {}).map(([fieldName, fieldSchema]) => (
            <ObjectFieldEditor
              key={fieldName}
              fieldName={fieldName}
              schema={fieldSchema}
              isRequired={(value.required ?? []).includes(fieldName)}
              onRename={(newName) => renameField(fieldName, newName)}
              onRemove={() => removeField(fieldName)}
              onSchemaChange={(s) => updateFieldSchema(fieldName, s)}
              onToggleRequired={() => toggleRequired(fieldName)}
              depth={depth}
            />
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addField}>
            + {t('validators.addField')}
          </Button>
        </fieldset>
      )}

      {/* Enum (for all kinds) */}
      <div>
        <Input
          label={t('validators.enum')}
          placeholder='[1, 2, "a"]'
          value={enumStr}
          onChange={(e) => handleEnumChange(e.target.value)}
        />
      </div>
      </>
      )}
    </div>
  );
}

// --- Sub-component for object field editing ---

interface ObjectFieldEditorProps {
  fieldName: string;
  schema: SchemaNode;
  isRequired: boolean;
  onRename: (newName: string) => void;
  onRemove: () => void;
  onSchemaChange: (s: SchemaNode) => void;
  onToggleRequired: () => void;
  depth: number;
}

function ObjectFieldEditor({
  fieldName,
  schema,
  isRequired,
  onRename,
  onRemove,
  onSchemaChange,
  onToggleRequired,
  depth,
}: ObjectFieldEditorProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(fieldName);
  const [collapsed, setCollapsed] = useState(true);
  const confirmDialog = useConfirmDialog();

  const commitRename = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== fieldName) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div className="bg-gray-50 rounded-md p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-0.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg className="w-3.5 h-3.5 transition-transform" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {editing ? (
          <Input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); }}
            autoFocus
            className="!w-40"
          />
        ) : (
          <button
            type="button"
            className="text-sm font-mono font-semibold text-primary-700 hover:underline cursor-pointer"
            onClick={() => { setTempName(fieldName); setEditing(true); }}
            title={t('validators.renameField')}
          >
            {fieldName}
          </button>
        )}
        <span className="text-xs text-gray-400">{schema.kind}</span>
        <Checkbox
          label={t('common.required')}
          checked={isRequired}
          onChange={onToggleRequired}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-600 ml-auto"
          onClick={() => confirmDialog.requestConfirm(async () => { onRemove(); })}
        >
          ✕
        </Button>
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t('common.deleteTitle')}
        message={t('validators.confirmDeleteField', { field: fieldName })}
        onConfirm={confirmDialog.confirm}
        onClose={confirmDialog.close}
      />
      {!collapsed && (
        <SchemaBuilder value={schema} onChange={onSchemaChange} depth={depth + 1} />
      )}
    </div>
  );
}
