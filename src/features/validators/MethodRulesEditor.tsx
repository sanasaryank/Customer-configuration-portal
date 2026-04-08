import React, { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SchemaNode, HttpMethod, MethodRules, MethodRuleSet } from '../../types/validator';
import { emptyMethodRuleSet } from '../../types/validator';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { collectFieldPaths, collectRequiredPaths } from './schemaUtils';

const HTTP_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH'];

const METHOD_OPTIONS = HTTP_METHODS.map((m) => ({ value: m, label: m }));

interface MethodRulesEditorProps {
  schema: SchemaNode;
  methodRules: MethodRules;
  onChange: (rules: MethodRules) => void;
}

type RuleCategory = 'forbid_fields' | 'add_required' | 'remove_required';

const RULE_CATEGORIES: RuleCategory[] = ['forbid_fields', 'add_required', 'remove_required'];

export default function MethodRulesEditor({ schema, methodRules, onChange }: MethodRulesEditorProps) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod>('POST');

  const allPaths = useMemo(() => collectFieldPaths(schema), [schema]);
  const requiredPaths = useMemo(() => new Set(collectRequiredPaths(schema)), [schema]);

  const currentRules: MethodRuleSet = methodRules[selectedMethod] ?? emptyMethodRuleSet();

  const updateRules = useCallback(
    (ruleSet: MethodRuleSet) => {
      onChange({ ...methodRules, [selectedMethod]: ruleSet });
    },
    [methodRules, selectedMethod, onChange],
  );

  const addToCategory = useCallback(
    (category: RuleCategory, path: string) => {
      if (currentRules[category].includes(path)) return;
      updateRules({ ...currentRules, [category]: [...currentRules[category], path] });
    },
    [currentRules, updateRules],
  );

  const removeFromCategory = useCallback(
    (category: RuleCategory, path: string) => {
      updateRules({
        ...currentRules,
        [category]: currentRules[category].filter((p) => p !== path),
      });
    },
    [currentRules, updateRules],
  );

  // Compute which paths are available for each category, preventing conflicts
  const availablePaths = useMemo(() => {
    const forbidSet = new Set(currentRules.forbid_fields);
    const addReqSet = new Set(currentRules.add_required);
    const removeReqSet = new Set(currentRules.remove_required);

    return {
      forbid_fields: allPaths.filter((p) => !forbidSet.has(p)),
      add_required: allPaths.filter(
        (p) =>
          !forbidSet.has(p) &&       // can't require a forbidden field
          !addReqSet.has(p) &&       // not already added
          !requiredPaths.has(p),     // already required in base, no point adding
      ),
      remove_required: allPaths.filter(
        (p) =>
          !forbidSet.has(p) &&       // can't un-require a forbidden field
          !removeReqSet.has(p) &&    // not already in remove list
          requiredPaths.has(p),      // only base-required fields can be removed
      ),
    };
  }, [allPaths, requiredPaths, currentRules]);

  const categoryLabels: Record<RuleCategory, string> = {
    forbid_fields: t('validators.forbidFields'),
    add_required: t('validators.addRequired'),
    remove_required: t('validators.removeRequired'),
  };

  const categoryVariants: Record<RuleCategory, 'danger' | 'info' | 'warning'> = {
    forbid_fields: 'danger',
    add_required: 'info',
    remove_required: 'warning',
  };

  return (
    <div className="space-y-4">
      <div className="w-48">
        <Select
          label={t('validators.httpMethod')}
          options={METHOD_OPTIONS}
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value as HttpMethod)}
        />
      </div>

      {RULE_CATEGORIES.map((category) => (
        <RuleCategorySection
          key={category}
          label={categoryLabels[category]}
          variant={categoryVariants[category]}
          paths={currentRules[category]}
          availablePaths={availablePaths[category]}
          onAdd={(path) => addToCategory(category, path)}
          onRemove={(path) => removeFromCategory(category, path)}
        />
      ))}
    </div>
  );
}

interface RuleCategorySectionProps {
  label: string;
  variant: 'danger' | 'info' | 'warning';
  paths: string[];
  availablePaths: string[];
  onAdd: (path: string) => void;
  onRemove: (path: string) => void;
}

function RuleCategorySection({
  label,
  variant,
  paths,
  availablePaths,
  onAdd,
  onRemove,
}: RuleCategorySectionProps) {
  const { t } = useTranslation();
  const [selectedPath, setSelectedPath] = useState('');

  const pathOptions = useMemo(
    () => availablePaths.map((p) => ({ value: p, label: p })),
    [availablePaths],
  );

  const handleAdd = () => {
    if (!selectedPath) return;
    onAdd(selectedPath);
    setSelectedPath('');
  };

  return (
    <fieldset className="border border-gray-200 rounded-md p-3 space-y-2">
      <legend className="text-sm font-medium text-gray-700 px-1">{label}</legend>

      {/* Current entries */}
      {paths.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {paths.map((path) => (
            <span key={path} className="inline-flex items-center gap-1">
              <Badge variant={variant}>{path}</Badge>
              <button
                type="button"
                className="text-gray-400 hover:text-red-600 text-xs leading-none"
                onClick={() => onRemove(path)}
                title={t('common.remove')}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">{t('validators.noFieldsConfigured')}</p>
      )}

      {/* Add new entry */}
      {pathOptions.length > 0 && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              options={[{ value: '', label: t('validators.selectField') }, ...pathOptions]}
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedPath}
          >
            + {t('common.add')}
          </Button>
        </div>
      )}
    </fieldset>
  );
}
