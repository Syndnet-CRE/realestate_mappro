import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const BulkOperationsPanel = ({ selectedDeals, onBulkAction, onClearSelection }) => {
  const [bulkAction, setBulkAction] = useState('');
  const [targetStage, setTargetStage] = useState('');
  const [assignee, setAssignee] = useState('');

  const stageOptions = [
    { value: 'initial-interest', label: 'Initial Interest' },
    { value: 'due-diligence', label: 'Due Diligence' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'under-contract', label: 'Under Contract' },
    { value: 'closing', label: 'Closing' }
  ];

  const assigneeOptions = [
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'lisa-rodriguez', label: 'Lisa Rodriguez' },
    { value: 'david-kim', label: 'David Kim' },
    { value: 'john-analyst', label: 'John Analyst' }
  ];

  const actionOptions = [
    { value: 'move-stage', label: 'Move to Stage' },
    { value: 'assign-team', label: 'Assign Team Member' },
    { value: 'set-priority', label: 'Set Priority' },
    { value: 'add-tag', label: 'Add Tag' },
    { value: 'export-data', label: 'Export Data' },
    { value: 'archive', label: 'Archive Deals' }
  ];

  const handleBulkAction = () => {
    if (!bulkAction) return;

    const actionData = {
      action: bulkAction,
      targetStage,
      assignee,
      dealIds: selectedDeals.map(deal => deal.id)
    };

    onBulkAction(actionData);
    setBulkAction('');
    setTargetStage('');
    setAssignee('');
  };

  if (selectedDeals.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-elevation-3 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked
                onChange={onClearSelection}
                className="border-primary"
              />
              <span className="text-sm font-medium text-text-primary">
                {selectedDeals.length} deal{selectedDeals.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                placeholder="Choose action..."
                options={actionOptions}
                value={bulkAction}
                onChange={setBulkAction}
                className="w-48"
              />

              {bulkAction === 'move-stage' && (
                <Select
                  placeholder="Select stage..."
                  options={stageOptions}
                  value={targetStage}
                  onChange={setTargetStage}
                  className="w-48"
                />
              )}

              {bulkAction === 'assign-team' && (
                <Select
                  placeholder="Select assignee..."
                  options={assigneeOptions}
                  value={assignee}
                  onChange={setAssignee}
                  className="w-48"
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconPosition="left"
            >
              Clear Selection
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAction}
              disabled={!bulkAction || (bulkAction === 'move-stage' && !targetStage) || (bulkAction === 'assign-team' && !assignee)}
              iconName="Play"
              iconPosition="left"
            >
              Apply Action
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border">
          <span className="text-sm text-text-secondary">Quick actions:</span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction({ action: 'export-data', dealIds: selectedDeals.map(d => d.id) })}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction({ action: 'set-priority', priority: 'high', dealIds: selectedDeals.map(d => d.id) })}
            iconName="AlertTriangle"
            iconPosition="left"
          >
            High Priority
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction({ action: 'add-tag', tag: 'review-needed', dealIds: selectedDeals.map(d => d.id) })}
            iconName="Tag"
            iconPosition="left"
          >
            Tag for Review
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction({ action: 'schedule-meeting', dealIds: selectedDeals.map(d => d.id) })}
            iconName="Calendar"
            iconPosition="left"
          >
            Schedule Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsPanel;